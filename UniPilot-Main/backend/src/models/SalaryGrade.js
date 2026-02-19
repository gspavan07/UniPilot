import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const SalaryGrade = sequelize.define(
  "SalaryGrade",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "e.g., Professor Grade A, Admin Level 2",
    },
    basic_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    allowances: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Standard allowances for this grade",
    },
    deductions: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Standard deductions for this grade",
    },
    leave_policy: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Leave entitlements: [{name, days, carry_forward, is_paid}]",
    },
    lop_config: {
      type: DataTypes.JSONB,
      defaultValue: { basis: "basic", deduction_factor: 1.0 },
      comment: "Loss of Pay rules",
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "salary_grades",
    timestamps: true,
    underscored: true,
  }
);

export default SalaryGrade;
