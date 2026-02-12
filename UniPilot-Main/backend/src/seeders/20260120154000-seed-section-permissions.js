"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Define New Permission
    const sectionPermission = {
      name: "Manage Sections",
      slug: "academics:sections:manage",
      module: "Academics",
    };

    // 2. Insert Permission (Idempotent)
    let permId;
    const [existingPerm] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE slug = '${sectionPermission.slug}' LIMIT 1;`,
    );

    if (existingPerm.length > 0) {
      permId = existingPerm[0].id;
    } else {
      permId = uuidv4();
      await queryInterface.bulkInsert("permissions", [
        {
          id: permId,
          name: sectionPermission.name,
          slug: sectionPermission.slug,
          module: sectionPermission.module,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }

    // 3. Fetch Role IDs for Assignment
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles WHERE slug IN ('super_admin', 'admin', 'hod');`,
    );

    const roleMap = {};
    roles.forEach((r) => {
      roleMap[r.slug] = r.id;
    });

    const timestamp = new Date();
    const rolePermissions = [];

    const targetRoles = ["super_admin", "admin", "hod"];

    // 4. Prepare Assignments for Manage Sections
    for (const slug of targetRoles) {
      if (roleMap[slug]) {
        rolePermissions.push({
          role_id: roleMap[slug],
          permission_id: permId,
          created_at: timestamp,
          updated_at: timestamp,
        });
      }
    }

    // 5. Also ensure HOD has Manage Promotions permission
    const [promoPerm] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE slug = 'academics:promotion:manage' LIMIT 1;`,
    );

    if (promoPerm.length > 0 && roleMap["hod"]) {
      rolePermissions.push({
        role_id: roleMap["hod"],
        permission_id: promoPerm[0].id,
        created_at: timestamp,
        updated_at: timestamp,
      });
    }

    // 6. Bulk Insert Relations (Idempotent check)
    for (const rp of rolePermissions) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT 1 FROM role_permissions WHERE role_id = '${rp.role_id}' AND permission_id = '${rp.permission_id}' LIMIT 1;`,
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert("role_permissions", [rp]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Optionally remove assignments, but usually safer to keep them
  },
};
