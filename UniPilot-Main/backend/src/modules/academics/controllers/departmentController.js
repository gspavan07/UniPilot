import { Op } from "sequelize";
import logger from "../../../utils/logger.js";
import { Department } from "../models/index.js";
import { Role, User } from "../../core/models/index.js";



/**
 * Department Controller
 * Handles CRUD operations for university departments
 */

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private/Admin/Faculty
export const getAllDepartments = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};
    if (type) where.type = type;

    const departments = await Department.findAll({
      where,
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
export const getDepartment = async (req, res) => {
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
export const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);

    // Automatic HOD Promotion
    if (department.hod_id) {
      const hodUser = await User.findByPk(department.hod_id, {
        include: [{ model: Role, as: "role_data" }],
      });
      if (hodUser && hodUser.role_data.slug === "faculty") {
        const hodRole = await Role.findOne({ where: { slug: "hod" } });
        if (hodRole) {
          await hodUser.update({
            role_id: hodRole.id,
            role: "hod", // maintaining legacy column just in case
          });
          logger.info(
            `Automatically promoted user ${hodUser.id} to HOD for department ${department.id}`,
          );
        }
      }
    }

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
export const updateDepartment = async (req, res) => {
  try {
    let department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    const previousHodId = department.hod_id;
    const newHodId = req.body.hod_id;

    department = await department.update(req.body);

    // Handle HOD Role Changes
    if (previousHodId !== newHodId) {
      const facultyRole = await Role.findOne({ where: { slug: "faculty" } });
      const hodRole = await Role.findOne({ where: { slug: "hod" } });

      // 1. Demote Old HOD (if exists and hasn't been reassigned elsewhere - simplified logic: demote if role is HOD)
      // Note: Realistically we should check if they are HOD of another dept before demoting,
      // but assuming 1 HOD per dept and 1 person per role mostly.
      if (previousHodId) {
        const oldHod = await User.findByPk(previousHodId, {
          include: [{ model: Role, as: "role_data" }],
        });
        if (oldHod && oldHod.role_data.slug === "hod") {
          // Check if they are HOD of any *other* department
          const otherDepts = await Department.count({
            where: {
              hod_id: previousHodId,
              id: { [Op.ne]: department.id },
            },
          });

          if (otherDepts === 0 && facultyRole) {
            await oldHod.update({
              role_id: facultyRole.id,
              role: "faculty",
            });
            logger.info(`Automatically demoted user ${oldHod.id} to Faculty`);
          }
        }
      }

      // 2. Promote New HOD
      if (newHodId) {
        const newHod = await User.findByPk(newHodId, {
          include: [{ model: Role, as: "role_data" }],
        });
        if (newHod && newHod.role_data.slug === "faculty" && hodRole) {
          await newHod.update({
            role_id: hodRole.id,
            role: "hod",
          });
          logger.info(`Automatically promoted user ${newHod.id} to HOD`);
        }
      }
    }

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
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    const currentHodId = department.hod_id;

    // Check for sub-departments or related programs/users before deleting
    // For now, simple soft delete or hard delete based on preference
    // Let's do hard delete for now but in production we might want safety checks
    await department.destroy();

    // Demote HOD if department is deleted
    if (currentHodId) {
      const facultyRole = await Role.findOne({ where: { slug: "faculty" } });
      const oldHod = await User.findByPk(currentHodId, {
        include: [{ model: Role, as: "role_data" }],
      });

      if (oldHod && oldHod.role_data.slug === "hod") {
        // Check if they are HOD of any *other* department
        const otherDepts = await Department.count({
          where: { hod_id: currentHodId }, // department already destroyed, so simple check
        });

        if (otherDepts === 0 && facultyRole) {
          await oldHod.update({
            role_id: facultyRole.id,
            role: "faculty",
          });
          logger.info(
            `Automatically demoted user ${oldHod.id} to Faculty after department deletion`,
          );
        }
      }
    }

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
