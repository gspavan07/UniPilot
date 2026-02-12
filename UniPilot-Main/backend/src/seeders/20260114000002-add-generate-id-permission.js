"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. Add Permission
    const permissionId = uuidv4();
    const permSlug = "admissions:generate_ids";

    // Check if exists first to avoid duplicate error
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE slug = '${permSlug}';`
    );

    if (existing.length === 0) {
      await queryInterface.bulkInsert("permissions", [
        {
          id: permissionId,
          name: "Generate Permanent IDs",
          slug: permSlug,
          module: "Admissions",
          created_at: now,
          updated_at: now,
        },
      ]);
      console.log(`Created permission: ${permSlug}`);

      // 2. Assign to Roles (Super Admin, Admission Admin)
      const rolesToAssign = ["super_admin", "admission_admin"];
      for (const roleSlug of rolesToAssign) {
        const [roles] = await queryInterface.sequelize.query(
          `SELECT id FROM roles WHERE slug = '${roleSlug}';`
        );

        if (roles.length > 0) {
          const roleId = roles[0].id;
          await queryInterface.bulkInsert("role_permissions", [
            {
              role_id: roleId,
              permission_id: permissionId, // This might be wrong if we didn't insert it.
              // Better to fetch it back if we want to be 100% safe, but since we are inside the if block, permissionId is valid for the new row.
              created_at: now,
              updated_at: now,
            },
          ]);
          console.log(`Assigned '${permSlug}' to '${roleSlug}'`);
        }
      }
    } else {
      console.log(`Permission ${permSlug} already exists. Skipping.`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const permSlug = "admissions:generate_ids";

    // Get ID
    const [perms] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE slug = '${permSlug}';`
    );

    if (perms.length > 0) {
      const id = perms[0].id;
      // Delete Role Permissions
      await queryInterface.bulkDelete("role_permissions", {
        permission_id: id,
      });
      // Delete Permission
      await queryInterface.bulkDelete("permissions", { id: id });
    }
  },
};
