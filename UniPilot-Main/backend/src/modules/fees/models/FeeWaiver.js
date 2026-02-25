import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const FeeWaiver = sequelize.define(
  "FeeWaiver",
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
    fee_category_id: {
      type: DataTypes.UUID,
      references: { model: "fee_categories", key: "id" },
    },
    waiver_type: {
      type: DataTypes.STRING, // e.g., "Scholarship", "Alumni Discount"
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    applies_to: {
      type: DataTypes.ENUM("all_semesters", "specific_semester", "one_time"),
      defaultValue: "one_time",
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    value_type: {
      type: DataTypes.ENUM("fixed", "percentage"),
      defaultValue: "fixed",
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
    },
    approved_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "fee_waivers",
    timestamps: true,
    underscored: true,
  },
);

export default FeeWaiver;
