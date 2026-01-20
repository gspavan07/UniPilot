"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Rename 'status' to 'attendance_status'
    await queryInterface.renameColumn(
      "exam_marks",
      "status",
      "attendance_status",
    );

    // 2. Add 'moderation_status'
    await queryInterface.addColumn("exam_marks", "moderation_status", {
      type: Sequelize.ENUM("draft", "verified", "approved", "locked"),
      defaultValue: "draft",
    });

    // 3. Add 'moderation_history'
    await queryInterface.addColumn("exam_marks", "moderation_history", {
      type: Sequelize.JSONB,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exam_marks", "moderation_history");
    await queryInterface.removeColumn("exam_marks", "moderation_status");
    await queryInterface.renameColumn(
      "exam_marks",
      "attendance_status",
      "status",
    );

    // Note: To truly revert ENUM changes in Postgres, you might need extra steps,
    // but for this dev environment, renaming and removing columns is standard.
  },
};
