const {
  Attendance,
  LeaveRequest,
  User,
  Course,
  Holiday,
  sequelize,
} = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

// @desc    Mark attendance for multiple students
// @route   POST /api/attendance/mark
// @access  Private/Faculty
exports.markAttendance = async (req, res) => {
  try {
    const { course_id, date, attendance_data } = req.body; // attendance_data: [{student_id, status, remarks}]

    if (!attendance_data || !Array.isArray(attendance_data)) {
      return res.status(400).json({ error: "Invalid attendance data" });
    }

    // Date Validation: Prevent future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return res
        .status(400)
        .json({ error: "Cannot mark attendance for a future date" });
    }

    // Optional: Prevent marking attendance too far in the past (e.g., 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    if (selectedDate < thirtyDaysAgo) {
      return res
        .status(400)
        .json({ error: "Cannot mark attendance older than 30 days" });
    }

    // Check if it's a holiday
    const holiday = await Holiday.findOne({ where: { date } });
    if (holiday) {
      return res.status(400).json({
        error: `Cannot mark attendance on a holiday: ${holiday.name}`,
      });
    }

    const savedRecords = await sequelize.transaction(async (t) => {
      const records = [];
      for (const item of attendance_data) {
        const [record, created] = await Attendance.findOrCreate({
          where: { student_id: item.student_id, date, course_id },
          defaults: {
            status: item.status,
            remarks: item.remarks,
            marked_by: req.user.userId,
          },
          transaction: t,
        });

        if (!created) {
          await record.update(
            {
              status: item.status,
              remarks: item.remarks,
              marked_by: req.user.userId,
            },
            { transaction: t }
          );
        }
        records.push(record);
      }
      return records;
    });

    res.status(200).json({
      success: true,
      message: `Marked attendance for ${attendance_data.length} students`,
      data: savedRecords,
    });
  } catch (error) {
    logger.error("Error marking attendance:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to mark attendance" });
  }
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/my-attendance
// @access  Private/Student
exports.getMyAttendance = async (req, res) => {
  try {
    const student_id = req.user.userId;
    const { course_id, start_date, end_date, semester } = req.query;

    const where = { student_id };
    if (course_id) where.course_id = course_id;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    // Build include for course filtering
    const courseInclude = {
      model: Course,
      as: "course",
      attributes: ["name", "code", "id", "semester"],
      required: false, // LEFT JOIN by default
    };

    // If semester is specified, filter courses by semester
    if (semester) {
      courseInclude.where = { semester: parseInt(semester) };
      courseInclude.required = true; // INNER JOIN when filtering
    }

    const records = await Attendance.findAll({
      where,
      include: [courseInclude],
      order: [["date", "DESC"]],
    });

    // Calculate Overall Summary
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    // Calculate Course-Wise Statistics
    const courseWiseMap = {};
    records.forEach((record) => {
      const courseId = record.course?.id || "general";
      const courseName = record.course?.name || "General";
      const courseCode = record.course?.code || "N/A";

      if (!courseWiseMap[courseId]) {
        courseWiseMap[courseId] = {
          course_id: courseId,
          course_name: courseName,
          course_code: courseCode,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }

      courseWiseMap[courseId].total++;
      if (record.status === "present") courseWiseMap[courseId].present++;
      else if (record.status === "absent") courseWiseMap[courseId].absent++;
      else if (record.status === "late") courseWiseMap[courseId].late++;
    });

    // Convert to array and add percentage
    const courseWiseStats = Object.values(courseWiseMap).map((course) => ({
      ...course,
      percentage:
        course.total > 0
          ? ((course.present / course.total) * 100).toFixed(2)
          : "0.00",
    }));

    res.status(200).json({
      success: true,
      data: {
        records,
        summary: {
          total,
          present,
          percentage: percentage.toFixed(2),
        },
        courseWise: courseWiseStats,
      },
    });
  } catch (error) {
    logger.error("Error fetching my attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

// @desc    Apply for leave
// @route   POST /api/attendance/leave/apply
// @access  Private/Student
exports.applyLeave = async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason, attachment_url } =
      req.body;
    const student_id = req.user.userId;

    const leave = await LeaveRequest.create({
      student_id,
      leave_type,
      start_date,
      end_date,
      reason,
      attachment_url,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    logger.error("Error applying leave:", error);
    res.status(500).json({ error: "Leave application failed" });
  }
};

// @desc    Get leave requests for review
// @route   GET /api/attendance/leave/requests
// @access  Private/Faculty/Admin
exports.getLeaveRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.findAll({
      where: { status: "pending" },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["first_name", "last_name", "student_id"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    logger.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// @desc    Approve or Reject leave
// @route   PUT /api/attendance/leave/:id
// @access  Private/Admin
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const leave = await LeaveRequest.findByPk(id);
    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    await leave.update({
      status,
      review_remarks: remarks,
      reviewed_by: req.user.userId,
    });

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    logger.error("Error updating leave status:", error);
    res.status(500).json({ error: "Update failed" });
  }
};
