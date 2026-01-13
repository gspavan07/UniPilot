const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamMark = sequelize.define(
  "ExamMark",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    exam_schedule_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "exam_schedules", key: "id" },
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    marks_obtained: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING(5),
    },
    status: {
      type: DataTypes.ENUM("present", "absent", "malpractice"),
      defaultValue: "present",
    },
    remarks: {
      type: DataTypes.TEXT,
    },
    entered_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "exam_marks",
    timestamps: true,
    underscored: true,
  }
);

module.exports = ExamMark;
