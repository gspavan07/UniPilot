"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the newly created permissions
    const permissions = await queryInterface.sequelize.query(
      `SELECT id, slug FROM permissions WHERE slug IN (
        'exams:reverification:view',
        'exams:reverification:manage', 
        'exams:scripts:view',
        'exams:scripts:manage'
      )`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    // Get admin and super_admin roles
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('admin', 'super_admin')`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    console.log(
      `Found ${permissions.length} permissions and ${roles.length} roles`,
    );

    if (permissions.length === 0 || roles.length === 0) {
      console.log("Permissions or roles not found. Skipping assignment.");
      return;
    }

    // Create role_permissions entries for each role-permission combination
    const rolePermissions = [];
    for (const role of roles) {
      for (const permission of permissions) {
        rolePermissions.push({
          id: require("crypto").randomUUID(),
          role_id: role.id,
          permission_id: permission.id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("role_permissions", rolePermissions, {});
    console.log(
      `✅ Assigned ${permissions.length} reverification permissions to ${roles.length} roles`,
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Get permission IDs to remove
    const permissions = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE slug IN (
        'exams:reverification:view',
        'exams:reverification:manage',
        'exams:scripts:view',
        'exams:scripts:manage'
      )`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (permissions.length > 0) {
      const permissionIds = permissions.map((p) => p.id);
      await queryInterface.bulkDelete("role_permissions", {
        permission_id: permissionIds,
      });
    }
  },
};
