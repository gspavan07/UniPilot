import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const HostelComplaint = sequelize.define(
  "HostelComplaint",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    room_id: {
      type: DataTypes.UUID,
      references: {
        model: "hostel_rooms",
        key: "id",
      },
    },
    complaint_type: {
      type: DataTypes.ENUM(
        "electrical",
        "plumbing",
        "furniture",
        "cleanliness",
        "wifi",
        "other",
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "resolved", "closed"),
      defaultValue: "pending",
    },
    assigned_to: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
    },
    resolution_notes: {
      type: DataTypes.TEXT,
    },
    resolved_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "hostel_complaints",
    underscored: true,
    timestamps: true,
  },
);

export default HostelComplaint;
