const {
  User,
  FeePayment,
  Attendance,
  AuditLog,
  Department,
  Program,
  InstitutionSetting,
  StudentFeeCharge,
  StudentDocument,
  StaffAttendance,
  FeeSemesterConfig,
  FeeStructure,
} = require("../models");
const { Op, fn, col, literal } = require("sequelize");
const os = require("os");

/**
 * Get Super Admin Dashboard Statistics (Live)
 */
const getSuperAdminStats = async (req, res) => {
  try {
    // 0. Filters
    const { batch } = req.query;
    const studentWhere = { role: "student", is_active: true };
    const paymentWhere = { status: "completed" };

    if (batch && batch !== "all") {
      studentWhere.batch_year = parseInt(batch, 10);
    }

    // 1. KPI Cards - Real Data
    const totalStudents = await User.count({
      where: studentWhere,
    });
    const totalFaculty = await User.count({
      where: {
        role: "faculty",
        is_active: true,
      },
    });

    // Handle batch-specific revenue filtering
    if (batch && batch !== "all") {
      paymentWhere["$student.batch_year$"] = parseInt(batch, 10);
    }

    const totalRevenueResult = await FeePayment.sum("amount_paid", {
      where: paymentWhere,
      include: [
        {
          model: User,
          as: "student",
          attributes: [],
          required: true,
        },
      ],
    });
    const totalRevenue = totalRevenueResult || 0;

    // Calculate Total Collectable Revenue
    // 1. Base Structure Fees
    let totalCollectableStructure = 0;

    // Get unique student IDs for the filtered batch
    const students = await User.findAll({
      where: studentWhere,
      attributes: ["id", "program_id", "admission_type", "batch_year"],
      raw: true,
    });

    const studentIds = students.map((s) => s.id);

    if (studentIds.length > 0) {
      // Calculate structure fees
      const feeStructures = await FeeStructure.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { student_id: studentIds },
            { student_id: null }, // Global structures
          ],
        },
        raw: true,
      });

      students.forEach((student) => {
        const studentStructures = feeStructures.filter((fs) => {
          // Rule 1: Student-specific structure
          if (fs.student_id === student.id) return true;
          // Rule 2: Program & Batch & Type matching
          if (
            fs.student_id === null &&
            fs.program_id === student.program_id &&
            fs.batch_year === student.batch_year &&
            (fs.applies_to === "all" ||
              fs.applies_to === student.admission_type)
          ) {
            return true;
          }
          return false;
        });

        const studentTotal = studentStructures.reduce(
          (sum, fs) => sum + parseFloat(fs.amount),
          0,
        );
        totalCollectableStructure += studentTotal;
      });

      // 2. Individual Extra Charges
      const extraChargesResult = await StudentFeeCharge.sum("amount", {
        where: {
          student_id: studentIds,
        },
      });
      totalCollectableStructure += parseFloat(extraChargesResult || 0);
    }

    const academicDepts = await Department.count({
      where: { type: "academic", is_active: true },
    });
    const adminDepts = await Department.count({
      where: { type: "administrative", is_active: true },
    });
    const totalPrograms = await Program.count();

    // 2. Revenue Trend
    const sixMonthsAgoTrend = new Date();
    sixMonthsAgoTrend.setMonth(sixMonthsAgoTrend.getMonth() - 6);
    sixMonthsAgoTrend.setDate(1);
    sixMonthsAgoTrend.setHours(0, 0, 0, 0);

    // 2a. Collected Revenue Trend
    const revenueTrendData = await FeePayment.findAll({
      attributes: [
        [fn("date_trunc", "month", col("payment_date")), "month"],
        [fn("sum", col("amount_paid")), "total"],
      ],
      where: {
        ...paymentWhere,
        payment_date: {
          [Op.gte]: sixMonthsAgoTrend,
        },
      },
      include:
        batch && batch !== "all"
          ? [
              {
                model: User,
                as: "student",
                attributes: [],
                required: true,
              },
            ]
          : [],
      group: [fn("date_trunc", "month", col("payment_date"))],
      order: [[fn("date_trunc", "month", col("payment_date")), "ASC"]],
    });

    // 2b. Collectable Revenue Trend (from StudentFeeCharge)
    const collectableTrendData = await StudentFeeCharge.findAll({
      attributes: [
        [fn("date_trunc", "month", col("created_at")), "month"],
        [fn("sum", col("amount")), "total"],
      ],
      where:
        studentIds.length > 0
          ? {
              student_id: studentIds,
              created_at: {
                [Op.gte]: sixMonthsAgoTrend,
              },
            }
          : {
              created_at: {
                [Op.gte]: sixMonthsAgoTrend,
              },
            },
      group: [fn("date_trunc", "month", col("created_at"))],
      order: [[fn("date_trunc", "month", col("created_at")), "ASC"]],
    });

    // 2c. Merge Trends
    const mergedTrend = [];
    const months = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(
        d.toLocaleString("default", { month: "short", year: "numeric" }),
      );
    }
    months.reverse();

    months.forEach((monthName) => {
      const collectedObj = revenueTrendData.find((t) => {
        const d = new Date(t.get("month"));
        return (
          d.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }) === monthName
        );
      });

      const collectableObj = collectableTrendData.find((t) => {
        const d = new Date(t.get("month"));
        return (
          d.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }) === monthName
        );
      });

      mergedTrend.push({
        month: monthName,
        collected: parseFloat(collectedObj?.get("total") || 0),
        collectable: parseFloat(collectableObj?.get("total") || 0),
      });
    });

    // 3. Student Enrollment by Program (Pie Chart) - Live data from DB
    const enrollmentByProgram = await User.findAll({
      attributes: [
        [literal('"program"."name"'), "program_name"],
        [fn("COUNT", col("User.id")), "student_count"],
      ],
      where: studentWhere,
      include: [
        {
          model: Program,
          as: "program",
          attributes: [],
          required: true,
        },
      ],
      group: [literal('"program"."name"')],
      raw: true,
    });

    // Ensure student_count is a number for Recharts
    const formattedEnrollment = enrollmentByProgram.map((item) => ({
      ...item,
      student_count: parseInt(item.student_count, 10),
    }));

    // Get Available Batches
    const availableBatches = await User.findAll({
      where: { role: "student", batch_year: { [Op.ne]: null } },
      attributes: [[fn("DISTINCT", col("batch_year")), "batch_year"]],
      order: [[col("batch_year"), "DESC"]],
      raw: true,
    });

    res.json({
      success: true,
      kpis: {
        students: totalStudents,
        faculty: totalFaculty,
        revenue: totalRevenue, // Total Collected
        total_collectable: totalCollectableStructure,
        academic_depts: academicDepts,
        admin_depts: adminDepts,
        programs: totalPrograms,
      },
      analytics: {
        revenue_trend: mergedTrend,
        enrollment_by_program: formattedEnrollment,
        batches: availableBatches.map((b) => b.batch_year),
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getSuperAdminStats,
};
