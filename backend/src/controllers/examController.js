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
  ExamReverification,
  ExamFeePayment,
  FeePayment,
  sequelize,
} = require("../models");
const logger = require("../utils/logger");
const { calculateFeeStatus } = require("./feeController");
const { Op } = require("sequelize");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const PDFDocument = require("pdfkit");

// Template imports
const generateHallTicketPdf = require("../templates/exam/hallTicketPdf");
const generateExamReceiptPdf = require("../templates/exam/examReceiptPdf");

// Payment Utilities
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
// Prioritize RAZORPAY_MODE env var, otherwise fallback to NODE_ENV
const isLive =
  process.env.RAZORPAY_MODE === "live" || process.env.NODE_ENV === "production";

const razorpay = new Razorpay({
  key_id: isLive
    ? process.env.RAZORPAY_KEY_ID_LIVE
    : process.env.RAZORPAY_KEY_ID,
  key_secret: isLive
    ? process.env.RAZORPAY_KEY_SECRET_LIVE
    : process.env.RAZORPAY_KEY_SECRET,
});
const generateMarksImportTemplate = require("../templates/exam/marksImportTemplate");
const generateCourseResultsExcel = require("../templates/exam/courseResultsExcel");
const generateDepartmentResultsExcel = require("../templates/exam/departmentResultsExcel");



// Helper: Calculate total fee server-side to prevent tampering
const calculateTotalExamFee = (
  student,
  cycle,
  subjects = [], // for supply/combined
  existingRegistration = null,
  attendance_percentage = 100,
  nextCondoned = false,
) => {
  let total_fee = 0;
  let condonation_fee = 0;

  // Detect Attempt Type
  // Logic must match Frontend: Exams.jsx -> calculateFees
  let isRegularAttempt = false;

  if (cycle.exam_mode === "regular") {
    isRegularAttempt = true;
  } else if (cycle.exam_mode === "supplementary") {
    isRegularAttempt = false;
  } else if (cycle.exam_mode === "combined") {
    // If combined, it's regular if batch/sem matches, otherwise it's supply (e.g. backlog attempt)
    // Use loose equality for safety if types differ
    isRegularAttempt = (cycle.batch_year == student.batch_year && cycle.semester == student.current_semester);
  }

  // 1. Base / Supply Fee
  if (isRegularAttempt) {
    // Current Semester Student
    total_fee += parseFloat(cycle.regular_fee || 0);

    // If combined, they might have selected supply subjects too (Backlogs)
    if (cycle.exam_mode === "combined") {
      const supplyCount = subjects.filter((s) => s.type === "supply").length;
      total_fee += supplyCount * parseFloat(cycle.supply_fee_per_paper || 0);
    }
  } else {
    // Supplementary / Backlog Student
    // Charge per paper
    total_fee += subjects.length * parseFloat(cycle.supply_fee_per_paper || 0);
  }

  // 2. Late Fee
  const today = new Date().toISOString().split("T")[0];
  if (cycle.reg_end_date && today > cycle.reg_end_date) {
    total_fee += parseFloat(cycle.late_fee_amount || 0);
  }

  // 3. Condonation Fee
  // Logic: Respect existing registration status if available, otherwise use live check
  let needsCondonation = false;

  if (existingRegistration) {
    // Use stored status
    needsCondonation =
      !existingRegistration.is_condoned &&
      (existingRegistration.attendance_status === 'low' ||
        existingRegistration.attendance_status === 'condoned');
  } else {
    // Use live calculation
    // Trust nextCondoned from frontend if provided (user intent), OR force if attendance is strictly low
    needsCondonation =
      (cycle.is_attendance_checked && isRegularAttempt &&
        attendance_percentage < cycle.attendance_condonation_threshold &&
        attendance_percentage >= 0) ||
      nextCondoned;
  }

  if (needsCondonation) {
    condonation_fee = parseFloat(cycle.condonation_fee || 0);
  }

  total_fee += condonation_fee;

  return { total_fee, condonation_fee };
};

const calculateLiveAttendance = async (
  student_id,
  cycle,
  transaction = null,
) => {
  const attendanceRecords = await Attendance.findAll({
    where: { student_id },
    attributes: ["status"],
    transaction,
  });
  const totalClasses = attendanceRecords.length;
  const presentClasses = attendanceRecords.filter(
    (r) => r.status === "present",
  ).length;
  const attendance_percentage =
    totalClasses > 0
      ? parseFloat(((presentClasses / totalClasses) * 100).toFixed(2))
      : 0;

  let attendance_status = "clear";
  let condonation_fee = 0;
  if (cycle.is_attendance_checked) {
    if (attendance_percentage < cycle.attendance_condonation_threshold) {
      attendance_status = "low";
      condonation_fee = parseFloat(cycle.condonation_fee || 0);
    }
  }

  return { attendance_percentage, attendance_status, condonation_fee };
};

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

        // 1. Check if student has any unresolved backlogs (failures in locked end-sem cycles)
        const { ExamMark, ExamSchedule, ExamCycle } = require("../models");
        const allMarks = await ExamMark.findAll({
          where: { student_id: student.id, moderation_status: "locked" },
          include: [
            {
              model: ExamSchedule,
              as: "schedule",
              include: [
                {
                  model: ExamCycle,
                  as: "cycle",
                  where: { cycle_type: "end_semester" },
                },
              ],
            },
          ],
        });

        // Find latest attempt for each course code
        const latestAttempts = new Map();
        allMarks.forEach((m) => {
          const courseCode = m.schedule?.course?.code || m.schedule?.course_id;
          if (!courseCode) return;
          const prev = latestAttempts.get(courseCode);
          if (
            !prev ||
            new Date(m.schedule.exam_date) > new Date(prev.schedule.exam_date)
          ) {
            latestAttempts.set(courseCode, m);
          }
        });

        const backlogItems = Array.from(latestAttempts.values()).filter(
          (m) => m.grade === "F",
        );
        const backlogSemesters = [
          ...new Set(
            backlogItems
              .map((m) => m.schedule?.cycle?.semester)
              .filter(Boolean),
          ),
        ];

        // 2. Build filtered where clause
        where = {
          // Only show cycles where registration window has at least started
          reg_start_date: {
            [Op.and]: [{ [Op.ne]: null }, { [Op.lte]: today }],
          },
          // And where it hasn't completely closed
          [Op.or]: [
            { reg_end_date: { [Op.gte]: today } },
            { reg_late_fee_date: { [Op.gte]: today } },
          ],
          // Logic:
          // 1. It's my current semester exam (Regular/Combined)
          // 2. OR it's a semester where I have backlogs (Supplementary/Combined)
          [Op.or]: [
            {
              batch_year: student.batch_year,
              semester: student.current_semester,
            },
            {
              semester: { [Op.in]: backlogSemesters },
              exam_mode: { [Op.in]: ["supplementary", "combined"] },
            },
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
      exam_month,
      exam_year,
      condonation_fee,
      attendance_condonation_threshold,
      attendance_permission_threshold,
      status,
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
      exam_month,
      exam_year,
      condonation_fee,
      attendance_condonation_threshold,
      attendance_permission_threshold,
      status: status || "scheduled",
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
      exam_month,
      exam_year,
      condonation_fee,
      attendance_condonation_threshold,
      attendance_permission_threshold,
      status,
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
      exam_month: exam_month !== undefined ? exam_month : cycle.exam_month,
      exam_year: exam_year !== undefined ? exam_year : cycle.exam_year,
      condonation_fee:
        condonation_fee !== undefined ? condonation_fee : cycle.condonation_fee,
      attendance_condonation_threshold:
        attendance_condonation_threshold !== undefined
          ? attendance_condonation_threshold
          : cycle.attendance_condonation_threshold,
      attendance_permission_threshold:
        attendance_permission_threshold !== undefined
          ? attendance_permission_threshold
          : cycle.attendance_permission_threshold,
      status: status !== undefined ? status : cycle.status,
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
            "id",
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

    // Filter by student program if applicable
    let filteredSchedules = schedules;
    if (req.user.role === "student" || req.user.role === "Student") {
      const student = await User.findByPk(req.user.userId);
      if (student && student.program_id) {
        // First filter by branch/program
        const branchFiltered = schedules.filter((s) => {
          if (!s.branches || s.branches.length === 0) return true;
          return s.branches.includes(student.program_id);
        });

        // Then ensure uniqueness by Course ID (in case of multiple sections/slots)
        const uniqueMap = new Map();
        branchFiltered.forEach((s) => {
          if (!uniqueMap.has(s.course_id)) {
            uniqueMap.set(s.course_id, s);
          }
        });
        filteredSchedules = Array.from(uniqueMap.values());
      }
    }

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

    const enhancedSchedules = filteredSchedules.map((s) => ({
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
            "exam_mode",
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
    const semester = schedule.course.semester || 1;
    const cycleMode = (schedule.cycle?.exam_mode || "").toLowerCase();
    const cycleType = (schedule.cycle?.cycle_type || "").toLowerCase();

    // Detect if this is a supplementary/backlog-oriented cycle
    const isSupplyOrCombined =
      ["supplementary", "combined", "supply"].includes(cycleMode) ||
      cycleType.includes("supply") ||
      cycleType.includes("supplementary");

    logger.info(
      `Mark Entry Data: ScheduleID=${scheduleId}, Mode=${cycleMode}, Type=${cycleType}, DetectSupply=${isSupplyOrCombined}`,
    );

    let studentWhere = {
      role: "student",
      is_active: true,
    };

    // For regular exams, filter by current_semester
    if (!isSupplyOrCombined) {
      studentWhere.current_semester = semester;
    }

    if (!isSuperUser && assignedSections.length > 0) {
      studentWhere.section = { [Op.in]: assignedSections };
    }

    // Branch/Program filtering
    if (schedule.branches && schedule.branches.length > 0) {
      studentWhere.program_id = { [Op.in]: schedule.branches };
    } else if (schedule.course.program_id) {
      studentWhere.program_id = schedule.course.program_id;
    }

    // For Supply/Combined, we MUST filter by registered students for this SPECIFIC course
    if (isSupplyOrCombined) {
      const { ExamRegistration } = require("../models");
      const registrations = await ExamRegistration.findAll({
        where: {
          exam_cycle_id: schedule.exam_cycle_id,
          // Only students who are actually registered and cleared (paid, waived, or approved)
          status: { [Op.in]: ["approved", "submitted"] },
          fee_status: { [Op.in]: ["paid", "waived", "pending"] },
        },
        attributes: ["student_id", "registered_subjects"],
      });

      const registeredStudentIds = registrations
        .filter((r) => {
          if (!r.registered_subjects) return false;
          // Support both UUID objects and strings in JSONB comparison
          return r.registered_subjects.some(
            (s) => String(s.course_id) === String(schedule.course_id),
          );
        })
        .map((r) => r.student_id);

      // CRITICAL: If this is a supply/combined cycle, we MUST restrict to these IDs.
      studentWhere.id = { [Op.in]: registeredStudentIds };

      // If no registrations, return empty to avoid showing all students
      if (registeredStudentIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            schedule,
            students: [],
          },
        });
      }
    }

    // 4. Fetch students with their marks for this schedule
    const { reverification_only } = req.query;

    const studentInclude = [
      {
        model: ExamMark,
        as: "exam_marks",
        where: { exam_schedule_id: scheduleId },
        required: false,
      },
    ];

    // If filtering for reverification only, add reverification join
    if (reverification_only === "true") {
      const { ExamReverification } = require("../models");
      studentInclude.push({
        model: ExamReverification,
        as: "exam_reverifications",
        where: {
          exam_schedule_id: scheduleId,
          status: "under_review",
        },
        required: true, // INNER JOIN - only students with reverification
      });
    }

    const students = await User.findAll({
      where: studentWhere,
      attributes: ["id", "first_name", "last_name", "student_id", "program_id"],
      include: studentInclude,
      order: [["student_id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        schedule,
        students: students.map((s) => {
          const studentData = s.toJSON();
          return {
            ...studentData,
            mark: s.exam_marks && s.exam_marks[0] ? s.exam_marks[0] : null,
            has_reverification:
              reverification_only === "true" ||
              (studentData.exam_reverifications &&
                studentData.exam_reverifications.length > 0),
          };
        }),
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

        // If component scores provided and not empty, calculate total from them
        if (
          componentScores &&
          typeof componentScores === "object" &&
          Object.keys(componentScores).length > 0
        ) {
          totalMarks = Object.values(componentScores).reduce(
            (sum, val) => sum + (parseFloat(val) || 0),
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
            // Bypass lock if there is an active under_review reverification for this student/schedule
            const hasReverification = await ExamReverification.findOne({
              where: {
                student_id: item.student_id,
                exam_schedule_id,
                status: "under_review",
              },
              transaction: t,
            });

            if (!hasReverification) {
              continue; // Still skip if no active reverification
            }
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
// @desc    Get detailed results for a specific student (for Faculty/HOD/Admin)
// @route   GET /api/exam/results/:studentId
// @access  Private/Faculty/Admin
exports.getStudentAcademicDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;

    // Build include for course filtering
    const courseInclude = {
      model: Course,
      as: "course",
      attributes: ["name", "code", "semester", "credits", "course_type"],
      required: false,
    };

    if (semester) {
      courseInclude.where = { semester: parseInt(semester) };
      courseInclude.required = true;
    }

    const marks = await ExamMark.findAll({
      where: {
        student_id: studentId,
      },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          required: semester ? true : false,
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
      order: [
        [
          { model: ExamSchedule, as: "schedule" },
          { model: Course, as: "course" },
          "semester",
          "ASC",
        ],
        ["created_at", "DESC"],
      ],
    });

    // Fetch Semester Results (SGPA/CGPA)
    const semesterResults = await SemesterResult.findAll({
      where: { student_id: studentId },
      order: [["semester", "ASC"]],
    });

    // Initialize performance from Semester Results (SGPA/CGPA)
    const performance = {};
    semesterResults.forEach((r) => {
      performance[r.semester] = {
        semester: r.semester,
        sgpa: parseFloat(r.sgpa).toFixed(2),
        credits: r.total_credits,
        earned: r.earned_credits,
        courses: {},
      };
    });

    // Group marks by Semester, then by Course

    marks.forEach((m) => {
      const sem = m.schedule?.course?.semester || "Unknown";
      const courseId = m.schedule?.course?.id;

      if (!performance[sem]) {
        const semResult = semesterResults.find((r) => r.semester === sem);
        performance[sem] = {
          semester: sem,
          sgpa: semResult ? parseFloat(semResult.sgpa).toFixed(2) : null,
          credits: semResult ? semResult.total_credits : 0,
          earned: semResult ? semResult.earned_credits : 0,
          courses: {},
        };
      }

      if (courseId) {
        if (!performance[sem].courses[courseId]) {
          performance[sem].courses[courseId] = {
            id: courseId,
            name: m.schedule.course.name,
            code: m.schedule.course.code,
            type: m.schedule.course.course_type,
            marks: {},
          };
        }

        const cycleType = m.schedule.cycle.cycle_type;
        const instance = m.schedule.cycle.instance_number;
        const key = `${cycleType}${instance > 1 ? `_${instance}` : ""}`;

        performance[sem].courses[courseId].marks[key] = {
          obtained: m.marks_obtained,
          grade: m.grade,
          status: m.attendance_status,
        };
      }
    });

    // Convert courses object to array for easier frontend mapping
    const formattedPerformance = Object.values(performance).map((semData) => ({
      ...semData,
      courses: Object.values(semData.courses),
    }));

    res.status(200).json({
      success: true,
      data: {
        performance: formattedPerformance,
        summary: {
          totalSemesters: semesterResults.length,
          cgpa:
            semesterResults.length > 0
              ? (
                semesterResults.reduce(
                  (acc, r) => acc + parseFloat(r.sgpa) * r.total_credits,
                  0,
                ) /
                semesterResults.reduce((acc, r) => acc + r.total_credits, 0)
              ).toFixed(2)
              : "0.00",
          totalCredits: semesterResults.reduce(
            (acc, r) => acc + r.total_credits,
            0,
          ),
          earnedCredits: semesterResults.reduce(
            (acc, r) => acc + r.earned_credits,
            0,
          ),
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching student academic details:", error);
    res.status(500).json({ error: "Failed to fetch academic details" });
  }
};

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
      targetCycle = await ExamCycle.findByPk(exam_cycle_id, {
        attributes: [
          "id",
          "name",
          "cycle_type",
          "exam_mode",
          "batch_year",
          "semester",
        ],
      });
      logger.info(
        `ConsolidatedResults: CycleID=${exam_cycle_id}, Mode=${targetCycle?.exam_mode}`,
      );
    }

    // STRICT: Only 'end_semester' cycle results show SGPA/Grades.
    const isFinalSemester = targetCycle?.cycle_type === "end_semester";
    logger.info(`PublishMarks: isFinalSemester: ${isFinalSemester}`);

    const studentWhere = { role: "student" };
    if (program_id) studentWhere.program_id = program_id;
    if (batch_year) studentWhere.batch_year = batchInt;
    if (section) studentWhere.section = section;

    // Filter by registration if it's a supply or combined cycle
    const cycleMode = (targetCycle?.exam_mode || "").toLowerCase();
    const isSupplyOrCombined = ["supplementary", "combined", "supply"].includes(
      cycleMode,
    );

    if (isSupplyOrCombined && exam_cycle_id) {
      const registrations = await ExamRegistration.findAll({
        where: {
          exam_cycle_id,
          status: { [Op.in]: ["approved", "submitted"] },
        },
        attributes: ["student_id"],
      });
      const registeredStudentIds = registrations.map((r) => r.student_id);
      studentWhere.id = { [Op.in]: registeredStudentIds };

      // If no registrations found, we should still use an empty IN clause to return 0 students
      if (registeredStudentIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
    }

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
          include: [{ model: User, as: "student" }],
          transaction: t,
        });

        // Eligibility check
        let is_blocked = false;
        let block_reason = "";

        // Check for current semester dues specifically
        const student =
          registration?.student ||
          (await User.findByPk(sid, { transaction: t }));
        const feeStatus = await calculateFeeStatus(sid);
        const currentSem = student?.current_semester || 1;
        const currentSemData = feeStatus.semesterWise[currentSem];
        const hasDues = currentSemData?.totals.due > 0;

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
        } else if (hasDues && !registration.override_status) {
          is_blocked = true;
          block_reason = `Outstanding dues for Semester ${currentSem} (₹${currentSemData.totals.due}).`;
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

    // 1. Get ALL locked marks for this student to determine latest status
    const allMarks = await ExamMark.findAll({
      where: {
        student_id,
        moderation_status: "locked",
      },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          include: [
            {
              model: ExamCycle,
              as: "cycle",
              // Include all cycle types to get full history
            },
            {
              model: Course,
              as: "course",
              attributes: ["id", "name", "code", "credits"],
            },
          ],
        },
      ],
    });

    // 2. Group by course code and find the latest attempt
    const latestAttempts = new Map(); // Using Course Code for logical uniqueness
    allMarks.forEach((m) => {
      const courseCode = m.schedule?.course?.code;
      if (!courseCode) return;

      const currentLatest = latestAttempts.get(courseCode);
      if (
        !currentLatest ||
        new Date(m.schedule.exam_date) >
        new Date(currentLatest.schedule.exam_date)
      ) {
        latestAttempts.set(courseCode, m);
      }
    });

    // 3. Filter for those where the LATEST attempt is a failure
    const uniqueBacklogs = [];
    latestAttempts.forEach((mark, courseCode) => {
      if (mark.grade === "F") {
        const course = mark.schedule.course;
        uniqueBacklogs.push({
          id: course.id,
          name: course.name,
          code: course.code,
          credits: course.credits,
          last_grade: mark.grade,
          last_attempt_date: mark.schedule.exam_date,
          last_attempt_cycle: mark.schedule.cycle?.name,
          last_attempt_period:
            `${mark.schedule.cycle?.exam_month || ""} ${mark.schedule.cycle?.exam_year || ""}`.trim() ||
            null,
        });
      }
    });

    res.status(200).json({ success: true, data: uniqueBacklogs });
  } catch (error) {
    logger.error("Error fetching backlogs:", error);
    res.status(500).json({ error: "Failed to fetch backlog subjects" });
  }
};

// @desc    Create Razorpay Order for Exam Registration
// @route   POST /api/exam/create-order
// @access  Private/Student
exports.createRegistrationOrder = async (req, res) => {
  try {
    const student_id = req.user.userId;
    const { cycleId, subjects = [], is_condoned } = req.body;

    logger.info(`Creating Registration Order for Student: ${student_id}, Cycle: ${cycleId}`);
    logger.info(`Subjects: ${JSON.stringify(subjects)}, Condoned: ${is_condoned}`);

    // 1. Fetch Student & Cycle
    const student = await User.findByPk(student_id);
    const cycle = await ExamCycle.findByPk(cycleId);

    if (!student || !cycle) {
      logger.error("Student or Exam Cycle not found during order creation");
      return res.status(404).json({ error: "Student or Exam Cycle not found." });
    }

    // 2. Refresh Attendance for accurate fee calculation
    // (We could reuse calculateLiveAttendance here to be safe, or assume frontend sent valid intent)
    // 2. Fetch existing registration if any (to respect its approval/condonation state)
    const existingRegistration = await ExamRegistration.findOne({
      where: { student_id, exam_cycle_id: cycleId }
    });

    // 3. Refresh Attendance for accurate fee calculation (fallback if no registration)
    // (We could reuse calculateLiveAttendance here to be safe, or assume frontend sent valid intent)
    const { attendance_percentage } = await calculateLiveAttendance(
      student_id,
      cycle
    );
    logger.info(`Calculated Attendance: ${attendance_percentage}`);

    // 4. Calculate Fee Server-Side
    const { total_fee } = calculateTotalExamFee(
      student,
      cycle,
      subjects,
      existingRegistration, // Pass existing reg to respect its state
      attendance_percentage,
      is_condoned
    );
    logger.info(`Calculated Total Fee: ${total_fee}`);

    if (total_fee <= 0) {
      return res.status(400).json({ error: "No fee applicable for this registration." });
    }

    // 4. Create Razorpay Order
    const options = {
      amount: Math.round(total_fee * 100), // paise
      currency: "INR",
      receipt: `EXAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      notes: {
        student_id: student_id,
        exam_cycle_id: cycleId,
        type: "exam_registration",
      },
    };

    const order = await razorpay.orders.create(options);
    logger.info(`Razorpay Order Created: ${order.id}`);

    res.status(200).json({
      success: true,
      data: order,
      key_id: razorpay.key_id,
      amount_in_rupees: total_fee,
    });

  } catch (error) {
    logger.error("Error creating exam registration order:", error);
    // Print stack trace for debugging
    console.error(error);
    res.status(500).json({ error: "Failed to create payment order." });
  }
};

// @desc    Register for exams (Regular & Supply)
// @route   POST /api/exam/register
// @access  Private/Student
exports.registerForExams = async (req, res) => {
  try {
    const { exam_cycle_id, subjects } = req.body; // subjects: [{course_id, type: 'regular'|'supply'}]
    const student_id = req.user.userId;

    const student = await User.findByPk(student_id);
    if (!student) return res.status(404).json({ error: "Student not found" });

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

    // Check for current semester dues before proceeding
    const feeStatus = await calculateFeeStatus(student_id);
    const currentSem = student.current_semester || 1;
    const currentSemData = feeStatus.semesterWise[currentSem];
    const hasCurrentSemDues = currentSemData?.totals.due > 0;

    // Check if student already has a registration with overrides
    const existingRegistration = await ExamRegistration.findOne({
      where: { exam_cycle_id, student_id },
    });

    if (
      cycle.is_fee_checked &&
      hasCurrentSemDues &&
      !existingRegistration?.override_status
    ) {
      return res.status(400).json({
        error: `Registration blocked. Please clear outstanding dues for Semester ${currentSem} (₹${currentSemData.totals.due}).`,
      });
    }

    // Detect Attempt Type
    const isRegularAttempt =
      cycle.batch_year === student.batch_year &&
      cycle.semester === student.current_semester;

    // Check attendance and apply condonation fee (Only for Regular attempts)
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

    let attendance_status = "clear";
    let condonation_fee = 0;

    if (
      cycle.is_attendance_checked &&
      isRegularAttempt &&
      !existingRegistration?.is_condoned
    ) {
      if (attendance_percentage < cycle.attendance_permission_threshold) {
        if (!existingRegistration?.has_permission) {
          return res.status(400).json({
            error:
              "Attendance too low (below 65%). HOD permission and condonation fee required to register.",
          });
        }
        attendance_status = "low";
        condonation_fee = parseFloat(cycle.condonation_fee || 0);
      } else if (
        attendance_percentage < cycle.attendance_condonation_threshold
      ) {
        attendance_status = "low";
        condonation_fee = parseFloat(cycle.condonation_fee || 0);
      }
    }

    // Calculate Fees
    let total_fee = 0;
    let late_fee = 0;
    let reg_type = isRegularAttempt ? "regular" : "supply";

    const supplyCount = subjects.length;

    if (isRegularAttempt) {
      // Regular Path: Flat fee + optional supply backlogs if cycle is combined
      total_fee = parseFloat(cycle.regular_fee || 0);

      // If it's a combined cycle, we might have additional backlogs selected
      // (though usually backlogs are for previous semesters, here we assume any
      // subjects specifically marked 'supply' in a regular attempt incur extra cost)
      const extraSupplyCount = subjects.filter(
        (s) => s.type === "supply",
      ).length;
      total_fee +=
        extraSupplyCount * parseFloat(cycle.supply_fee_per_paper || 0);

      if (extraSupplyCount > 0) reg_type = "combined";
    } else {
      // Senior Path: Per paper fee only
      total_fee = supplyCount * parseFloat(cycle.supply_fee_per_paper || 0);
    }

    // Apply late fee if applicable
    if (cycle.reg_end_date && today > cycle.reg_end_date) {
      late_fee = parseFloat(cycle.late_fee_amount || 0);
    }

    const finalTotal = total_fee + late_fee + condonation_fee;

    // Payment Verification Logic
    const { payment } = req.body;
    let fee_status = "pending";
    let transaction_id = `TXN-EXAM-${Date.now()}-${student_id.substring(0, 8).toUpperCase()}`;
    let payment_method = "offline"; // default

    if (finalTotal > 0 && payment && payment.razorpay_payment_id) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payment;

      // Verify Signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac(
          "sha256",
          isLive
            ? process.env.RAZORPAY_KEY_SECRET_LIVE
            : process.env.RAZORPAY_KEY_SECRET
        )
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        fee_status = "paid";
        transaction_id = razorpay_payment_id;
        payment_method = "razorpay";
      } else {
        return res.status(400).json({ error: "Invalid payment signature." });
      }
    } else if (finalTotal === 0) {
      // No fee required
      fee_status = "paid";
    }

    // Perform database operations in a transaction
    const t = await sequelize.transaction();

    try {
      // 3. Create or update ExamRegistration
      const [registration, created] = await ExamRegistration.findOrCreate({
        where: { exam_cycle_id, student_id },
        defaults: {
          student_id,
          exam_cycle_id,
          status: "approved", // auto-approve standard registrations
          registration_type: reg_type,
          registered_subjects: subjects, // Store JSON
          total_fee: finalTotal,
          fee_status: fee_status, // Use calculated status
          attendance_percentage:
            attendance_percentage >= 0 ? attendance_percentage : 100,
          attendance_status: attendance_status,
          is_condoned: false, // Override flag
          has_permission: false, // Override flag
          override_status: false,
          transaction_id: transaction_id, // Store transaction ID
        },
        transaction: t,
      });

      if (!created) {
        // If already exists (maybe updating subjects), just update relevant fields
        // Be careful about overriding approved status if re-registering
        await registration.update(
          {
            registered_subjects: subjects,
            total_fee: finalTotal,
            registration_type: reg_type,
            // Only auto-update to paid if verified now, otherwise keep existing
            fee_status: fee_status === "paid" ? "paid" : registration.fee_status,
            transaction_id: transaction_id, // Update transaction ID
          },
          { transaction: t },
        );
      }

      // 4. Create Fee Payment Records if PAID
      // 4. Create Fee Payment Records if PAID
      if (fee_status === "paid" && finalTotal > 0) {
        // A. Create Global Fee Payment Record
        const feePayment = await FeePayment.create(
          {
            student_id,
            amount_paid: finalTotal, // Total amount including late fees and condonation
            payment_date: new Date(),
            transaction_id: transaction_id || mockTransactionId,
            payment_method: payment_method || "online",
            status: "completed",
            remarks: `Exam Registration: ${cycle.name} (${reg_type})`,
            // fees_structure_id is null for exam payments
          },
          { transaction: t }
        );

        // B. Create Detailed Exam Fee Payment Records
        // Main Registration Fee
        if (total_fee > 0) {
          await ExamFeePayment.create(
            {
              student_id,
              exam_cycle_id,
              category: "registration",
              amount: total_fee,
              transaction_id: transaction_id || mockTransactionId,
              payment_method: payment_method || "online",
              remarks: `Exam Registration Fee (${reg_type}) - ${payment_method === 'razorpay' ? 'Online' : 'Offline'}`,
              fee_payment_id: feePayment.id,
            },
            { transaction: t }
          );
        }

        // Late Fee (Separate record if we want granularity, or integrated)
        if (late_fee > 0) {
          await ExamFeePayment.create(
            {
              student_id,
              exam_cycle_id,
              category: "registration", // Or specific category if needed
              amount: late_fee,
              transaction_id: transaction_id || mockTransactionId,
              payment_method: payment_method || "online",
              remarks: `Late Fee for ${cycle.name}`,
              fee_payment_id: feePayment.id,
            },
            { transaction: t }
          );
        }

        // Condonation Fee
        if (condonation_fee > 0) {
          await ExamFeePayment.create(
            {
              student_id,
              exam_cycle_id,
              category: "condonation",
              amount: condonation_fee,
              transaction_id: transaction_id || mockTransactionId,
              payment_method: payment_method || "online",
              remarks: `Attendance Condonation Fee for ${cycle.name} (${attendance_percentage.toFixed(2)}%)`,
              fee_payment_id: feePayment.id,
            },
            { transaction: t }
          );
        }
      }

      await t.commit();
      res.status(200).json({ success: true, data: registration });
    } catch (innerError) {
      await t.rollback();
      throw innerError;
    }
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
    const {
      status,
      is_condoned,
      has_permission,
      override_status,
      override_remarks,
      exam_cycle_id,
    } = req.body;

    let registration;
    const finalStatus =
      status === "not_registered" ? "approved" : status || "approved";

    // Fetch cycle to get fees and thresholds
    const cycle = await ExamCycle.findByPk(
      exam_cycle_id || req.body.exam_cycle_id,
    );
    if (!cycle && id.startsWith("temp-")) {
      return res.status(400).json({ error: "Exam cycle not found" });
    }

    if (id.startsWith("temp-")) {
      const student_id = id.replace("temp-", "");

      // Calculate LIVE attendance for initial status
      const { attendance_percentage, attendance_status, condonation_fee } =
        await calculateLiveAttendance(student_id, cycle);

      // Calculate initial fee
      let initial_fee = parseFloat(cycle.regular_fee || 0) + condonation_fee;
      const today = new Date().toISOString().split("T")[0];
      if (cycle.reg_end_date && today > cycle.reg_end_date) {
        initial_fee += parseFloat(cycle.late_fee_amount || 0);
      }

      // Find or create registration for this student and cycle
      const [record, created] = await ExamRegistration.findOrCreate({
        where: { student_id, exam_cycle_id },
        defaults: {
          status: finalStatus,
          is_condoned: is_condoned || false,
          has_permission: has_permission || false,
          override_status: override_status || false,
          override_remarks,
          registration_type: "regular",
          fee_status: "pending",
          total_fee: initial_fee,
          attendance_status,
          attendance_percentage,
          registered_subjects: [],
        },
      });
      registration = record;
    } else {
      registration = await ExamRegistration.findByPk(id);
    }

    if (!registration)
      return res.status(404).json({ error: "Registration not found" });

    // For existing registrations, if they are undergoing override or permission,
    // ensure attendance/fees are corrected if they were previously zero or clear.
    const { attendance_percentage, attendance_status, condonation_fee } =
      await calculateLiveAttendance(registration.student_id, cycle);

    // Recalculate fee if it's currently 0 or if condonation status is being updated
    let updated_fee = parseFloat(registration.total_fee);
    const nextCondoned =
      is_condoned !== undefined ? is_condoned : registration.is_condoned;

    if (updated_fee === 0 || is_condoned !== undefined) {
      const today = new Date().toISOString().split("T")[0];
      let base_fee = 0;

      // Determine base fee from registration type
      if (
        registration.registration_type === "regular" ||
        registration.registration_type === "combined"
      ) {
        base_fee = parseFloat(cycle.regular_fee || 0);
        if (registration.registration_type === "combined") {
          const supplyCount = (registration.registered_subjects || []).filter(
            (s) => s.type === "supply",
          ).length;
          base_fee += supplyCount * parseFloat(cycle.supply_fee_per_paper || 0);
        }
      } else {
        const supplyCount = (registration.registered_subjects || []).length;
        base_fee = supplyCount * parseFloat(cycle.supply_fee_per_paper || 0);
      }

      let late_fee = 0;
      if (cycle.reg_end_date && today > cycle.reg_end_date) {
        late_fee = parseFloat(cycle.late_fee_amount || 0);
      }

      // Apply condonation fee only if NOT condoned
      const final_condonation_fee = nextCondoned ? 0 : condonation_fee;
      updated_fee = base_fee + late_fee + final_condonation_fee;
    }

    const final_attendance_status = nextCondoned
      ? "condoned"
      : attendance_status || registration.attendance_status;

    await registration.update({
      status: status ? finalStatus : registration.status,
      total_fee: updated_fee,
      attendance_status: final_attendance_status,
      attendance_percentage:
        attendance_percentage !== undefined
          ? attendance_percentage
          : registration.attendance_percentage,
      is_condoned: nextCondoned,
      has_permission:
        has_permission !== undefined
          ? has_permission
          : registration.has_permission,
      override_status:
        override_status !== undefined
          ? override_status
          : registration.override_status,
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

    // Fetch cycle to get fees and thresholds
    const cycle = await ExamCycle.findByPk(exam_cycle_id);
    if (!cycle) {
      return res.status(400).json({ error: "Exam cycle not found" });
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
              // Calculate LIVE attendance for initial status
              const {
                attendance_percentage,
                attendance_status,
                condonation_fee,
              } = await calculateLiveAttendance(actualUserId, cycle, t);

              // Calculate initial fee (regular + condonation + late)
              const today = new Date().toISOString().split("T")[0];
              const final_condonation_fee = is_condoned ? 0 : condonation_fee;
              let initial_fee =
                parseFloat(cycle.regular_fee || 0) + final_condonation_fee;

              if (cycle.reg_end_date && today > cycle.reg_end_date) {
                initial_fee += parseFloat(cycle.late_fee_amount || 0);
              }

              registration = await ExamRegistration.create(
                {
                  student_id: actualUserId,
                  exam_cycle_id: exam_cycle_id,
                  status: "approved", // Set to approved since admin is granting override
                  registration_type: "regular",
                  fee_status: "pending",
                  total_fee: initial_fee,
                  attendance_status,
                  attendance_percentage,
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
              // Update existing registration - but recalculate fees if 0 or if condonation is being applied
              const {
                attendance_percentage,
                attendance_status,
                condonation_fee,
              } = await calculateLiveAttendance(
                registration.student_id,
                cycle,
                t,
              );

              let updated_fee = parseFloat(registration.total_fee);
              const nextCondoned =
                is_condoned !== undefined
                  ? is_condoned
                  : registration.is_condoned;

              if (updated_fee === 0 || is_condoned !== undefined) {
                const today = new Date().toISOString().split("T")[0];
                let base_fee = 0;

                if (
                  registration.registration_type === "regular" ||
                  registration.registration_type === "combined"
                ) {
                  base_fee = parseFloat(cycle.regular_fee || 0);
                  if (registration.registration_type === "combined") {
                    const supplyCount = (
                      registration.registered_subjects || []
                    ).filter((s) => s.type === "supply").length;
                    base_fee +=
                      supplyCount * parseFloat(cycle.supply_fee_per_paper || 0);
                  }
                } else {
                  const supplyCount = (registration.registered_subjects || [])
                    .length;
                  base_fee =
                    supplyCount * parseFloat(cycle.supply_fee_per_paper || 0);
                }

                let late_fee = 0;
                if (cycle.reg_end_date && today > cycle.reg_end_date) {
                  late_fee = parseFloat(cycle.late_fee_amount || 0);
                }

                const final_condonation_fee = nextCondoned ? 0 : condonation_fee;
                updated_fee = base_fee + late_fee + final_condonation_fee;
              }

              await registration.update(
                {
                  total_fee: updated_fee,
                  attendance_status:
                    attendance_status || registration.attendance_status,
                  attendance_percentage:
                    attendance_percentage !== undefined
                      ? attendance_percentage
                      : registration.attendance_percentage,
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

    // 5. Update reverification requests to completed
    // Find all under_review reverifications for these schedules and update them
    const { ExamReverification } = require("../models");

    const reverifications = await ExamReverification.findAll({
      where: {
        exam_schedule_id: { [Op.in]: scheduleIds },
        status: "under_review",
      },
      include: [
        {
          model: ExamMark,
          as: "exam_mark",
          attributes: ["marks_obtained", "grade"],
        },
      ],
    });

    if (reverifications.length > 0) {
      for (const reverification of reverifications) {
        await reverification.update({
          status: "completed",
          revised_marks: reverification.exam_mark.marks_obtained,
          revised_grade: reverification.exam_mark.grade,
          reviewed_at: new Date(),
          reviewed_by: req.user.userId,
          remarks:
            reverification.remarks ||
            "Reverification completed - marks published",
        });
      }
      logger.info(
        `Completed ${reverifications.length} reverification requests`,
      );
    }

    // 6. Update the Cycle Status to results_published
    if (cycle && cycle.status !== "results_published") {
      await cycle.update({ status: "results_published" });
    }

    res.status(200).json({
      success: true,
      message: `Successfully published ${updatedCount} results${reverifications.length > 0 ? ` and completed ${reverifications.length} reverification(s)` : ""}.`,
      updatedCount,
      reverificationsCompleted: reverifications.length,
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
        "batch_year",
        "semester",
        "is_attendance_checked",
        "is_fee_checked",
        "reg_start_date",
        "reg_end_date",
        "reg_late_fee_date",
        "regular_fee",
        "supply_fee_per_paper",
        "late_fee_amount",
        "condonation_fee",
        "attendance_condonation_threshold",
        "attendance_permission_threshold",
      ],
    });

    if (!cycle) {
      return res.status(404).json({ error: "Exam cycle not found" });
    }

    const student = await User.findByPk(student_id, {
      attributes: ["id", "batch_year", "current_semester"],
    });

    // Detect Attempt Type
    const isRegularAttempt =
      cycle.batch_year === student.batch_year &&
      cycle.semester === student.current_semester;
    const attempt_type = isRegularAttempt ? "regular" : "supply";

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

    // 3. Determine Blockers
    const blockers = [];
    const is_condoned = registration?.is_condoned || false;
    const has_permission = registration?.has_permission || false;
    const override_status = registration?.override_status || false;

    // 2. Determine Attendance Tier
    let attendance_tier = "clear";
    if (cycle.is_attendance_checked && isRegularAttempt) {
      if (is_condoned) {
        attendance_tier = "clear";
      } else if (
        attendance_percentage < cycle.attendance_permission_threshold
      ) {
        attendance_tier = "needs_permission";
      } else if (
        attendance_percentage < cycle.attendance_condonation_threshold
      ) {
        attendance_tier = "needs_condonation";
      }
    }

    // Attendance block (Only for Regular attempts)
    if (cycle.is_attendance_checked && isRegularAttempt) {
      // NOTE: 'override_status' is specifically for FEE block override in the UI.
      // HOD permission is handled by 'has_permission'.
      // 'is_condoned' is handled by the tier logic above (sets tier to 'clear').
      if (attendance_tier === "needs_permission") {
        if (!has_permission) blockers.push("needs_hod_permission");
      }
    }

    // Fee block (Current Semester)
    const feeStatus = await calculateFeeStatus(student_id);
    const currentSem = student?.current_semester || 1;
    const currentSemData = feeStatus.semesterWise[currentSem];
    const hasCurrentSemDues = currentSemData?.totals.due > 0;

    // Fee override is handled by 'override_status'
    if (cycle.is_fee_checked && hasCurrentSemDues && !override_status) {
      blockers.push("fee_pending");
    }

    if (registration?.status === "blocked") {
      blockers.push("admin_blocked");
    }

    const is_eligible = blockers.length === 0;

    // Calculate condonation fee if applicable (Only for Regular attempts)
    let condonation_fee = 0;
    if (cycle.is_attendance_checked && isRegularAttempt) {
      // Below permission threshold (< 65%) - requires HOD permission + condonation
      if (attendance_percentage < cycle.attendance_permission_threshold) {
        condonation_fee = parseFloat(cycle.condonation_fee || 0);
      }
      // Between permission and condonation threshold (65-75%) - auto condonation
      else if (attendance_percentage < cycle.attendance_condonation_threshold) {
        condonation_fee = parseFloat(cycle.condonation_fee || 0);
      }
    }

    // 4. Construct Response
    let responseData;

    if (!registration) {
      // Virtual Registration Object for unregistered students
      responseData = {
        student_id,
        exam_cycle_id: cycleId,
        status: "not_registered",
        fee_status: "pending",
        total_fee: isRegularAttempt ? cycle.regular_fee : 0, // Supply fee calculated per paper on front
        condonation_fee,
        is_eligible,
        blockers,
        attempt_type,
        attendance_status:
          attendance_tier === "clear" ? "clear" : "low",
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
      responseData.condonation_fee = condonation_fee;
      responseData.attempt_type = attempt_type;
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
    const { program_id, status: filterStatus, course_id } = req.query;

    const { Op } = require("sequelize");

    const cycle = await ExamCycle.findByPk(cycleId);
    if (!cycle) return res.status(404).json({ error: "Exam cycle not found" });

    // Detect if this is a supplementary/backlog-oriented cycle
    const cycleMode = (cycle.exam_mode || "").toLowerCase();
    const cycleType = (cycle.cycle_type || "").toLowerCase();
    const isSupply =
      ["supplementary", "supply"].includes(cycleMode) ||
      cycleType.includes("supply") ||
      cycleType.includes("supplementary");

    // 1. Get all students who SHOULD be in this cycle
    const studentWhere = { role: "student", is_active: true };
    // For regular exams, filter by current_semester
    if (!isSupply) {
      if (cycle.batch_year) studentWhere.batch_year = cycle.batch_year;
      if (cycle.semester && cycle.exam_type !== "re_exam") {
        studentWhere.current_semester = cycle.semester;
      }
    }
    if (program_id) studentWhere.program_id = program_id;

    const registrationWhere = { exam_cycle_id: cycleId };
    if (course_id) {
      registrationWhere.registered_subjects = {
        [Op.contains]: [{ course_id }],
      };
    }

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
          where: registrationWhere,
          required: isSupply || filterStatus || course_id ? true : false,
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
            requires_action = "hod_and_condonation";
          } else if (
            attendance_percentage < cycle.attendance_condonation_threshold
          ) {
            attendance_tier = "needs_condonation";
            requires_action = "condonation";
          }
        }

        // Calculate live fee dues for current semester ONLY
        const feeStatus = await calculateFeeStatus(student.id);
        const currentSem = student.current_semester || 1;
        const currentSemData = feeStatus.semesterWise[currentSem];

        const fee_due = {
          amount: currentSemData?.totals.due || 0,
          status: currentSemData?.totals.due > 0 ? "pending" : "clear",
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

        if (cycle.is_attendance_checked) {
          if (attendance_tier === "needs_permission") {
            if (!has_permission) blockers.push("needs_hod_permission");
          }
        }

        if (fee_due.status === "pending" && !override_status) {
          blockers.push("fee_pending");
        }

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
            tier: attendance_tier,
            status:
              attendance_percentage >= cycle.attendance_condonation_threshold
                ? "clear"
                : "low",
          },
          fee_due,
          eligibility: {
            is_eligible: blockers.length === 0,
            blockers,
            requires_action,
          },
          registration: registration
            ? {
              id: registration.id,
              status: registration.status,
              fee_status: registration.fee_status,
              is_condoned,
              has_permission,
              override_status,
              override_remarks: registration.override_remarks || "",
              subjects: registration.registered_subjects,
            }
            : null,
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
