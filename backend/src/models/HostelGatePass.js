const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const HostelGatePass = sequelize.define(
  "HostelGatePass",
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
    going_date: {
      type: DataTypes.DATEONLY,
    },
    coming_date: {
      type: DataTypes.DATEONLY,
    },
    pass_type: {
      type: DataTypes.ENUM("day", "long"),
      defaultValue: "long",
    },
    expected_out_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expected_in_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parent_otp: {
      type: DataTypes.STRING,
    },
    is_otp_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    attendance_synced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    out_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expected_return_time: {
      type: DataTypes.DATE,
    },
    actual_return_time: {
      type: DataTypes.DATE,
    },
    purpose: {
      type: DataTypes.STRING,
    },
    destination: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "out",
        "returned",
        "late",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    approved_by: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "hostel_gate_passes",
    underscored: true,
    timestamps: true,
  },
);

module.exports = HostelGatePass;
