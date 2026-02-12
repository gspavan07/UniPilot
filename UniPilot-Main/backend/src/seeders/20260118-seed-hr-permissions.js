const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Define Permissions
    const permissions = [
      // Staff Management
      {
        name: "View Staff",
        slug: "hr:staff:view",
        module: "staff",
        description: "Can view staff profiles and directory",
      },
      {
        name: "Manage Staff",
        slug: "hr:staff:manage",
        module: "staff",
        description: "Can add, edit, onboard, and offboard staff",
      },

      // Payroll
      {
        name: "View Payroll",
        slug: "hr:payroll:view",
        module: "payroll",
        description: "Can view payroll history and stats",
      },
      {
        name: "Manage Payroll",
        slug: "hr:payroll:manage",
        module: "payroll",
        description: "Can generate payslips, manage salary structures",
      },
      {
        name: "Publish Payroll",
        slug: "hr:payroll:publish",
        module: "payroll",
        description: "Can publish payslips and confirm payouts",
      },

      // Leaves
      {
        name: "View Leave Requests",
        slug: "hr:leaves:view",
        module: "leaves",
        description: "Can view leave applications",
      },
      {
        name: "Manage Leaves",
        slug: "hr:leaves:manage",
        module: "leaves",
        description: "Can approve/reject leave requests",
      },

      // Attendance
      {
        name: "View Attendance",
        slug: "hr:attendance:view",
        module: "attendance",
        description: "Can view daily attendance records",
      },
      {
        name: "Manage Attendance",
        slug: "hr:attendance:manage",
        module: "attendance",
        description: "Can mark attendance and modify records",
      },

      // Onboarding
      {
        name: "Access Onboarding",
        slug: "hr:onboarding:access",
        module: "onboarding",
        description: "Can access employee onboarding wizard",
      },

      // Settings
      {
        name: "Manage Settings",
        slug: "hr:settings:manage",
        module: "settings",
        description: "Can manage institution settings (e.g. Saturday working)",
      },
    ];

    // 2. Insert Permissions (Idempotent)
    for (const perm of permissions) {
      const exists = await queryInterface.rawSelect(
        "permissions",
        {
          where: {
            [Sequelize.Op.or]: [{ slug: perm.slug }, { name: perm.name }],
          },
        },
        ["id"]
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

    // 3. Fetch Role IDs
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles WHERE slug IN ('admin', 'super_admin', 'hr', 'hr_admin');`
    );

    const roleMap = {};
    roles.forEach((r) => {
      roleMap[r.slug] = r.id;
    });

    // 4. Assign Permissions
    const [allPerms] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM permissions;`
    );

    const rolePermissions = [];
    const timestamp = new Date();

    // Helper to add if not exists
    const addRelation = (roleSlug, permSlug) => {
      const roleId = roleMap[roleSlug];
      const perm = allPerms.find((p) => p.slug === permSlug);

      if (roleId && perm) {
        rolePermissions.push({
          id: uuidv4(),
          role_id: roleId,
          permission_id: perm.id,
          created_at: timestamp,
          updated_at: timestamp,
        });
      }
    };

    // Assign ALL to Admins
    if (roleMap["admin"]) {
      allPerms.forEach((p) => addRelation("admin", p.slug));
    }
    if (roleMap["super_admin"]) {
      allPerms.forEach((p) => addRelation("super_admin", p.slug));
    }

    // Assign HR Permissions to HR Roles
    const hrRoles = ["hr", "hr_admin"];
    hrRoles.forEach((rSlug) => {
      if (roleMap[rSlug]) {
        allPerms.forEach((p) => addRelation(rSlug, p.slug));
      }
    });

    // 5. Bulk Insert Relations
    for (const rp of rolePermissions) {
      // Remove ID from insert object if it exists (it was added in prev step)
      const { id, ...insertData } = rp;

      const [existing] = await queryInterface.sequelize.query(
        `SELECT 1 FROM role_permissions WHERE role_id = '${rp.role_id}' AND permission_id = '${rp.permission_id}' LIMIT 1;`
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert("role_permissions", [insertData]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Optional: Delete permissions on rollback
  },
};
