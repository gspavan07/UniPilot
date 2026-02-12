const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamFeePayment = sequelize.define(
  "ExamFeePayment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },

    fee_payment_id: {
      type: DataTypes.UUID,
      allowNull: true, // Nullable for now during migration
      references: { model: "fee_payments", key: "id" },
      comment: "Parent Global Transaction ID",
    },
    exam_cycle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "exam_cycles", key: "id" },
    },
    category: {
      type: DataTypes.ENUM(
        "registration",
        "supply",
        "reverification",
        "condonation",
        "script_view",
      ),
      allowNull: false,
      comment: "Category of exam fee paid",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      defaultValue: "online",
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "completed",
    },
    payment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "exam_fee_payments",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["exam_cycle_id"] },
      { fields: ["category"] },
      { fields: ["transaction_id"] },
    ],
  },
);

module.exports = ExamFeePayment;
