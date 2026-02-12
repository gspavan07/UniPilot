"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("exam_cycles", "weightage", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment:
        "Weightage percentage for this exam cycle towards final results (0-100)",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exam_cycles", "weightage");
  },
};
