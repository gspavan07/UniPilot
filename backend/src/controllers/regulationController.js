const Regulation = require("../models/Regulation");
const logger = require("../utils/logger");

/**
 * @desc    Get all regulations
 * @route   GET /api/regulations
 * @access  Private
 */
exports.getAllRegulations = async (req, res) => {
  try {
    const regulations = await Regulation.findAll({
      order: [["academic_year", "DESC"]],
    });
    res.status(200).json({ success: true, data: regulations });
  } catch (error) {
    logger.error("Error fetching regulations:", error);
    res.status(500).json({ error: "Failed to fetch regulations" });
  }
};

/**
 * @desc    Get single regulation by ID
 * @route   GET /api/regulations/:id
 * @access  Private
 */
exports.getRegulationById = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }
    res.status(200).json({ success: true, data: regulation });
  } catch (error) {
    logger.error("Error fetching regulation:", error);
    res.status(500).json({ error: "Failed to fetch regulation" });
  }
};

/**
 * @desc    Create new regulation
 * @route   POST /api/regulations
 * @access  Private/Admin
 */
exports.createRegulation = async (req, res) => {
  try {
    const regulation = await Regulation.create(req.body);
    res.status(201).json({ success: true, data: regulation });
  } catch (error) {
    logger.error("Error creating regulation:", error);
    res.status(500).json({ error: "Failed to create regulation" });
  }
};

/**
 * @desc    Update regulation exam structure
 * @route   PUT /api/regulations/:id/exam-structure
 * @access  Private/Admin
 */
exports.updateExamStructure = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    const { exam_structure, grade_scale } = req.body;

    if (exam_structure) regulation.exam_structure = exam_structure;
    if (grade_scale) regulation.grade_scale = grade_scale;

    await regulation.save();

    res.status(200).json({
      success: true,
      message: "Exam structure updated successfully",
      data: regulation,
    });
  } catch (error) {
    logger.error("Error updating exam structure:", error);
    res.status(500).json({ error: "Failed to update exam structure" });
  }
};

/**
 * @desc    Get exam structure for a regulation
 * @route   GET /api/regulations/:id/exam-structure
 * @access  Private
 */
exports.getExamStructure = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id, {
      attributes: ["id", "name", "exam_structure", "grade_scale"],
    });

    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        regulation_id: regulation.id,
        regulation_name: regulation.name,
        exam_structure: regulation.exam_structure,
        grade_scale: regulation.grade_scale,
      },
    });
  } catch (error) {
    logger.error("Error fetching exam structure:", error);
    res.status(500).json({ error: "Failed to fetch exam structure" });
  }
};

/**
 * @desc    Update regulation
 * @route   PUT /api/regulations/:id
 * @access  Private/Admin
 */
exports.updateRegulation = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    await regulation.update(req.body);
    res.status(200).json({ success: true, data: regulation });
  } catch (error) {
    logger.error("Error updating regulation:", error);
    res.status(500).json({ error: "Failed to update regulation" });
  }
};

/**
 * @desc    Delete regulation
 * @route   DELETE /api/regulations/:id
 * @access  Private/Admin
 */
exports.deleteRegulation = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id);
    if (!regulation) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    await regulation.destroy();
    res.status(200).json({
      success: true,
      message: "Regulation deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting regulation:", error);
    res.status(500).json({ error: "Failed to delete regulation" });
  }
};

/**
 * @desc    Update regulation exam structure
 * @route   PUT /api/regulations/:id/exam-structure
 * @access  Private/Admin
 */
exports.updateExamStructure = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id);
    if (!regulation) {
      return res.status(404).json({
        success: false,
        error: "Regulation not found",
      });
    }

    const { exam_structure, grade_scale } = req.body;

    if (exam_structure) regulation.exam_structure = exam_structure;
    if (grade_scale) regulation.grade_scale = grade_scale;

    await regulation.save();

    res.status(200).json({
      success: true,
      message: "Exam structure updated successfully",
      data: regulation,
    });
  } catch (error) {
    logger.error("Error updating exam structure:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Get exam structure for a regulation
 * @route   GET /api/regulations/:id/exam-structure
 * @access  Private
 */
exports.getExamStructure = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id, {
      attributes: ["id", "name", "exam_structure", "grade_scale"],
    });

    if (!regulation) {
      return res.status(404).json({
        success: false,
        error: "Regulation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        regulation_id: regulation.id,
        regulation_name: regulation.name,
        exam_structure: regulation.exam_structure,
        grade_scale: regulation.grade_scale,
      },
    });
  } catch (error) {
    logger.error("Error fetching exam structure:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
