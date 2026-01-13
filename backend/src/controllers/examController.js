const {
  ExamCycle,
  ExamSchedule,
  ExamMark,
  HallTicket,
  User,
  Course,
  sequelize,
} = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

// @desc    Get all exam cycles
// @route   GET /api/exam/cycles
// @access  Private/Faculty/Admin
exports.getExamCycles = async (req, res) => {
  try {
    const cycles = await ExamCycle.findAll({
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
    const { name, start_date, end_date, batch_year, semester, exam_type } =
      req.body;
    const cycle = await ExamCycle.create({
      name,
      start_date,
      end_date,
      batch_year,
      semester,
      exam_type,
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
    const schedule = await ExamSchedule.create(req.body);
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
        { model: Course, as: "course", attributes: ["name", "code"] },
        { model: ExamCycle, as: "cycle", attributes: ["name"] },
      ],
      order: [
        ["exam_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });
    res.status(200).json({ success: true, data: schedules });
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
              max_marks: max_marks || 100,
              passing_marks: passing_marks || 35,
            },
            { transaction: t }
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

// @desc    Enter marks for students
// @route   POST /api/exam/marks/bulk
// @access  Private/Faculty/Admin
exports.enterMarks = async (req, res) => {
  try {
    const { exam_schedule_id, marks_data } = req.body; // marks_data: [{student_id, marks_obtained, status, remarks}]

    const schedule = await ExamSchedule.findByPk(exam_schedule_id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    const savedMarks = await sequelize.transaction(async (t) => {
      const records = [];
      for (const item of marks_data) {
        // Simple grade calculation logic
        let grade = "F";
        if (item.status === "present") {
          const perc = (item.marks_obtained / schedule.max_marks) * 100;
          if (perc >= 90) grade = "A+";
          else if (perc >= 80) grade = "A";
          else if (perc >= 70) grade = "B";
          else if (perc >= 60) grade = "C";
          else if (perc >= 50) grade = "D";
          else if (perc >= schedule.passing_marks) grade = "E";
        }

        const [mark, created] = await ExamMark.findOrCreate({
          where: { exam_schedule_id, student_id: item.student_id },
          defaults: {
            marks_obtained: item.marks_obtained,
            grade,
            status: item.status,
            remarks: item.remarks,
            entered_by: req.user.userId,
          },
          transaction: t,
        });

        if (!created) {
          await mark.update(
            {
              marks_obtained: item.marks_obtained,
              grade,
              status: item.status,
              remarks: item.remarks,
              entered_by: req.user.userId,
            },
            { transaction: t }
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
      where: { student_id },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          required: semester ? true : false, // INNER JOIN when filtering by semester
          include: [
            courseInclude,
            { model: ExamCycle, as: "cycle", attributes: ["name"] },
          ],
        },
      ],
    });

    // Calculate GPA metrics
    const gradePoints = { "A+": 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

    // Current semester GPA (for filtered results)
    let currentSemesterGPA = 0;
    let currentSemesterCredits = 0;

    results.forEach((result) => {
      const credits = result.schedule?.course?.credits || 3;
      const points = gradePoints[result.grade] || 0;
      currentSemesterGPA += points * credits;
      currentSemesterCredits += credits;
    });

    currentSemesterGPA =
      currentSemesterCredits > 0
        ? (currentSemesterGPA / currentSemesterCredits).toFixed(2)
        : "0.00";

    // Overall CGPA (all semesters)
    let overallCGPA = 0;
    let overallCredits = 0;

    if (!semester) {
      // If no semester filter, use current results
      overallCGPA = currentSemesterGPA;
      overallCredits = currentSemesterCredits;
    } else {
      // Fetch all results for overall CGPA
      const allResults = await ExamMark.findAll({
        where: { student_id },
        include: [
          {
            model: ExamSchedule,
            as: "schedule",
            include: [
              {
                model: Course,
                as: "course",
                attributes: ["credits"],
              },
            ],
          },
        ],
      });

      allResults.forEach((result) => {
        const credits = result.schedule?.course?.credits || 3;
        const points = gradePoints[result.grade] || 0;
        overallCGPA += points * credits;
        overallCredits += credits;
      });

      overallCGPA =
        overallCredits > 0 ? (overallCGPA / overallCredits).toFixed(2) : "0.00";
    }

    res.status(200).json({
      success: true,
      data: results,
      gpa: {
        currentSemester: currentSemesterGPA,
        overall: overallCGPA,
      },
    });
  } catch (error) {
    logger.error("Error fetching my results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

// @desc    Generate Hall Ticket
// @route   POST /api/exam/hall-ticket/generate
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
