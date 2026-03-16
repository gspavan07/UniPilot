import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const SectionIncharge = sequelize.define(
  "SectionIncharge",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    faculty_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "departments", key: "id" },
    },
    program_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "programs", key: "id" },
    },
    batch_year: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: false,
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
    tableName: "section_incharges",
    schema: 'academics',
    timestamps: true,
    underscored: true,
  },
);

export default SectionIncharge;
