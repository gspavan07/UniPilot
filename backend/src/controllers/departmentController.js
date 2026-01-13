const { Department, User } = require("../models");
const logger = require("../utils/logger");

/**
 * Department Controller
 * Handles CRUD operations for university departments
 */

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private/Admin/Faculty
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [
        {
          model: User,
          as: "hod",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "profile_picture",
          ],
        },
        {
          model: Department,
          as: "parentDepartment",
          attributes: ["id", "name", "code"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    logger.error("Error in getAllDepartments:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "hod",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "profile_picture",
          ],
        },
        {
          model: Department,
          as: "parentDepartment",
          attributes: ["id", "name", "code"],
        },
      ],
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    logger.error("Error in getDepartment:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    logger.error("Error in createDepartment:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Department name or code already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res) => {
  try {
    let department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    department = await department.update(req.body);

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    logger.error("Error in updateDepartment:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Department name or code already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    // Check for sub-departments or related programs/users before deleting
    // For now, simple soft delete or hard delete based on preference
    // Let's do hard delete for now but in production we might want safety checks
    await department.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error("Error in deleteDepartment:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
