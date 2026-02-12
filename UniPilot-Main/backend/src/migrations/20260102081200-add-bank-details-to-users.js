"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "bank_details", {
      type: Sequelize.JSONB,
      defaultValue: {},
      allowNull: true,
      comment:
        "Stores bank name, account number, IFSC, branch, and holder name",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "bank_details");
  },
};
