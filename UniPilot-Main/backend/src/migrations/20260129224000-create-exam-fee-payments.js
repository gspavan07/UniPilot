"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("exam_fee_payments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      exam_cycle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "exam_cycles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      category: {
        type: Sequelize.ENUM(
          "registration",
          "supply",
          "reverification",
          "condonation",
          "script_view",
        ),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      payment_method: {
        type: Sequelize.STRING(50),
        defaultValue: "online",
      },
      status: {
        type: Sequelize.ENUM("pending", "completed", "failed"),
        defaultValue: "completed",
      },
      payment_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes manually if needed or via standard Table options
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("exam_fee_payments");
  },
};
