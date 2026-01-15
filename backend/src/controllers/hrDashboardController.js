const {
  User,
  StaffAttendance,
  LeaveRequest,
  Payslip,
  Department,
  SalaryStructure,
  Role,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

/**
 * HR Dashboard Controller
 * Aggregates real-time statistics for the management console
 */

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
