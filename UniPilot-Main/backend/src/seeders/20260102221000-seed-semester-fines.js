"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Get Student John
    const [john] = await queryInterface.sequelize.query(
      `SELECT id, program_id, batch_year FROM users WHERE first_name = 'John' LIMIT 1;`
    );

    if (!john || john.length === 0) return;

    const student = john[0];

    // 2. Add Semester Configs for Semester 7 (Overdue) and Semester 8 (Upcoming)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await queryInterface.bulkInsert("fee_semester_configs", [
      {
        id: Sequelize.fn("gen_random_uuid"),
        program_id: student.program_id,
        batch_year: student.batch_year,
        semester: 8,
        due_date: yesterday,
        fine_type: "fixed",
        fine_amount: 500.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.fn("gen_random_uuid"),
        program_id: student.program_id,
        batch_year: student.batch_year,
        semester: 7,
        due_date: yesterday,
        fine_type: "percentage",
        fine_amount: 10.0, // 10% fine
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log("Seeded semester configs for John's batch.");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("fee_semester_configs", null, {});
  },
};
