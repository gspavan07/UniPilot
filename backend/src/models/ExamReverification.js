const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamReverification = sequelize.define(
  "ExamReverification",
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
      comment: "Student who requested reverification",
    },
    exam_schedule_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "exam_schedules", key: "id" },
      comment: "Exam schedule for which reverification is requested",
    },
    exam_mark_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "exam_marks", key: "id" },
      comment: "Original exam mark record",
    },
    original_marks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: "Original marks before reverification",
    },
    original_grade: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "Original grade before reverification",
    },
    revised_marks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Revised marks after reverification (if changed)",
    },
    revised_grade: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "Revised grade after reverification (if changed)",
    },
    status: {
      type: DataTypes.ENUM("pending", "under_review", "completed", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "waived"),
      defaultValue: "pending",
      allowNull: false,
    },
    fee_charge_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "student_fee_charges", key: "id" },
      comment: "Associated fee charge for reverification",
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Semester for which reverification is requested",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Student's reason for requesting reverification",
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Exam cell's remarks after review",
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      comment: "Exam cell staff who reviewed this request",
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "exam_reverifications",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["exam_schedule_id"] },
      { fields: ["status"] },
      { fields: ["payment_status"] },
      { fields: ["created_at"] },
    ],
  },
);

module.exports = ExamReverification;
