"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "exam_cycles",
      "attendance_condonation_threshold",
      {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 75.0,
        comment:
          "Attendance percentage below which admin condonation is required",
      },
    );

    await queryInterface.addColumn(
      "exam_cycles",
      "attendance_permission_threshold",
      {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 65.0,
        comment:
          "Attendance percentage below which HOD permission is required in addition to condonation",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "exam_cycles",
      "attendance_condonation_threshold",
    );
    await queryInterface.removeColumn(
      "exam_cycles",
      "attendance_permission_threshold",
    );
  },
};
