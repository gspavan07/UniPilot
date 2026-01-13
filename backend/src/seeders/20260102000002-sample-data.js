"use strict";

const { hashPassword } = require("../utils/bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const defaultPassword = await hashPassword("University@123");

    // 1. Create Departments
    const departments = [
      {
        id: "872f3c3f-e639-440e-bf62-5852a1e37c53",
        name: "Computer Science & Engineering",
        code: "CSE",
        description: "Department of Computer Science and Engineering",
        email: "cse@university.edu",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "a0fe6afd-f905-491a-ae6a-42c1b46a3a0c",
        name: "Electrical & Electronics Engineering",
        code: "EEE",
        description: "Department of Electrical and Electronics Engineering",
        email: "eee@university.edu",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "ef2a302a-50af-46b1-a90f-e2f253360024",
        name: "Mechanical Engineering",
        code: "MECH",
        description: "Department of Mechanical Engineering",
        email: "mech@university.edu",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("departments", departments);

    // 2. Create Faculty
    const faculty = [
      {
        id: "e4382119-ea37-41ed-9cd6-4e9cf9dc7866",
        first_name: "Alice",
        last_name: "Smith",
        email: "alice@university.edu",
        password_hash: defaultPassword,
        role: "faculty",
        gender: "female",
        employee_id: "EMP001",
        department_id: "872f3c3f-e639-440e-bf62-5852a1e37c53",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "45215478-115e-4b86-8353-6d10f5bdac00",
        first_name: "Bob",
        last_name: "Johnson",
        email: "bob@university.edu",
        password_hash: defaultPassword,
        role: "faculty",
        gender: "male",
        employee_id: "EMP002",
        department_id: "a0fe6afd-f905-491a-ae6a-42c1b46a3a0c",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "697da015-510f-43cb-9118-e8dfd971df2b",
        first_name: "Charlie",
        last_name: "Brown",
        email: "charlie@university.edu",
        password_hash: defaultPassword,
        role: "faculty",
        gender: "male",
        employee_id: "EMP003",
        department_id: "ef2a302a-50af-46b1-a90f-e2f253360024",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("users", faculty);

    // 3. Update Departments with HODs
    await queryInterface.bulkUpdate(
      "departments",
      { hod_id: "e4382119-ea37-41ed-9cd6-4e9cf9dc7866" },
      { id: "872f3c3f-e639-440e-bf62-5852a1e37c53" }
    );
    await queryInterface.bulkUpdate(
      "departments",
      { hod_id: "45215478-115e-4b86-8353-6d10f5bdac00" },
      { id: "a0fe6afd-f905-491a-ae6a-42c1b46a3a0c" }
    );
    await queryInterface.bulkUpdate(
      "departments",
      { hod_id: "697da015-510f-43cb-9118-e8dfd971df2b" },
      { id: "ef2a302a-50af-46b1-a90f-e2f253360024" }
    );

    // 4. Create Programs
    const programs = [
      {
        id: "1922a060-d9fb-4b0b-8d38-4587f3a91bf7",
        name: "B.Tech Computer Science",
        code: "BT-CSE",
        degree_type: "undergraduate",
        duration_years: 4,
        total_semesters: 8,
        department_id: "872f3c3f-e639-440e-bf62-5852a1e37c53",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "88f28102-17ad-4437-92e7-5b50c3420f48",
        name: "M.Tech Data Science",
        code: "MT-DS",
        degree_type: "postgraduate",
        duration_years: 2,
        total_semesters: 4,
        department_id: "872f3c3f-e639-440e-bf62-5852a1e37c53",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "53bd60d5-03d1-4a0f-b1b4-de138c5e4329",
        name: "B.Tech Electrical Engineering",
        code: "BT-EEE",
        degree_type: "undergraduate",
        duration_years: 4,
        total_semesters: 8,
        department_id: "a0fe6afd-f905-491a-ae6a-42c1b46a3a0c",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "8301ff40-aa34-4784-998b-7e98633ecbf3",
        name: "B.Tech Mechanical Engineering",
        code: "BT-ME",
        degree_type: "undergraduate",
        duration_years: 4,
        total_semesters: 8,
        department_id: "ef2a302a-50af-46b1-a90f-e2f253360024",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("programs", programs);

    // 5. Create Courses
    const courses = [
      {
        id: "399c77ad-4871-45d0-a700-9e454c75afff",
        name: "Data Structures",
        code: "CSE101",
        credits: 4,
        course_type: "theory_practical",
        semester: 3,
        department_id: "872f3c3f-e639-440e-bf62-5852a1e37c53",
        program_id: "1922a060-d9fb-4b0b-8d38-4587f3a91bf7",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "85230d9f-ed8e-42d4-aa26-bf0f58b8a8a1",
        name: "Design and Analysis of Algorithms",
        code: "CSE201",
        credits: 4,
        course_type: "theory",
        semester: 4,
        department_id: "872f3c3f-e639-440e-bf62-5852a1e37c53",
        program_id: "1922a060-d9fb-4b0b-8d38-4587f3a91bf7",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "50f8d1bd-9eea-4e83-a2fb-42b5d6ee1520",
        name: "Circuit Theory",
        code: "EEE101",
        credits: 3,
        course_type: "theory",
        semester: 3,
        department_id: "a0fe6afd-f905-491a-ae6a-42c1b46a3a0c",
        program_id: "53bd60d5-03d1-4a0f-b1b4-de138c5e4329",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "99c38e4d-ff81-4385-b6a8-9491eec32008",
        name: "Thermodynamics",
        code: "ME101",
        credits: 3,
        course_type: "theory",
        semester: 3,
        department_id: "ef2a302a-50af-46b1-a90f-e2f253360024",
        program_id: "8301ff40-aa34-4784-998b-7e98633ecbf3",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("courses", courses);

    // 6. Create Students
    const students = [
      {
        id: "f6d21b45-75dd-4846-9101-107f5ffd165b",
        first_name: "John",
        last_name: "Doe",
        email: "john@student.edu",
        password_hash: defaultPassword,
        role: "student",
        gender: "male",
        student_id: "STU001",
        department_id: "872f3c3f-e639-440e-bf62-5852a1e37c53",
        program_id: "1922a060-d9fb-4b0b-8d38-4587f3a91bf7",
        current_semester: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "0feed5f9-337f-451d-97f1-ec95cda0eb84",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@student.edu",
        password_hash: defaultPassword,
        role: "student",
        gender: "female",
        student_id: "STU002",
        department_id: "872f3c3f-e639-440e-bf62-5852a1e37c53",
        program_id: "1922a060-d9fb-4b0b-8d38-4587f3a91bf7",
        current_semester: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "8da9cb92-006b-4180-bfec-a097b65df91e",
        first_name: "Wilson",
        last_name: "K",
        email: "wilson@student.edu",
        password_hash: defaultPassword,
        role: "student",
        gender: "male",
        student_id: "STU003",
        department_id: "872f3c3f-e639-440e-bf62-5852a1e37c53",
        program_id: "88f28102-17ad-4437-92e7-5b50c3420f48",
        current_semester: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "cd1d574e-09b6-4daf-bc53-02f9e91380ea",
        first_name: "Emily",
        last_name: "Davis",
        email: "emily@student.edu",
        password_hash: defaultPassword,
        role: "student",
        gender: "female",
        student_id: "STU004",
        department_id: "a0fe6afd-f905-491a-ae6a-42c1b46a3a0c",
        program_id: "53bd60d5-03d1-4a0f-b1b4-de138c5e4329",
        current_semester: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "aa525a96-5ce2-4444-8574-cdae9fe837d3",
        first_name: "Michael",
        last_name: "Wilson",
        email: "michael@student.edu",
        password_hash: defaultPassword,
        role: "student",
        gender: "male",
        student_id: "STU005",
        department_id: "ef2a302a-50af-46b1-a90f-e2f253360024",
        program_id: "8301ff40-aa34-4784-998b-7e98633ecbf3",
        current_semester: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("users", students);

    console.log("✓ Sample data seeded successfully:");
    console.log("  - 3 Departments");
    console.log("  - 3 Faculty members");
    console.log("  - 4 Programs");
    console.log("  - 4 Courses");
    console.log("  - 5 Students");
  },

  down: async (queryInterface, Sequelize) => {
    // Delete in reverse order of dependencies
    await queryInterface.bulkDelete("users", {
      id: [
        "f6d21b45-75dd-4846-9101-107f5ffd165b",
        "0feed5f9-337f-451d-97f1-ec95cda0eb84",
        "8da9cb92-006b-4180-bfec-a097b65df91e",
        "cd1d574e-09b6-4daf-bc53-02f9e91380ea",
        "aa525a96-5ce2-4444-8574-cdae9fe837d3",
        "e4382119-ea37-41ed-9cd6-4e9cf9dc7866",
        "45215478-115e-4b86-8353-6d10f5bdac00",
        "697da015-510f-43cb-9118-e8dfd971df2b",
      ],
    });
    await queryInterface.bulkDelete("courses", {
      id: [
        "399c77ad-4871-45d0-a700-9e454c75afff",
        "85230d9f-ed8e-42d4-aa26-bf0f58b8a8a1",
        "50f8d1bd-9eea-4e83-a2fb-42b5d6ee1520",
        "99c38e4d-ff81-4385-b6a8-9491eec32008",
      ],
    });
    await queryInterface.bulkDelete("programs", {
      id: [
        "1922a060-d9fb-4b0b-8d38-4587f3a91bf7",
        "88f28102-17ad-4437-92e7-5b50c3420f48",
        "53bd60d5-03d1-4a0f-b1b4-de138c5e4329",
        "8301ff40-aa34-4784-998b-7e98633ecbf3",
      ],
    });
    await queryInterface.bulkDelete("departments", {
      id: [
        "872f3c3f-e639-440e-bf62-5852a1e37c53",
        "a0fe6afd-f905-491a-ae6a-42c1b46a3a0c",
        "ef2a302a-50af-46b1-a90f-e2f253360024",
      ],
    });
  },
};
