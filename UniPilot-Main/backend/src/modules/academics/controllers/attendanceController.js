import logger from "../../../utils/logger.js";
import { Op } from "sequelize";
import { sequelize } from "../../../config/database.js";
import { Attendance, Course, LeaveRequest, Program, Regulation, Timetable, TimetableSlot } from "../models/index.js";
import { User } from "../../core/models/index.js";
import { Holiday } from "../../settings/models/index.js";

// @desc    Mark attendance for multiple students
// @route   POST /api/attendance/mark
// @access  Private/Faculty
export const markAttendance = async (req, res) => {
  try {
    const { course_id, timetable_slot_id, date, attendance_data } = req.body;
    // attendance_data: [{student_id, status, remarks}]

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
        // Fetch student details to record batch/section at time of marking
        const student = await User.findByPk(item.student_id, {
          attributes: ["batch_year", "section"],
        });

        const [record, created] = await Attendance.findOrCreate({
          where: {
            student_id: item.student_id,
            date,
            timetable_slot_id: timetable_slot_id || null,
            course_id: course_id || null,
          },
          defaults: {
            status: item.status,
            remarks: item.remarks,
            marked_by: req.user.userId,
            batch_year: student?.batch_year,
            section: student?.section,
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
            { transaction: t },
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
export const getMyAttendance = async (req, res) => {
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
      attributes: ["name", "code", "id"],
      required: false, // LEFT JOIN by default
    };

    // If semester is specified, filter courses by fetching IDs from Regulation
    if (semester) {
      const student = await User.findByPk(student_id);

      let targetIds = new Set();

      if (
        student &&
        student.regulation_id &&
        student.program_id &&
        student.batch_year
      ) {
        const regulation = await Regulation.findByPk(student.regulation_id);

        if (regulation && regulation.courses_list) {
          const coursesList = regulation.courses_list;
          const batchYear = student.batch_year;
          const progId = student.program_id;
          const semKey = String(semester);

          // Program Courses
          if (coursesList[progId] && coursesList[progId][batchYear][semKey]) {
            coursesList[progId][batchYear][semKey].forEach((id) =>
              targetIds.add(id),
            );
          }

          // Common Courses
          // if (coursesList["common"] && coursesList["common"][semKey]) {
          //   coursesList["common"][semKey].forEach(id => targetIds.add(id));
          // }
        }
      }

      if (targetIds.size > 0) {
        console.log("targetIds", targetIds);
        if (where.course_id) {
          if (!targetIds.has(where.course_id)) {
            return res.status(200).json({
              success: true,
              data: {
                records: [],
                summary: { total: 0, present: 0, percentage: 0 },
                courseWise: [],
              },
            });
          }
        } else {
          where.course_id = { [Op.in]: Array.from(targetIds) };
        }
      } else {
        return res.status(200).json({
          success: true,
          data: {
            records: [],
            summary: { total: 0, present: 0, percentage: 0 },
            courseWise: [],
          },
        });
      }
    }

    const records = await Attendance.findAll({
      where,
      include: [
        courseInclude,
        {
          model: User,
          as: "instructor",
          attributes: ["first_name", "last_name", "role", "role_id"],
        },
      ],
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
export const applyLeave = async (req, res) => {
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
export const getLeaveRequests = async (req, res) => {
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
export const updateLeaveStatus = async (req, res) => {
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

// @desc    Get faculty's classes for today
// @route   GET /api/attendance/faculty/today
// @access  Private/Faculty
export const getTodayClasses = async (req, res) => {
  try {
    const { role, userId, department_id: userDeptId } = req.user;
    const { department_id, batch_year, semester, section } = req.query;

    const isAdmin = ["admin", "super_admin"].includes(role);
    const isHOD = role === "hod";

    const today = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[today.getDay()];
    const dateStr = today.toISOString().split("T")[0];

    const where = { day_of_week: dayName };
    const timetableWhere = {};
    if (section) timetableWhere.section = section;
    if (semester) timetableWhere.semester = semester;
    // Note: academic_year in Timetable is usually "2025-2026", while batch_year is "2024".
    // We'll skip filtering Timetable by batch_year for now unless we have a mapping.

    const timetableInclude = {
      model: Timetable,
      as: "timetable",
      attributes: ["section", "program_id", "semester", "academic_year"],
      where:
        Object.keys(timetableWhere).length > 0 ? timetableWhere : undefined,
      required: Object.keys(timetableWhere).length > 0,
    };

    // Role-based filtering
    if (isAdmin) {
      if (department_id) {
        timetableInclude.include = [
          {
            model: Program,
            as: "program",
            where: { department_id },
            required: true,
          },
        ];
        timetableInclude.required = true;
      }
    } else if (isHOD) {
      // HODs see everything in their department for today
      // Safety check for department_id
      if (!userDeptId) {
        logger.error(`HOD ${userId} is missing department_id in session`);
        return res
          .status(403)
          .json({ error: "Departmental context missing. Please re-login." });
      }

      timetableInclude.include = [
        {
          model: Program,
          as: "program",
          where: { department_id: userDeptId },
          required: true,
        },
      ];
      timetableInclude.required = true;
    } else {
      // Faculty only see their own classes
      where.faculty_id = userId;
    }

    // Find all slots based on role scope
    const slots = await TimetableSlot.findAll({
      where,
      include: [
        { model: Course, as: "course", attributes: ["name", "code"] },
        {
          model: User,
          as: "faculty",
          attributes: ["id", "first_name", "last_name", "profile_picture"],
        },
        timetableInclude,
        {
          model: Attendance,
          as: "attendance_records",
          where: { date: dateStr },
          required: false,
          limit: 1, // Just to check if marked
        },
      ],
      order: [["start_time", "ASC"]],
    });

    const results = slots.map((slot) => ({
      id: slot.id,
      course_id: slot.course_id,
      course_name: slot.course?.name || slot.activity_name,
      course_code: slot.course?.code,
      faculty_name: slot.faculty
        ? `${slot.faculty.first_name} ${slot.faculty.last_name}`
        : "N/A",
      section: slot.timetable?.section,
      program_id: slot.timetable?.program_id,
      semester: slot.timetable?.semester,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_marked: slot.attendance_records.length > 0,
      type: slot.course_id ? "course" : "activity",
    }));

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error("Error fetching today classes:", error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};

// @desc    Get attendance analytics for HOD/Admin
// @route   GET /api/attendance/stats
// @access  Private/Admin/HOD
export const getAttendanceStats = async (req, res) => {
  try {
    const { department_id, batch_year, semester, section } = req.query;
    const { role, department_id: userDeptId } = req.user;

    const where = { role: "student" };

    // Enforce Hierarchy
    if (role === "hod") {
      // HODs only see their department
      if (!userDeptId) {
        logger.error(
          `HOD ${req.user.userId} is missing department_id in session`,
        );
        return res
          .status(403)
          .json({ error: "Departmental context missing. Please re-login." });
      }
      where.department_id = userDeptId;
    } else if (["admin", "super_admin"].includes(role)) {
      // Admins can filter by department, or see all if not specified
      if (department_id) where.department_id = department_id;
    } else {
      // For faculty/others with manage permission, default to their dept if available
      if (userDeptId) where.department_id = userDeptId;
      else if (department_id) where.department_id = department_id;
    }

    if (batch_year) where.batch_year = batch_year;
    if (semester) where.current_semester = semester;
    if (section) where.section = section;

    const students = await User.findAll({
      where,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "student_id",
        "section",
        "batch_year",
      ],
      include: [
        {
          model: Attendance,
          as: "attendance_records",
          attributes: ["status", "date"],
        },
      ],
    });

    const stats = students.map((student) => {
      const total = student.attendance_records.length;
      const present = student.attendance_records.filter(
        (a) => a.status === "present",
      ).length;
      const percentage = total > 0 ? (present / total) * 100 : 0;

      return {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        student_id: student.student_id,
        section: student.section,
        batch_year: student.batch_year,
        total,
        present,
        percentage: percentage.toFixed(2),
        is_low: percentage < 75,
      };
    });

    // Sort by percentage ASC to show at-risk students first
    stats.sort((a, b) => a.percentage - b.percentage);

    res.status(200).json({
      success: true,
      data: {
        total_students: stats.length,
        at_risk_count: stats.filter((s) => s.is_low).length,
        students: stats,
      },
    });
  } catch (error) {
    logger.error("Error fetching attendance stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// @desc    Get attendance for a specific session (for editing)
// @route   GET /api/attendance/session/:id
// @access  Private/Faculty/Admin
export const getSessionAttendance = async (req, res) => {
  try {
    const { id } = req.params; // timetable_slot_id
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const records = await Attendance.findAll({
      where: {
        timetable_slot_id: id,
        date: date,
      },
      attributes: ["student_id", "status", "remarks"],
    });

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    logger.error("Error fetching session attendance:", error);
    res.status(500).json({ error: "Failed to fetch session attendance" });
  }
};

export default {
  markAttendance,
  getMyAttendance,
  applyLeave,
  getLeaveRequests,
  updateLeaveStatus,
  getTodayClasses,
  getAttendanceStats,
  getSessionAttendance,
};
