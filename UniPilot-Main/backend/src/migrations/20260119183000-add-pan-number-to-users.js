"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("users");
    if (!tableInfo.pan_number) {
      await queryInterface.addColumn("users", "pan_number", {
        type: Sequelize.STRING(20),
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "pan_number");
  },
};
