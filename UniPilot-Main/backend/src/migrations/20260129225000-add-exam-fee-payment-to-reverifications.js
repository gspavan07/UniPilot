"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable(
      "exam_reverifications",
    );
    if (!tableInfo.exam_fee_payment_id) {
      await queryInterface.addColumn(
        "exam_reverifications",
        "exam_fee_payment_id",
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: "exam_fee_payments", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          comment: "Associated centralized exam fee payment",
        },
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable(
      "exam_reverifications",
    );
    if (tableInfo.exam_fee_payment_id) {
      await queryInterface.removeColumn(
        "exam_reverifications",
        "exam_fee_payment_id",
      );
    }
  },
};
