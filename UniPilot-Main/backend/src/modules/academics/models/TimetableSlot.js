import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

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
      allowNull: true, // Allow null for non-course activities
      references: { model: "courses", key: "id" },
    },
    activity_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment:
        "For non-course activities like 'Coding Training', 'Sports', etc.",
    },
    faculty_id: {
      type: DataTypes.UUID,
      allowNull: true, // Optional for activities
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
        "Sunday",
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
    block_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "blocks", key: "id" },
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "rooms", key: "id" },
    },
    room_number: {
      type: DataTypes.STRING,
      comment: "Deprecated: Use room_id instead",
    },
  },
  {
    tableName: "timetable_slots",
    schema: 'academics',
    timestamps: true,
    underscored: true,
  },
);

export default TimetableSlot;
