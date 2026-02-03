const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DriveRound = sequelize.define(
  "DriveRound",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    drive_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    round_number: {
      type: DataTypes.INTEGER,
    },
    round_name: {
      type: DataTypes.STRING(100),
    },
    round_type: {
      type: DataTypes.STRING(50),
    },
    round_date: {
      type: DataTypes.DATEONLY,
    },
    round_time: {
      type: DataTypes.TIME,
    },
    venue: {
      type: DataTypes.STRING(255),
    },
    mode: {
      type: DataTypes.ENUM("online", "offline"),
      defaultValue: "offline",
    },
    test_link: {
      type: DataTypes.STRING(500),
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
    },
    is_eliminatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    venue_type: {
      type: DataTypes.STRING(50),
      defaultValue: "online",
    },
  },
  {
    tableName: "drive_rounds",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = DriveRound;
