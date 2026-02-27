import { Op } from "sequelize";
import { Role, Permission } from "../models/index.js";

// Basic operations
export const findRoleByPk = (id, options = {}) => Role.findByPk(id, options);
export const findOneRole = (options = {}) => Role.findOne(options);
export const findAllRoles = (options = {}) => Role.findAll(options);
export const findAndCountAllRoles = (options = {}) => Role.findAndCountAll(options);

// Permission operations
export const findPermissionByPk = (id, options = {}) => Permission.findByPk(id, options);
export const findAllPermissions = (options = {}) => Permission.findAll(options);

// Bulk operations
export const getRolesByIds = async (ids = [], options = {}) => {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (uniqueIds.length === 0) return [];
    return Role.findAll({ where: { id: { [Op.in]: uniqueIds } }, ...options });
};

export const getRoleMapByIds = async (ids = [], options = {}) => {
    const roles = await getRolesByIds(ids, options);
    return new Map(roles.map((role) => [role.id, role]));
};

export default {
    findRoleByPk,
    findOneRole,
    findAllRoles,
    findAndCountAllRoles,
    findPermissionByPk,
    findAllPermissions,
    getRolesByIds,
    getRoleMapByIds,
};
