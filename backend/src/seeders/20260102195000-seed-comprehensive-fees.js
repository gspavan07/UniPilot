"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Reused IDs
    const PROG_CSE_ID = "1922a060-d9fb-4b0b-8d38-4587f3a91bf7";
    const STUDENT_JOHN_ID = "f6d21b45-75dd-4846-9101-107f5ffd165b";

    console.log("Seeding comprehensive fee categories and structures...");

    // 1. Create Categories
    const categories = [
      {
        id: uuidv4(),
        name: "Tuition Fee",
        description: "Main academic tuition fees",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Special Fee",
        description: "Laboratory, library and other special fees",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Transport Fee",
        description: "College bus facility charges",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Hostel Fee",
        description: "Accommodation and mess charges",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Textbooks & Printed Books",
        description: "Course material and books",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Misfee-B",
        description: "Miscellaneous fees group B",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Misfee-Amcat/Cocubes/Elitmus",
        description: "Placement and assessment fees",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("fee_categories", categories);

    const catMap = {};
    categories.forEach((c) => (catMap[c.name] = c.id));

    // 2. Create Fee Structures for Batch 2023
    const structures = [];

    // Helper to add structure
    const addFee = (
      sem,
      catName,
      amount,
      isOptional = false,
      appliesTo = "all"
    ) => {
      structures.push({
        id: uuidv4(),
        category_id: catMap[catName],
        program_id: PROG_CSE_ID,
        batch_year: 2023,
        semester: sem,
        amount: amount,
        is_optional: isOptional,
        applies_to: appliesTo,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
    };

    // Semester 1
    addFee(1, "Misfee-B", 2430.0);
    addFee(1, "Special Fee", 15000.0);
    addFee(1, "Transport Fee", 11000.0, true, "day_scholars");
    addFee(1, "Tuition Fee", 62500.0);
    addFee(1, "Hostel Fee", 45000.0, true, "hostellers");

    // Semester 2
    addFee(2, "Textbooks & Printed Books", 1290.0);
    addFee(2, "Transport Fee", 11000.0, true, "day_scholars");
    addFee(2, "Tuition Fee", 62500.0);
    addFee(2, "Hostel Fee", 45000.0, true, "hostellers");

    // Semester 3
    addFee(3, "Special Fee", 7500.0);
    addFee(3, "Transport Fee", 11500.0, true, "day_scholars");
    addFee(3, "Tuition Fee", 62500.0);
    addFee(3, "Hostel Fee", 48000.0, true, "hostellers");

    // Semester 4
    addFee(4, "Special Fee", 7500.0);
    addFee(4, "Transport Fee", 11500.0, true, "day_scholars");
    addFee(4, "Tuition Fee", 62500.0);
    addFee(4, "Hostel Fee", 48000.0, true, "hostellers");

    // Semester 5
    addFee(5, "Special Fee", 7500.0);
    addFee(5, "Transport Fee", 12000.0, true, "day_scholars");
    addFee(5, "Tuition Fee", 62500.0);
    addFee(5, "Hostel Fee", 50000.0, true, "hostellers");

    // Semester 6
    addFee(6, "Special Fee", 7500.0);
    addFee(6, "Textbooks & Printed Books", 760.0);
    addFee(6, "Transport Fee", 12000.0, true, "day_scholars");
    addFee(6, "Tuition Fee", 62500.0);
    addFee(6, "Hostel Fee", 50000.0, true, "hostellers");

    // Semester 7
    addFee(7, "Misfee-Amcat/Cocubes/Elitmus", 1500.0);
    addFee(7, "Special Fee", 7500.0);
    addFee(7, "Tuition Fee", 62500.0);
    addFee(7, "Hostel Fee", 55000.0, true, "hostellers");

    // Semester 8
    addFee(8, "Special Fee", 7500.0);
    addFee(8, "Tuition Fee", 62500.0);
    addFee(8, "Hostel Fee", 55000.0, true, "hostellers");

    await queryInterface.bulkInsert("fee_structures", structures);

    // 3. Update John's Profile
    await queryInterface.bulkUpdate(
      "users",
      {
        batch_year: 2023,
        is_hosteller: false,
        requires_transport: true,
        admission_date: "2023-08-15",
      },
      { id: STUDENT_JOHN_ID }
    );

    // 4. Create Payments for John (matching image)
    const payments = [];
    const addPayment = (feeIdx, recNo, date, amountPaid = null) => {
      const struct = structures[feeIdx];
      payments.push({
        id: uuidv4(),
        student_id: STUDENT_JOHN_ID,
        fee_structure_id: struct.id,
        amount_paid: amountPaid || struct.amount,
        payment_date: new Date(date),
        payment_method: "online",
        transaction_id: recNo,
        status: "completed",
        created_at: new Date(),
        updated_at: new Date(),
      });
    };

    // Semester 1 Paid
    addPayment(0, "M/2205395", "2023-01-23"); // Misfee-B
    addPayment(1, "T/2214324", "2022-12-10"); // Special Fee
    addPayment(2, "B/2202537", "2022-09-12"); // Transport
    addPayment(3, "T/2214324", "2022-12-10"); // Tuition

    // Semester 2 Paid
    addPayment(5, "P/2300524", "2023-06-12"); // Books
    addPayment(6, "B/2205959", "2023-03-27"); // Transport
    addPayment(7, "T/2300487", "2023-04-05"); // Tuition

    // Semester 3 Paid
    addPayment(9, "T/2306076", "2023-09-09"); // Special
    addPayment(10, "B/2302508", "2023-09-09"); // Transport
    addPayment(11, "T/2306076", "2023-09-09"); // Tuition

    // Semester 4 Paid
    addPayment(13, "T/2313289", "2024-02-22"); // Special
    addPayment(14, "B/2305274", "2024-02-22"); // Transport
    addPayment(15, "T/2313289", "2024-02-22"); // Tuition

    // Semester 5 Paid
    addPayment(17, "T/2405248", "2024-08-10"); // Special
    addPayment(18, "B/2401276", "2024-08-10"); // Transport
    addPayment(19, "T/2405248", "2024-08-10"); // Tuition

    // Semester 6 Paid
    addPayment(21, "T/2411822", "2025-01-27"); // Special
    addPayment(22, "P/2404793", "2025-03-25"); // Books
    addPayment(23, "B/2405001", "2025-01-27"); // Transport
    addPayment(24, "T/2411441", "2025-01-06"); // Tuition

    // Semester 7 Paid
    addPayment(26, "M/2500282", "2025-07-23"); // Misfee
    addPayment(27, "T/2501152", "2025-07-16"); // Special
    addPayment(28, "T/2501375", "2025-07-23"); // Tuition

    // Semester 8 (Unpaid according to image totals)
    // No payments added for Semester 8

    await queryInterface.bulkInsert("fee_payments", payments);

    console.log("✅ Comprehensive fee data seeded successfully!");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("fee_payments", null, {});
    await queryInterface.bulkDelete("fee_structures", null, {});
    await queryInterface.bulkDelete("fee_categories", null, {});
  },
};
