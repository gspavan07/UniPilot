"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("holidays", "target", {
      type: Sequelize.STRING(50),
      defaultValue: "staff",
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("holidays", "target");
  },
};
