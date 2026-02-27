import { sequelize } from "../../../../config/database.js";
import logger from "../../../../utils/logger.js";
import { Op } from "sequelize";
import { ExamCycle, ExamTimetable } from "../../models/index.js";
import AcademicService from "../../../academics/services/index.js";
import CoreService from "../../../core/services/index.js";
import SettingsService from "../../../settings/services/index.js";

/**
 * Get all timetables for a cycle with optional program filter
 * GET /api/exam/cycles/:cycleId/timetables?programId=xxx
 */
async function getTimetablesByCycle(req, res) {
  try {
    const { cycleId } = req.params;
    const { programId } = req.query;

    const where = {
      exam_cycle_id: cycleId,
      is_deleted: false,
    };

    // Since program_id is now an array, we need to check if the array contains the programId
    if (programId) {
      where.program_id = { [Op.contains]: [programId] };
    }

    const timetables = await ExamTimetable.findAll({
      where,
      order: [
        ["exam_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    const courseIds = new Set();
    const facultyIds = new Set();
    const programIds = new Set();

    timetables.forEach((timetable) => {
      if (timetable.course_id) courseIds.add(timetable.course_id);
      if (timetable.assigned_faculty_id)
        facultyIds.add(timetable.assigned_faculty_id);
      if (timetable.program_id && Array.isArray(timetable.program_id)) {
        timetable.program_id.forEach((pid) => programIds.add(pid));
      }
    });

    const [courses, programs, faculty] = await Promise.all([
      AcademicService.getCoursesByIds([...courseIds], {
        attributes: ["id", "name", "code", "department_id"],
        raw: true,
      }),
      AcademicService.getProgramsByIds([...programIds], {
        attributes: ["id", "name", "code"],
        raw: true,
      }),
      CoreService.getUsersByIds([...facultyIds], {
        attributes: ["id", "first_name", "last_name", "department_id"],
      }),
    ]);

    const courseMap = new Map(courses.map((course) => [course.id, course]));
    const programMap = new Map(programs.map((program) => [program.id, program]));
    const facultyMap = new Map(
      faculty.map((user) => [user.id, user.toJSON?.() ?? user]),
    );

    const timetablesWithPrograms = timetables.map((timetable) => {
      const tt = timetable.toJSON();
      tt.course = tt.course_id ? courseMap.get(tt.course_id) || null : null;
      tt.assigned_faculty = tt.assigned_faculty_id
        ? facultyMap.get(tt.assigned_faculty_id) || null
        : null;
      tt.programs = (tt.program_id || [])
        .map((pid) => programMap.get(pid))
        .filter(Boolean);
      return tt;
    });

    res.json({ success: true, data: timetablesWithPrograms });
  } catch (error) {
    logger.error("Get timetables error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Add single timetable entry
 * POST /api/exam/cycles/:cycleId/timetables
 */
async function addTimetableEntry(req, res) {
  try {
    const { cycleId } = req.params;
    const {
      program_id,
      course_id,
      exam_date,
      start_time,
      end_time,
      session,
      roll_number_range,
    } = req.body;

    const timetable = await ExamTimetable.create({
      exam_cycle_id: cycleId,
      program_id,
      course_id,
      exam_date,
      start_time,
      end_time,
      session: session || "full_day",
      roll_number_range: roll_number_range || null,
    });

    logger.info(`Timetable entry created for cycle ${cycleId}`);

    res.status(201).json({ success: true, data: timetable });
  } catch (error) {
    logger.error("Add timetable entry error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Update timetable entry
 * PUT /api/exam/timetables/:id
 */
async function updateTimetableEntry(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const timetable = await ExamTimetable.findByPk(id);
    if (!timetable) {
      return res
        .status(404)
        .json({ success: false, error: "Timetable entry not found" });
    }

    // Save to history before updating
    await saveToHistory(
      id,
      "update",
      timetable.toJSON(),
      updates,
      req.user.userId,
    );

    await timetable.update(updates);

    logger.info(`Timetable entry ${id} updated`);

    res.json({ success: true, data: timetable });
  } catch (error) {
    logger.error("Update timetable entry error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Delete single timetable entry (soft delete)
 * DELETE /api/exam/timetables/:id
 */
async function deleteTimetableEntry(req, res) {
  try {
    const { id } = req.params;

    const timetable = await ExamTimetable.findByPk(id);
    if (!timetable) {
      return res
        .status(404)
        .json({ success: false, error: "Timetable entry not found" });
    }

    // Save to history before deleting
    await saveToHistory(
      id,
      "delete",
      timetable.toJSON(),
      null,
      req.user.userId,
    );

    await timetable.update({
      is_deleted: true,
      deleted_at: new Date(),
    });

    // Check if all timetables are deleted, update cycle status
    await updateCycleStatus(timetable.exam_cycle_id);

    logger.info(`Timetable entry ${id} deleted`);

    res.json({ success: true, message: "Timetable entry deleted" });
  } catch (error) {
    logger.error("Delete timetable entry error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Delete all timetables for a cycle
 * DELETE /api/exam/cycles/:cycleId/timetables/all
 */
async function deleteAllTimetables(req, res) {
  try {
    const { cycleId } = req.params;

    const timetables = await ExamTimetable.findAll({
      where: { exam_cycle_id: cycleId, is_deleted: false },
    });

    // Save all to history
    for (const timetable of timetables) {
      await saveToHistory(
        timetable.id,
        "delete",
        timetable.toJSON(),
        null,
        req.user.userId,
      );
    }

    await ExamTimetable.update(
      { is_deleted: true, deleted_at: new Date() },
      { where: { exam_cycle_id: cycleId, is_deleted: false } },
    );

    // Update cycle status to 'scheduling'
    await ExamCycle.update(
      { status: "scheduling" },
      { where: { id: cycleId } },
    );

    logger.info(`All timetables deleted for cycle ${cycleId}`);

    res.json({ success: true, message: "All timetables deleted" });
  } catch (error) {
    logger.error("Delete all timetables error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Auto-generate timetable with holiday avoidance
 * POST /api/exam/cycles/:cycleId/timetables/auto-generate
 */
async function autoGenerateTimetable(req, res) {
  try {
    const { cycleId } = req.params;
    const {
      start_date,
      gap,
      morning_start,
      morning_end,
      afternoon_start,
      afternoon_end,
      allow_both_sessions,
    } = req.body;

    const cycle = await ExamCycle.findByPk(cycleId);
    if (!cycle) {
      return res.status(404).json({ success: false, error: "Cycle not found" });
    }
    console.log(cycle);

    // Get all programs for this degree
    const programs = await AcademicService.listPrograms({
      where: { degree_type: cycle.degree, is_active: true },
      attributes: ["id", "name", "code"],
      raw: true,
    });

    // Get regulation with course_list
    const regulation = await AcademicService.getRegulationById(
      cycle.regulation_id,
      { attributes: ["id", "name", "courses_list"] },
    );

    if (!regulation) {
      return res.status(404).json({
        success: false,
        error: "Regulation not found",
      });
    }

    const courseList = regulation.courses_list || {};

    // Extract course IDs and track which programs they belong to
    const courseIdsSet = new Set();
    const courseToProgramsMap = {}; // Maps course_id to array of program_ids

    programs.forEach((program) => {
      const programCourses = courseList[program.id];
      if (programCourses && programCourses[cycle.semester]) {
        programCourses[cycle.semester].forEach((courseId) => {
          courseIdsSet.add(courseId);
          // Track all programs for this course (a course can belong to multiple programs)
          if (!courseToProgramsMap[courseId]) {
            courseToProgramsMap[courseId] = [];
          }
          courseToProgramsMap[courseId].push(program.id);
        });
      }
    });

    const courseIds = Array.from(courseIdsSet);

    if (courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "No courses found for this semester in the regulation's course list",
      });
    }

    // Get course details for the extracted course IDs
    const courses = await AcademicService.getCoursesByIds(courseIds, {
      attributes: ["id", "name", "code"],
      raw: true,
    });

    // Attach array of program IDs to each course
    const coursesWithPrograms = courses.map((course) => ({
      ...course,
      program_ids: courseToProgramsMap[course.id] || [],
    }));

    console.log("courses: ", coursesWithPrograms);

    // Get holidays from academic calendar
    const holidays = await getHolidays(start_date);
    console.log("holidays: ", holidays);

    // Group courses by course_code to schedule same exams together
    const courseGroups = groupByCourseCode(coursesWithPrograms);
    console.log("courseGroups: ", courseGroups);
    const timetables = [];
    // Track which programs are scheduled on each date+session (for conflict detection)
    const dateSessionToPrograms = {}; // { "2024-01-15:morning": [...], "2024-01-15:afternoon": [...] }

    // Helper: check if programs conflict with a date+session
    const hasConflict = (coursePrograms, date, session) => {
      const dateKey = date.toISOString().split("T")[0];
      const key = `${dateKey}:${session}`;
      const scheduledPrograms = dateSessionToPrograms[key] || [];
      return coursePrograms.some((p) => scheduledPrograms.includes(p));
    };

    // Helper: add programs to a date+session
    const addProgramsToDateSession = (coursePrograms, date, session) => {
      const dateKey = date.toISOString().split("T")[0];
      const key = `${dateKey}:${session}`;
      if (!dateSessionToPrograms[key]) {
        dateSessionToPrograms[key] = [];
      }
      dateSessionToPrograms[key].push(...coursePrograms);
    };

    let currentDate = new Date(start_date);
    const gapDays = parseInt(gap) || 0;

    // For each course group, find the earliest date+session with no conflicts
    for (const courseGroup of courseGroups) {
      let maxScheduledDateForGroup = new Date(0); // Track max date used for this group

      for (const course of courseGroup) {
        let scheduled = false;
        let attemptDate = new Date(currentDate);

        // Try to find a suitable date+session
        while (!scheduled) {
          // Skip weekends and holidays
          while (isWeekendOrHoliday(attemptDate, holidays)) {
            attemptDate.setDate(attemptDate.getDate() + 1);
          }

          // Try morning session first
          if (!hasConflict(course.program_ids, attemptDate, "morning")) {
            timetables.push({
              exam_cycle_id: cycleId,
              program_id: course.program_ids,
              course_id: course.id,
              exam_date: new Date(attemptDate),
              start_time: morning_start,
              end_time: morning_end,
              session: "morning",
            });

            addProgramsToDateSession(
              course.program_ids,
              attemptDate,
              "morning",
            );
            scheduled = true;
          }
          // If morning conflicts and dual sessions allowed, try afternoon
          else if (
            allow_both_sessions &&
            afternoon_start &&
            afternoon_end &&
            !hasConflict(course.program_ids, attemptDate, "afternoon")
          ) {
            timetables.push({
              exam_cycle_id: cycleId,
              program_id: course.program_ids,
              course_id: course.id,
              exam_date: new Date(attemptDate),
              start_time: afternoon_start,
              end_time: afternoon_end,
              session: "afternoon",
            });

            addProgramsToDateSession(
              course.program_ids,
              attemptDate,
              "afternoon",
            );
            scheduled = true;
          } else {
            // Both sessions conflict or afternoon not allowed, try next day
            attemptDate.setDate(attemptDate.getDate() + 1);
          }
        }

        if (attemptDate > maxScheduledDateForGroup) {
          maxScheduledDateForGroup = new Date(attemptDate);
        }
      }

      // Advance currentDate to the latest date used by the previous group + gap
      // If gap=1, we want 1 full day between exams. So +1 (for next day) + gap.
      currentDate = new Date(maxScheduledDateForGroup);
      currentDate.setDate(currentDate.getDate() + gapDays + 1);
    }
    console.log(timetables);
    // Bulk create all timetables
    await ExamTimetable.bulkCreate(timetables);

    // Update cycle status to 'scheduled'
    await cycle.update({ status: "scheduled" });

    logger.info(
      `Auto-generated ${timetables.length} timetable entries for cycle ${cycleId}`,
    );

    res.json({ success: true, data: timetables, count: timetables.length });
  } catch (error) {
    logger.error("Auto-generate timetable error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Bulk Update Timetables (Faculty Assignment)
 * PUT /api/exam/cycles/:cycleId/timetables/bulk-update
 */
async function bulkUpdateTimetables(req, res) {
  const t = await sequelize.transaction();
  try {
    const { cycleId } = req.params;
    const { updates } = req.body; // Array of objects: { id, assigned_faculty_id, ... }

    if (!Array.isArray(updates)) {
      return res
        .status(400)
        .json({ success: false, error: "Updates must be an array" });
    }

    for (const update of updates) {
      const { id, ...data } = update;
      if (id) {
        await ExamTimetable.update(data, {
          where: { id, exam_cycle_id: cycleId },
          transaction: t,
        });
      }
    }

    await t.commit();
    res.json({ success: true, message: "Timetables updated successfully" });
  } catch (error) {
    await t.rollback();
    logger.error("Bulk update timetables error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Helper functions

function groupByCourseCode(courses) {
  const groups = {};
  courses.forEach((course) => {
    // Group by course.code instead of course.course_code
    const key = course.code || course.id;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(course);
  });
  return Object.values(groups);
}

async function getHolidays(fromDate) {
  try {
    const holidays = await SettingsService.listHolidaysFromDate(fromDate, {
      attributes: ["date"],
      raw: true,
    });
    return holidays.map((holiday) => holiday.date);
  } catch (error) {
    logger.error(
      "Could not fetch holidays, continuing without holiday data",
      error,
    );
    return [];
  }
}

function isWeekendOrHoliday(date, holidays) {
  const day = date.getDay();
  if (day === 0) return true; // Sunday

  const dateStr = date.toISOString().split("T")[0];
  return holidays.some((holiday) => {
    const holidayStr = new Date(holiday).toISOString().split("T")[0];
    return holidayStr === dateStr;
  });
}

async function saveToHistory(timetableId, action, oldData, newData, userId) {
  try {
    await sequelize.query(
      `INSERT INTO exam_timetable_history (timetable_id, action, old_data, new_data, performed_by)
       VALUES (:timetableId, :action, :oldData, :newData, :userId)`,
      {
        replacements: {
          timetableId,
          action,
          oldData: JSON.stringify(oldData),
          newData: JSON.stringify(newData),
          userId,
        },
      },
    );
  } catch (error) {
    logger.error("Save to history error:", error);
  }
}

async function updateCycleStatus(cycleId) {
  try {
    const count = await ExamTimetable.count({
      where: { exam_cycle_id: cycleId, is_deleted: false },
    });

    if (count === 0) {
      await ExamCycle.update(
        { status: "scheduling" },
        { where: { id: cycleId } },
      );
    }
  } catch (error) {
    logger.error("Update cycle status error:", error);
  }
}

export default {
  getTimetablesByCycle,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteAllTimetables,
  autoGenerateTimetable,
  bulkUpdateTimetables,
};
