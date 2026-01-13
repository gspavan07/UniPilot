"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("exam_schedules", "branches", {
      type: Sequelize.JSONB,
      defaultValue: [],
      allowNull: true,
      comment: "Array of program IDs this exam schedule applies to",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exam_schedules", "branches");
  },
};
