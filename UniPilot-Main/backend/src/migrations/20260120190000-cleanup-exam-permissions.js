"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Get role IDs
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, slug FROM roles WHERE slug IN ('admin', 'super_admin', 'faculty', 'hod', 'exam_admin', 'exam_staff');",
    );
    const roleMap = {};
    roles.forEach((r) => (roleMap[r.slug] = r.id));

    // 2. Get permission IDs
    const [permissions] = await queryInterface.sequelize.query(
      "SELECT id, slug FROM permissions WHERE slug LIKE '%exam%';",
    );
    const permMap = {};
    permissions.forEach((p) => (permMap[p.slug] = p.id));

    const timestamp = new Date();

    // Permissions to Revoke from Faculty/HOD
    const revokeSlugs = [
      "exams:manage",
      "exams:results:publish",
      "academics:exams:manage",
      "exams:schedule:manage",
    ];

    // 3. Cleanup existing assignments for faculty/hod that are too broad
    for (const roleSlug of ["faculty", "hod"]) {
      const roleId = roleMap[roleSlug];
      if (roleId) {
        for (const permSlug of revokeSlugs) {
          const permId = permMap[permSlug];
          if (permId) {
            await queryInterface.sequelize.query(
              `DELETE FROM role_permissions WHERE role_id = '${roleId}' AND permission_id = '${permId}';`,
            );
          }
        }
      }
    }

    // 4. Ensure correct assignments
    const assignments = [
      // Faculty/HOD
      { role: "faculty", perm: "exams:results:entry" },
      { role: "faculty", perm: "exams:view" },
      { role: "hod", perm: "exams:results:entry" },
      { role: "hod", perm: "exams:view" },

      // Admin/Exam Admin
      { role: "admin", perm: "exams:manage" },
      { role: "admin", perm: "exams:results:publish" },
      { role: "admin", perm: "exams:results:entry" },
      { role: "exam_admin", perm: "exams:manage" },
      { role: "exam_admin", perm: "exams:results:publish" },
      { role: "exam_admin", perm: "exams:results:entry" },
    ];

    for (const item of assignments) {
      const roleId = roleMap[item.role];
      const permId = permMap[item.perm];
      if (roleId && permId) {
        // Use insert ignore or check existence
        const [exists] = await queryInterface.sequelize.query(
          `SELECT 1 FROM role_permissions WHERE role_id = '${roleId}' AND permission_id = '${permId}' LIMIT 1;`,
        );
        if (exists.length === 0) {
          await queryInterface.bulkInsert("role_permissions", [
            {
              role_id: roleId,
              permission_id: permId,
              created_at: timestamp,
              updated_at: timestamp,
            },
          ]);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No-op for safety
  },
};
