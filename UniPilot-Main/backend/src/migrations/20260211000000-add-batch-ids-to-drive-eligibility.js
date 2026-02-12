"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("drive_eligibility", "batch_ids", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true,
      comment: "Eligible student joining years (e.g. 2022, 2023)",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("drive_eligibility", "batch_ids");
  },
};
