"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("fee_payments", "fee_structure_id", {
      type: Sequelize.UUID,
      allowNull: true, // Changed from false to true
      references: {
        model: "fee_structures",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to non-nullable (careful if data has nulls)
    // We keep it nullable in down for safety or delete records where it is null?
    // Usually revert tries to restore exact state, but if data exists, it might fail.
    // For now, we will try to revert to allow false, but real-world usage might prevent this.
    await queryInterface.changeColumn("fee_payments", "fee_structure_id", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "fee_structures",
        key: "id",
      },
    });
  },
};
