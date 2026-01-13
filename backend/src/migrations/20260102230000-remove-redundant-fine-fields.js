"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("fee_structures", "due_date");
    await queryInterface.removeColumn("fee_structures", "fine_type");
    await queryInterface.removeColumn("fee_structures", "fine_amount");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("fee_structures", "due_date", {
      type: Sequelize.DATEONLY,
    });
    await queryInterface.addColumn("fee_structures", "fine_type", {
      type: Sequelize.ENUM("none", "fixed", "percentage"),
      defaultValue: "none",
    });
    await queryInterface.addColumn("fee_structures", "fine_amount", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });
  },
};
