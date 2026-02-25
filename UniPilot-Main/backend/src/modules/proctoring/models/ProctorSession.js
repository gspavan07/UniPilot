import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const ProctorSession = sequelize.define(
  "ProctorSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "proctor_assignments", key: "id" },
    },
    session_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    session_type: {
      type: DataTypes.STRING(50), // ONE_ON_ONE, GROUP, ONLINE
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
    },
    location: {
      type: DataTypes.STRING(200),
    },
    agenda: {
      type: DataTypes.TEXT,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    attendance_status: {
      type: DataTypes.STRING(20), // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
      defaultValue: "SCHEDULED",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "proctor_sessions",
    timestamps: true,
    underscored: true,
  }
);

export default ProctorSession;
