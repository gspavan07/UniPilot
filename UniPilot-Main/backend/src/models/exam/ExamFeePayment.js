const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

/**
 * ExamFeePayment Model
 * Links a student's exam cycle to a specific transaction in the main fee_payments table.
 */
const ExamFeePayment = sequelize.define(
  "exam_fee_payment",
  {
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
    },
    exam_cycle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "exam_cycles",
        key: "id",
      },
    },
    fee_payment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "fee_payments",
        key: "id",
      },
      comment: "Link to the main transaction record in fee_payments table",
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    amount_breakup: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("completed", "failed", "partially_paid"),
      defaultValue: "completed",
    },
    fee_type: {
      type: DataTypes.ENUM(
        "Exam Fee",
        "Revaluation Fee",
        "Script View Fee",
        "Supply Fee",
      ),
      defaultValue: "Exam Fee",
    },
  },
  {
    tableName: "exam_fee_payments",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["exam_cycle_id"] },
      { fields: ["fee_payment_id"] },
    ],
  },
);

module.exports = ExamFeePayment;
