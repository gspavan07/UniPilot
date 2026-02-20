import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ProctorAssignment = sequelize.define(
  "ProctorAssignment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    proctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "departments", key: "id" },
    },
    assignment_type: {
      type: DataTypes.STRING(50),
      defaultValue: "ACADEMIC",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    assigned_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "proctor_assignments",
    timestamps: true,
    underscored: true,
  }
);

export default ProctorAssignment;
