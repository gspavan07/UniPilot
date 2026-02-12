"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("exam_cycles", "is_attendance_checked", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
    await queryInterface.addColumn("exam_cycles", "is_fee_checked", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("exam_cycles", "is_attendance_checked");
    await queryInterface.removeColumn("exam_cycles", "is_fee_checked");
  },
};
