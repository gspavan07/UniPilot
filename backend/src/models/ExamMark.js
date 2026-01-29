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
    component_scores: {
      type: DataTypes.JSONB,
      defaultValue: null,
      comment:
        "Component-wise scores: {assignment: 4, objective: 9, descriptive: 13}",
    },
    grade: {
      type: DataTypes.STRING(5),
    },
    attendance_status: {
      type: DataTypes.ENUM("present", "absent", "malpractice"),
      defaultValue: "present",
    },
    moderation_status: {
      type: DataTypes.ENUM("draft", "verified", "approved", "locked"),
      defaultValue: "draft",
    },
    moderation_history: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    remarks: {
      type: DataTypes.TEXT,
    },
    entered_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
    is_reverified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "Whether this mark has been reverified",
    },
    reverification_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: "Number of times reverification was done",
    },
    original_marks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment:
        "Original marks when first published (for reverification tracking)",
    },
    reverification_history: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "History of all reverification changes",
    },
  },
  {
    tableName: "exam_marks",
    timestamps: true,
    underscored: true,
  },
);

module.exports = ExamMark;
