import logger from "../../../utils/logger.js";
import { Permission, Role } from "../models/index.js";


/**
 * Role Controller
 * Handles CRUD for Dynamic RBAC
 */

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: "permissions",
          attributes: ["id", "name", "slug", "module"],
          through: { attributes: [] },
        },
      ],
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    logger.error("Error in getAllRoles:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get all permissions
// @route   GET /api/roles/permissions
// @access  Private/Admin
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [
        ["module", "ASC"],
        ["name", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    logger.error("Error in getAllPermissions:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private/Admin
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions, field_config } = req.body;

    // Create slug from name
    const slug = name.toLowerCase().replace(/ /g, "-");

    const role = await Role.create({
      name,
      slug,
      description,
      field_config: field_config || {},
      is_system: false,
    });

    if (permissions && permissions.length > 0) {
      await role.setPermissions(permissions);
    }

    const fullRole = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: "permissions" }],
    });

    res.status(201).json({
      success: true,
      data: fullRole,
    });
  } catch (error) {
    logger.error("Error in createRole:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
export const updateRole = async (req, res) => {
  try {
    const { name, description, permissions, field_config } = req.body;
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        error: "Role not found",
      });
    }

    // Don't allow changing system role names/slugs easily
    const updateData = { description, field_config };
    if (!role.is_system && name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/ /g, "-");
    }

    await role.update(updateData);

    if (permissions) {
      await role.setPermissions(permissions);
    }

    const updatedRole = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: "permissions" }],
    });

    res.status(200).json({
      success: true,
      data: updatedRole,
    });
  } catch (error) {
    logger.error("Error in updateRole:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
