"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add reverification tracking fields to exam_marks table
    await queryInterface.addColumn("exam_marks", "is_reverified", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn("exam_marks", "reverification_count", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });

    await queryInterface.addColumn("exam_marks", "original_marks", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    });

    await queryInterface.addColumn("exam_marks", "reverification_history", {
      type: Sequelize.JSONB,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exam_marks", "reverification_history");
    await queryInterface.removeColumn("exam_marks", "original_marks");
    await queryInterface.removeColumn("exam_marks", "reverification_count");
    await queryInterface.removeColumn("exam_marks", "is_reverified");
  },
};
