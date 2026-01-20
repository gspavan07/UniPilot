const {
  ExamCycle,
  ExamSchedule,
  ExamMark,
  HallTicket,
  User,
  Course,
  Regulation,
  Timetable,
  TimetableSlot,
  SemesterResult,
  sequelize,
} = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");

// @desc    Get all exam cycles
// @route   GET /api/exam/cycles
// @access  Private/Faculty/Admin
exports.getExamCycles = async (req, res) => {
  try {
    const { Regulation } = require("../models");
    const cycles = await ExamCycle.findAll({
      include: [
        {
          model: Regulation,
          as: "regulation",
          attributes: ["id", "name"],
        },
      ],
      order: [["start_date", "DESC"]],
    });
    res.status(200).json({ success: true, data: cycles });
  } catch (error) {
    logger.error("Error fetching exam cycles:", error);
    res.status(500).json({ error: "Failed to fetch exam cycles" });
  }
};

// @desc    Create a new exam cycle
// @route   POST /api/exam/cycles
// @access  Private/Admin
exports.createExamCycle = async (req, res) => {
  try {
    const {
      name,
      start_date,
      end_date,
      batch_year,
      semester,
      exam_type,
      regulation_id,
      cycle_type,
      instance_number,
    } = req.body;

    let component_breakdown = [];
    let max_marks = 0;

    // Auto-populate from regulation if provided
    if (regulation_id && cycle_type) {
      const { Regulation } = require("../models");
      const regulation = await Regulation.findByPk(regulation_id);

      if (regulation && regulation.exam_structure) {
        const structure = regulation.exam_structure;

        // Determine which category to pull from based on common cycle types
        // This logic mapping can be expanded as needed
        if (cycle_type === "mid_term") {
          const midConfig = structure.theory_courses?.mid_terms || {};
          component_breakdown = midConfig.components || [];
          max_marks = midConfig.total_marks || 0;
        } else if (cycle_type === "end_semester") {
          const endConfig = structure.theory_courses?.end_semester || {};
          component_breakdown = endConfig.components || [];
          max_marks = endConfig.total_marks || 0;
        } else if (cycle_type === "internal_lab") {
          max_marks = structure.lab_courses?.internal_lab?.total_marks || 0;
        } else if (cycle_type === "external_lab") {
          max_marks = structure.lab_courses?.external_lab?.total_marks || 0;
        } else if (cycle_type === "project_review") {
          max_marks = structure.project_courses?.total_marks || 0;
        }
      }
    }

    const cycle = await ExamCycle.create({
      name,
      start_date,
      end_date,
      batch_year,
      semester,
      exam_type:
        exam_type ||
        (cycle_type === "end_semester" ? "semester_end" : cycle_type) ||
        "semester_end",
      regulation_id,
      cycle_type,
      instance_number: instance_number || 1,
      component_breakdown,
      max_marks,
      passing_marks: Math.ceil(max_marks * 0.35), // Default passing marks to 35%
    });

    res.status(201).json({ success: true, data: cycle });
  } catch (error) {
    logger.error("Error creating exam cycle:", error);
    res.status(500).json({ error: "Failed to create exam cycle" });
  }
};

// @desc    Update an exam cycle
// @route   PUT /api/exam/cycles/:id
// @access  Private/Admin
exports.updateExamCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const cycle = await ExamCycle.findByPk(id);
    if (!cycle) return res.status(404).json({ error: "Exam cycle not found" });

    await cycle.update(req.body);
    res.status(200).json({ success: true, data: cycle });
  } catch (error) {
    logger.error("Error updating exam cycle:", error);
    res.status(500).json({ error: "Failed to update exam cycle" });
  }
};

// @desc    Delete an exam cycle
// @route   DELETE /api/exam/cycles/:id
// @access  Private/Admin
exports.deleteExamCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const cycle = await ExamCycle.findByPk(id);
    if (!cycle) return res.status(404).json({ error: "Exam cycle not found" });

    // Schedules will be deleted automatically if CASCADE is setup,
    // but better to be explicit or check dependencies if needed.
    // For now, let's assume we want to delete everything related to this cycle.
    await ExamSchedule.destroy({ where: { exam_cycle_id: id } });
    await cycle.destroy();

    res.status(200).json({
      success: true,
      message: "Exam cycle and all its schedules deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting exam cycle:", error);
    res.status(500).json({ error: "Failed to delete exam cycle" });
  }
};

// @desc    Add a schedule to a cycle
// @route   POST /api/exam/schedules
// @access  Private/Admin
exports.addSchedule = async (req, res) => {
  try {
    const { exam_cycle_id, max_marks, passing_marks } = req.body;
    let final_max_marks = max_marks;
    let final_passing_marks = passing_marks;

    // Inherit from cycle if marks are not provided
    if (!final_max_marks || !final_passing_marks) {
      const cycle = await ExamCycle.findByPk(exam_cycle_id);
      if (cycle) {
        final_max_marks = final_max_marks || cycle.max_marks;
        final_passing_marks = final_passing_marks || cycle.passing_marks;
      }
    }

    const schedule = await ExamSchedule.create({
      ...req.body,
      max_marks: final_max_marks || 100,
      passing_marks: final_passing_marks || 35,
    });
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    logger.error("Error adding exam schedule:", error);
    res.status(500).json({ error: "Failed to add schedule" });
  }
};

// @desc    Get schedules for a cycle
// @route   GET /api/exam/schedules
// @access  Private/Faculty/Admin
exports.getExamSchedules = async (req, res) => {
  try {
    const { exam_cycle_id } = req.query;
    const where = {};
    if (exam_cycle_id) where.exam_cycle_id = exam_cycle_id;

    const schedules = await ExamSchedule.findAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "name", "code", "program_id", "semester"],
        },
        {
          model: ExamCycle,
          as: "cycle",
          attributes: [
            "name",
            "cycle_type",
            "component_breakdown",
            "max_marks",
            "passing_marks",
          ],
        },
      ],
      order: [
        ["exam_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    // For faculty, identify which courses they teach
    const isSuperUser = [
      "super_admin",
      "admin",
      "exam_cell",
      "registrar",
    ].includes(req.user.role);
    let taughtCourseIds = new Set();

    if (!isSuperUser) {
      const slots = await TimetableSlot.findAll({
        where: { faculty_id: req.user.userId },
        attributes: ["course_id"],
      });
      taughtCourseIds = new Set(slots.map((s) => s.course_id));
    }

    const enhancedSchedules = schedules.map((s) => ({
      ...s.toJSON(),
      is_teaching: isSuperUser || taughtCourseIds.has(s.course_id),
    }));

    res.status(200).json({ success: true, data: enhancedSchedules });
  } catch (error) {
    logger.error("Error fetching exam schedules:", error);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
};

// @desc    Update an exam schedule
// @route   PUT /api/exam/schedules/:id
// @access  Private/Admin
exports.updateExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ExamSchedule.findByPk(id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    await schedule.update(req.body);
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    logger.error("Error updating exam schedule:", error);
    res.status(500).json({ error: "Failed to update schedule" });
  }
};

// @desc    Delete an exam schedule
// @route   DELETE /api/exam/schedules/:id
// @access  Private/Admin
exports.deleteExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ExamSchedule.findByPk(id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    await schedule.destroy();
    res.status(200).json({ success: true, message: "Schedule deleted" });
  } catch (error) {
    logger.error("Error deleting exam schedule:", error);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
};

// @desc    Auto-generate timetable
// @route   POST /api/exam/schedules/auto-generate
// @access  Private/Admin
exports.autoGenerateTimetable = async (req, res) => {
  try {
    const {
      exam_cycle_id,
      program_id,
      start_date,
      gap_days,
      start_time,
      end_time,
      venue,
      max_marks,
      passing_marks,
    } = req.body;

    const cycle = await ExamCycle.findByPk(exam_cycle_id);
    if (!cycle) return res.status(404).json({ error: "Exam cycle not found" });

    // Use provided semester if available, otherwise use cycle's semester
    const semesterValue = req.body.semester;
    const targetSemester =
      semesterValue !== undefined && semesterValue !== ""
        ? parseInt(semesterValue)
        : cycle.semester;

    if (
      targetSemester === null ||
      targetSemester === undefined ||
      isNaN(targetSemester)
    ) {
      return res.status(400).json({
        error:
          "No valid semester specified for auto-generation (cycle semester is null)",
      });
    }

    // Only get courses for this program AND the target semester
    const courses = await Course.findAll({
      where: {
        program_id,
        semester: targetSemester,
      },
    });

    if (!courses.length) {
      return res.status(404).json({
        error: `No courses found for ${targetSemester === 0 ? "all semesters" : `Semester ${targetSemester}`} of this program`,
      });
    }

    const generatedSchedules = await sequelize.transaction(async (t) => {
      const results = [];
      let currentDate = new Date(start_date);

      for (const course of courses) {
        // Skip if schedule already exists for this course in this cycle
        const existing = await ExamSchedule.findOne({
          where: { exam_cycle_id, course_id: course.id },
          transaction: t,
        });

        if (!existing) {
          const schedule = await ExamSchedule.create(
            {
              exam_cycle_id,
              course_id: course.id,
              exam_date: currentDate.toISOString().split("T")[0],
              start_time,
              end_time,
              venue,
              max_marks: max_marks || cycle.max_marks || 100,
              passing_marks: passing_marks || cycle.passing_marks || 35,
            },
            { transaction: t },
          );
          results.push(schedule);
        }

        // Increment date for next exam
        currentDate.setDate(currentDate.getDate() + parseInt(gap_days) + 1);
      }
      return results;
    });

    res.status(201).json({
      success: true,
      data: generatedSchedules,
      message: generatedSchedules.length
        ? `Successfully generated ${generatedSchedules.length} schedules.`
        : "All courses for this semester already have schedules.",
    });
  } catch (error) {
    logger.error("Error auto-generating timetable:", error);
    res.status(500).json({ error: "Failed to auto-generate timetable" });
  }
};

// @desc    Get marks for a schedule (for editing)
// @route   GET /api/exam/marks/:scheduleId
// @access  Private/Faculty/Admin
exports.getScheduleMarks = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const marks = await ExamMark.findAll({
      where: { exam_schedule_id: scheduleId },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id"],
        },
      ],
    });

    res.status(200).json({ success: true, data: marks });
  } catch (error) {
    logger.error("Error fetching schedule marks:", error);
    res.status(500).json({ error: "Failed to fetch marks" });
  }
};

// @desc    Get data for bulk mark entry (students + existing marks)
// @route   GET /api/exam/marks/entry-data/:scheduleId
// @access  Private/Faculty/Admin
exports.getMarkEntryData = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // 1. Get schedule info
    const schedule = await ExamSchedule.findByPk(scheduleId, {
      include: [
        {
          model: ExamCycle,
          as: "cycle",
          attributes: [
            "id",
            "name",
            "cycle_type",
            "component_breakdown",
            "max_marks",
            "passing_marks",
          ],
          include: [{ model: Regulation, as: "regulation" }],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "name", "code", "program_id", "semester"],
        },
      ],
    });

    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    // 2. Access Control for Faculty
    const isSuperUser = [
      "super_admin",
      "admin",
      "exam_cell",
      "registrar",
    ].includes(req.user.role);
    let assignedSections = [];

    if (!isSuperUser) {
      const slots = await TimetableSlot.findAll({
        where: {
          faculty_id: req.user.userId,
          course_id: schedule.course_id,
        },
        include: [{ model: Timetable, as: "timetable" }],
      });

      if (slots.length === 0) {
        return res.status(403).json({
          error: "Access Denied: You are not assigned to this subject.",
        });
      }

      assignedSections = [
        ...new Set(slots.map((s) => s.timetable?.section)),
      ].filter(Boolean);
    }

    // 3. Determine target students
    // Filter by role 'student', current_semester (from cycle), and program (from branches)
    const semester = schedule.course.semester || 1;

    let studentWhere = {
      role: "student",
      is_active: true,
      current_semester: semester,
    };

    if (!isSuperUser && assignedSections.length > 0) {
      studentWhere.section = { [Op.in]: assignedSections };
    }

    if (schedule.branches && schedule.branches.length > 0) {
      studentWhere.program_id = { [Op.in]: schedule.branches };
    } else if (schedule.course.program_id) {
      studentWhere.program_id = schedule.course.program_id;
    }

    // 4. Fetch students with their marks for this schedule
    const students = await User.findAll({
      where: studentWhere,
      attributes: ["id", "first_name", "last_name", "student_id", "program_id"],
      include: [
        {
          model: ExamMark,
          as: "exam_marks",
          where: { exam_schedule_id: scheduleId },
          required: false,
        },
      ],
      order: [["student_id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        schedule,
        students: students.map((s) => ({
          ...s.toJSON(),
          mark: s.exam_marks && s.exam_marks[0] ? s.exam_marks[0] : null,
        })),
      },
    });
  } catch (error) {
    logger.error("Error fetching mark entry data:", error);
    res.status(500).json({ error: "Failed to fetch mark entry data" });
  }
};

// @desc    Enter marks for students
// @route   POST /api/exam/marks/bulk
// @access  Private/Faculty/Admin
exports.enterMarks = async (req, res) => {
  try {
    const { exam_schedule_id, marks_data } = req.body; // marks_data: [{student_id, marks_obtained, attendance_status, remarks}]

    const schedule = await ExamSchedule.findByPk(exam_schedule_id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    // Security check for Faculty
    const isSuperUser = [
      "super_admin",
      "admin",
      "exam_cell",
      "registrar",
    ].includes(req.user.role);
    let assignedSections = [];

    if (!isSuperUser) {
      const slots = await TimetableSlot.findAll({
        where: {
          faculty_id: req.user.userId,
          course_id: schedule.course_id,
        },
        include: [{ model: Timetable, as: "timetable" }],
      });

      if (slots.length === 0) {
        return res.status(403).json({
          error: "Access Denied: You are not assigned to this subject.",
        });
      }

      assignedSections = [
        ...new Set(slots.map((s) => s.timetable?.section)),
      ].filter(Boolean);
    }

    const savedMarks = await sequelize.transaction(async (t) => {
      const records = [];
      for (const item of marks_data) {
        // For non-admins, verify the student belongs to one of the faculty's sections
        if (!isSuperUser && assignedSections.length > 0) {
          const student = await User.findByPk(item.student_id);
          if (!student || !assignedSections.includes(student.section)) {
            continue; // Skip student not in faculty's sections
          }
        }

        // Calculate total marks - either direct or from components
        let totalMarks = parseFloat(item.marks_obtained || 0);
        let componentScores = item.component_scores || null;

        // If component scores provided, calculate total correctly
        if (componentScores && typeof componentScores === "object") {
          totalMarks = Object.values(componentScores).reduce(
            (sum, val) => sum + parseFloat(val || 0),
            0,
          );
        }

        // Apply grade scale from cycle/regulation if available
        let grade = "F";
        const isAbsent = item.attendance_status === "absent";

        if (isAbsent) {
          totalMarks = 0;
          componentScores = null;
          grade = "F";
        } else if (item.attendance_status === "present") {
          const maxMarks = schedule.max_marks || 100;
          const passingMarks = schedule.passing_marks || 35;
          const perc = (totalMarks / maxMarks) * 100;

          if (perc >= 90) grade = "O";
          else if (perc >= 80) grade = "A+";
          else if (perc >= 70) grade = "A";
          else if (perc >= 60) grade = "B+";
          else if (perc >= 50) grade = "B";
          else if (perc >= 40) grade = "P";
          else if (totalMarks >= passingMarks) grade = "P";
          else grade = "F";
        }

        const [mark, created] = await ExamMark.findOrCreate({
          where: { exam_schedule_id, student_id: item.student_id },
          defaults: {
            marks_obtained: totalMarks,
            component_scores: componentScores,
            grade,
            attendance_status: item.attendance_status,
            remarks: item.remarks,
            entered_by: req.user.userId,
            moderation_status: "draft",
            moderation_history: [
              {
                status: "draft",
                action: "created",
                by: req.user.userId,
                at: new Date(),
              },
            ],
          },
          transaction: t,
        });

        if (!created) {
          // Check if locked
          if (mark.moderation_status === "locked") {
            continue; // Skip locked records
          }

          const oldMarks = mark.marks_obtained;
          await mark.update(
            {
              marks_obtained: totalMarks,
              component_scores: componentScores,
              grade,
              attendance_status: item.attendance_status,
              remarks: item.remarks,
              entered_by: req.user.userId,
              moderation_history: [
                ...mark.moderation_history,
                {
                  status: mark.moderation_status,
                  action: "updated",
                  by: req.user.userId,
                  at: new Date(),
                  previous_value: oldMarks,
                  new_value: totalMarks,
                },
              ],
            },
            { transaction: t },
          );
        }
        records.push(mark);
      }
      return records;
    });

    res.status(200).json({ success: true, data: savedMarks });
  } catch (error) {
    logger.error("Error entering marks:", error);
    res.status(500).json({ error: "Failed to enter marks" });
  }
};

// @desc    Update moderation status of marks (Verify/Approve/Lock)
// @route   PUT /api/exam/marks/moderation
// @access  Private/Admin/HOD
exports.updateModerationStatus = async (req, res) => {
  try {
    const { exam_schedule_id, status } = req.body; // status: 'verified', 'approved', 'locked'

    const validStatuses = ["draft", "verified", "approved", "locked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update all marks for this schedule
    await ExamMark.update(
      {
        moderation_status: status,
        moderation_history: sequelize.fn(
          "jsonb_insert",
          sequelize.col("moderation_history"),
          "{999999}", // Insert at end
          sequelize.literal(
            `'${JSON.stringify({
              status,
              action: "moderation_change",
              by: req.user.userId,
              at: new Date(),
            })}'::jsonb`,
          ),
        ),
      },
      { where: { exam_schedule_id } },
    );

    res
      .status(200)
      .json({ success: true, message: `Marks ${status} successfully` });
  } catch (error) {
    logger.error("Error updating moderation status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};

// @desc    Get student's exam results
// @route   GET /api/exam/my-results
// @access  Private/Student
exports.getMyResults = async (req, res) => {
  try {
    const { semester } = req.query;
    const student_id = req.user.userId;

    // Build include for course filtering
    const courseInclude = {
      model: Course,
      as: "course",
      attributes: ["name", "code", "semester", "credits"],
      required: false, // LEFT JOIN to avoid filtering out parent records
    };

    // If semester is specified, filter courses by semester
    if (semester) {
      courseInclude.where = { semester: parseInt(semester) };
      courseInclude.required = true; // INNER JOIN when filtering
    }

    const results = await ExamMark.findAll({
      where: { student_id, moderation_status: "locked" },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          required: semester ? true : false, // INNER JOIN when filtering by semester
          include: [
            courseInclude,
            {
              model: ExamCycle,
              as: "cycle",
              attributes: ["name", "cycle_type", "instance_number"],
            },
          ],
        },
      ],
    });

    // Fetch persistent semester results for GPA/CGPA
    const semesterResults = await SemesterResult.findAll({
      where: { student_id },
      order: [["semester", "ASC"]],
    });

    const targetSemester = semester
      ? parseInt(semester, 10)
      : semesterResults.length > 0
        ? semesterResults[semesterResults.length - 1].semester
        : null;

    const currentSemResult = semesterResults.find(
      (r) => r.semester === targetSemester,
    );

    let currentSemesterGPA = currentSemResult
      ? parseFloat(currentSemResult.sgpa).toFixed(2)
      : "0.00";
    let currentSemesterCredits = currentSemResult
      ? currentSemResult.total_credits
      : 0;
    let semesterGainedCredits = currentSemResult
      ? currentSemResult.earned_credits
      : 0;

    // Calculate overall CGPA from all persistent SGPAs
    let totalWeightedPoints = 0;
    let overallPossibleCredits = 0;
    let overallGainedCredits = 0;

    semesterResults.forEach((r) => {
      totalWeightedPoints += parseFloat(r.sgpa) * r.total_credits;
      overallPossibleCredits += r.total_credits;
      overallGainedCredits += r.earned_credits;
    });

    let overallCGPA =
      overallPossibleCredits > 0
        ? (totalWeightedPoints / overallPossibleCredits).toFixed(2)
        : "0.00";

    // Group results by cycle type
    const groupedResults = {
      mid_term: [],
      internal_lab: [],
      external_lab: [],
      end_semester: [],
      project: [],
      other: [],
    };

    results.forEach((res) => {
      const cycleType = res.schedule?.cycle?.cycle_type;
      if (cycleType === "mid_term") groupedResults.mid_term.push(res);
      else if (["internal_lab", "external_lab"].includes(cycleType))
        groupedResults[cycleType].push(res);
      else if (cycleType === "end_semester")
        groupedResults.end_semester.push(res);
      else if (cycleType === "project_review") groupedResults.project.push(res);
      else groupedResults.other.push(res);
    });

    res.status(200).json({
      success: true,
      data: groupedResults,
      raw: results, // Keep raw for backward compatibility/GPA calc
      gpa: {
        currentSemester: currentSemesterGPA,
        overall: overallCGPA,
        totalGainedCredits: overallGainedCredits,
        totalPossibleCredits: overallPossibleCredits,
        semesterGainedCredits: semesterGainedCredits,
        semesterPossibleCredits: currentSemesterCredits,
      },
    });
  } catch (error) {
    logger.error("Error fetching my results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

// @desc    Get student's own exam schedules
// @route   GET /api/exam/my-schedules
// @access  Private/Student
exports.getMyExamSchedules = async (req, res) => {
  try {
    const student = await User.findByPk(req.user.userId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const { program_id, current_semester } = student;

    const schedules = await ExamSchedule.findAll({
      include: [
        {
          model: Course,
          as: "course",
          where: {
            semester: current_semester || 1,
          },
          attributes: ["name", "code", "credits", "course_type"],
        },
        {
          model: ExamCycle,
          as: "cycle",
          where: {
            status: {
              [Op.in]: [
                "scheduled",
                "ongoing",
                "completed",
                "results_published",
              ],
            },
          },
          attributes: [
            "id",
            "name",
            "cycle_type",
            "instance_number",
            "start_date",
            "end_date",
            "max_marks",
            "passing_marks",
            "component_breakdown",
          ],
        },
      ],
      where: {
        [Op.or]: [
          { branches: { [Op.eq]: [] } }, // Empty array = Common
          { branches: null }, // Null = Common
          { branches: { [Op.contains]: [program_id] } }, // Specific branch
        ],
      },
      order: [
        ["exam_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    logger.error("Error fetching student schedules:", error);
    res.status(500).json({ error: "Failed to fetch your schedules" });
  }
};

// @desc    Get consolidated semester results with weighted average
// @route   GET /api/exam/consolidated-results
// @access  Private/Admin/HOD
exports.getConsolidatedResults = async (req, res) => {
  try {
    const { program_id, semester, batch_year, section, exam_cycle_id } =
      req.query;

    const semInt = parseInt(semester, 10);
    const batchInt = parseInt(batch_year, 10);

    // Fetch target cycle if provided
    let targetCycle = null;
    if (exam_cycle_id) {
      targetCycle = await ExamCycle.findByPk(exam_cycle_id);
      logger.info(`PublishMarks: Cycle Type: ${targetCycle?.cycle_type}`);
    }

    // STRICT: Only 'end_semester' cycle results show SGPA/Grades.
    const isFinalSemester = targetCycle?.cycle_type === "end_semester";
    logger.info(`PublishMarks: isFinalSemester: ${isFinalSemester}`);

    const studentWhere = { role: "student" };
    if (program_id) studentWhere.program_id = program_id;
    if (batch_year) studentWhere.batch_year = batchInt;
    if (section) studentWhere.section = section;

    const students = await User.findAll({
      where: studentWhere,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "student_id",
        "section",
        "regulation_id",
      ],
      include: [
        {
          model: Regulation,
          as: "regulation",
          attributes: ["id", "name", "exam_structure", "grade_scale"],
        },
      ],
      order: [["student_id", "ASC"]],
    });

    const studentIds = students.map((s) => s.id);

    // Fetch all marks for these students in this semester/batch
    const marks = await ExamMark.findAll({
      where: { student_id: studentIds },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          required: true,
          include: [
            {
              model: ExamCycle,
              as: "cycle",
              where: { semester: semInt, batch_year: batchInt },
              attributes: [
                "id",
                "name",
                "cycle_type",
                "instance_number",
                "regulation_id",
              ],
            },
            {
              model: Course,
              as: "course",
              attributes: ["id", "name", "code", "credits", "course_type"],
            },
          ],
        },
      ],
    });

    // Import FormulaEngine
    const FormulaEngine = require("../services/FormulaEngine");

    // Process results per student
    const consolidated = students.map((student) => {
      const studentMarks = marks.filter((m) => m.student_id === student.id);
      const regulation = student.regulation;

      if (!regulation || !regulation.exam_structure) {
        return {
          ...student.toJSON(),
          courses: [],
          sgpa: "0.00",
          error: "No regulation or exam structure configured",
        };
      }

      const examStructure = regulation.exam_structure;
      const gradeScale = regulation.grade_scale || [];
      const coursesMap = {};

      // Group marks by course
      studentMarks.forEach((m) => {
        const courseId = m.schedule.course.id;
        const courseType = m.schedule.course.course_type || "theory";
        const cycleType = m.schedule.cycle.cycle_type;
        const instanceNum = m.schedule.cycle.instance_number;

        if (!coursesMap[courseId]) {
          coursesMap[courseId] = {
            course_name: m.schedule.course.name,
            course_code: m.schedule.course.code,
            credits: m.schedule.course.credits,
            course_type: courseType,
            marks_by_cycle: {},
          };
        }

        // Store marks by cycle type and instance
        const key = `${cycleType}_${instanceNum}`;
        coursesMap[courseId].marks_by_cycle[key] = {
          cycle_type: cycleType,
          instance: instanceNum,
          marks: m.marks_obtained,
          component_scores: m.component_scores,
        };
      });

      // Calculate final marks per course
      const finalCourses = Object.values(coursesMap).map((courseData) => {
        const { course_type, marks_by_cycle } = courseData;
        let finalMarks = 0;
        let isInternalOnly = !isFinalSemester;

        if (isInternalOnly && targetCycle) {
          // Internal view: Only show marks for the selected cycle
          const key = `${targetCycle.cycle_type}_${targetCycle.instance_number}`;
          finalMarks = Number(marks_by_cycle[key]?.marks || 0);
        } else {
          // Final Semester view: Aggregate mids and end sem
          if (course_type === "theory") {
            const theoryConfig = examStructure.theory_courses || {};
            const midConfig = theoryConfig.mid_terms || {};
            const midFormula = midConfig.aggregation_formula || "AVERAGE";
            const midMarks = Object.values(marks_by_cycle)
              .filter((m) => m.cycle_type === "mid_term")
              .map((m) => Number(m.marks || 0));

            const midContribution =
              midMarks.length > 0
                ? FormulaEngine.execute(midFormula, midMarks)
                : 0;

            const endSemMark = Object.values(marks_by_cycle).find(
              (m) => m.cycle_type === "end_semester",
            );
            const endSemMarks = endSemMark ? Number(endSemMark.marks || 0) : 0;
            finalMarks = midContribution + endSemMarks;
          } else if (course_type === "lab") {
            const internalMark = Object.values(marks_by_cycle).find(
              (m) => m.cycle_type === "internal_lab",
            );
            const externalMark = Object.values(marks_by_cycle).find(
              (m) => m.cycle_type === "external_lab",
            );
            finalMarks =
              Number(internalMark?.marks || 0) +
              Number(externalMark?.marks || 0);
          } else if (course_type === "project") {
            const projectMark = Object.values(marks_by_cycle).find(
              (m) => m.cycle_type === "project_review",
            );
            finalMarks = Number(projectMark?.marks || 0);
          }
        }

        // Apply grade from regulation's grade scale
        let grade = "-";
        let points = 0;

        if (!isInternalOnly) {
          const gradeEntry = gradeScale.find(
            (g) => finalMarks >= g.min && finalMarks <= g.max,
          );
          grade = gradeEntry?.grade || "F";
          points = gradeEntry?.points || 0;
        }

        return {
          ...courseData,
          finalMarks: Number(finalMarks).toFixed(2),
          totalScore: Number(finalMarks).toFixed(2),
          grade,
          points,
          isInternalOnly,
        };
      });

      // Calculate SGPA (only for final semester results)
      let totalPoints = 0;
      let totalCredits = 0;
      finalCourses.forEach((c) => {
        totalPoints += (Number(c.points) || 0) * (Number(c.credits) || 0);
        totalCredits += Number(c.credits) || 0;
      });

      const sgpa =
        isFinalSemester && totalCredits > 0
          ? (totalPoints / totalCredits).toFixed(2)
          : null;

      // Determine overall moderation status for this view
      let status = "draft";
      if (!isFinalSemester && targetCycle) {
        const key = `${targetCycle.cycle_type}_${targetCycle.instance_number}`;
        const relevantMark = studentMarks.find((m) => {
          return (
            m.schedule.cycle.cycle_type === targetCycle.cycle_type &&
            m.schedule.cycle.instance_number === targetCycle.instance_number
          );
        });
        status = relevantMark?.moderation_status || "draft";
      } else {
        // For final tabulation, it's 'locked' only if end_semester marks are locked
        const endSemMark = studentMarks.find(
          (m) => m.schedule.cycle.cycle_type === "end_semester",
        );
        status = endSemMark?.moderation_status || "draft";
      }

      return {
        ...student.toJSON(),
        courses: finalCourses,
        sgpa,
        moderation_status: status,
        isFinalSemester,
        reportType: isFinalSemester
          ? "Final Tabulation"
          : `${targetCycle?.name} Scores`,
      };
    });

    res.status(200).json({ success: true, data: consolidated });
  } catch (error) {
    logger.error("Error in getConsolidatedResults:", error);
    res.status(500).json({ error: "Failed to process results" });
  }
};

// @desc    Generate Hall Ticket
// @route   POST /api/exam/hall-ticket/generate
// @desc    Bulk import marks from CSV/Excel
// @route   POST /api/exam/marks/bulk-import
// @access  Private/Admin
exports.bulkImportMarks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file" });
    }

    const { exam_cycle_id } = req.body;
    if (!exam_cycle_id) {
      return res.status(400).json({ error: "Exam cycle ID is required" });
    }

    const cycle = await ExamCycle.findByPk(exam_cycle_id);
    if (!cycle) return res.status(404).json({ error: "Exam cycle not found" });

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Cleanup temp file
    fs.unlinkSync(filePath);

    if (data.length === 0) {
      return res.status(400).json({ error: "The uploaded file is empty" });
    }

    const results = await sequelize.transaction(async (t) => {
      const importStats = { success: 0, failed: 0, errors: [] };

      for (const row of data) {
        try {
          // Expected headers: "Student ID", "Course Code", "Marks", "Attendance", "Remarks"
          const studentRegNo =
            row["Student ID"] || row["student_id"] || row["Reg No"];
          const courseCode = row["Course Code"] || row["course_code"];
          const marks = parseFloat(row["Marks"] || row["marks"] || 0);
          const attendance = (
            row["Attendance"] ||
            row["attendance"] ||
            "present"
          ).toLowerCase();
          const isAbsent = attendance === "absent";
          const remarks = row["Remarks"] || row["remarks"] || "";

          if (!studentRegNo || !courseCode) {
            importStats.failed++;
            importStats.errors.push(
              `Missing Student ID or Course Code in row: ${JSON.stringify(row)}`,
            );
            continue;
          }

          // 1. Find Student
          const student = await User.findOne({
            where: { student_id: studentRegNo, role: "student" },
            transaction: t,
          });
          if (!student) {
            importStats.failed++;
            importStats.errors.push(
              `Student with ID ${studentRegNo} not found`,
            );
            continue;
          }

          // 2. Find Course & Schedule
          const course = await Course.findOne({
            where: { code: courseCode },
            transaction: t,
          });
          if (!course) {
            importStats.failed++;
            importStats.errors.push(`Course with code ${courseCode} not found`);
            continue;
          }

          const schedule = await ExamSchedule.findOne({
            where: { exam_cycle_id, course_id: course.id },
            transaction: t,
          });

          if (!schedule) {
            importStats.failed++;
            importStats.errors.push(
              `No exam schedule found for course ${courseCode} in this cycle`,
            );
            continue;
          }

          // 3. Calculate Grade
          let grade = "F";
          let finalMarks = marks;

          if (isAbsent) {
            finalMarks = 0;
            grade = "F";
          } else if (attendance === "present") {
            const maxMarks = schedule.max_marks || cycle.max_marks || 100;
            const perc = (marks / maxMarks) * 100;

            // Simplified grading for bulk import - can be expanded to use Regulation scales
            if (perc >= 90) grade = "O";
            else if (perc >= 80) grade = "A+";
            else if (perc >= 70) grade = "A";
            else if (perc >= 60) grade = "B";
            else if (perc >= 50) grade = "C";
            else if (perc >= 40) grade = "D";
            else grade = "F";
          }

          // 4. Upsert Mark
          await ExamMark.upsert(
            {
              exam_schedule_id: schedule.id,
              student_id: student.id,
              marks_obtained: finalMarks,
              grade,
              attendance_status: isAbsent ? "absent" : "present",
              remarks,
              entered_by: req.user.userId,
              moderation_status: "draft", // Bulk imports start as draft now
            },
            { transaction: t },
          );

          importStats.success++;
        } catch (err) {
          importStats.failed++;
          importStats.errors.push(`Error processing row: ${err.message}`);
        }
      }

      return importStats;
    });

    res.status(200).json({
      success: true,
      data: results,
      message: `Import completed: ${results.success} succeeded, ${results.failed} failed.`,
    });
  } catch (error) {
    logger.error("Error importing marks:", error);
    res.status(500).json({ error: "Failed to import marks" });
  }
};

// @desc    Download Bulk Import Template
// @route   GET /api/exam/marks/template?exam_cycle_id=...
// @access  Private/Admin
exports.downloadImportTemplate = async (req, res) => {
  try {
    const { exam_cycle_id } = req.query;
    if (!exam_cycle_id) {
      return res.status(400).json({ error: "Exam cycle ID is required" });
    }

    const schedules = await ExamSchedule.findAll({
      where: { exam_cycle_id },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["code", "name", "semester"],
        },
        { model: ExamCycle, as: "cycle", attributes: ["name"] },
      ],
    });

    if (schedules.length === 0) {
      return res
        .status(404)
        .json({ error: "No schedules found for this cycle" });
    }

    // Create a worksheet with instructions and sample data
    const templateData = [
      ["Student ID", "Course Code", "Marks", "Attendance", "Remarks"],
      ["STU001", schedules[0].course.code, "75", "present", "Good"],
      ["STU002", schedules[0].course.code, "0", "absent", "Medical leave"],
    ];

    // Optionally add all students for this cycle/semester to make it easier
    // But for a template, headers + sample is often enough.

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(templateData);
    xlsx.utils.book_append_sheet(wb, ws, "Marks Import Template");

    // Add a second sheet with reference data (courses)
    const refData = [["Course Code", "Course Name"]];
    schedules.forEach((s) => refData.push([s.course.code, s.course.name]));
    const wsRef = xlsx.utils.aoa_to_sheet(refData);
    xlsx.utils.book_append_sheet(wb, wsRef, "Course Reference");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Marks_Import_Template_${schedules[0].cycle.name}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    logger.error("Error generating template:", error);
    res.status(500).json({ error: "Failed to generate template" });
  }
};
// @access  Private/Admin
exports.generateHallTickets = async (req, res) => {
  try {
    const { exam_cycle_id, student_ids } = req.body;

    const tickets = await sequelize.transaction(async (t) => {
      const generated = [];
      for (const sid of student_ids) {
        const ticket_number =
          `HT-${Date.now()}-${sid.substring(0, 4)}`.toUpperCase();
        const [ticket, created] = await HallTicket.findOrCreate({
          where: { exam_cycle_id, student_id: sid },
          defaults: { ticket_number },
          transaction: t,
        });
        generated.push(ticket);
      }
      return generated;
    });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    logger.error("Error generating hall tickets:", error);
    res.status(500).json({ error: "Hall ticket generation failed" });
  }
};

// @desc    Bulk publish (lock) marks for a cycle/program/section
// @route   POST /api/exam/marks/bulk-publish
// @access  Private/Admin/Registrar
exports.bulkPublishResults = async (req, res) => {
  try {
    const { exam_cycle_id, program_id, section, batch_year, semester } =
      req.body;

    if (!exam_cycle_id) {
      return res.status(400).json({ error: "Exam Cycle ID is required" });
    }

    // 1. Build where clause for ExamMarks
    // We need to find all schedules belonging to the cycle
    const scheduleWhere = { exam_cycle_id };

    const schedules = await ExamSchedule.findAll({
      where: scheduleWhere,
      include: [
        {
          model: Course,
          as: "course",
          where: program_id ? { program_id } : {},
        },
      ],
    });

    const scheduleIds = schedules.map((s) => s.id);

    // 2. Build where clause for students if section or batch info is provided
    let studentIds = null;
    if (section || batch_year || semester) {
      const studentWhere = { role: "student" };
      if (section) studentWhere.section = section;
      if (batch_year) studentWhere.batch_year = parseInt(batch_year, 10);
      if (semester) studentWhere.current_semester = parseInt(semester, 10);
      if (program_id) studentWhere.program_id = program_id;

      const students = await User.findAll({
        where: studentWhere,
        attributes: ["id"],
      });
      studentIds = students.map((s) => s.id);
    }

    // 3. Update moderation_status to 'locked'
    const updateWhere = {
      exam_schedule_id: { [Op.in]: scheduleIds },
    };
    if (studentIds) {
      updateWhere.student_id = { [Op.in]: studentIds };
    }

    const [updatedCount] = await ExamMark.update(
      {
        moderation_status: "locked",
        moderation_history: sequelize.fn(
          "jsonb_insert",
          sequelize.col("moderation_history"),
          "{999999}",
          sequelize.literal(
            `'${JSON.stringify({
              status: "locked",
              action: "bulk_publish",
              by: req.user.userId,
              at: new Date(),
            })}'::jsonb`,
          ),
        ),
      },
      { where: updateWhere },
    );

    // 4. Calculate SGPA for affected students (if it's a final result cycle)
    const cycle = await ExamCycle.findByPk(exam_cycle_id);
    const finalCycleTypes = ["end_semester", "external_lab", "project_review"];

    if (cycle && finalCycleTypes.includes(cycle.cycle_type)) {
      // Get all affected student IDs for SGPA calculation
      let finalStudentIds = studentIds;
      if (!finalStudentIds) {
        // If studentIds was not provided initially, we need to find all students in the updateWhere
        const affectedMarks = await ExamMark.findAll({
          where: updateWhere,
          attributes: ["student_id"],
          group: ["student_id"],
        });
        finalStudentIds = affectedMarks.map((m) => m.student_id);
      }

      if (finalStudentIds && finalStudentIds.length > 0) {
        for (const student_id of finalStudentIds) {
          // Fetch student's regulation to get grade scale
          const student = await User.findByPk(student_id, {
            include: [
              {
                model: Regulation,
                as: "regulation",
                attributes: ["grade_scale"],
              },
            ],
          });

          if (!student || !student.regulation) {
            logger.warn(
              `Student ${student_id} has no regulation assigned, skipping SGPA calculation`,
            );
            continue;
          }

          const gradeScale = student.regulation.grade_scale || [];
          if (gradeScale.length === 0) {
            logger.warn(
              `Regulation for student ${student_id} has no grade scale configured, skipping SGPA calculation`,
            );
            continue;
          }

          // Build grade points map from regulation
          const gradePointsMap = {};
          gradeScale.forEach((entry) => {
            if (entry.grade && entry.points !== undefined) {
              gradePointsMap[entry.grade.trim().toUpperCase()] = entry.points;
            }
          });

          // Fetch all final results for this student for THIS semester
          const studentMarks = await ExamMark.findAll({
            where: {
              student_id,
              moderation_status: "locked",
            },
            include: [
              {
                model: ExamSchedule,
                as: "schedule",
                required: true,
                include: [
                  {
                    model: Course,
                    as: "course",
                    where:
                      semester || cycle.semester
                        ? { semester: parseInt(semester || cycle.semester, 10) }
                        : {},
                    required: true,
                  },
                  {
                    model: ExamCycle,
                    as: "cycle",
                    where: { cycle_type: { [Op.in]: finalCycleTypes } },
                    required: true,
                  },
                ],
              },
            ],
          });

          if (studentMarks.length > 0) {
            let totalPoints = 0;
            let totalCredits = 0;
            let earnedCredits = 0;

            // Group by course to avoid duplicates if multiple final cycles exist
            const courseResults = {};
            studentMarks.forEach((m) => {
              const courseId = m.schedule.course.id;
              if (
                !courseResults[courseId] ||
                m.schedule.cycle.cycle_type === "end_semester"
              ) {
                courseResults[courseId] = m;
              }
            });

            Object.values(courseResults).forEach((m) => {
              const credits = m.schedule?.course?.credits || 3;
              const gradeClean = (m.grade || "").trim().toUpperCase();
              const points = gradePointsMap[gradeClean] || 0;
              totalPoints += points * credits;
              totalCredits += credits;
              if (gradeClean !== "F" && gradeClean !== "") {
                earnedCredits += credits;
              }
            });

            const currentSemester =
              studentMarks[0].schedule.course.semester || cycle.semester;
            const currentBatchYear =
              batch_year ||
              studentMarks[0].schedule.cycle.batch_year ||
              cycle.batch_year ||
              new Date().getFullYear();

            const sgpaValue =
              totalCredits > 0
                ? (totalPoints / totalCredits).toFixed(2)
                : "0.00";

            // Upsert into SemesterResult
            await SemesterResult.upsert({
              student_id,
              semester: currentSemester,
              batch_year: currentBatchYear,
              sgpa: sgpaValue,
              total_credits: totalCredits,
              earned_credits: earnedCredits,
              exam_cycle_id,
              published_by: req.user.userId,
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully published ${updatedCount} results and updated SGPAs.`,
      updatedCount,
    });
  } catch (error) {
    logger.error("Error bulk publishing results:", error);
    res.status(500).json({ error: "Failed to publish results" });
  }
};
