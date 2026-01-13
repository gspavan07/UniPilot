const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TimetableSlot = sequelize.define(
  "TimetableSlot",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    timetable_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "timetables", key: "id" },
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "courses", key: "id" },
    },
    faculty_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    day_of_week: {
      type: DataTypes.ENUM(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    room_number: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "timetable_slots",
    timestamps: true,
    underscored: true,
  }
);

module.exports = TimetableSlot;
