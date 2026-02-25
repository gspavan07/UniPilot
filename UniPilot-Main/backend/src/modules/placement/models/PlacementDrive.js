import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const PlacementDrive = sequelize.define(
  "PlacementDrive",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_posting_id: {
      type: DataTypes.UUID,
    },
    drive_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    drive_type: {
      type: DataTypes.ENUM("on_campus", "off_campus", "pool_campus"),
      defaultValue: "on_campus",
    },
    drive_date: {
      type: DataTypes.DATEONLY,
    },
    venue: {
      type: DataTypes.STRING(255),
    },
    mode: {
      type: DataTypes.ENUM("online", "offline", "hybrid"),
      defaultValue: "offline",
    },
    status: {
      type: DataTypes.ENUM("scheduled", "ongoing", "completed", "cancelled"),
      defaultValue: "scheduled",
    },
    coordinator_id: {
      type: DataTypes.UUID,
    },
    registration_start: {
      type: DataTypes.DATE,
    },
    registration_end: {
      type: DataTypes.DATE,
    },
    registration_form_fields: {
      type: DataTypes.JSONB,
    },
    external_registration_url: {
      type: DataTypes.STRING(500),
    },
  },
  {
    tableName: "placement_drives",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default PlacementDrive;
