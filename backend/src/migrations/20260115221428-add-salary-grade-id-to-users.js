"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "salary_grade_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "salary_grades",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "salary_grade_id");
  },
};
