"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "fee_structures",
        "fine_type",
        {
          type: Sequelize.ENUM("none", "fixed", "percentage"),
          defaultValue: "none",
          comment: "Type of fine for late payment",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "fee_structures",
        "fine_amount",
        {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
          comment: "Amount or percentage of fine",
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("fee_structures", "fine_type", {
        transaction,
      });
      await queryInterface.removeColumn("fee_structures", "fine_amount", {
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
