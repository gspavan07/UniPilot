"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update the charge_type enum to include exam-related charges
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_student_fee_charges_charge_type" 
      ADD VALUE IF NOT EXISTS 'exam_reverification';
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_student_fee_charges_charge_type" 
      ADD VALUE IF NOT EXISTS 'exam_script_view';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support dropping enum values directly
    // This would require recreating the enum type which is risky
    // For production, you'd need to handle this more carefully
    console.log("Warning: Cannot remove enum values in down migration");
  },
};
