import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const ProctorAlert = sequelize.define(
  "ProctorAlert",
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
    alert_type: {
      type: DataTypes.STRING(50), // LOW_ATTENDANCE, FAILING_GRADES, NO_FEE_PAYMENT
      allowNull: false,
    },
    alert_message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.STRING(20), // INFO, WARNING, CRITICAL
      defaultValue: "INFO",
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    triggered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    read_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "proctor_alerts",
    schema: 'proctoring',
    timestamps: false, // Using triggered_at instead
    underscored: true,
  }
);

export default ProctorAlert;
