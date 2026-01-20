"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add max_marks and passing_marks to exam_cycles
    await queryInterface.addColumn("exam_cycles", "max_marks", {
      type: Sequelize.INTEGER,
      defaultValue: 100,
    });

    await queryInterface.addColumn("exam_cycles", "passing_marks", {
      type: Sequelize.INTEGER,
      defaultValue: 35,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exam_cycles", "max_marks");
    await queryInterface.removeColumn("exam_cycles", "passing_marks");
  },
};
