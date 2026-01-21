"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("exam_cycles", "exam_mode", {
      type: Sequelize.STRING(50),
      defaultValue: "regular",
      comment: "Selection for end_semester: regular, supplementary, combined",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("exam_cycles", "exam_mode");
  },
};
