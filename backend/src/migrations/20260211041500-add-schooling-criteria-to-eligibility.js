"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("drive_eligibility", "min_10th_percent", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.0,
    });
    await queryInterface.addColumn("drive_eligibility", "min_inter_percent", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("drive_eligibility", "min_10th_percent");
    await queryInterface.removeColumn("drive_eligibility", "min_inter_percent");
  },
};
