"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

// Helper to hash password synchronously for seeder
const hash = (pw) => bcrypt.hashSync(pw, 10);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = hash("University@123");
    const now = new Date();

    console.log("Cleanup: Truncating tables...");
    // Order matters due to foreign keys if we hard truncate
    await queryInterface.sequelize.query('TRUNCATE TABLE "users" CASCADE;');
    await queryInterface.sequelize.query(
      'TRUNCATE TABLE "role_permissions" CASCADE;'
    );
    await queryInterface.sequelize.query('TRUNCATE TABLE "roles" CASCADE;');
    await queryInterface.sequelize.query(
      'TRUNCATE TABLE "permissions" CASCADE;'
    );
    await queryInterface.sequelize.query('TRUNCATE TABLE "courses" CASCADE;');
    await queryInterface.sequelize.query('TRUNCATE TABLE "programs" CASCADE;');
    await queryInterface.sequelize.query(
      'TRUNCATE TABLE "departments" CASCADE;'
    );

    // ==========================================
    // 1. SEED PERMISSIONS (Consolidated Slugs)
    // ==========================================
    console.log("Seeding Exhaustive Permissions...");
    const permissionData = [
      // User Management
      { name: "View Users", slug: "users:view", module: "Users" },
      { name: "Create Users", slug: "users:create", module: "Users" },
      { name: "Edit Users", slug: "users:edit", module: "Users" },
      { name: "Delete Users", slug: "users:delete", module: "Users" },

      // Academics
      {
        name: "View Courses",
        slug: "academics:courses:view",
        module: "Academics",
      },
      {
        name: "Manage Courses",
        slug: "academics:courses:manage",
        module: "Academics",
      },
      {
        name: "View Attendance",
        slug: "academics:attendance:view",
        module: "Academics",
      },
      {
        name: "Mark Attendance",
        slug: "academics:attendance:mark",
        module: "Academics",
      },
      {
        name: "Manage Attendance",
        slug: "academics:attendance:manage",
        module: "Academics",
      },
      {
        name: "Manage Student Promotion",
        slug: "academics:promotion:manage",
        module: "Academics",
      },
      {
        name: "Process Graduation",
        slug: "academics:graduation:manage",
        module: "Academics",
      },
      {
        name: "Manage Examinations",
        slug: "academics:exams:manage",
        module: "Academics",
      },
      {
        name: "View Exam Results",
        slug: "academics:exams:results:view",
        module: "Academics",
      },
      {
        name: "Manage Timetables",
        slug: "academics:timetable:manage",
        module: "Academics",
      },
      {
        name: "View Timetables",
        slug: "academics:timetable:view",
        module: "Academics",
      },

      // Exams
      {
        name: "View Exam Schedule",
        slug: "exams:schedule:view",
        module: "Exams",
      },
      {
        name: "Manage Exam Schedule",
        slug: "exams:schedule:manage",
        module: "Exams",
      },
      { name: "Enter Marks", slug: "exams:marks:entry", module: "Exams" },
      {
        name: "Publish Results",
        slug: "exams:results:publish",
        module: "Exams",
      },

      // Finance
      { name: "View Fees", slug: "finance:fees:view", module: "Finance" },
      { name: "Collect Fees", slug: "finance:fees:collect", module: "Finance" },
      {
        name: "Process Payroll",
        slug: "finance:payroll:process",
        module: "Finance",
      },
      {
        name: "View Financial Reports",
        slug: "finance:reports:view",
        module: "Finance",
      },
      {
        name: "Administer Fee Structures",
        slug: "finance:fees:admin",
        module: "Finance",
      },
      {
        name: "Finance Oversight",
        slug: "finance:fees:oversight",
        module: "Finance",
      },

      // Admissions
      {
        name: "View Admissions",
        slug: "admissions:view",
        module: "Admissions",
      },
      {
        name: "Manage Admissions",
        slug: "admissions:manage",
        module: "Admissions",
      },

      // Library
      {
        name: "View Library Catalog",
        slug: "library:books:view",
        module: "Library",
      },
      { name: "Manage Books", slug: "library:books:manage", module: "Library" },
      { name: "Issue/Return Books", slug: "library:issue", module: "Library" },

      // Proctoring
      {
        name: "View Proctoring Info",
        slug: "proctoring:view",
        module: "Proctoring",
      },
      {
        name: "Manage Assignments",
        slug: "proctoring:manage",
        module: "Proctoring",
      },
      {
        name: "Mentoring Tasks",
        slug: "proctoring:mentor",
        module: "Proctoring",
      },

      // Settings
      {
        name: "Manage Roles",
        slug: "settings:roles:manage",
        module: "Settings",
      },
    ];

    // Module-based generic permissions (matching MainLayout roles)
    const extraModules = ["transport", "hostel", "id_card", "hr"];
    const extraActions = ["read", "write", "admin"];
    extraModules.forEach((mod) => {
      extraActions.forEach((act) => {
        permissionData.push({
          name: `${mod.charAt(0).toUpperCase() + mod.slice(1).replace("_", " ")} ${act.toUpperCase()}`,
          slug: `${mod}:${act}`,
          module: mod,
        });
      });
    });

    const permissions = permissionData.map((p) => ({
      id: uuidv4(),
      ...p,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert("permissions", permissions);

    // ==========================================
    // 2. SEED ROLES
    // ==========================================
    console.log("Seeding Roles...");
    const roleDefinitions = [
      {
        name: "Super Admin",
        slug: "super_admin",
        description: "Full system access",
      },
      {
        name: "Admin",
        slug: "admin",
        description: "General administrative access",
      },
      {
        name: "Head of Department",
        slug: "hod",
        description: "Department management",
      },
      { name: "Faculty", slug: "faculty", description: "Teaching staff" },
      { name: "Student", slug: "student", description: "Enrolled students" },
      {
        name: "Admission Admin",
        slug: "admission_admin",
        description: "Manages admissions",
      },
      {
        name: "Admission Staff",
        slug: "admission_staff",
        description: "Admission operational staff",
      },
      {
        name: "Finance Admin",
        slug: "finance_admin",
        description: "Manages fees and accounts",
      },
      {
        name: "Finance Staff",
        slug: "finance_staff",
        description: "Finance operational staff",
      },
      {
        name: "Exam Admin",
        slug: "exam_admin",
        description: "Manages exams and results",
      },
      {
        name: "Exam Staff",
        slug: "exam_staff",
        description: "Exam operational staff",
      },
      {
        name: "HR Admin",
        slug: "hr_admin",
        description: "Manages employee records",
      },
      {
        name: "HR Staff",
        slug: "hr_staff",
        description: "HR operational staff",
      },
      {
        name: "Lab Assistant",
        slug: "lab_assistant",
        description: "Laboratory support",
      },
      {
        name: "Operator",
        slug: "operator",
        description: "Technical operations staff",
      },
    ];

    const roles = roleDefinitions.map((r) => ({
      id: uuidv4(),
      ...r,
      is_system: true,
      field_config: JSON.stringify({}),
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert("roles", roles);

    // Map roles for easy access
    const roleMap = roles.reduce((acc, r) => {
      acc[r.slug] = r.id;
      return acc;
    }, {});

    // Role Permissions (Super Admin gets all)
    const rolePermissions = [];
    permissions.forEach((p) => {
      rolePermissions.push({
        role_id: roleMap["super_admin"],
        permission_id: p.id,
        created_at: now,
        updated_at: now,
      });
    });

    // Specific Role Permissions
    const roleSpecificPerms = {
      admission_admin: [
        "admissions:view",
        "admissions:manage",
        "users:view",
        "users:create",
        "users:edit",
      ],
      admission_staff: ["admissions:view", "users:view", "users:create"],
      finance_admin: [
        "finance:fees:view",
        "finance:fees:admin",
        "finance:fees:collect",
        "finance:reports:view",
        "users:view",
      ],
      finance_staff: [
        "finance:fees:view",
        "finance:fees:collect",
        "users:view",
      ],
      exam_admin: [
        "academics:exams:manage",
        "academics:exams:results:view",
        "exams:schedule:manage",
        "exams:marks:entry",
        "exams:results:publish",
        "users:view",
      ],
      exam_staff: [
        "academics:exams:results:view",
        "exams:schedule:view",
        "exams:marks:entry",
        "users:view",
      ],
      hr_admin: [
        "hr:admin",
        "hr:read",
        "hr:write",
        "users:view",
        "users:create",
        "users:edit",
        "users:delete",
      ],
      hr_staff: ["hr:read", "hr:write", "users:view", "users:create"],
      hod: [
        "academics:courses:view",
        "academics:timetable:view",
        "academics:attendance:view",
        "users:view",
        "users:create",
        "users:edit",
      ],
      faculty: [
        "academics:courses:view",
        "academics:timetable:view",
        "academics:attendance:mark",
        "academics:attendance:view",
        "users:view",
      ],
      student: [
        "academics:courses:view",
        "academics:timetable:view",
        "academics:attendance:view",
        "finance:fees:view",
        "library:books:view",
      ],
    };

    Object.keys(roleSpecificPerms).forEach((roleSlug) => {
      const roleId = roleMap[roleSlug];
      if (roleId) {
        roleSpecificPerms[roleSlug].forEach((permSlug) => {
          const perm = permissions.find((p) => p.slug === permSlug);
          if (perm) {
            rolePermissions.push({
              role_id: roleId,
              permission_id: perm.id,
              created_at: now,
              updated_at: now,
            });
          }
        });
      }
    });

    await queryInterface.bulkInsert("role_permissions", rolePermissions);

    // ==========================================
    // 3. SEED DEPARTMENTS
    // ==========================================
    console.log("Seeding Departments...");
    const depts = [
      {
        id: uuidv4(),
        name: "Computer Science and Engineering",
        code: "CSE",
        description: "Dept of CSE",
        office_location: "Block A, 1st Floor",
      },
      {
        id: uuidv4(),
        name: "Artificial Intelligence and Machine Learning",
        code: "AIML",
        description: "Dept of AI/ML",
        office_location: "Block A, 2nd Floor",
      },
      {
        id: uuidv4(),
        name: "Information Technology",
        code: "IT",
        description: "Dept of IT",
        office_location: "Block B, 1st Floor",
      },
    ].map((d) => ({ ...d, is_active: true, created_at: now, updated_at: now }));

    await queryInterface.bulkInsert("departments", depts);
    const deptMap = depts.reduce((acc, d) => {
      acc[d.code] = d.id;
      return acc;
    }, {});

    // ==========================================
    // 4. SEED PROGRAMS
    // ==========================================
    console.log("Seeding Programs...");
    const programs = depts.map((d) => ({
      id: uuidv4(),
      name: `B.Tech in ${d.name}`,
      code: `BTECH-${d.code}`,
      degree_type: "undergraduate",
      duration_years: 4,
      total_semesters: 8,
      department_id: d.id,
      min_percentage: 60.0,
      max_intake: 120,
      is_active: true,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert("programs", programs);
    const progMap = programs.reduce((acc, p) => {
      acc[p.code.split("-")[1]] = p.id;
      return acc;
    }, {});

    // ==========================================
    // 5. SEED COURSES (3 per sem per program)
    // ==========================================
    console.log("Seeding Courses...");
    const courses = [];
    const courseNamesCore = {
      CSE: [
        "Data Structures",
        "Operating Systems",
        "Computer Networks",
        "DBMS",
        "Java Programming",
        "Web Technologies",
        "Automata Theory",
        "Compiler Design",
      ],
      AIML: [
        "Intro to AI",
        "Machine Learning",
        "Neural Networks",
        "NLP",
        "Computer Vision",
        "Deep Learning",
        "Data Mining",
        "Robotics",
      ],
      IT: [
        "Software Engineering",
        "Network Security",
        "Cloud Computing",
        "Information Retrieval",
        "ERP Systems",
        "Big Data",
        "Mobile Computing",
        "Cyber Law",
      ],
    };

    const commonCourses = [
      "Mathematics",
      "Physics",
      "Chemistry",
      "English",
      "Environmental Science",
      "Human Values",
      "Soft Skills",
      "Managerial Economics",
    ];

    programs.forEach((prog) => {
      const branch = prog.code.split("-")[1];
      for (let sem = 1; sem <= 8; sem++) {
        // 1 Core
        courses.push({
          id: uuidv4(),
          name: `${courseNamesCore[branch][sem - 1] || branch + " Elective " + sem}`,
          code: `${branch}${sem}01`,
          credits: 4,
          course_type: "theory",
          department_id: prog.department_id,
          program_id: prog.id,
          semester: sem,
          is_active: true,
          created_at: now,
          updated_at: now,
        });

        // 1 Common
        courses.push({
          id: uuidv4(),
          name: `${commonCourses[sem - 1] || "General Studies " + sem}`,
          code: `${branch}-COM${sem}0${sem}`,
          credits: 3,
          course_type: "theory",
          department_id: prog.department_id,
          program_id: prog.id,
          semester: sem,
          is_active: true,
          created_at: now,
          updated_at: now,
        });

        // 1 Practical
        courses.push({
          id: uuidv4(),
          name: `${courseNamesCore[branch][sem - 1] || branch} Lab`,
          code: `${branch}${sem}02L`,
          credits: 2,
          course_type: "practical",
          department_id: prog.department_id,
          program_id: prog.id,
          semester: sem,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      }
    });

    await queryInterface.bulkInsert("courses", courses);

    // ==========================================
    // 6. SEED USERS (Admin, Teams, Faculty, Staff, Students)
    // ==========================================
    console.log("Seeding Users...");
    const users = [];

    // SUPER ADMIN
    users.push({
      id: uuidv4(),
      first_name: "Super",
      last_name: "Admin",
      email: "admin@university.edu",
      password_hash: passwordHash,
      role: "super_admin",
      role_id: roleMap["super_admin"],
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    // MODULE TEAMS (1 Admin, 2 Staff for each)
    const teamModules = [
      "admission",
      "finance",
      "exam",
      "hr",
      "academics",
      "id_card",
      "transport",
      "hostel",
    ];
    teamModules.forEach((mod) => {
      users.push({
        id: uuidv4(),
        first_name: `${mod.charAt(0).toUpperCase() + mod.slice(1).replace("_", " ")}`,
        last_name: "Admin",
        email: `${mod}_admin@university.edu`,
        password_hash: passwordHash,
        role: `${mod}_admin`,
        role_id: roleMap[`${mod}_admin`] || roleMap["admin"],
        is_active: true,
        created_at: now,
        updated_at: now,
      });
      for (let i = 1; i <= 2; i++) {
        users.push({
          id: uuidv4(),
          first_name: `${mod.charAt(0).toUpperCase() + mod.slice(1).replace("_", " ")}`,
          last_name: `Staff ${i}`,
          email: `${mod}_staff${i}@university.edu`,
          password_hash: passwordHash,
          role: `${mod}_staff`,
          role_id: roleMap[`${mod}_staff`] || roleMap["staff"],
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      }
    });

    // FACULTY & DEPT STAFF (5 Faculty, 2 Lab Asst, 1 Operator per Dept)
    const hodUpdates = [];
    for (const dept of depts) {
      // 1 HOD
      const hodId = uuidv4();
      users.push({
        id: hodId,
        first_name: `HOD`,
        last_name: dept.code,
        email: `hod.${dept.code.toLowerCase()}@university.edu`,
        password_hash: passwordHash,
        role: "hod",
        role_id: roleMap["hod"],
        department_id: dept.id,
        employee_id: `EMP-${dept.code}-HOD`,
        is_active: true,
        created_at: now,
        updated_at: now,
      });

      // Defer Dept HOD link until users are inserted
      hodUpdates.push({ hodId, deptId: dept.id });

      // 4 more Faculty
      for (let i = 1; i <= 4; i++) {
        users.push({
          id: uuidv4(),
          first_name: `Professor`,
          last_name: `${dept.code} ${i}`,
          email: `prof${i}.${dept.code.toLowerCase()}@university.edu`,
          password_hash: passwordHash,
          role: "faculty",
          role_id: roleMap["faculty"],
          department_id: dept.id,
          employee_id: `EMP-${dept.code}-FAC${i}`,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      }

      // 2 Lab Assistants
      for (let i = 1; i <= 2; i++) {
        users.push({
          id: uuidv4(),
          first_name: `LabAssistant`,
          last_name: `${dept.code} ${i}`,
          email: `lab${i}.${dept.code.toLowerCase()}@university.edu`,
          password_hash: passwordHash,
          role: "lab_assistant",
          role_id: roleMap["lab_assistant"],
          department_id: dept.id,
          employee_id: `EMP-${dept.code}-LAB${i}`,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      }

      // 1 Operator
      users.push({
        id: uuidv4(),
        first_name: `Operator`,
        last_name: dept.code,
        email: `op.${dept.code.toLowerCase()}@university.edu`,
        password_hash: passwordHash,
        role: "operator",
        role_id: roleMap["operator"],
        department_id: dept.id,
        employee_id: `EMP-${dept.code}-OP`,
        is_active: true,
        created_at: now,
        updated_at: now,
      });

      // STUDENTS (10 per sem, 8 semesters = 80 per dept)
      for (let sem = 1; sem <= 8; sem++) {
        for (let i = 1; i <= 10; i++) {
          const sid = `2024${dept.code}${sem}${i.toString().padStart(2, "0")}`;
          users.push({
            id: uuidv4(),
            first_name: `Student`,
            last_name: `${dept.code} S${sem} ${i}`,
            email: `s${sid.toLowerCase()}@university.edu`,
            password_hash: passwordHash,
            role: "student",
            role_id: roleMap["student"],
            department_id: dept.id,
            program_id: progMap[dept.code],
            student_id: sid,
            admission_number: `ADM-${sid}`,
            current_semester: sem,
            batch_year: 2024,
            academic_status: "active",
            gender: i % 2 === 0 ? "male" : "female",
            is_active: true,
            created_at: now,
            updated_at: now,
          });
        }
      }
    }

    // Chunk insert users to avoid massive query limits
    const chunkSize = 100;
    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      await queryInterface.bulkInsert("users", chunk);
    }

    console.log(`✓ Total users seeded: ${users.length}`);

    // Finalize HOD Assignments
    console.log("Finalizing HOD assignments...");
    for (const update of hodUpdates) {
      await queryInterface.sequelize.query(
        `UPDATE departments SET hod_id = '${update.hodId}' WHERE id = '${update.deptId}';`
      );
    }

    console.log("✓ Comprehensive Indian university data seeded successfully!");
  },

  down: async (queryInterface, Sequelize) => {
    // Dangerous, handle with care. In this specific task, truncation is what the user asked for.
  },
};
