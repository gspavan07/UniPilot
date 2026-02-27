import { Op, fn, col } from "sequelize";
import CoreService from "../../core/services/index.js";
import academicLookupService from "../../academics/services/academicLookupService.js";
import feeAnalyticsService from "../../fees/services/feeAnalyticsService.js";

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
    const totalStudents = await CoreService.count({
      where: studentWhere,
    });
    const totalFaculty = await CoreService.count({
      where: {
        role: "faculty",
        is_active: true,
      },
    });

    // Handle batch-specific revenue filtering
    if (batch && batch !== "all") {
      paymentWhere["$student.batch_year$"] = parseInt(batch, 10);
    }

    const totalRevenue = await feeAnalyticsService.getTotalRevenue({
      batchYear: batch && batch !== "all" ? batch : undefined,
    });

    // Calculate Total Collectable Revenue
    // 1. Base Structure Fees
    const totalCollectableStructure =
      await feeAnalyticsService.getTotalCollectableStructure({
        studentWhere,
      });

    const academicDepts = await academicLookupService.countDepartments({
      where: { type: "academic", is_active: true },
    });
    const adminDepts = await academicLookupService.countDepartments({
      where: { type: "administrative", is_active: true },
    });
    const totalPrograms = await academicLookupService.countPrograms();

    // 2. Revenue Trend
    const sixMonthsAgoTrend = new Date();
    sixMonthsAgoTrend.setMonth(sixMonthsAgoTrend.getMonth() - 6);
    sixMonthsAgoTrend.setDate(1);
    sixMonthsAgoTrend.setHours(0, 0, 0, 0);

    // 2a. Collected Revenue Trend
    const revenueTrendData = await feeAnalyticsService.getRevenueTrend({
      sinceDate: sixMonthsAgoTrend,
      batchYear: batch && batch !== "all" ? batch : undefined,
    });

    // 3. Student Enrollment by Program (Pie Chart) - Live data from DB
    const enrollmentByProgramRaw = await CoreService.findAll({
      attributes: [
        "program_id",
        [fn("COUNT", col("User.id")), "student_count"],
      ],
      where: {
        ...studentWhere,
        program_id: { [Op.ne]: null },
      },
      group: ["program_id"],
      raw: true,
    });

    const programMap = await academicLookupService.getProgramMapByIds(
      enrollmentByProgramRaw.map((item) => item.program_id),
      { attributes: ["id", "name"] },
    );

    const enrollmentByProgram = enrollmentByProgramRaw.map((item) => ({
      program_name: programMap.get(item.program_id)?.name || "Unknown",
      student_count: item.student_count,
    }));

    // Ensure student_count is a number for Recharts
    const formattedEnrollment = enrollmentByProgram.map((item) => ({
      ...item,
      student_count: parseInt(item.student_count, 10),
    }));

    // Get Available Batches
    const availableBatches = await CoreService.findAll({
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
        academic_depts: academicDepts,
        admin_depts: adminDepts,
        programs: totalPrograms,
      },
      analytics: {
        revenue_trend: revenueTrendData,
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

export default {
  getSuperAdminStats,
};
