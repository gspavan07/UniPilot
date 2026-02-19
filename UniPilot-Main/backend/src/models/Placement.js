import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Placement = sequelize.define(
  "Placement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING(100),
    },
    package_lpa: {
      type: DataTypes.DECIMAL(5, 2),
    },
    placement_date: {
      type: DataTypes.DATEONLY,
    },
    offer_letter_url: {
      type: DataTypes.STRING(500),
    },
    is_on_campus: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    academic_year: {
      type: DataTypes.STRING(10),
    },
    remarks: {
      type: DataTypes.TEXT,
    },
    drive_id: {
      type: DataTypes.UUID,
    },
    job_posting_id: {
      type: DataTypes.UUID,
    },
    application_id: {
      type: DataTypes.UUID,
    },
    offer_accepted_at: {
      type: DataTypes.DATE,
    },
    joining_date: {
      type: DataTypes.DATEONLY,
    },
    status: {
      type: DataTypes.ENUM("offered", "accepted", "rejected", "joined"),
      defaultValue: "offered",
    },
  },
  {
    tableName: "placements",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Placement;
