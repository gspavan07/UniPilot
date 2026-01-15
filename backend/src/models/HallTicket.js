const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const HallTicket = sequelize.define(
  "HallTicket",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    exam_cycle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "exam_cycles", key: "id" },
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    ticket_number: {
      type: DataTypes.STRING,
    },
    download_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    block_reason: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "hall_tickets",
    timestamps: true,
    underscored: true,
  }
);

module.exports = HallTicket;
