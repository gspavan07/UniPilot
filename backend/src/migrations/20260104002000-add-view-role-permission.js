"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. Insert the 'settings:roles:view' permission
    const [permission] = await queryInterface.sequelize.query(
      `INSERT INTO permissions (id, name, slug, module, created_at, updated_at)
       VALUES (gen_random_uuid(), 'View Roles', 'settings:roles:view', 'Settings', :now, :now)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      {
        replacements: { now },
        type: queryInterface.sequelize.QueryTypes.INSERT,
      }
    );

    let permissionId;
    if (permission && permission.length > 0) {
      permissionId = permission[0].id;
    } else {
      // If it already existed, get its ID
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE slug = 'settings:roles:view' LIMIT 1`
      );
      if (existing.length > 0) {
        permissionId = existing[0].id;
      }
    }

    if (!permissionId) return;

    // 2. Grant it to 'super_admin' role
    const [superAdminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE slug = 'super_admin' LIMIT 1`
    );

    if (superAdminRole.length > 0) {
      const roleId = superAdminRole[0].id;

      // Check if link already exists
      const [exists] = await queryInterface.sequelize.query(
        `SELECT 1 FROM role_permissions WHERE role_id = :roleId AND permission_id = :permissionId`,
        { replacements: { roleId, permissionId } }
      );

      if (exists.length === 0) {
        await queryInterface.bulkInsert("role_permissions", [
          {
            role_id: roleId,
            permission_id: permissionId,
            created_at: now,
            updated_at: now,
          },
        ]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Optional: remove the permission and link
    const [permission] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE slug = 'settings:roles:view' LIMIT 1`
    );

    if (permission.length > 0) {
      const permissionId = permission[0].id;
      await queryInterface.sequelize.query(
        `DELETE FROM role_permissions WHERE permission_id = :permissionId`,
        { replacements: { permissionId } }
      );
      await queryInterface.sequelize.query(
        `DELETE FROM permissions WHERE id = :permissionId`,
        { replacements: { permissionId } }
      );
    }
  },
};
