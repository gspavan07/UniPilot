"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to fee_waivers table
    await queryInterface.addColumn("fee_waivers", "applies_to", {
      type: Sequelize.STRING,
      defaultValue: "one_time",
      allowNull: false,
      comment: "all_semesters, specific_semester, one_time",
    });

    await queryInterface.addColumn("fee_waivers", "semester", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("fee_waivers", "value_type", {
      type: Sequelize.STRING,
      defaultValue: "fixed",
      allowNull: false,
      comment: "fixed, percentage",
    });

    await queryInterface.addColumn("fee_waivers", "percentage", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("fee_waivers", "percentage");
    await queryInterface.removeColumn("fee_waivers", "value_type");
    await queryInterface.removeColumn("fee_waivers", "semester");
    await queryInterface.removeColumn("fee_waivers", "applies_to");
  },
};
