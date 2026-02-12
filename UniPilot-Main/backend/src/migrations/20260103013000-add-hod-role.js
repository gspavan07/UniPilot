"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. Find or Create Permissions
    // We'll reuse existing 'academics:admin' or create a specific 'dept:admin'
    // For now, let's give HOD 'academics:admin' and 'academics:write' and 'student:admin'

    // Actually, let's just fetch the permission IDs we iterate.
    // But since we can't easily fetch in a migration without models, we will insert if not exists logic or simple bulk insert handling issues.

    // Simplest: Create the Role 'hod'
    const roleId = uuidv4();

    await queryInterface.bulkInsert("roles", [
      {
        id: roleId,
        name: "Head of Department",
        slug: "hod",
        description: "Head of Admin/Academic Department",
        is_system: false,
        field_config: JSON.stringify({}),
        created_at: now,
        updated_at: now,
      },
    ]);

    // 2. Map Permissions (Conceptual)
    // We need to find the IDs of 'academics:admin', 'student:admin' (if exists), etc.
    // Since we don't know the IDs, we can't easily map them here without a raw query select.

    // Workaround: Use Sequelize query to fetch
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM permissions WHERE slug IN ('academics:admin', 'academics:write', 'academics:read', 'student:write', 'student:read')`
    );

    const rolePermissions = permissions.map((p) => ({
      role_id: roleId,
      permission_id: p.id,
      created_at: now,
      updated_at: now,
    }));

    if (rolePermissions.length > 0) {
      await queryInterface.bulkInsert("role_permissions", rolePermissions);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete("roles", { slug: "hod" });
  },
};
