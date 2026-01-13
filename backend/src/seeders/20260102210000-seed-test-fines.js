"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Reused IDs from previous seeders
    const PROG_CSE_ID = "1922a060-d9fb-4b0b-8d38-4587f3a91bf7";
    const STUDENT_JOHN_ID = "f6d21b45-75dd-4846-9101-107f5ffd165b";

    // Get categories mapping
    const [categories] = await queryInterface.sequelize.query(
      `SELECT id, name FROM fee_categories WHERE name IN ('Tuition Fee', 'Transport Fee', 'Special Fee')`
    );

    if (categories.length === 0) {
      console.log("Required categories not found");
      return;
    }

    const catMap = {};
    categories.forEach((c) => (catMap[c.name] = c.id));

    // Create overdue structures for Semester 8 (which is currently unpaid/empty)
    const structures = [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        category_id: catMap["Tuition Fee"],
        program_id: PROG_CSE_ID,
        batch_year: 2023,
        semester: 8,
        amount: 62500,
        due_date: "2025-12-01", // Overdue
        fine_type: "fixed",
        fine_amount: 1000,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal("gen_random_uuid()"),
        category_id: catMap["Transport Fee"],
        program_id: PROG_CSE_ID,
        batch_year: 2023,
        semester: 8,
        amount: 12000,
        due_date: "2025-12-15", // Overdue
        fine_type: "percentage",
        fine_amount: 5, // 5% of 12000 = 600
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("fee_structures", structures);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("fee_structures", {
      semester: 8,
      batch_year: 2023,
    });
  },
};
