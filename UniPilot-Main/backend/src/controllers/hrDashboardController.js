const {
  User,
  StaffAttendance,
  LeaveRequest,
  Payslip,
  Department,
  SalaryStructure,
  Role,
  Program,
  Course,
  Timetable,
  TimetableSlot,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

// @desc    Get All HR Dashboard Stats (Admin/HR only)
// @route   GET /api/hr/dashboard/stats
// @access  Private/Admin/HR
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA");

    // 1. Workforce Distribution by Department (Staff only)
    const workforceMix = await User.findAll({
      attributes: [
        [sequelize.col("department.name"), "name"],
        [sequelize.fn("COUNT", sequelize.col("User.id")), "value"],
      ],
      include: [
        {
          model: Department,
          as: "department",
          attributes: [],
        },
      ],
      where: {
        role: { [Op.ne]: "student" },
        is_active: true,
      },
      group: [sequelize.col("department.name")],
      raw: true,
    });

    // 2. Today's Attendance Snapshot
    const totalStaff = await User.count({
      where: {
        role: { [Op.ne]: "student" },
        is_active: true,
      },
    });

    const presentToday = await StaffAttendance.count({
      where: {
        date: today,
        status: "present",
      },
      include: [
        {
          model: User,
          as: "staff",
          where: {
            role: { [Op.ne]: "student" },
            is_active: true,
          },
          required: true,
        },
      ],
    });

    const onLeaveToday = await StaffAttendance.count({
      where: {
        date: today,
        status: "leave",
      },
      include: [
        {
          model: User,
          as: "staff",
          where: {
            role: { [Op.ne]: "student" },
            is_active: true,
          },
          required: true,
        },
      ],
    });

    // 3. Pending Approvals
    const pendingLeaves = await LeaveRequest.findAll({
      where: { status: "pending" },
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "first_name", "last_name", "role", "employee_id"],
          include: [
            { model: Department, as: "department", attributes: ["name"] },
          ],
        },
      ],
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
      include: [
        {
          model: User,
          as: "staff",
          attributes: [],
          where: {
            role: { [Op.ne]: "student" },
            is_active: true,
          },
          required: true,
        },
      ],
      where: {
        date: { [Op.in]: last7Days },
        status: "present",
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
        pendingLeaves,
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
exports.getHodDashboardStats = async (req, res) => {
  try {
    const { userId } = req.user;

    // Find User's department
    const user = await User.findByPk(userId);
    if (!user || !user.department_id) {
      return res
        .status(400)
        .json({ error: "User not associated with any department" });
    }

    const departmentId = user.department_id;
    const department = await Department.findByPk(departmentId);

    // 1. Total Students in Department
    const totalStudents = await User.count({
      where: { department_id: departmentId, role: "student", is_active: true },
    });

    // 2. Total Faculty in Department
    const totalFaculty = await User.count({
      where: {
        department_id: departmentId,
        role: { [Op.in]: ["faculty", "hod"] },
        is_active: true,
      },
    });

    // 3. Total Courses in Department (via Programs)
    const programs = await Program.findAll({
      where: { department_id: departmentId },
      attributes: ["id"],
    });
    const programIds = programs.map((p) => p.id);

    const totalCourses = await Course.count({
      where: { program_id: { [Op.in]: programIds } },
    });

    // 4. Classes Today in Department
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const activeClasses = await TimetableSlot.count({
      include: [
        {
          model: Timetable,
          as: "timetable",
          where: { program_id: { [Op.in]: programIds }, is_active: true },
          required: true,
        },
      ],
      where: { day_of_week: today },
    });

    // 5. Recent Activity (Timetable changes & New Students)
    const recentStudents = await User.findAll({
      where: { department_id: departmentId, role: "student" },
      limit: 3,
      order: [["created_at", "DESC"]],
      attributes: ["first_name", "last_name", "created_at"],
    });

    const recentTimetableSlots = await TimetableSlot.findAll({
      include: [
        {
          model: Timetable,
          as: "timetable",
          where: { program_id: { [Op.in]: programIds } },
          attributes: ["section", "semester"],
          required: true,
        },
        { model: Course, as: "course", attributes: ["name", "code"] },
      ],
      limit: 3,
      order: [["created_at", "DESC"]],
    });

    // Merge and format updates
    const recentUpdates = [
      ...recentStudents.map((s) => ({
        type: "STUDENT",
        title: "New Student Registered",
        message: `${s.first_name} ${s.last_name} joined the department.`,
        time: s.created_at || s.createdAt || new Date(),
      })),
      ...recentTimetableSlots.map((slot) => ({
        type: "TIMETABLE",
        title: "Timetable Updated",
        message: `${slot.course?.name || "Activity"} scheduled for Sem ${slot.timetable.semester} - Sec ${slot.timetable.section}`,
        time: slot.created_at || slot.createdAt || new Date(),
      })),
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
