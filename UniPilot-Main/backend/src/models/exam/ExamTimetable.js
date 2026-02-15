const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

/**
 * ExamTimetable Model
 * Individual exam schedule entries with support for sessions and roll number ranges
 */
const ExamTimetable = sequelize.define(
  "exam_timetable",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    exam_cycle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "exam_cycles",
        key: "id",
      },
    },
    program_id: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      comment: "Array of program IDs that share this exam",
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
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
    session: {
      type: DataTypes.STRING(20),
      defaultValue: "full_day",
    },
    roll_number_range: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    assigned_faculty_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Faculty assigned for invigilation",
    },
    paper_format: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Structure of question paper with questions, marks, and CO mapping",
    },
    exam_status: {
      type: DataTypes.STRING(20),
      defaultValue: "assigned",
      allowNull: false,
      comment: "Status: assigned, format_submitted, approved",
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    tableName: "exam_timetables",
    underscored: true,
    timestamps: true,
  },
);

module.exports = ExamTimetable;
