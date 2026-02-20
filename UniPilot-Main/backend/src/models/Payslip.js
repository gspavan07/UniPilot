import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Payslip = sequelize.define(
  "Payslip",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 12 },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_earnings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_deductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    net_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    breakdown: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Detailed breakdown of earnings and deductions for this slip",
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "paid"),
      defaultValue: "draft",
    },
    generated_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
    },
    transaction_ref: {
      type: DataTypes.STRING,
      comment: "Bank transaction reference number",
    },
    pdf_url: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "payslips",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "month", "year"],
      },
    ],
  }
);

Payslip.associate = (models) => {
  Payslip.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "staff",
  });
};

export default Payslip;
