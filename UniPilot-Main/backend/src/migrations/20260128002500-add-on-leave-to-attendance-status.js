"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_attendance_status\" ADD VALUE IF NOT EXISTS 'on_leave';",
      );
    } catch (e) {
      console.log(
        "Enum value might already exist or table doesn't use it yet.",
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Standard procedure for removing ENUM values in Postgres is complex,
    // usually we don't remove them in down migrations unless necessary.
  },
};
