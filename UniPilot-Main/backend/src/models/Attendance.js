const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Attendance = sequelize.define(
  "Attendance",
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
    course_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "courses", key: "id" },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("present", "absent", "late", "excused", "on_leave"),
      defaultValue: "present",
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
    },
    marked_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
    timetable_slot_id: {
      type: DataTypes.UUID,
      references: { model: "timetable_slots", key: "id" },
    },
    batch_year: {
      type: DataTypes.INTEGER,
    },
    section: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "attendance",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Attendance;
