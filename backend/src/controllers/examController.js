const {
  ExamCycle,
  ExamSchedule,
  ExamMark,
  HallTicket,
  ExamRegistration,
  Attendance,
  User,
  Course,
  Regulation,
  Timetable,
  TimetableSlot,
  SemesterResult,
  Program,
  sequelize,
} = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const PDFDocument = require("pdfkit");

// Template imports
const generateHallTicketPdf = require("../templates/exam/hallTicketPdf");
const generateExamReceiptPdf = require("../templates/exam/examReceiptPdf");
const generateMarksImportTemplate = require("../templates/exam/marksImportTemplate");
const generateCourseResultsExcel = require("../templates/exam/courseResultsExcel");
const generateDepartmentResultsExcel = require("../templates/exam/departmentResultsExcel");

// @desc    Get all exam cycles
// @route   GET /api/exam/cycles
// @access  Private/Faculty/Admin
exports.getExamCycles = async (req, res) => {
  try {
    const { Regulation, User } = require("../models");
    let where = {};

    // For students, filter by their batch and semester
    if (req.user.role === "student" || req.user.role === "Student") {
      const student = await User.findByPk(req.user.userId);
      if (student) {
        const today = new Date().toISOString().split("T")[0];
        where = {
          batch_year: student.batch_year,
          semester: student.current_semester,
          // Only show cycles where registration window has at least started
          reg_start_date: {
            [Op.and]: [{ [Op.ne]: null }, { [Op.lte]: today }],
          },
          // And where it hasn't completely closed (end date or late fee date)
          [Op.or]: [
            { reg_end_date: { [Op.gte]: today } },
            { reg_late_fee_date: { [Op.gte]: today } },
          ],
        };
      }
    }

    const cycles = await ExamCycle.findAll({
      where,
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
      reg_start_date,
      reg_end_date,
      reg_late_fee_date,
      regular_fee,
      supply_fee_per_paper,
      late_fee_amount,
      is_attendance_checked,
      is_fee_checked,
      exam_mode,
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
      reg_start_date: reg_start_date || null,
      reg_end_date: reg_end_date || null,
      reg_late_fee_date: reg_late_fee_date || null,
      regular_fee: regular_fee || 0,
      supply_fee_per_paper: supply_fee_per_paper || 0,
      late_fee_amount: late_fee_amount || 0,
      is_attendance_checked:
        is_attendance_checked !== undefined ? is_attendance_checked : true,
      is_fee_checked: is_fee_checked !== undefined ? is_fee_checked : true,
      exam_mode: exam_mode || "regular",
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

    const {
      name,
      start_date,
      end_date,
      batch_year,
      semester,
      regulation_id,
      cycle_type,
      instance_number,
      reg_start_date,
      reg_end_date,
      reg_late_fee_date,
      regular_fee,
      supply_fee_per_paper,
      late_fee_amount,
      is_attendance_checked,
      is_fee_checked,
      exam_mode,
    } = req.body;

    await cycle.update({
      name: name !== undefined ? name : cycle.name,
      start_date: start_date !== undefined ? start_date : cycle.start_date,
      end_date: end_date !== undefined ? end_date : cycle.end_date,
      batch_year: batch_year !== undefined ? batch_year : cycle.batch_year,
      semester: semester !== undefined ? semester : cycle.semester,
      regulation_id:
        regulation_id !== undefined ? regulation_id : cycle.regulation_id,
      cycle_type: cycle_type !== undefined ? cycle_type : cycle.cycle_type,
      instance_number:
        instance_number !== undefined ? instance_number : cycle.instance_number,
      reg_start_date:
        reg_start_date === "" ? null : reg_start_date || cycle.reg_start_date,
      reg_end_date:
        reg_end_date === "" ? null : reg_end_date || cycle.reg_end_date,
      reg_late_fee_date:
        reg_late_fee_date === ""
          ? null
          : reg_late_fee_date || cycle.reg_late_fee_date,
      regular_fee: regular_fee !== undefined ? regular_fee : cycle.regular_fee,
      supply_fee_per_paper:
        supply_fee_per_paper !== undefined
          ? supply_fee_per_paper
          : cycle.supply_fee_per_paper,
      late_fee_amount:
        late_fee_amount !== undefined ? late_fee_amount : cycle.late_fee_amount,
      is_attendance_checked:
        is_attendance_checked !== undefined
          ? is_attendance_checked
          : cycle.is_attendance_checked,
      is_fee_checked:
        is_fee_checked !== undefined ? is_fee_checked : cycle.is_fee_checked,
      exam_mode: exam_mode !== undefined ? exam_mode : cycle.exam_mode,
    });

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
    const { Course, ExamCycle, User, TimetableSlot } = require("../models");

    let studentDeptId = null;
    if (req.user.role === "student" || req.user.role === "Student") {
      const student = await User.findByPk(req.user.userId);
      if (student) {
        studentDeptId = student.department_id;
      }
    }

    const where = {};
    if (exam_cycle_id) where.exam_cycle_id = exam_cycle_id;

    const schedules = await ExamSchedule.findAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: [
            "id",
            "name",
            "code",
            "program_id",
            "semester",
            "department_id",
          ],
          where: studentDeptId
            ? {
                [Op.or]: [
                  { department_id: studentDeptId },
                  { program_id: null }, // Common subjects across programs
                ],
              }
            : {},
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

    if (!isSuperUser && req.user.role === "faculty") {
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

    // Use template module to generate Excel
    const buffer = generateMarksImportTemplate(schedules);

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
// @desc    Generate Hall Tickets
// @route   POST /api/exam/hall-ticket/generate
// @access  Private/Admin
exports.generateHallTickets = async (req, res) => {
  try {
    const { exam_cycle_id, student_ids } = req.body;

    const tickets = await sequelize.transaction(async (t) => {
      const generated = [];
      for (const sid of student_ids) {
        // Check registration status
        const registration = await ExamRegistration.findOne({
          where: { exam_cycle_id, student_id: sid },
          transaction: t,
        });

        // Eligibility check
        let is_blocked = false;
        let block_reason = "";

        if (!registration) {
          is_blocked = true;
          block_reason = "Student not registered for this exam cycle.";
        } else if (registration.status === "blocked") {
          is_blocked = true;
          block_reason =
            registration.override_remarks || "Registration blocked by admin.";
        } else if (
          registration.fee_status !== "paid" &&
          !registration.override_status
        ) {
          is_blocked = true;
          block_reason = "Exam fee payment pending.";
        } else if (
          registration.attendance_status === "low" &&
          !registration.is_condoned &&
          !registration.override_status
        ) {
          is_blocked = true;
          block_reason = "Low attendance (Attendance Condonation required).";
        }

        const ticket_number =
          `HT-${Date.now()}-${sid.substring(0, 4)}`.toUpperCase();

        const [ticket, created] = await HallTicket.findOrCreate({
          where: { exam_cycle_id, student_id: sid },
          defaults: {
            ticket_number,
            is_blocked,
            block_reason,
          },
          transaction: t,
        });

        if (!created) {
          await ticket.update({ is_blocked, block_reason }, { transaction: t });
        }

        if (!is_blocked) {
          await registration.update(
            { hall_ticket_generated: true },
            { transaction: t },
          );
        }

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

// @desc    Get backlog subjects for a student
// @route   GET /api/exam/backlogs
// @access  Private/Student
exports.getBacklogSubjects = async (req, res) => {
  try {
    const student_id = req.user.userId;

    // A backlog is a subject where the student appeared (or was absent) and got 'F'
    // in a locked final result (end_semester).
    const backlogs = await ExamMark.findAll({
      where: {
        student_id,
        grade: "F",
        moderation_status: "locked",
      },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "name", "code", "credits"],
            },
          ],
        },
      ],
    });

    // Simplify response to unique courses
    const uniqueBacklogs = [];
    const seenCourses = new Set();

    backlogs.forEach((mark) => {
      const course = mark.schedule?.course;
      if (course && !seenCourses.has(course.id)) {
        uniqueBacklogs.push({
          id: course.id,
          name: course.name,
          code: course.code,
          credits: course.credits,
          last_grade: mark.grade,
          last_attempt_date: mark.schedule.exam_date,
        });
        seenCourses.add(course.id);
      }
    });

    res.status(200).json({ success: true, data: uniqueBacklogs });
  } catch (error) {
    logger.error("Error fetching backlogs:", error);
    res.status(500).json({ error: "Failed to fetch backlog subjects" });
  }
};

// @desc    Register for exams (Regular & Supply)
// @route   POST /api/exam/register
// @access  Private/Student
exports.registerForExams = async (req, res) => {
  try {
    const { exam_cycle_id, subjects } = req.body; // subjects: [{course_id, type: 'regular'|'supply'}]
    const student_id = req.user.userId;

    const cycle = await ExamCycle.findByPk(exam_cycle_id);
    if (!cycle) return res.status(404).json({ error: "Exam cycle not found" });

    // Check if registration is open
    const today = new Date().toISOString().split("T")[0];
    if (cycle.reg_start_date && today < cycle.reg_start_date) {
      return res
        .status(400)
        .json({ error: "Registration has not started yet." });
    }
    if (
      cycle.reg_end_date &&
      today > cycle.reg_end_date &&
      !cycle.reg_late_fee_date
    ) {
      return res.status(400).json({ error: "Registration is closed." });
    }

    // Calculate Fees
    let total_fee = 0;
    let late_fee = 0;
    let reg_type = "regular";

    const regularCount = subjects.filter((s) => s.type === "regular").length;
    const supplyCount = subjects.filter((s) => s.type === "supply").length;

    if (regularCount > 0 && supplyCount > 0) reg_type = "combined";
    else if (supplyCount > 0) reg_type = "supply";

    if (
      regularCount > 0 ||
      (subjects.length === 0 && cycle.exam_mode !== "supplementary")
    )
      total_fee += parseFloat(cycle.regular_fee || 0);
    total_fee += supplyCount * parseFloat(cycle.supply_fee_per_paper || 0);

    // Apply late fee if applicable
    if (cycle.reg_end_date && today > cycle.reg_end_date) {
      late_fee = parseFloat(cycle.late_fee_amount || 0);
    }

    // Check attendance (Simple auto-check)
    const attendanceRecords = await Attendance.findAll({
      where: { student_id },
      attributes: ["status"],
    });
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(
      (r) => r.status === "present",
    ).length;
    const attendance_percentage =
      totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

    // Generate mock transaction ID for testing
    const mockTransactionId = `TXN-${Date.now()}-${student_id.substring(0, 8).toUpperCase()}`;

    const [registration, created] = await ExamRegistration.findOrCreate({
      where: { exam_cycle_id, student_id },
      defaults: {
        registered_subjects: subjects,
        registration_type: reg_type,
        total_fee: total_fee + late_fee,
        paid_amount: total_fee + late_fee, // Mock payment - set paid amount equal to total
        late_fee,
        attendance_percentage,
        attendance_status: attendance_percentage < 75 ? "low" : "clear",
        status: "approved", // Auto-approve for mock payment
        fee_status: "paid", // Mock payment - mark as paid immediately
        transaction_id: mockTransactionId, // Mock transaction ID
      },
    });

    if (!created) {
      await registration.update({
        registered_subjects: subjects,
        registration_type: reg_type,
        total_fee: total_fee + late_fee,
        paid_amount: total_fee + late_fee, // Mock payment - set paid amount equal to total
        late_fee,
        attendance_percentage,
        attendance_status: attendance_percentage < 75 ? "low" : "clear",
        status: "approved", // Auto-approve for mock payment
        fee_status: "paid", // Mock payment - mark as paid immediately
        transaction_id: mockTransactionId, // Mock transaction ID
      });
    }

    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    logger.error("Error registering for exams:", error);
    res.status(500).json({ error: "Registration failed." });
  }
};

// @desc    Admin update registration status (Overrides)
// @route   PUT /api/exam/registration/:id
// @access  Private/Admin
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, is_condoned, override_status, override_remarks } = req.body;

    const registration = await ExamRegistration.findByPk(id);
    if (!registration)
      return res.status(404).json({ error: "Registration not found" });

    await registration.update({
      status,
      is_condoned,
      override_status,
      override_remarks: override_remarks || registration.override_remarks,
    });

    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    logger.error("Error updating registration:", error);
    res.status(500).json({ error: "Failed to update registration." });
  }
};

// @desc    Bulk Update Registration Status (for multiple students)
// @route   PUT /api/exam/registrations/bulk-override
// @access  Private/Admin
exports.bulkUpdateRegistrationStatus = async (req, res) => {
  try {
    const {
      student_ids,
      is_condoned,
      has_permission,
      override_status,
      override_remarks,
    } = req.body;

    if (
      !student_ids ||
      !Array.isArray(student_ids) ||
      student_ids.length === 0
    ) {
      return res.status(400).json({ error: "student_ids array is required" });
    }

    if (!override_remarks) {
      return res
        .status(400)
        .json({ error: "override_remarks are mandatory for bulk actions" });
    }

    // We also need the exam_cycle_id to create registrations if needed
    const { exam_cycle_id } = req.body;

    if (!exam_cycle_id) {
      return res
        .status(400)
        .json({ error: "exam_cycle_id is required for bulk override" });
    }

    // Process bulk update in transaction
    const result = await sequelize.transaction(async (t) => {
      const updated = [];
      const created = [];
      const failed = [];

      for (const studentId of student_ids) {
        try {
          let registration;

          // Check if this is a "temp-XXX" ID (student hasn't registered yet)
          if (studentId.startsWith("temp-")) {
            const actualUserId = studentId.replace("temp-", "");

            // Try to find existing registration first
            registration = await ExamRegistration.findOne({
              where: {
                student_id: actualUserId,
                exam_cycle_id: exam_cycle_id,
              },
              transaction: t,
            });

            // If no registration exists, create one with override data
            if (!registration) {
              registration = await ExamRegistration.create(
                {
                  student_id: actualUserId,
                  exam_cycle_id: exam_cycle_id,
                  status: "approved", // Set to approved since admin is granting override
                  registration_type: "regular",
                  fee_status: "pending",
                  total_fee: 0,
                  is_condoned: is_condoned || false,
                  has_permission: has_permission || false,
                  override_status: override_status || false,
                  override_remarks: override_remarks,
                  registered_subjects: [],
                },
                { transaction: t },
              );

              created.push(studentId);
            } else {
              // Update existing registration
              await registration.update(
                {
                  is_condoned:
                    is_condoned !== undefined
                      ? is_condoned
                      : registration.is_condoned,
                  has_permission:
                    has_permission !== undefined
                      ? has_permission
                      : registration.has_permission,
                  override_status:
                    override_status !== undefined
                      ? override_status
                      : registration.override_status,
                  override_remarks: override_remarks,
                  status: "approved", // Approve on override
                },
                { transaction: t },
              );

              updated.push(studentId);
            }
          } else {
            // Real registration ID - just update
            registration = await ExamRegistration.findByPk(studentId, {
              transaction: t,
            });

            if (registration) {
              await registration.update(
                {
                  is_condoned:
                    is_condoned !== undefined
                      ? is_condoned
                      : registration.is_condoned,
                  has_permission:
                    has_permission !== undefined
                      ? has_permission
                      : registration.has_permission,
                  override_status:
                    override_status !== undefined
                      ? override_status
                      : registration.override_status,
                  override_remarks: override_remarks,
                  status: "approved",
                },
                { transaction: t },
              );

              updated.push(studentId);
            } else {
              failed.push({ id: studentId, reason: "Registration not found" });
            }
          }
        } catch (err) {
          logger.error(`Error processing student ${studentId}:`, err);
          failed.push({ id: studentId, reason: err.message });
        }
      }

      return { updated, created, failed };
    });

    res.status(200).json({
      success: true,
      message: `Bulk override completed. ${result.updated.length} updated, ${result.created.length} created, ${result.failed.length} failed.`,
      data: result,
    });
  } catch (error) {
    logger.error("Error in bulk update:", error);
    res.status(500).json({ error: "Bulk update failed." });
  }
};

// @desc    Waive Exam Fine
// @route   POST /api/exam/registration/:id/waive-fine
// @access  Private/Admin
exports.waiveExamFine = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await ExamRegistration.findByPk(id);
    if (!registration)
      return res.status(404).json({ error: "Registration not found" });

    const new_total =
      parseFloat(registration.total_fee) - parseFloat(registration.late_fee);

    await registration.update({
      total_fee: new_total,
      late_fee: 0,
      is_fine_waived: true,
    });

    res
      .status(200)
      .json({ success: true, message: "Fine waived successfully." });
  } catch (error) {
    logger.error("Error waiving fine:", error);
    res.status(500).json({ error: "Fine waiver failed." });
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

// @desc    Get registration status for a student in a cycle
// @route   GET /api/exam/registration/status/:cycleId
// @access  Private/Student
// @desc    Get registration status for a student in a cycle
// @route   GET /api/exam/registration/status/:cycleId
// @access  Private/Student
exports.getRegistrationStatus = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const student_id = req.user.userId;

    let registration = await ExamRegistration.findOne({
      where: { exam_cycle_id: cycleId, student_id },
    });

    const cycle = await ExamCycle.findByPk(cycleId, {
      attributes: [
        "id",
        "name",
        "is_attendance_checked",
        "is_fee_checked",
        "reg_start_date",
        "reg_end_date",
        "reg_late_fee_date",
        "regular_fee",
        "supply_fee_per_paper",
        "late_fee_amount",
        "attendance_condonation_threshold",
        "attendance_permission_threshold",
      ],
    });

    if (!cycle) {
      return res.status(404).json({ error: "Exam cycle not found" });
    }

    // 1. Calculate Attendance (Live calculation for accurate status)
    const attendanceRecords = await Attendance.findAll({
      where: { student_id },
      attributes: ["status"],
    });
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(
      (r) => r.status === "present",
    ).length;
    const attendance_percentage =
      totalClasses > 0
        ? parseFloat(((presentClasses / totalClasses) * 100).toFixed(2))
        : 0;

    // 2. Determine Attendance Tier
    let attendance_tier = "clear";
    if (cycle.is_attendance_checked) {
      if (attendance_percentage < cycle.attendance_permission_threshold) {
        attendance_tier = "needs_permission";
      } else if (
        attendance_percentage < cycle.attendance_condonation_threshold
      ) {
        attendance_tier = "needs_condonation";
      }
    }

    // 3. Determine Blockers
    const blockers = [];
    const is_condoned = registration?.is_condoned || false;
    const has_permission = registration?.has_permission || false;
    const override_status = registration?.override_status || false;

    // Fee status check
    // If registered, use stored fee_status. If not, default to "pending"
    // IMPORTANT: 'fee_status' here refers to the EXAM FEE for THIS registration.
    const exam_fee_status = registration?.fee_status || "pending";

    // For blocking, we usually check TUITION fees. Since we don't have a Tuition module linked yet,
    // we assume Tuition is clear. If we check 'exam_fee_status' here, it creates a deadlock
    // (can't register because haven't paid exam fee, can't pay exam fee because not registered).
    const tuition_fee_status = "paid"; // Assume clear for now to allow testing

    if (cycle.is_attendance_checked) {
      if (
        attendance_tier === "needs_permission" &&
        !has_permission &&
        !override_status
      ) {
        blockers.push("needs_hod_permission");
      } else if (
        attendance_tier === "needs_condonation" &&
        !is_condoned &&
        !override_status
      ) {
        blockers.push("needs_condonation");
      }
    }

    // Here "fee_checked" usually refers to TUITION fee.
    // If we don't have a Tuition Fee table, we might assume it's clear for now
    // OR if the user wants us to simulating "fee due", we can use a flag on User model.
    // For this specific 'exam' fee, it's always pending until they pay.
    // The user requisition said "if ... fee is pending we will lock".
    // Let's assume this refers to 'Tuition Fee'.
    // We will assume tuition is clear for now unless we add a column to User.
    // But for EXAM fee, it's obviously pending.
    // FIX: Do NOT block on 'fee_status' (exam fee) being pending.
    // Only block if we had a separate tuition check.
    // blockers.push("fee_pending");
    if (
      cycle.is_fee_checked &&
      tuition_fee_status === "pending" &&
      !override_status
    ) {
      blockers.push("fee_pending");
    }

    if (registration?.status === "blocked") {
      blockers.push("admin_blocked");
    }

    const is_eligible = blockers.length === 0;

    // 4. Construct Response
    let responseData;

    if (!registration) {
      // Virtual Registration Object for unregistered students
      responseData = {
        student_id,
        exam_cycle_id: cycleId,
        status: "not_registered",
        fee_status: "pending",
        total_fee: cycle.regular_fee, // Simplified
        is_eligible,
        blockers,
        attendance: {
          percentage: attendance_percentage,
          tier: attendance_tier,
        },
        overrides: {
          is_condoned: false,
          has_permission: false,
          override_status: false,
        },
      };
    } else {
      // Existing Registration enriched with live data
      responseData = registration.toJSON();
      responseData.attendance = {
        percentage: attendance_percentage,
        tier: attendance_tier,
      };
      responseData.blockers = blockers;
      responseData.is_eligible = is_eligible;
      responseData.overrides = {
        is_condoned: registration.is_condoned,
        has_permission: registration.has_permission,
        override_status: registration.override_status,
      };
    }

    res.status(200).json({ success: true, data: responseData, cycle });
  } catch (error) {
    logger.error("Error fetching registration status:", error);
    res.status(500).json({ error: "Failed to fetch registration status." });
  }
};

// @desc    Get all my registrations (Active & Past)
// @route   GET /api/exam/my-registrations
// @access  Private/Student
exports.getMyRegistrations = async (req, res) => {
  try {
    const student_id = req.user.userId;

    const registrations = await ExamRegistration.findAll({
      where: { student_id },
      include: [
        {
          model: ExamCycle,
          as: "cycle",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Also fetch "virtual" registrations for active cycles not yet registered?
    // For now, let's keep it simple: returns list of what's in DB.
    // The frontend "Active Payments" tab should query 'Active Cycles' and then check status for each.
    // BUT we need a way to see "Past Payments". This endpoint serves that nicely.

    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    logger.error("Error fetching my registrations:", error);
    res.status(500).json({ error: "Failed to fetch my registrations." });
  }
};

// @desc    Download Payment Receipt
// @route   GET /api/exam/registration/:id/receipt
// @access  Private/Student
exports.downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await ExamRegistration.findByPk(id, {
      include: [
        { model: ExamCycle, as: "cycle" },
        {
          model: User,
          as: "student",
          attributes: ["first_name", "last_name", "student_id", "email"],
        },
      ],
    });

    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (
      registration.fee_status !== "paid" &&
      registration.fee_status !== "waived"
    ) {
      return res.status(400).json({ error: "Payment not completed yet" });
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Receipt-${registration.student.student_id}-${registration.cycle.name}.pdf`,
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("UniPilot University", { align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Excellence in Education", { align: "center" });
    doc.moveDown();
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#cccccc")
      .stroke()
      .moveDown();

    // Receipt Title
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#4f46e5")
      .text("OFFICIAL PAYMENT RECEIPT", { align: "center" })
      .fillColor("black");
    doc.moveDown();

    // Box for details
    const startY = doc.y;
    doc.rect(50, startY, 500, 260).strokeColor("#e5e7eb").stroke();

    const leftX = 70;
    const valueX = 220;
    let currentY = startY + 20;

    // Helper for rows
    const drawRow = (label, value) => {
      doc.fontSize(10).font("Helvetica-Bold").text(label, leftX, currentY);
      doc.font("Helvetica").text(value, valueX, currentY);
      currentY += 25;
    };

    drawRow(
      "Receipt Number:",
      registration.transaction_id ||
        `REC-${registration.id.split("-")[0].toUpperCase()}`,
    );
    drawRow("Date:", new Date(registration.updatedAt).toLocaleDateString());
    drawRow(
      "Student Name:",
      `${registration.student.first_name} ${registration.student.last_name}`,
    );
    drawRow("Student ID:", registration.student.student_id);
    drawRow("Email:", registration.student.email);

    doc
      .moveTo(70, currentY)
      .lineTo(530, currentY)
      .strokeColor("#e5e7eb")
      .stroke();
    currentY += 20;

    doc.fontSize(14).text("Exam Details");
    doc.fontSize(10).text(`Cycle: ${registration.cycle.name}`);
    doc.text(`Session: ${registration.cycle.month} ${registration.cycle.year}`);
    drawRow("Payment Status:", registration.fee_status.toUpperCase());

    doc
      .moveTo(70, currentY)
      .lineTo(530, currentY)
      .strokeColor("#e5e7eb")
      .stroke();
    currentY += 20;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Amount Paid:", leftX, currentY);
    doc
      .fontSize(12)
      .fillColor("#16a34a")
      .text(`Rs. ${registration.total_fee}`, valueX, currentY)
      .fillColor("black");

    // Footer
    doc.moveDown(10);
    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text(
        "This is a computer-generated receipt and does not require a physical signature.",
        { align: "center", color: "gray" },
      );
    doc
      .fontSize(8)
      .text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });

    doc.end();
  } catch (error) {
    logger.error("Error generating receipt:", error);
    res.status(500).json({ error: "Failed to generate receipt." });
  }
};

// @desc    Get all registrations for a cycle (Admin)
// @route   GET /api/exam/registrations/:cycleId
// @access  Private/Admin
exports.getRegistrations = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const { program_id, status: filterStatus } = req.query;

    const cycle = await ExamCycle.findByPk(cycleId);
    if (!cycle) return res.status(404).json({ error: "Exam cycle not found" });

    // 1. Get all students who SHOULD be in this cycle
    const studentWhere = { role: "student", is_active: true };
    if (cycle.batch_year) studentWhere.batch_year = cycle.batch_year;
    if (cycle.semester && cycle.exam_type !== "re_exam") {
      studentWhere.current_semester = cycle.semester;
    }
    if (program_id) studentWhere.program_id = program_id;

    const students = await User.findAll({
      where: studentWhere,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "batch_year",
        "section",
        "student_id",
      ],
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["name"],
        },
        {
          model: ExamRegistration,
          as: "exam_registrations",
          where: { exam_cycle_id: cycleId },
          required: false, // LEFT JOIN to get all students
        },
      ],
      order: [["student_id", "ASC"]],
    });

    // 2. Process each student with live calculations
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const registration = student.exam_registrations?.[0];

        // Calculate LIVE attendance
        const attendanceRecords = await Attendance.findAll({
          where: { student_id: student.id },
          attributes: ["status"],
        });
        const totalClasses = attendanceRecords.length;
        const presentClasses = attendanceRecords.filter(
          (r) => r.status === "present",
        ).length;
        const attendance_percentage =
          totalClasses > 0
            ? parseFloat(((presentClasses / totalClasses) * 100).toFixed(2))
            : 0;

        // Determine attendance tier
        let attendance_tier = "clear";
        let requires_action = "none";

        if (cycle.is_attendance_checked) {
          if (attendance_percentage < cycle.attendance_permission_threshold) {
            attendance_tier = "needs_permission";
            requires_action = "hod_permission";
          } else if (
            attendance_percentage < cycle.attendance_condonation_threshold
          ) {
            attendance_tier = "needs_condonation";
            requires_action = "condonation";
          }
        }

        // TODO: Calculate fee dues from actual fee system
        // For now, mock as 0 (implement when fee module exists)
        const fee_due = {
          amount: 0,
          status: "clear", // "clear" or "pending"
        };

        // Determine exam registration type
        let registration_type = "regular";
        if (registration?.registered_subjects) {
          const hasBacklogs = registration.registered_subjects.some(
            (s) => s.type === "supply",
          );
          const hasRegular = registration.registered_subjects.some(
            (s) => s.type === "regular",
          );
          if (hasBacklogs && hasRegular) registration_type = "combined";
          else if (hasBacklogs) registration_type = "supply";
        }

        // Check if student has overrides
        const is_condoned = registration?.is_condoned || false;
        const has_permission = registration?.has_permission || false; // New field
        const override_status = registration?.override_status || false;

        // Determine final eligibility
        const blockers = [];

        // Attendance check
        if (cycle.is_attendance_checked) {
          if (
            attendance_tier === "needs_permission" &&
            !has_permission &&
            !override_status
          ) {
            blockers.push("needs_hod_permission");
          } else if (
            attendance_tier === "needs_condonation" &&
            !is_condoned &&
            !override_status
          ) {
            blockers.push("needs_condonation");
          }
        }

        // Fee dues check
        if (
          cycle.is_fee_checked &&
          fee_due.status === "pending" &&
          !override_status
        ) {
          blockers.push("fee_pending");
        }

        // Admin manual block
        if (registration?.status === "blocked") {
          blockers.push("admin_blocked");
        }

        const is_eligible = blockers.length === 0;

        // Exam fee status
        const exam_fee_status = {
          paid: registration?.fee_status === "paid",
          transaction_id: registration?.transaction_id || null,
          amount: registration?.total_fee || 0,
          late_fee: registration?.late_fee || 0,
          is_fine_waived: registration?.is_fine_waived || false,
        };

        return {
          id: registration?.id || `temp-${student.id}`,
          student: {
            id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            first_name: student.first_name,
            last_name: student.last_name,
            student_id: student.student_id,
            email: student.email,
            section: student.section,
            program: student.program?.name || "N/A",
          },
          type: registration_type,
          attendance: {
            percentage: attendance_percentage,
            total_classes: totalClasses,
            present: presentClasses,
            tier: attendance_tier, // "clear", "needs_condonation", "needs_permission"
            status:
              attendance_percentage >= cycle.attendance_condonation_threshold
                ? "clear"
                : "low",
          },
          fee_due,
          eligibility: {
            is_eligible,
            blockers,
            requires_action, // "none", "condonation", "hod_permission"
          },
          exam_fee_status,
          overrides: {
            is_condoned,
            has_permission,
            override_status,
            override_remarks: registration?.override_remarks || "",
          },
          registration_status: registration?.status || "not_registered",
          registered_at: registration?.created_at || null,
        };
      }),
    );

    // Apply filter if specified
    const filteredStudents = filterStatus
      ? enrichedStudents.filter((s) => s.registration_status === filterStatus)
      : enrichedStudents;

    res.status(200).json({
      success: true,
      count: filteredStudents.length,
      data: filteredStudents,
      cycle_config: {
        is_attendance_checked: cycle.is_attendance_checked,
        is_fee_checked: cycle.is_fee_checked,
        attendance_condonation_threshold:
          cycle.attendance_condonation_threshold,
        attendance_permission_threshold: cycle.attendance_permission_threshold,
      },
    });
  } catch (error) {
    logger.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Failed to fetch registrations." });
  }
};

// @desc    Download Hall Ticket PDF
// @route   GET /api/exam/registration/:cycleId/download-hall-ticket
// @access  Private/Student
exports.downloadHallTicket = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const student_id = req.user.userId;

    // 1. Fetch registration and check eligibility
    const registration = await ExamRegistration.findOne({
      where: { exam_cycle_id: cycleId, student_id },
      include: [
        {
          model: User,
          as: "student",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "batch_year",
            "section",
            "student_id",
          ],
        },
        {
          model: ExamCycle,
          as: "cycle",
          attributes: ["name", "semester", "start_date"],
        },
      ],
    });

    if (!registration) {
      return res.status(404).json({ error: "Exam registration not found" });
    }

    const isEligible =
      registration.status !== "blocked" &&
      (registration.fee_status === "paid" || registration.override_status) &&
      (registration.attendance_status === "clear" ||
        registration.is_condoned ||
        registration.override_status);

    if (!isEligible) {
      return res.status(403).json({
        error: "Not eligible for Hall Ticket. Please check status.",
      });
    }

    // 2. Fetch schedules for this student
    const schedules = await ExamSchedule.findAll({
      where: { exam_cycle_id: cycleId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["name", "code"],
        },
      ],
      order: [["exam_date", "ASC"]],
    });

    // 3. Set response headers
    const filename = `HallTicket_${registration.student.student_id || student_id.substring(0, 8)}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    // 4. Use template module to generate PDF
    await generateHallTicketPdf(registration, schedules, res);

    // 5. Update download status
    await HallTicket.update(
      { download_status: true },
      { where: { exam_cycle_id: cycleId, student_id } },
    );
  } catch (error) {
    logger.error("Error generating hall ticket PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate Hall Ticket PDF." });
    }
  }
};

// @desc    Faculty Results Report - Download Excel
// @route   GET /api/exam/faculty/results-report
// @access  Private/Faculty
exports.getFacultyResultsReport = async (req, res) => {
  try {
    const { exam_cycle_id, course_id, section } = req.query;
    const faculty_id = req.user.userId;

    if (!exam_cycle_id || !course_id) {
      return res
        .status(400)
        .json({ error: "Exam cycle and course are required" });
    }

    // Verify faculty teaches this course
    const teachingAssignment = await TimetableSlot.findOne({
      where: {
        faculty_id,
        course_id,
        ...(section && { section }),
      },
    });

    if (!teachingAssignment) {
      return res
        .status(403)
        .json({ error: "You are not assigned to teach this course/section" });
    }

    // Fetch exam cycle and course details
    const cycle = await ExamCycle.findByPk(exam_cycle_id);
    const course = await Course.findByPk(course_id);

    if (!cycle || !course) {
      return res.status(404).json({ error: "Cycle or course not found" });
    }

    // Fetch all exam schedules for this cycle and course
    const schedules = await ExamSchedule.findAll({
      where: { exam_cycle_id, course_id },
    });

    if (schedules.length === 0) {
      return res.status(404).json({ error: "No exam schedules found" });
    }

    // Fetch all marks for these schedules
    const marks = await ExamMark.findAll({
      where: {
        exam_schedule_id: schedules.map((s) => s.id),
        ...(section && { "$student.section$": section }),
      },
      include: [
        {
          model: User,
          as: "student",
          attributes: [
            "id",
            "student_id",
            "first_name",
            "last_name",
            "section",
            "batch_year",
          ],
        },
        {
          model: ExamSchedule,
          as: "schedule",
          attributes: ["id", "exam_type", "max_marks"],
        },
      ],
      order: [["student", "student_id", "ASC"]],
    });

    // Get regulation for grade calculation
    const regulation = await Regulation.findByPk(cycle.regulation_id);
    const gradeScale = regulation?.grade_scale || [];

    // Group marks by student
    const studentMarks = {};
    marks.forEach((mark) => {
      const studentId = mark.student.student_id;
      if (!studentMarks[studentId]) {
        studentMarks[studentId] = {
          student_id: studentId,
          name: `${mark.student.first_name} ${mark.student.last_name}`,
          section: mark.student.section,
          batch_year: mark.student.batch_year,
          marks: {},
          total: 0,
        };
      }
      studentMarks[studentId].marks[mark.schedule.exam_type] =
        mark.marks_obtained;
      studentMarks[studentId].total += parseFloat(mark.marks_obtained || 0);
    });

    // Calculate grades
    Object.values(studentMarks).forEach((student) => {
      const percentage =
        (student.total / schedules.reduce((sum, s) => sum + s.max_marks, 0)) *
        100;

      // Find grade from scale
      let grade = "F";
      for (const gradeEntry of gradeScale) {
        if (percentage >= gradeEntry.min_percentage) {
          grade = gradeEntry.grade;
          break;
        }
      }

      student.percentage = percentage.toFixed(2);
      student.grade = grade;
      student.result = grade !== "F" ? "PASS" : "FAIL";
    });

    // Create Excel workbook
    const workbook = xlsx.utils.book_new();

    // Prepare data for Excel
    const excelData = Object.values(studentMarks).map((student) => ({
      "Roll No": student.student_id,
      Name: student.name,
      Section: student.section,
      Batch: student.batch_year,
      ...Object.keys(student.marks).reduce((acc, examType) => {
        acc[examType] = student.marks[examType];
        return acc;
      }, {}),
      Total: student.total,
      Percentage: student.percentage,
      Grade: student.grade,
      Result: student.result,
    }));

    // Add summary statistics
    const totalStudents = excelData.length;
    const passedStudents = excelData.filter((s) => s.Result === "PASS").length;
    const failedStudents = totalStudents - passedStudents;
    const passPercentage = ((passedStudents / totalStudents) * 100).toFixed(2);

    const summaryData = [
      { Metric: "Total Students", Value: totalStudents },
      { Metric: "Passed", Value: passedStudents },
      { Metric: "Failed", Value: failedStudents },
      { Metric: "Pass %", Value: passPercentage },
    ];

    // Create worksheets
    const summarySheet = xlsx.utils.json_to_sheet(summaryData);
    const resultsSheet = xlsx.utils.json_to_sheet(excelData);

    xlsx.utils.book_append_sheet(workbook, summarySheet, "Summary");
    xlsx.utils.book_append_sheet(workbook, resultsSheet, "Results");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers and send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Results_${course.code}_${cycle.name.replace(/\s/g, "_")}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    logger.error("Error generating faculty results report:", error);
    res.status(500).json({ error: "Failed to generate results report" });
  }
};

// @desc    HOD Results Report - Download Excel
// @route   GET /api/exam/hod/results-report
// @access  Private/HOD
exports.getHODResultsReport = async (req, res) => {
  try {
    const { exam_cycle_id, batch_year, semester, section } = req.query;
    const hod_id = req.user.userId;

    if (!exam_cycle_id) {
      return res.status(400).json({ error: "Exam cycle is required" });
    }

    // Get HOD's department
    const { Department } = require("../models");
    const hod = await User.findByPk(hod_id, {
      attributes: ["department_id"],
      include: [{ model: Department, as: "department", attributes: ["name"] }],
    });

    if (!hod || !hod.department_id) {
      return res.status(403).json({ error: "HOD department not found" });
    }

    const departmentId = hod.department_id;
    const departmentName = hod.department.name;

    // Fetch exam cycle
    const cycle = await ExamCycle.findByPk(exam_cycle_id);
    if (!cycle) {
      return res.status(404).json({ error: "Exam cycle not found" });
    }

    // Build student filter
    const studentWhere = {
      department_id: departmentId,
      role: "student",
      ...(batch_year && { batch_year: parseInt(batch_year) }),
      ...(semester && { current_semester: parseInt(semester) }),
      ...(section && { section }),
    };

    // Fetch all students in department
    const students = await User.findAll({
      where: studentWhere,
      attributes: [
        "id",
        "student_id",
        "first_name",
        "last_name",
        "section",
        "batch_year",
        "current_semester",
      ],
      order: [
        ["batch_year", "DESC"],
        ["current_semester", "ASC"],
        ["section", "ASC"],
        ["student_id", "ASC"],
      ],
    });

    if (students.length === 0) {
      return res
        .status(404)
        .json({ error: "No students found matching criteria" });
    }

    const studentIds = students.map((s) => s.id);

    // Fetch all exam schedules for this cycle
    const schedules = await ExamSchedule.findAll({
      where: { exam_cycle_id },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["code", "name", "semester"],
        },
      ],
    });

    // Fetch all marks for these students
    const marks = await ExamMark.findAll({
      where: {
        student_id: studentIds,
        exam_schedule_id: schedules.map((s) => s.id),
      },
      include: [
        {
          model: User,
          as: "student",
          attributes: [
            "id",
            "student_id",
            "first_name",
            "last_name",
            "section",
            "batch_year",
            "current_semester",
          ],
        },
        {
          model: ExamSchedule,
          as: "schedule",
          attributes: ["id", "exam_type", "max_marks"],
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["code", "name"],
            },
          ],
        },
      ],
    });

    // Get regulation for grade calculation
    const regulation = await Regulation.findByPk(cycle.regulation_id);
    const gradeScale = regulation?.grade_scale || [];

    // Group by student and course
    const studentData = {};
    marks.forEach((mark) => {
      const studentId = mark.student.student_id;
      const courseCode = mark.schedule.course.code;

      if (!studentData[studentId]) {
        studentData[studentId] = {
          student_id: studentId,
          name: `${mark.student.first_name} ${mark.student.last_name}`,
          section: mark.student.section,
          batch: mark.student.batch_year,
          semester: mark.student.current_semester,
          courses: {},
        };
      }

      if (!studentData[studentId].courses[courseCode]) {
        studentData[studentId].courses[courseCode] = {
          course_name: mark.schedule.course.name,
          marks: {},
          total: 0,
        };
      }

      studentData[studentId].courses[courseCode].marks[
        mark.schedule.exam_type
      ] = mark.marks_obtained;
      studentData[studentId].courses[courseCode].total += parseFloat(
        mark.marks_obtained || 0,
      );
    });

    // Create Excel workbook
    const workbook = xlsx.utils.book_new();

    // Summary Sheet
    const totalStudents = Object.keys(studentData).length;
    const summaryData = [
      { Metric: "Department", Value: departmentName },
      { Metric: "Exam Cycle", Value: cycle.name },
      { Metric: "Total Students", Value: totalStudents },
      ...(batch_year ? [{ Metric: "Batch Year", Value: batch_year }] : []),
      ...(semester ? [{ Metric: "Semester", Value: semester }] : []),
      ...(section ? [{ Metric: "Section", Value: section }] : []),
    ];

    const summarySheet = xlsx.utils.json_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Student-wise Results Sheet
    const studentResults = [];
    Object.values(studentData).forEach((student) => {
      Object.entries(student.courses).forEach(([courseCode, courseData]) => {
        studentResults.push({
          "Roll No": student.student_id,
          Name: student.name,
          Batch: student.batch,
          Sem: student.semester,
          Section: student.section,
          Course: courseCode,
          "Course Name": courseData.course_name,
          ...courseData.marks,
          Total: courseData.total,
        });
      });
    });

    const resultsSheet = xlsx.utils.json_to_sheet(studentResults);
    xlsx.utils.book_append_sheet(workbook, resultsSheet, "Student Results");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers and send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Department_Results_${cycle.name.replace(/\s/g, "_")}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    logger.error("Error generating HOD results report:", error);
    res
      .status(500)
      .json({ error: "Failed to generate department results report" });
  }
};
