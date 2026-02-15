const {
  User,
  Department,
  Program,
  AdmissionConfig,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

/**
 * Admission Analytics Controller
 * Comprehensive analytics for admission management dashboard
 */

// @desc    Get comprehensive admission analytics
// @route   GET /api/admission/analytics
// @access  Private (Admission Admin/Staff)
exports.getAdmissionAnalytics = async (req, res) => {
  try {
    const { batch } = req.query;

    // Get active batch year from admission config
    const activeConfig = await AdmissionConfig.findOne({
      where: { is_active: true },
      order: [["batch_year", "DESC"]],
    });

    const activeBatchYear =
      activeConfig?.batch_year || new Date().getFullYear();

    // Determine batch filter
    const batchWhere =
      batch && batch !== "all" ? { batch_year: parseInt(batch) } : {};

    // 1. Batch-wise growth data (last 5 years)
    const batchGrowth = await User.findAll({
      attributes: [
        "batch_year",
        [sequelize.fn("COUNT", sequelize.col("id")), "students"],
      ],
      where: {
        role: "student",
        batch_year: { [Op.ne]: null },
      },
      group: ["batch_year"],
      order: [["batch_year", "ASC"]],
      raw: true,
    });

    // Calculate growth percentages
    const batchGrowthWithPercentage = batchGrowth.map((batch, index) => {
      let growth = 0;
      if (index > 0) {
        const previousCount = parseInt(batchGrowth[index - 1].students);
        const currentCount = parseInt(batch.students);
        growth = (
          ((currentCount - previousCount) / previousCount) *
          100
        ).toFixed(1);
      }
      return {
        batch: `${batch.batch_year}-${(batch.batch_year + 1).toString().slice(-2)}`,
        students: parseInt(batch.students),
        growth: parseFloat(growth),
      };
    });

    // 2. Department classification
    const departmentData = await User.findAll({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("User.id")), "students"],
      ],
      where: {
        role: "student",
        ...batchWhere,
      },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["name", "code"],
          required: true,
        },
      ],
      group: ["department.id", "department.name", "department.code"],
      raw: true,
    });

    const departmentFormatted = departmentData.map((dept) => ({
      name: dept["department.code"] || dept["department.name"],
      students: parseInt(dept.students),
    }));

    // 3. Gender distribution
    const genderData = await User.findAll({
      attributes: [
        "gender",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        role: "student",
        gender: { [Op.ne]: null },
        ...batchWhere,
      },
      group: ["gender"],
      raw: true,
    });

    const genderFormatted = genderData.map((item) => ({
      name: item.gender.charAt(0).toUpperCase() + item.gender.slice(1),
      value: parseInt(item.count),
    }));

    // 4. Caste distribution
    const casteData = await User.findAll({
      attributes: [
        "caste",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        role: "student",
        caste: { [Op.ne]: null },
        ...batchWhere,
      },
      group: ["caste"],
      raw: true,
    });

    const casteFormatted = casteData.map((item) => ({
      name: item.caste,
      value: parseInt(item.count),
    }));

    // 5. Religion distribution
    const religionData = await User.findAll({
      attributes: [
        "religion",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        role: "student",
        religion: { [Op.ne]: null },
        ...batchWhere,
      },
      group: ["religion"],
      raw: true,
    });

    const religionFormatted = religionData.map((item) => ({
      name: item.religion,
      value: parseInt(item.count),
    }));

    // 6. Country distribution
    const countryData = await User.findAll({
      attributes: [
        "nationality",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        role: "student",
        nationality: { [Op.ne]: null },
        ...batchWhere,
      },
      group: ["nationality"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      raw: true,
    });

    const countryFormatted = countryData.map((item) => ({
      name: item.nationality,
      value: parseInt(item.count),
    }));

    // 7. State distribution (India only)
    const stateData = await User.findAll({
      attributes: [
        "state",
        [sequelize.fn("COUNT", sequelize.col("id")), "students"],
      ],
      where: {
        role: "student",
        state: { [Op.ne]: null },
        nationality: "Indian",
        ...batchWhere,
      },
      group: ["state"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      limit: 5,
      raw: true,
    });

    const stateFormatted = stateData.map((item) => ({
      name: item.state,
      students: parseInt(item.students),
    }));

    // 8. Admission Type distribution
    const admissionTypeData = await User.findAll({
      attributes: [
        "admission_type",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        role: "student",
        admission_type: { [Op.ne]: null },
        ...batchWhere,
      },
      group: ["admission_type"],
      raw: true,
    });

    const admissionTypeFormatted = admissionTypeData.map((item) => ({
      name:
        item.admission_type.charAt(0).toUpperCase() +
        item.admission_type.slice(1),
      value: parseInt(item.count),
    }));

    // 9. KPI statistics
    const totalStudents = await User.count({
      where: {
        role: "student",
        ...batchWhere,
      },
    });

    const internationalStudents = await User.count({
      where: {
        role: "student",
        nationality: { [Op.ne]: "Indian" },
        ...batchWhere,
      },
    });

    const activeBatch = `${activeBatchYear}-${(activeBatchYear + 1).toString().slice(-2)}`;

    const departmentCount = departmentFormatted.length;

    // 9. Get all available batches
    const allBatches = await User.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("batch_year")), "batch_year"],
      ],
      where: {
        role: "student",
        batch_year: { [Op.ne]: null },
      },
      order: [["batch_year", "DESC"]],
      raw: true,
    });

    // Extract batch years
    let batchYears = allBatches.map((b) => b.batch_year);

    // Always include active batch year if not present
    if (!batchYears.includes(activeBatchYear)) {
      batchYears.push(activeBatchYear);
      batchYears.sort((a, b) => b - a); // Re-sort descending
    }

    const batchList = batchYears.map(
      (year) => `${year}-${(year + 1).toString().slice(-2)}`,
    );

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalAdmissions: totalStudents,
          activeBatch,
          activeBatchYear,
          departments: departmentCount,
          international: internationalStudents,
          internationalPercentage:
            totalStudents > 0
              ? ((internationalStudents / totalStudents) * 100).toFixed(1)
              : "0.0",
        },
        batchGrowth: batchGrowthWithPercentage,
        departments: departmentFormatted,
        gender: genderFormatted,
        caste: casteFormatted,
        religion: religionFormatted,
        country: countryFormatted,
        admissionType: admissionTypeFormatted,
        states: stateFormatted,
        batches: batchList,
      },
    });
  } catch (error) {
    logger.error("Error in getAdmissionAnalytics:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: error.message,
    });
  }
};
