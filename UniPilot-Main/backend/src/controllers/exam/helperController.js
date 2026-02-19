import { User, Regulation, Program } from "../../models/index.js";
import { sequelize } from "../../config/database.js";
import logger from "../../utils/logger.js";

/**
 * Get all available regulations
 * GET /api/exam/cycles/helpers/regulations
 */
async function getAllRegulations(req, res) {
  try {
    const regulations = await Regulation.findAll({
      attributes: ["id", "name", "academic_year", "exam_configuration"],
      order: [["academic_year", "DESC"]],
    });

    res.json({ success: true, data: regulations });
  } catch (error) {
    logger.error("Get regulations error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get unique batch years from users table
 * GET /api/exam/cycles/helpers/batches
 */
async function getAllBatches(req, res) {
  try {
    const batches = await User.findAll({
      attributes: [
        [
          User.sequelize.fn("DISTINCT", User.sequelize.col("batch_year")),
          "batch_year",
        ],
      ],
      where: {
        batch_year: { [sequelize.Sequelize.Op.ne]: null },
        role: "student",
      },
      order: [["batch_year", "DESC"]],
      raw: true,
    });

    const batchList = batches.map((b) => b.batch_year).filter(Boolean);

    res.json({ success: true, data: batchList });
  } catch (error) {
    logger.error("Get batches error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get course types from exam_config for a regulation
 * GET /api/exam/cycles/helpers/course-types/:regulationId
 */
async function getCourseTypes(req, res) {
  try {
    const { regulationId } = req.params;

    const regulation = await Regulation.findByPk(regulationId);

    if (!regulation) {
      return res
        .status(404)
        .json({ success: false, error: "Regulation not found" });
    }

    const exam_config = regulation.exam_config;
    const courseTypes = Object.keys(exam_config || {});

    res.json({ success: true, data: courseTypes });
  } catch (error) {
    logger.error("Get course types error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get cycle types (exam components) where is_exam = true
 * GET /api/exam/cycles/helpers/cycle-types/:regulationId/:courseType
 */
async function getCycleTypes(req, res) {
  try {
    const { regulationId, courseType } = req.params;

    const regulation = await Regulation.findByPk(regulationId);

    if (!regulation) {
      return res
        .status(404)
        .json({ success: false, error: "Regulation not found" });
    }

    const exam_config = regulation.exam_config;
    const courseTypeConfig = exam_config[courseType];

    if (!courseTypeConfig || !courseTypeConfig.components) {
      return res.json({ success: true, data: [] });
    }

    // Filter components where is_exam is true
    const cycleTypes = courseTypeConfig.components
      .filter((component) => component.is_exam === true)
      .map((component) => component.name);

    res.json({ success: true, data: cycleTypes });
  } catch (error) {
    logger.error("Get cycle types error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get current semester for a batch year
 * GET /api/exam/cycles/helpers/semester/:batch
 */
async function getCurrentSemester(req, res) {
  try {
    const { batch } = req.params;

    // Get most common current_semester for students in this batch_year
    const result = await User.findAll({
      attributes: [
        "current_semester",
        [sequelize.fn("COUNT", sequelize.col("current_semester")), "count"],
      ],
      where: {
        batch_year: batch,
        role: "student",
        current_semester: { [sequelize.Sequelize.Op.ne]: null },
      },
      group: ["current_semester"],
      order: [[sequelize.literal("count"), "DESC"]],
      limit: 1,
      raw: true,
    });

    if (!result || !result[0]) {
      return res
        .status(404)
        .json({ success: false, error: "No students found for this batch" });
    }

    res.json({ success: true, data: result[0].current_semester });
  } catch (error) {
    logger.error("Get current semester error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get programs by degree
 * GET /api/exam/cycles/helpers/programs/:degree
 */
async function getProgramsByDegree(req, res) {
  try {
    const { degree } = req.params;

    const programs = await Program.findAll({
      where: {
        degree_type: degree,
        is_active: true,
      },
      attributes: ["id", "name", "code", "degree_type"],
      order: [["name", "ASC"]],
    });

    res.json({ success: true, data: programs });
  } catch (error) {
    logger.error("Get programs by degree error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export default {
  getAllRegulations,
  getAllBatches,
  getCourseTypes,
  getCycleTypes,
  getCurrentSemester,
  getProgramsByDegree,
  getAllDegrees,
};

/**
 * Get distinct degree types from programs
 * GET /api/exam/cycles/helpers/degrees
 */
async function getAllDegrees(req, res) {
  try {
    const degrees = await Program.findAll({
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("degree_type")),
          "degree_type",
        ],
      ],
      where: {
        is_active: true,
      },
      raw: true,
    });

    const degreeList = degrees.map((d) => d.degree_type).filter(Boolean);
    res.json({ success: true, data: degreeList });
  } catch (error) {
    logger.error("Get all degrees error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
