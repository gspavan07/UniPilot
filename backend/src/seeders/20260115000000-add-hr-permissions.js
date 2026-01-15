"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const hrPermissions = [
      {
        id: uuidv4(),
        name: "Manage Staff Profiles",
        slug: "hr:staff:manage",
        module: "HR",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Manage Payroll & Grades",
        slug: "hr:payroll:manage",
        module: "HR",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Manage Staff Attendance",
        slug: "hr:attendance:manage",
        module: "HR",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Manage Leave Requests",
        slug: "hr:leaves:manage",
        module: "HR",
        created_at: now,
        updated_at: now,
      },
    ];

    // 1. Insert Permissions
    for (const perm of hrPermissions) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE slug = '${perm.slug}';`
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert("permissions", [perm]);
        console.log(`Created permission: ${perm.slug}`);

        // 2. Assign to Roles
        const rolesToAssign = [
          "super_admin",
          "admin",
          "hr",
          "hr_admin",
          "administrator",
        ];
        for (const roleSlug of rolesToAssign) {
          const [roles] = await queryInterface.sequelize.query(
            `SELECT id FROM roles WHERE slug = '${roleSlug}';`
          );

          if (roles.length > 0) {
            const roleId = roles[0].id;
            await queryInterface.bulkInsert("role_permissions", [
              {
                role_id: roleId,
                permission_id: perm.id,
                created_at: now,
                updated_at: now,
              },
            ]);
            console.log(`Assigned '${perm.slug}' to '${roleSlug}'`);
          }
        }
      } else {
        console.log(`Permission ${perm.slug} already exists. Skipping.`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const slugs = [
      "hr:staff:manage",
      "hr:payroll:manage",
      "hr:attendance:manage",
      "hr:leaves:manage",
    ];

    for (const slug of slugs) {
      const [perms] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE slug = '${slug}';`
      );

      if (perms.length > 0) {
        const id = perms[0].id;
        await queryInterface.bulkDelete("role_permissions", {
          permission_id: id,
        });
        await queryInterface.bulkDelete("permissions", { id: id });
      }
    }
  },
};
