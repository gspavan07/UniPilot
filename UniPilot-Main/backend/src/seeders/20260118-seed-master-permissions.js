const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Define ALL Permissions
    const permissions = [
      // --- Dashboard ---
      { name: "View Dashboard", slug: "dashboard:view", module: "dashboard" },

      // --- HR Module ---
      { name: "View Staff", slug: "hr:staff:view", module: "staff" },
      { name: "Manage Staff", slug: "hr:staff:manage", module: "staff" },
      { name: "View Payroll", slug: "hr:payroll:view", module: "payroll" },
      { name: "Manage Payroll", slug: "hr:payroll:manage", module: "payroll" },
      {
        name: "Publish Payroll",
        slug: "hr:payroll:publish",
        module: "payroll",
      },
      { name: "View Leaves", slug: "hr:leaves:view", module: "leaves" },
      { name: "Manage Leaves", slug: "hr:leaves:manage", module: "leaves" },
      {
        name: "View Attendance",
        slug: "hr:attendance:view",
        module: "attendance",
      },
      {
        name: "Manage Attendance",
        slug: "hr:attendance:manage",
        module: "attendance",
      },
      {
        name: "Access Onboarding",
        slug: "hr:onboarding:access",
        module: "onboarding",
      },
      {
        name: "Manage HR Settings",
        slug: "hr:settings:manage",
        module: "settings",
      },

      // --- Admissions ---
      {
        name: "View Admissions",
        slug: "admissions:view",
        module: "admissions",
      },
      {
        name: "Manage Admissions",
        slug: "admissions:manage",
        module: "admissions",
      },
      {
        name: "Configure Admissions",
        slug: "admissions:config",
        module: "admissions",
      },

      // --- Academics ---
      {
        name: "View Courses",
        slug: "academics:courses:view",
        module: "academics",
      },
      {
        name: "Manage Courses",
        slug: "academics:courses:manage",
        module: "academics",
      }, // Includes Departments/Programs
      {
        name: "View Timetable",
        slug: "academics:timetable:view",
        module: "academics",
      },
      {
        name: "Manage Timetable",
        slug: "academics:timetable:manage",
        module: "academics",
      },
      {
        name: "View Student Attendance",
        slug: "academics:attendance:view",
        module: "academics",
      },
      {
        name: "Manage Student Attendance",
        slug: "academics:attendance:manage",
        module: "academics",
      },
      {
        name: "View Assignments",
        slug: "academics:assignments:view",
        module: "academics",
      },
      {
        name: "Manage Assignments",
        slug: "academics:assignments:manage",
        module: "academics",
      },
      {
        name: "Manage Promotions",
        slug: "academics:promotion:manage",
        module: "academics",
      },

      // --- Exams ---
      { name: "View Exams", slug: "exams:view", module: "exams" },
      { name: "Manage Exams", slug: "exams:manage", module: "exams" },
      { name: "View Results", slug: "exams:results:view", module: "exams" },
      { name: "Enter Results", slug: "exams:results:entry", module: "exams" },

      // --- Finance ---
      { name: "Manage Fees", slug: "finance:fees:manage", module: "finance" },
      { name: "Admin Fees", slug: "finance:fees:admin", module: "finance" },
      {
        name: "Finance Oversight",
        slug: "finance:fees:oversight",
        module: "finance",
      },

      // --- Library ---
      { name: "View Books", slug: "library:books:view", module: "library" },
      { name: "Manage Books", slug: "library:books:manage", module: "library" },
      {
        name: "Manage Issues",
        slug: "library:issues:manage",
        module: "library",
      },

      // --- Users ---
      { name: "View Users", slug: "users:view", module: "users" },
      { name: "Manage Users", slug: "users:manage", module: "users" },

      // --- Proctoring ---
      {
        name: "View Proctoring",
        slug: "proctoring:view",
        module: "proctoring",
      },
      {
        name: "Manage Proctoring",
        slug: "proctoring:manage",
        module: "proctoring",
      },

      // --- System Settings ---
      { name: "View Settings", slug: "settings:view", module: "settings" },
      { name: "Manage Settings", slug: "settings:manage", module: "settings" },
      {
        name: "Manage Roles",
        slug: "settings:roles:manage",
        module: "settings",
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

    // 3. Fetch Role IDs
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles;`,
    );

    const roleMap = {};
    roles.forEach((r) => {
      roleMap[r.slug] = r.id;
    });

    // 4. Assign Permissions Logic
    const [allPerms] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM permissions;`,
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

    // --- ASSIGNMENT RULES ---

    // SUPER ADMIN & ADMIN: Get EVERYTHING
    if (roleMap["super_admin"])
      allPerms.forEach((p) => addRelation("super_admin", p.slug));
    if (roleMap["admin"]) allPerms.forEach((p) => addRelation("admin", p.slug));

    // HR: Get all HR + Basic Dashboard
    const hrRoles = ["hr", "hr_admin"];
    hrRoles.forEach((role) => {
      if (roleMap[role]) {
        addRelation(role, "dashboard:view");
        permissions
          .filter((p) => p.slug.startsWith("hr:"))
          .forEach((p) => addRelation(role, p.slug));
        addRelation(role, "users:view"); // HR usually needs to view users
      }
    });

    // FACULTY / STAFF: Get Academic Views + specific manages + basic HR view (own)
    const facultyRoles = ["faculty", "staff", "hod"];
    facultyRoles.forEach((role) => {
      if (roleMap[role]) {
        addRelation(role, "dashboard:view");
        // Academics
        addRelation(role, "academics:courses:view");
        addRelation(role, "academics:timetable:view");
        addRelation(role, "academics:attendance:manage"); // Mark attendance
        addRelation(role, "academics:assignments:manage");
        addRelation(role, "exams:results:entry");
        // HR (Self) - Using granular permissions for "View Own" is tricky if logic is shared
        // securely, usually "view" implies "view all".
        // For now, let's give them basic view permissions that might be restricted by "own" logic in controllers if applicable,
        // OR we assume separate logic for "own data" which is often distinct from "permission to view module".
        // HOWEVER, specifically for "hr:leaves:view" it often means viewing ALL requests.
        // Let's be conservative: Faculty usually DON'T view all HR data.
        // We will assign them Academics primarily.
        addRelation(role, "library:books:view");
      }
    });

    // STUDENT: Get Views
    if (roleMap["student"]) {
      addRelation("student", "dashboard:view");
      addRelation("student", "academics:courses:view");
      addRelation("student", "academics:timetable:view");
      addRelation("student", "academics:attendance:view"); // Own attendance usually
      addRelation("student", "exams:results:view");
      addRelation("student", "library:books:view");
    }

    // 5. Bulk Insert Relations (Idempotent)
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
    // No-op for safety
  },
};
