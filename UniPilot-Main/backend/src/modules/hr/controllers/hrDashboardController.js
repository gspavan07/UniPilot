import { Op } from "sequelize";
import logger from "../../../utils/logger.js";
import { sequelize } from "../../../config/database.js";
import AcademicService from "../../academics/services/index.js";
import CoreService from "../../core/services/index.js";
import { Payslip, SalaryStructure, StaffAttendance } from "../models/index.js";

// @desc    Get All HR Dashboard Stats (Admin/HR only)
// @route   GET /api/hr/dashboard/stats
// @access  Private/Admin/HR
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA");

    // 1. Workforce Distribution by Department (Staff only)
    const staffUsers = await CoreService.findAll({
      where: {
        role: { [Op.ne]: "student" },
        is_active: true,
      },
      attributes: ["id", "department_id"],
    });
    const staffIds = staffUsers.map((user) => user.id);
    const departmentIds = [
      ...new Set(staffUsers.map((user) => user.department_id).filter(Boolean)),
    ];
    const departments = await AcademicService.getDepartmentsByIds(
      departmentIds,
      { attributes: ["id", "name"], raw: true },
    );
    const departmentMap = new Map(
      departments.map((department) => [department.id, department]),
    );

    const workforceCountMap = staffUsers.reduce((acc, user) => {
      const deptName =
        user.department_id && departmentMap.get(user.department_id)
          ? departmentMap.get(user.department_id).name
          : "Unassigned";
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    const workforceMix = Object.entries(workforceCountMap).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    // 2. Today's Attendance Snapshot
    const totalStaff = staffUsers.length;

    const presentToday = await StaffAttendance.count({
      where: {
        date: today,
        status: "present",
        user_id: { [Op.in]: staffIds },
      },
    });

    const onLeaveToday = await StaffAttendance.count({
      where: {
        date: today,
        status: "leave",
        user_id: { [Op.in]: staffIds },
      },
    });

    // 3. Pending Approvals
    const pendingLeaves = await AcademicService.listLeaveRequests({
      where: { status: "pending" },
      limit: 5,
      order: [["created_at", "DESC"]],
    });

    const applicantIds = [
      ...new Set(pendingLeaves.map((leave) => leave.student_id).filter(Boolean)),
    ];
    const applicants = await CoreService.getUsersByIds(applicantIds, {
      attributes: ["id", "first_name", "last_name", "role", "employee_id", "department_id"],
    });
    const applicantMap = new Map(
      applicants.map((user) => [user.id, user.toJSON?.() ?? user]),
    );
    const applicantDeptIds = [
      ...new Set(applicants.map((user) => user.department_id).filter(Boolean)),
    ];
    const applicantDepartments = await AcademicService.getDepartmentsByIds(
      applicantDeptIds,
      { attributes: ["id", "name"], raw: true },
    );
    const applicantDeptMap = new Map(
      applicantDepartments.map((department) => [department.id, department]),
    );
    const pendingLeavesEnriched = pendingLeaves.map((leave) => {
      const leaveJson = leave.toJSON?.() ?? leave;
      const applicant = applicantMap.get(leave.student_id);
      leaveJson.applicant = applicant
        ? {
            ...applicant,
            department: applicant.department_id
              ? applicantDeptMap.get(applicant.department_id) || null
              : null,
          }
        : null;
      return leaveJson;
    });

    // 4. Payroll Snapshot (Current Month)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const payrollTotal = await Payslip.sum("net_salary", {
      where: {
        month: currentMonth,
        year: currentYear,
        status: { [Op.ne]: "draft" },
      },
    });

    const payrollConfigured = await SalaryStructure.count();

    // 5. Attendance Trend (Last 7 Days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toLocaleDateString("en-CA"));
    }

    const attendanceTrendRaw = await StaffAttendance.findAll({
      attributes: [
        "date",
        [
          sequelize.fn("COUNT", sequelize.col("StaffAttendance.id")),
          "present_count",
        ],
      ],
      where: {
        date: { [Op.in]: last7Days },
        status: "present",
        user_id: { [Op.in]: staffIds },
      },
      group: ["date"],
      order: [["date", "ASC"]],
      raw: true,
    });

    // Format trend data for chart
    const trendMap = attendanceTrendRaw.reduce((acc, curr) => {
      acc[curr.date] = curr.present_count;
      return acc;
    }, {});

    const trend = last7Days.map((date) => {
      const dayName = new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
      });
      const count = parseInt(trendMap[date]) || 0;
      const percentage =
        totalStaff > 0 ? Math.round((count / totalStaff) * 100) : 0;
      return {
        name: dayName,
        attendance: count, // Using count for the trend for better clarity
        percentage: percentage,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalStaff,
          presentToday,
          onLeaveToday,
          payrollTotal: payrollTotal || 0,
          payrollConfigured,
          readinessPercentage:
            totalStaff > 0
              ? Math.round((payrollConfigured / totalStaff) * 100)
              : 0,
        },
        workforceMix: workforceMix.map((item) => ({
          ...item,
          value: parseInt(item.value),
        })),
        attendanceTrend: trend,
        pendingLeaves: pendingLeavesEnriched,
      },
    });
  } catch (error) {
    logger.error("Error in HR Dashboard Stats:", error);
    res.status(500).json({ error: "Failed to compile dashboard metrics" });
  }
};

// @desc    Get HOD Dashboard Stats (Department specific)
// @route   GET /api/hr/hod/dashboard-stats
// @access  Private/HOD
export const getHodDashboardStats = async (req, res) => {
  try {
    const { userId } = req.user;

    // Find User's department
    const user = await CoreService.findByPk(userId, {
      attributes: ["id", "department_id"],
    });
    if (!user || !user.department_id) {
      return res
        .status(400)
        .json({ error: "User not associated with any department" });
    }

    const departmentId = user.department_id;
    const department = await AcademicService.getDepartmentById(departmentId, {
      attributes: ["id", "name"],
    });

    // 1. Total Students in Department
    const totalStudents = await CoreService.count({
      where: { department_id: departmentId, role: "student", is_active: true },
    });

    // 2. Total Faculty in Department
    const totalFaculty = await CoreService.count({
      where: {
        department_id: departmentId,
        role: { [Op.in]: ["faculty", "hod"] },
        is_active: true,
      },
    });

    // 3. Total Courses in Department
    const totalCourses = await AcademicService.countCourses({
      where: { department_id: departmentId },
    });

    // 4. Classes Today in Department
    // Get program IDs for timetable filtering
    const programs = await AcademicService.listPrograms({
      where: { department_id: departmentId },
      attributes: ["id"],
      raw: true,
    });
    const programIds = programs.map((p) => p.id);

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const timetables = await AcademicService.listTimetables({
      where: { program_id: { [Op.in]: programIds }, is_active: true },
      attributes: ["id", "section", "semester", "program_id"],
      raw: true,
    });
    const timetableIds = timetables.map((timetable) => timetable.id);

    const activeClasses = timetableIds.length
      ? await AcademicService.countTimetableSlots({
          where: { day_of_week: today, timetable_id: { [Op.in]: timetableIds } },
        })
      : 0;

    // 5. Recent Activity (Timetable changes & New Students)
    const recentStudents = await CoreService.findAll({
      where: { department_id: departmentId, role: "student" },
      limit: 3,
      order: [["created_at", "DESC"]],
      attributes: ["first_name", "last_name", "created_at"],
    });

    const recentTimetableSlots = timetableIds.length
      ? await AcademicService.listTimetableSlots({
          where: { timetable_id: { [Op.in]: timetableIds } },
          limit: 3,
          order: [["created_at", "DESC"]],
        })
      : [];

    const recentCourseIds = [
      ...new Set(
        recentTimetableSlots.map((slot) => slot.course_id).filter(Boolean),
      ),
    ];
    const recentTimetableIds = [
      ...new Set(
        recentTimetableSlots.map((slot) => slot.timetable_id).filter(Boolean),
      ),
    ];

    const [recentCourses, recentTimetables] = await Promise.all([
      AcademicService.getCoursesByIds(recentCourseIds, {
        attributes: ["id", "name", "code"],
        raw: true,
      }),
      AcademicService.listTimetables({
        where: { id: { [Op.in]: recentTimetableIds } },
        attributes: ["id", "section", "semester"],
        raw: true,
      }),
    ]);

    const recentCourseMap = new Map(
      recentCourses.map((course) => [course.id, course]),
    );
    const recentTimetableMap = new Map(
      recentTimetables.map((timetable) => [timetable.id, timetable]),
    );

    // Merge and format updates
    const recentUpdates = [
      ...recentStudents.map((s) => ({
        type: "STUDENT",
        title: "New Student Registered",
        message: `${s.first_name} ${s.last_name} joined the department.`,
        time: s.created_at || s.createdAt || new Date(),
      })),
      ...recentTimetableSlots.map((slot) => {
        const course = recentCourseMap.get(slot.course_id);
        const timetable = recentTimetableMap.get(slot.timetable_id);
        return {
          type: "TIMETABLE",
          title: "Timetable Updated",
          message: `${course?.name || "Activity"} scheduled for Sem ${timetable?.semester || "-"} - Sec ${timetable?.section || "-"}`,
          time: slot.created_at || slot.createdAt || new Date(),
        };
      }),
      
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({
      success: true,
      data: {
        department,
        stats: {
          totalStudents,
          totalFaculty,
          totalCourses,
          activeClasses,
        },
        recentUpdates,
      },
    });
  } catch (error) {
    logger.error("Error in HOD Dashboard Stats:", error);
    res.status(500).json({ error: "Failed to compile HOD dashboard metrics" });
  }
};

export default {
  getDashboardStats,
  getHodDashboardStats,
};
