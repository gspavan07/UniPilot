import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * AuditLog Model
 * Records all critical actions in the system for auditing purposes
 */
const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

AuditLog.associate = (models) => {
  AuditLog.belongsTo(models.User, { foreignKey: "user_id", as: "actor" });
};

export default AuditLog;
