const { Regulation, Course, Program } = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

/**
 * @desc    Get all regulations
 * @route   GET /api/regulations
 * @access  Private
 */
exports.getAllRegulations = async (req, res) => {
  try {
    const { is_active } = req.query;
    const where = {};
    if (is_active !== undefined) where.is_active = is_active === "true";

    const regulations = await Regulation.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "name", "code"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: regulations,
    });
  } catch (error) {
    logger.error("Error in getAllRegulations:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Get single regulation
 * @route   GET /api/regulations/:id
 * @access  Private
 */
exports.getRegulation = async (req, res) => {
  try {
    const regulation = await Regulation.findByPk(req.params.id, {
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "name", "code", "credits"],
        },
      ],
    });

    if (!regulation) {
      return res.status(404).json({
        success: false,
        error: "Regulation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: regulation,
    });
  } catch (error) {
    logger.error("Error in getRegulation:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Create regulation
 * @route   POST /api/regulations
 * @access  Private/Admin
 */
exports.createRegulation = async (req, res) => {
  try {
    const { name, academic_year } = req.body;

    // Check duplicate
    const existing = await Regulation.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Regulation with this name already exists",
      });
    }

    const regulation = await Regulation.create(req.body);

    res.status(201).json({
      success: true,
      data: regulation,
    });
  } catch (error) {
    logger.error("Error in createRegulation:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Update regulation
 * @route   PUT /api/regulations/:id
 * @access  Private/Admin
 */
exports.updateRegulation = async (req, res) => {
  try {
    let regulation = await Regulation.findByPk(req.params.id);

    if (!regulation) {
      return res.status(404).json({
        success: false,
        error: "Regulation not found",
      });
    }

    regulation = await regulation.update(req.body);

    res.status(200).json({
      success: true,
      data: regulation,
    });
  } catch (error) {
    logger.error("Error in updateRegulation:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
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
      return res.status(404).json({
        success: false,
        error: "Regulation not found",
      });
    }

    // Check for associated courses
    const courseCount = await Course.count({
      where: { regulation_id: req.params.id },
    });

    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete regulation used by ${courseCount} courses. Deactivate it instead.`,
      });
    }

    await regulation.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error("Error in deleteRegulation:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
