import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * ExamCycle Model
 * Represents a complete exam cycle like "B.Tech_R20_VI_Semester_Examination_Feb-2026"
 */
const ExamCycle = sequelize.define(
  "exam_cycle",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cycle_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    degree: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    regulation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "regulations",
        key: "id",
      },
    },
    exam_month: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    course_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    cycle_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    batch: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    needs_fee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "scheduling",
    },
    // Eligibility Conditions
    check_attendance: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    check_fee_clearance: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    attendance_threshold_eligible: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 75.0,
    },
    attendance_threshold_condonation: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 65.0,
    },
    condonation_fee_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    publish_eligibility: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "exam_cycles",
    schema: 'exams',
    underscored: true,
    timestamps: true,
  },
);

export default ExamCycle;
