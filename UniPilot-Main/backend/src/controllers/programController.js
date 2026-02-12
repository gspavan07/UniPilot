const { Program, Department, User } = require("../models");
const logger = require("../utils/logger");

/**
 * Program Controller
 * Handles CRUD operations for academic programs
 */

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.findAll({
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "code"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } catch (error) {
    logger.error("Error in getAllPrograms:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Private
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "code"],
        },
      ],
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        error: "Program not found",
      });
    }

    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    logger.error("Error in getProgram:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Private/Admin
exports.createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);

    res.status(201).json({
      success: true,
      data: program,
    });
  } catch (error) {
    logger.error("Error in createProgram:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Program code already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private/Admin
exports.updateProgram = async (req, res) => {
  try {
    let program = await Program.findByPk(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        error: "Program not found",
      });
    }

    program = await program.update(req.body);

    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    logger.error("Error in updateProgram:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Program code already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private/Admin
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        error: "Program not found",
      });
    }

    await program.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error("Error in deleteProgram:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
