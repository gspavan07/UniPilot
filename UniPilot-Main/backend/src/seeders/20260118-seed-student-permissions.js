const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Define Permissions
    const permissions = [
      {
        name: "View Students",
        slug: "students:view",
        module: "students",
        description: "Can view student profiles and directory",
      },
      {
        name: "Manage Students",
        slug: "students:manage",
        module: "students",
        description: "Can add, edit, and manage student records",
      },
    ];

    // 2. Insert Permissions (Idempotent)
    for (const perm of permissions) {
      const exists = await queryInterface.rawSelect(
        "permissions",
        {
          where: {
            slug: perm.slug,
          },
        },
        ["id"],
      );

      if (!exists) {
        await queryInterface.bulkInsert("permissions", [
          {
            id: uuidv4(),
            name: perm.name,
            slug: perm.slug,
            module: perm.module,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
      }
    }

    // 3. Fetch Role IDs for assignment
    // Assign to: admin, super_admin, admission_admin, admission_staff
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles WHERE slug IN ('admin', 'super_admin', 'admission_admin', 'admission_staff');`,
    );

    const roleMap = {};
    roles.forEach((r) => {
      roleMap[r.slug] = r.id;
    });

    const [allPerms] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM permissions WHERE slug IN ('students:view', 'students:manage');`,
    );

    const rolePermissions = [];
    const timestamp = new Date();

    const addRelation = (roleSlug, permSlug) => {
      const roleId = roleMap[roleSlug];
      const perm = allPerms.find((p) => p.slug === permSlug);

      if (roleId && perm) {
        rolePermissions.push({
          role_id: roleId,
          permission_id: perm.id,
          created_at: timestamp,
          updated_at: timestamp,
        });
      }
    };

    // Assign
    const viewRoles = [
      "admin",
      "super_admin",
      "admission_admin",
      "admission_staff",
    ];
    const manageRoles = [
      "admin",
      "super_admin",
      "admission_admin",
      "admission_staff",
    ];

    viewRoles.forEach((r) => addRelation(r, "students:view"));
    manageRoles.forEach((r) => addRelation(r, "students:manage"));

    // 4. Bulk Insert Relations
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
    // Optional: Delete permissions
  },
};
