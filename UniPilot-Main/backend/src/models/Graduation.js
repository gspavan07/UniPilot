import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Graduation = sequelize.define(
  "Graduation",
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
    application_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    graduation_date: {
      type: DataTypes.DATE,
    },
    final_cgpa: {
      type: DataTypes.DECIMAL(3, 2),
    },
    academic_clearance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fee_clearance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    library_clearance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING(50), // PENDING, APPROVED, REJECTED, COMPLETED
      defaultValue: "PENDING",
    },
    approved_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
    remarks: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "graduations",
    timestamps: true,
    underscored: true,
  }
);

export default Graduation;
