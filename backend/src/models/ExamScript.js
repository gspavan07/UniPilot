const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamScript = sequelize.define(
  "ExamScript",
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
      comment: "Exam schedule for this script",
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Student who wrote this script",
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Path to the PDF file",
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "File size in bytes",
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Exam cell staff who uploaded this script",
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "Whether student can view this script",
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: "Number of times student viewed this script",
    },
    last_viewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Last time student viewed this script",
    },
  },
  {
    tableName: "exam_scripts",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["exam_schedule_id"] },
      { fields: ["student_id"] },
      { fields: ["is_visible"] },
      { fields: ["student_id", "exam_schedule_id"], unique: true },
    ],
  },
);

module.exports = ExamScript;
