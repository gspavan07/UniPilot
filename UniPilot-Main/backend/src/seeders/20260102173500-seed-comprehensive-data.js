"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // === REUSED IDs FROM PREVIOUS SEEDER ===
    const DEPT_CSE_ID = "872f3c3f-e639-440e-bf62-5852a1e37c53";
    const PROG_CSE_ID = "1922a060-d9fb-4b0b-8d38-4587f3a91bf7";
    const FACULTY_ALICE_ID = "e4382119-ea37-41ed-9cd6-4e9cf9dc7866";
    const STUDENT_JOHN_ID = "f6d21b45-75dd-4846-9101-107f5ffd165b"; // Sem 3
    const STUDENT_JANE_ID = "0feed5f9-337f-451d-97f1-ec95cda0eb84"; // Sem 3
    const COURSE_DS_ID = "399c77ad-4871-45d0-a700-9e454c75afff";

    // ==========================================================
    // 1. FEE MANAGEMENT
    // ==========================================================
    console.log("Seeding Fees...");

    // Fee Categories
    const catTuition = uuidv4();
    await queryInterface.bulkInsert("fee_categories", [
      {
        id: catTuition,
        name: "Tuition Fee",
        description: "Semester Tuition",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Fee Structure (General rule for CSE Sem 3)
    const structCseSem3 = uuidv4();
    await queryInterface.bulkInsert("fee_structures", [
      {
        id: structCseSem3,
        category_id: catTuition,
        program_id: PROG_CSE_ID,
        semester: 3,
        amount: 50000.0,
        due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Fee Payments (John paid partial)
    await queryInterface.bulkInsert("fee_payments", [
      {
        id: uuidv4(),
        student_id: STUDENT_JOHN_ID,
        fee_structure_id: structCseSem3,
        amount_paid: 20000.0,
        payment_date: new Date(),
        payment_method: "online",
        transaction_id: "TXN_" + uuidv4().substring(0, 8),
        status: "completed",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ==========================================================
    // 2. TIMETABLE
    // ==========================================================
    console.log("Seeding Timetable...");
    const timetableId = uuidv4();

    await queryInterface.bulkInsert("timetables", [
      {
        id: timetableId,
        program_id: PROG_CSE_ID,
        semester: 3,
        section: "A",
        academic_year: "2025-2026",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    await queryInterface.bulkInsert("timetable_slots", [
      {
        id: uuidv4(),
        timetable_id: timetableId,
        day_of_week: today,
        start_time: "09:00:00",
        end_time: "10:30:00",
        course_id: COURSE_DS_ID,
        faculty_id: FACULTY_ALICE_ID,
        room_number: "LH-101",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        timetable_id: timetableId,
        day_of_week: today,
        start_time: "11:00:00",
        end_time: "12:30:00",
        course_id: COURSE_DS_ID,
        faculty_id: FACULTY_ALICE_ID,
        room_number: "LAB-2",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ==========================================================
    // 3. ATTENDANCE
    // ==========================================================
    console.log("Seeding Attendance...");

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    await queryInterface.bulkInsert("attendance", [
      {
        id: uuidv4(),
        student_id: STUDENT_JOHN_ID,
        course_id: COURSE_DS_ID,
        date: dateStr,
        status: "present",
        marked_by: FACULTY_ALICE_ID,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        student_id: STUDENT_JANE_ID,
        course_id: COURSE_DS_ID,
        date: dateStr,
        status: "absent",
        remarks: "Medical Leave",
        marked_by: FACULTY_ALICE_ID,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ==========================================================
    // 4. LIBRARY
    // ==========================================================
    console.log("Seeding Library...");

    const book1 = uuidv4();
    await queryInterface.bulkInsert("books", [
      {
        id: book1,
        isbn: "9780262033848",
        title: "Introduction to Algorithms",
        author: "Cormen, Leiserson, Rivest, Stein",
        category: "Computer Science",
        publisher: "MIT Press",
        total_copies: 10,
        available_copies: 9,
        status: "available",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("book_issues", [
      {
        id: uuidv4(),
        book_id: book1,
        student_id: STUDENT_JOHN_ID,
        issue_date: new Date(),
        due_date: new Date(new Date().setDate(new Date().getDate() + 14)),
        status: "issued",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ==========================================================
    // 5. EXAMS
    // ==========================================================
    console.log("Seeding Exams...");

    const cycleId = uuidv4();
    await queryInterface.bulkInsert("exam_cycles", [
      {
        id: cycleId,
        name: "Mid-Term Examination 2025",
        start_date: new Date(new Date().setDate(new Date().getDate() + 10)),
        end_date: new Date(new Date().setDate(new Date().getDate() + 20)),
        status: "scheduled",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const examSchedId = uuidv4();
    await queryInterface.bulkInsert("exam_schedules", [
      {
        id: examSchedId,
        exam_cycle_id: cycleId,
        course_id: COURSE_DS_ID,
        exam_date: new Date(new Date().setDate(new Date().getDate() + 12)),
        start_time: "10:00:00",
        end_time: "13:00:00",
        max_marks: 100,
        passing_marks: 40,
        venue: "Hall-A",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Result for John in a PREVIOUS cycle
    const prevCycleId = uuidv4();
    await queryInterface.bulkInsert("exam_cycles", [
      {
        id: prevCycleId,
        name: "Unit Test 1",
        start_date: new Date(new Date().setDate(new Date().getDate() - 30)),
        end_date: new Date(new Date().setDate(new Date().getDate() - 25)),
        status: "results_published",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const prevSchedId = uuidv4();
    await queryInterface.bulkInsert("exam_schedules", [
      {
        id: prevSchedId,
        exam_cycle_id: prevCycleId,
        course_id: COURSE_DS_ID,
        exam_date: new Date(new Date().setDate(new Date().getDate() - 28)),
        start_time: "09:00:00",
        end_time: "11:00:00",
        max_marks: 50,
        passing_marks: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("exam_marks", [
      {
        id: uuidv4(),
        exam_schedule_id: prevSchedId,
        student_id: STUDENT_JOHN_ID,
        marks_obtained: 42.0,
        grade: "A",
        status: "present",
        remarks: "Excellent",
        entered_by: FACULTY_ALICE_ID,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ==========================================================
    // 6. PROCTORING
    // ==========================================================
    console.log("Seeding Proctoring...");

    await queryInterface.bulkInsert("proctor_assignments", [
      {
        id: uuidv4(),
        proctor_id: FACULTY_ALICE_ID,
        student_id: STUDENT_JOHN_ID,
        department_id: DEPT_CSE_ID,
        start_date: new Date(),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        proctor_id: FACULTY_ALICE_ID,
        student_id: STUDENT_JANE_ID,
        department_id: DEPT_CSE_ID,
        start_date: new Date(),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ==========================================================
    // 7. HOLIDAYS & LEAVE
    // ==========================================================
    console.log("Seeding Holidays & Leave...");

    await queryInterface.bulkInsert("holidays", [
      {
        id: uuidv4(),
        name: "Republic Day",
        date: "2026-01-26",
        type: "National",
        description: "Republic Day of India",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Spring Break",
        date: "2026-03-15",
        type: "Institutional",
        description: "Semester Break",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("leave_requests", [
      {
        id: uuidv4(),
        student_id: STUDENT_JANE_ID,
        leave_type: "Medical",
        start_date: "2025-12-01",
        end_date: "2025-12-03",
        reason: "Severe fever",
        status: "approved",
        reviewed_by: FACULTY_ALICE_ID,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ==========================================================
    // 8. PROCTOR FEEDBACK
    // ==========================================================
    console.log("Seeding Proctor Feedback...");

    // We need the assignment ID for John
    const [johnAssignment] = await queryInterface.sequelize.query(
      `SELECT id FROM proctor_assignments WHERE student_id = '${STUDENT_JOHN_ID}' LIMIT 1;`
    );

    if (johnAssignment && johnAssignment[0]) {
      await queryInterface.bulkInsert("proctor_feedback", [
        {
          id: uuidv4(),
          assignment_id: johnAssignment[0].id,
          feedback_text:
            "John is performing exceptionally well in Data Structures. He needs to focus more on Algorithmic complexity.",
          feedback_category: "ACADEMIC",
          severity: "POSITIVE",
          is_visible_to_student: true,
          created_by: FACULTY_ALICE_ID,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }

    console.log("✓ Comprehensive data seeded successfully!");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("proctor_feedback", null, {});
    await queryInterface.bulkDelete("leave_requests", null, {});
    await queryInterface.bulkDelete("holidays", null, {});
    await queryInterface.bulkDelete("proctor_assignments", null, {});
    await queryInterface.bulkDelete("exam_marks", null, {});
    await queryInterface.bulkDelete("hall_tickets", null, {});
    await queryInterface.bulkDelete("exam_schedules", null, {});
    await queryInterface.bulkDelete("exam_cycles", null, {});
    await queryInterface.bulkDelete("book_issues", null, {});
    await queryInterface.bulkDelete("books", null, {});
    await queryInterface.bulkDelete("attendance", null, {});
    await queryInterface.bulkDelete("timetable_slots", null, {});
    await queryInterface.bulkDelete("timetables", null, {});
    await queryInterface.bulkDelete("fee_payments", null, {});
    await queryInterface.bulkDelete("fee_waivers", null, {});
    await queryInterface.bulkDelete("fee_structures", null, {});
    await queryInterface.bulkDelete("fee_categories", null, {});
  },
};
