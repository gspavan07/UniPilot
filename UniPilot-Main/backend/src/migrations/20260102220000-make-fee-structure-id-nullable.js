"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Make fee_structure_id nullable
    await queryInterface.changeColumn("fee_payments", "fee_structure_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "fee_structures", key: "id" },
    });

    // 2. Add semester column to fee_payments to track fine payments per semester
    await queryInterface.addColumn("fee_payments", "semester", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("fee_payments", "semester");
    await queryInterface.changeColumn("fee_payments", "fee_structure_id", {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
