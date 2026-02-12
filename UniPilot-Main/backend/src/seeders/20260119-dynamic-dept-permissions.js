const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. Define New Permissions
    const newPermissions = [
      {
        name: "Create Departments",
        slug: "departments:create",
        module: "academics", // or 'settings' or 'departments'
        created_at: now,
        updated_at: now,
      },
      {
        name: "View Administrative Departments",
        slug: "departments:view_administrative",
        module: "academics",
        created_at: now,
        updated_at: now,
      },
    ];

    // 2. Insert Permissions
    for (const perm of newPermissions) {
      // Check if exists
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE slug = '${perm.slug}';`,
      );
      if (existing.length === 0) {
        await queryInterface.bulkInsert("permissions", [
          {
            ...perm,
            id: uuidv4(),
          },
        ]);
      }
    }

    // 3. Assign to Roles
    // Get Permission IDs
    const [perms] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM permissions WHERE slug IN ('departments:create', 'departments:view_administrative');`,
    );

    // Get Role IDs
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles WHERE slug IN ('admin', 'super_admin', 'academics_admin', 'hr_admin');`,
    );

    const roleMap = {};
    roles.forEach((r) => (roleMap[r.slug] = r.id));

    const permMap = {};
    perms.forEach((p) => (permMap[p.slug] = p.id));

    const assignments = [];

    // Helper
    const add = (role, perm) => {
      if (roleMap[role] && permMap[perm]) {
        assignments.push({
          role_id: roleMap[role],
          permission_id: permMap[perm],
          created_at: now,
          updated_at: now,
        });
      }
    };

    // Rule: Admins get BOTH
    add("admin", "departments:create");
    add("admin", "departments:view_administrative");
    add("super_admin", "departments:create");
    add("super_admin", "departments:view_administrative");

    // Rule: HR Admin gets view_administrative (maybe? let's standardise with previous code)
    // Previous code: hr_admin could view administrative.
    add("hr_admin", "departments:view_administrative");

    // Rule: Academics Admin gets create, but NOT view_administrative
    add("academics_admin", "departments:create");

    // 4. Bulk Insert Assignments
    // We'll use insert ignore concept or check existence
    for (const a of assignments) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT 1 FROM role_permissions WHERE role_id = '${a.role_id}' AND permission_id = '${a.permission_id}';`,
      );
      if (exists.length === 0) {
        await queryInterface.bulkInsert("role_permissions", [a]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No-op
  },
};
