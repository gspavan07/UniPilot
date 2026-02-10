const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamSchedule = sequelize.define(
  "ExamSchedule",
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
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "courses", key: "id" },
    },
    exam_date: {
      type: DataTypes.DATEONLY,
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
    venue: {
      type: DataTypes.STRING,
    },
    max_marks: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    passing_marks: {
      type: DataTypes.INTEGER,
      defaultValue: 35,
    },
    programs: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Array of program IDs this exam schedule applies to",
    },
  },
  {
    tableName: "exam_schedules",
    timestamps: true,
    underscored: true,
  }
);

module.exports = ExamSchedule;
