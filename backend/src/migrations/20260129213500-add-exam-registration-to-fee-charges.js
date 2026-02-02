"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'exam_registration' to the charge_type enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_student_fee_charges_charge_type" 
      ADD VALUE IF NOT EXISTS 'exam_registration';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // PostgreSQL doesn't support dropping enum values directly.
    // This would require recreating the enum type which is risky.
    console.log("Warning: Cannot remove enum values in down migration");
  },
};
