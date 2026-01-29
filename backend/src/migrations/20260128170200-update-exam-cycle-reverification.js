"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add reverification configuration fields to exam_cycles table
    await queryInterface.addColumn("exam_cycles", "is_reverification_open", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn("exam_cycles", "reverification_start_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("exam_cycles", "reverification_end_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn(
      "exam_cycles",
      "reverification_fee_per_paper",
      {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
    );

    await queryInterface.addColumn("exam_cycles", "is_script_view_enabled", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn("exam_cycles", "script_view_fee", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exam_cycles", "script_view_fee");
    await queryInterface.removeColumn("exam_cycles", "is_script_view_enabled");
    await queryInterface.removeColumn(
      "exam_cycles",
      "reverification_fee_per_paper",
    );
    await queryInterface.removeColumn("exam_cycles", "reverification_end_date");
    await queryInterface.removeColumn(
      "exam_cycles",
      "reverification_start_date",
    );
    await queryInterface.removeColumn("exam_cycles", "is_reverification_open");
  },
};
