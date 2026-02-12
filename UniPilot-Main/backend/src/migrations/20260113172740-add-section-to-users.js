"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "section", {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: "Section for students (e.g. A, B, C)",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "section");
  },
};
