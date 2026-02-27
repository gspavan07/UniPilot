import logger from "../../../../utils/logger.js";
import AcademicService from "../../../academics/services/index.js";
import CoreService from "../../../core/services/index.js";



/**
 * Get all available regulations
 * GET /api/exam/cycles/helpers/regulations
 */
async function getAllRegulations(req, res) {
  try {
    const regulations = await AcademicService.listRegulations({
      attributes: ["id", "name", "academic_year", "exam_configuration"],
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
    const batchList = await CoreService.getDistinctBatchYears({
      role: "student",
    });

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

    const regulation = await AcademicService.getRegulationById(regulationId, {
      attributes: ["id", "exam_config"],
    });

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

    const regulation = await AcademicService.getRegulationById(regulationId, {
      attributes: ["id", "exam_config"],
    });

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
    const semester = await CoreService.getMostCommonSemesterForBatch(batch, {
      role: "student",
    });

    if (!semester) {
      return res
        .status(404)
        .json({ success: false, error: "No students found for this batch" });
    }

    res.json({ success: true, data: semester });
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

    const programs = await AcademicService.listPrograms({
      where: {
        degree_type: degree,
        is_active: true,
      },
      attributes: ["id", "name", "code", "degree_type"],
      order: [["name", "ASC"]],
      raw: true,
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
    const degrees = await AcademicService.listDistinctDegrees({
      where: { is_active: true },
    });
    const degreeList = degrees.map((d) => d.degree_type).filter(Boolean);
    res.json({ success: true, data: degreeList });
  } catch (error) {
    logger.error("Get all degrees error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
