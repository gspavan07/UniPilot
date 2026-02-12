"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Get the 'users:view' permission
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE slug = 'users:view' LIMIT 1`
    );

    if (!permissions.length) {
      console.log("'users:view' permission not found. Skipping.");
      return;
    }
    const userViewPermId = permissions[0].id;

    // 2. Get all custom admin roles (ending in _admin, but excluding super_admin if it exists)
    // We want roles like 'exam_admin', 'finance_admin' etc.
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles WHERE slug LIKE '%_admin' AND slug != 'super_admin'`
    );

    if (!roles.length) return;

    // 3. Prepare inserts
    const now = new Date();
    const rolePermissions = roles.map((role) => ({
      role_id: role.id,
      permission_id: userViewPermId,
      created_at: now,
      updated_at: now,
    }));

    // 4. Insert, handling potential duplicates (though unlikely for these new roles)
    // We'll verify if they already have it first to be safe
    for (const rp of rolePermissions) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT 1 FROM role_permissions WHERE role_id = '${rp.role_id}' AND permission_id = '${rp.permission_id}'`
      );

      if (!exists.length) {
        await queryInterface.bulkInsert("role_permissions", [rp]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // We won't strictly revert this effectively because it's hard to know which ones we added vs which existed.
    // But for this dev cycle it's fine.
  },
};
