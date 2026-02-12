"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "student_route_allocations",
      "academic_year",
      {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "Academic year (e.g., 2024-2025) - optional",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "student_route_allocations",
      "academic_year",
      {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: "Academic year (e.g., 2024-2025)",
      },
    );
  },
};
