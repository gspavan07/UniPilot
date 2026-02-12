"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Remove the old restrictive index
    await queryInterface.removeIndex(
      "attendance",
      "idx_attendance_unique_entry",
    );

    // 2. Add a new comprehensive unique index that includes timetable_slot_id
    // This allows multiple slots for the same course on the same day
    await queryInterface.addIndex(
      "attendance",
      ["student_id", "date", "course_id", "timetable_slot_id"],
      {
        unique: true,
        name: "idx_attendance_session_unique",
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      "attendance",
      "idx_attendance_session_unique",
    );

    await queryInterface.addIndex(
      "attendance",
      ["student_id", "date", "course_id"],
      {
        unique: true,
        name: "idx_attendance_unique_entry",
      },
    );
  },
};
