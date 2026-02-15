const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 0: Clear any existing table with the same name to avoid schema mismatch
    await queryInterface
      .dropTable("exam_fee_payments", { cascade: true })
      .catch(() => {});

    await queryInterface.createTable("exam_fee_payments", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      exam_cycle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "exam_cycles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fee_payment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "fee_payments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("completed", "failed", "partially_paid"),
        defaultValue: "completed",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("exam_fee_payments", ["student_id"]);
    await queryInterface.addIndex("exam_fee_payments", ["exam_cycle_id"]);
    await queryInterface.addIndex("exam_fee_payments", ["fee_payment_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("exam_fee_payments");
  },
};
