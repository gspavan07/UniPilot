"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the unique index exists before trying to remove it
    // In PostgreSQL, unique constraints often create an index
    try {
      await queryInterface.removeIndex(
        "fee_payments",
        "fee_payments_transaction_id_key"
      );
    } catch (e) {
      // If it's not named this way, try simple removeConstraint or ignore
      try {
        await queryInterface.removeConstraint(
          "fee_payments",
          "fee_payments_transaction_id_key"
        );
      } catch (err) {}
    }

    // Sometimes it's just a regular index with unique:true
    try {
      await queryInterface.removeIndex("fee_payments", "transaction_id");
    } catch (e) {}

    // Ensure the column is still there but not unique
    // (Sequelize changeColumn usually handles this if we don't specify unique)
    await queryInterface.changeColumn("fee_payments", "transaction_id", {
      type: Sequelize.STRING,
      unique: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("fee_payments", "transaction_id", {
      type: Sequelize.STRING,
      unique: true,
    });
  },
};
