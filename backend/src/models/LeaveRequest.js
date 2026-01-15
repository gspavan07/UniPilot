const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LeaveRequest = sequelize.define(
  "LeaveRequest",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    leave_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    is_half_day: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    reviewed_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
    approver_id: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
    review_remarks: {
      type: DataTypes.TEXT,
    },
    attachment_url: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "leave_requests",
    timestamps: true,
    underscored: true,
  }
);

module.exports = LeaveRequest;
