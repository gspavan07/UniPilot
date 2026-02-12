"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("fee_structures", "academic_year", {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: "Academic year (e.g., 2024-2025)",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("fee_structures", "academic_year");
  },
};
