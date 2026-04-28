import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * ExamStudentEligibility Model
 * Stores eligibility metrics and permission flags for a student in a specific exam cycle.
 * Status is calculated dynamically from flags, not stored.
 */
const ExamStudentEligibility = sequelize.define(
  "exam_student_eligibility",
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
    exam_cycle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "exam_cycles",
        key: "id",
      },
    },
    attendance_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Snapshot of attendance at the time of calculation",
    },
    fee_balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Snapshot of cumulative fee balance at the time of calculation",
    },
    fee_clear_permission: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment:
        "false if fee_balance > 0 or needs manual clearance, true if cleared",
    },
    hod_permission: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment:
        "false if attendance < threshold_condonation (needs HOD approval)",
    },
    has_condonation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment:
        "true if attendance < threshold_eligible (condonation fee applicable)",
    },
    bypassed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: "If not null, student is bypassed (status = bypassed)",
    },
  },
  {
    tableName: "exam_student_eligibilities",
    schema: 'exams',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["student_id", "exam_cycle_id"], unique: true },
      { fields: ["hod_permission"] },
      { fields: ["fee_clear_permission"] },
    ],
  },
);

export default ExamStudentEligibility;
