const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PlacementNotification = sequelize.define(
  "PlacementNotification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    notification_type: {
      type: DataTypes.STRING(50),
    },
    title: {
      type: DataTypes.STRING(255),
    },
    message: {
      type: DataTypes.TEXT,
    },
    related_drive_id: {
      type: DataTypes.UUID,
    },
    action_url: {
      type: DataTypes.STRING(500),
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "urgent"),
      defaultValue: "normal",
    },
  },
  {
    tableName: "placement_notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["user_id", "is_read"],
      },
    ],
  },
);

module.exports = PlacementNotification;
