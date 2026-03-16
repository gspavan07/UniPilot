import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const FeePayment = sequelize.define(
  "FeePayment",
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
    fee_structure_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "fee_structures", key: "id" },
    },
    fee_charge_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "student_fee_charges", key: "id" },
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    payment_method: {
      type: DataTypes.ENUM(
        "cash",
        "online",
        "bank_transfer",
        "cheque",
        "WALLET",
      ),
      defaultValue: "online",
    },
    transaction_id: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed", "partially_paid"),
      defaultValue: "completed",
    },
    receipt_url: {
      type: DataTypes.STRING,
    },
    remarks: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "fee_payments",
    schema: 'fees',
    timestamps: true,
    underscored: true,
  },
);

export default FeePayment;
