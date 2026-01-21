const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamRegistration = sequelize.define(
  "ExamRegistration",
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
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    registered_subjects: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Array of course IDs {course_id, type: 'regular'|'supply'}",
    },
    registration_type: {
      type: DataTypes.ENUM("regular", "supply", "combined"),
      defaultValue: "regular",
    },
    fee_status: {
      type: DataTypes.ENUM("pending", "paid", "partially_paid", "waived"),
      defaultValue: "pending",
    },
    total_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    late_fee_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_fine_waived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    attendance_status: {
      type: DataTypes.ENUM("clear", "low", "condoned"),
      defaultValue: "clear",
    },
    attendance_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    is_condoned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    has_permission: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "HOD permission granted for attendance <65%",
    },
    override_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    override_remarks: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM(
        "draft",
        "submitted",
        "approved",
        "rejected",
        "blocked",
      ),
      defaultValue: "draft",
    },
    hall_ticket_generated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "exam_registrations",
    timestamps: true,
    underscored: true,
  },
);

module.exports = ExamRegistration;
