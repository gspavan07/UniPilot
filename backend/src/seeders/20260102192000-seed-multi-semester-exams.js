"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // === REUSED IDs FROM PREVIOUS SEEDERS ===
    const DEPT_CSE_ID = "872f3c3f-e639-440e-bf62-5852a1e37c53";
    const PROG_CSE_ID = "1922a060-d9fb-4b0b-8d38-4587f3a91bf7";
    const FACULTY_ALICE_ID = "e4382119-ea37-41ed-9cd6-4e9cf9dc7866";
    const STUDENT_JOHN_ID = "f6d21b45-75dd-4846-9101-107f5ffd165b";

    console.log("Seeding Multi-Semester Courses and Exam Data...");

    // ========================================
    // 1. CREATE COURSES FOR DIFFERENT SEMESTERS
    // ========================================
    const courses = [
      // Semester 1 Courses
      {
        id: uuidv4(),
        name: "Programming Fundamentals",
        code: "CSE1001",
        credits: 4,
        course_type: "theory_practical",
        semester: 1,
        department_id: DEPT_CSE_ID,
        program_id: PROG_CSE_ID,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Mathematics I",
        code: "MATH1001",
        credits: 4,
        course_type: "theory",
        semester: 1,
        department_id: DEPT_CSE_ID,
        program_id: PROG_CSE_ID,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Semester 2 Courses
      {
        id: uuidv4(),
        name: "Object Oriented Programming",
        code: "CSE2001",
        credits: 4,
        course_type: "theory_practical",
        semester: 2,
        department_id: DEPT_CSE_ID,
        program_id: PROG_CSE_ID,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Discrete Mathematics",
        code: "MATH2001",
        credits: 3,
        course_type: "theory",
        semester: 2,
        department_id: DEPT_CSE_ID,
        program_id: PROG_CSE_ID,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Semester 4 Courses (in addition to existing)
      {
        id: uuidv4(),
        name: "Database Management Systems",
        code: "CSE4001",
        credits: 4,
        course_type: "theory_practical",
        semester: 4,
        department_id: DEPT_CSE_ID,
        program_id: PROG_CSE_ID,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("courses", courses);

    // Store course IDs for exam creation
    const sem1Course1Id = courses[0].id;
    const sem1Course2Id = courses[1].id;
    const sem2Course1Id = courses[2].id;
    const sem2Course2Id = courses[3].id;
    const sem4Course1Id = courses[4].id;

    // ========================================
    // 2. CREATE EXAM CYCLES FOR DIFFERENT SEMESTERS
    // ========================================

    // Semester 1 Exam Cycle (Past)
    const sem1CycleId = uuidv4();
    await queryInterface.bulkInsert("exam_cycles", [
      {
        id: sem1CycleId,
        name: "Semester 1 Final Exam 2025",
        start_date: new Date("2025-05-01"),
        end_date: new Date("2025-05-15"),
        status: "results_published",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Semester 2 Exam Cycle (Past)
    const sem2CycleId = uuidv4();
    await queryInterface.bulkInsert("exam_cycles", [
      {
        id: sem2CycleId,
        name: "Semester 2 Final Exam 2025",
        start_date: new Date("2025-11-01"),
        end_date: new Date("2025-11-15"),
        status: "results_published",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Semester 4 Exam Cycle (Recent)
    const sem4CycleId = uuidv4();
    await queryInterface.bulkInsert("exam_cycles", [
      {
        id: sem4CycleId,
        name: "Semester 4 Mid-Term 2026",
        start_date: new Date("2026-01-10"),
        end_date: new Date("2026-01-20"),
        status: "results_published",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ========================================
    // 3. CREATE EXAM SCHEDULES
    // ========================================
    const examSchedules = [
      // Semester 1 Schedules
      {
        id: uuidv4(),
        exam_cycle_id: sem1CycleId,
        course_id: sem1Course1Id,
        exam_date: new Date("2025-05-03"),
        start_time: "09:00:00",
        end_time: "12:00:00",
        max_marks: 100,
        passing_marks: 40,
        venue: "Hall-A",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        exam_cycle_id: sem1CycleId,
        course_id: sem1Course2Id,
        exam_date: new Date("2025-05-05"),
        start_time: "09:00:00",
        end_time: "12:00:00",
        max_marks: 100,
        passing_marks: 40,
        venue: "Hall-B",
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Semester 2 Schedules
      {
        id: uuidv4(),
        exam_cycle_id: sem2CycleId,
        course_id: sem2Course1Id,
        exam_date: new Date("2025-11-03"),
        start_time: "09:00:00",
        end_time: "12:00:00",
        max_marks: 100,
        passing_marks: 40,
        venue: "Hall-A",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        exam_cycle_id: sem2CycleId,
        course_id: sem2Course2Id,
        exam_date: new Date("2025-11-05"),
        start_time: "09:00:00",
        end_time: "12:00:00",
        max_marks: 100,
        passing_marks: 40,
        venue: "Hall-B",
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Semester 4 Schedule
      {
        id: uuidv4(),
        exam_cycle_id: sem4CycleId,
        course_id: sem4Course1Id,
        exam_date: new Date("2026-01-12"),
        start_time: "14:00:00",
        end_time: "17:00:00",
        max_marks: 50,
        passing_marks: 20,
        venue: "Lab-1",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("exam_schedules", examSchedules);

    // ========================================
    // 4. CREATE EXAM MARKS FOR JOHN
    // ========================================
    const examMarks = [
      // Semester 1 Results
      {
        id: uuidv4(),
        exam_schedule_id: examSchedules[0].id,
        student_id: STUDENT_JOHN_ID,
        marks_obtained: 85.0,
        grade: "A",
        status: "present",
        remarks: "Excellent performance",
        entered_by: FACULTY_ALICE_ID,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        exam_schedule_id: examSchedules[1].id,
        student_id: STUDENT_JOHN_ID,
        marks_obtained: 78.0,
        grade: "B",
        status: "present",
        remarks: "Good work",
        entered_by: FACULTY_ALICE_ID,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Semester 2 Results
      {
        id: uuidv4(),
        exam_schedule_id: examSchedules[2].id,
        student_id: STUDENT_JOHN_ID,
        marks_obtained: 92.0,
        grade: "A+",
        status: "present",
        remarks: "Outstanding",
        entered_by: FACULTY_ALICE_ID,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        exam_schedule_id: examSchedules[3].id,
        student_id: STUDENT_JOHN_ID,
        marks_obtained: 88.0,
        grade: "A",
        status: "present",
        remarks: "Very good",
        entered_by: FACULTY_ALICE_ID,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Semester 4 Results
      {
        id: uuidv4(),
        exam_schedule_id: examSchedules[4].id,
        student_id: STUDENT_JOHN_ID,
        marks_obtained: 45.0,
        grade: "A+",
        status: "present",
        remarks: "Excellent mid-term",
        entered_by: FACULTY_ALICE_ID,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("exam_marks", examMarks);

    console.log("✅ Multi-semester exam data seeded successfully!");
  },

  down: async (queryInterface, Sequelize) => {
    // Clean up in reverse order
    await queryInterface.bulkDelete("exam_marks", null, {});
    await queryInterface.bulkDelete("exam_schedules", null, {});
    await queryInterface.bulkDelete(
      "exam_cycles",
      { name: { [Sequelize.Op.like]: "%2025%" } },
      {}
    );
    await queryInterface.bulkDelete(
      "exam_cycles",
      { name: { [Sequelize.Op.like]: "%Semester%" } },
      {}
    );
    await queryInterface.bulkDelete(
      "courses",
      { code: { [Sequelize.Op.like]: "%1001%" } },
      {}
    );
    await queryInterface.bulkDelete(
      "courses",
      { code: { [Sequelize.Op.like]: "%2001%" } },
      {}
    );
    await queryInterface.bulkDelete("courses", { code: "CSE4001" }, {});
  },
};
