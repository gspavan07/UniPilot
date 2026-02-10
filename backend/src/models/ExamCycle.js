const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamCycle = sequelize.define(
  "ExamCycle",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "scheduling",
        "scheduled",
        "ongoing",
        "completed",
        "results_published",
      ),
      defaultValue: "scheduling",
    },
    batch_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    exam_type: {
      type: DataTypes.ENUM("mid_term_1", "mid_term_2", "semester_end_external", "re_exam", "internal_lab", "external_lab"),
      defaultValue: "semester_end_external",
    },
    weightage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Legacy field - use regulation.exam_structure instead",
    },
    regulation_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "regulations",
        key: "id",
      },
      comment: "Links to regulation for exam structure configuration",
    },
    cycle_type: {
      type: DataTypes.STRING(50),
      comment:
        "Type from regulation config: mid_term, end_semester, internal_lab, external_lab, project_review",
    },

    exam_mode: {
      type: DataTypes.STRING(50),
      defaultValue: "regular",
      comment: "Selection for end_semester: regular, supplementary, combined",
    },
    component_breakdown: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment:
        "Component structure copied from regulation: [{name, max_marks}]",
    },
    max_marks: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    passing_marks: {
      type: DataTypes.INTEGER,
      defaultValue: 35,
    },
    reg_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    reg_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    reg_late_fee_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    regular_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    supply_fee_per_paper: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    late_fee_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    is_attendance_checked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_fee_checked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    attendance_condonation_threshold: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 75.0,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
      comment: "Attendance % below which admin condonation is required",
    },
    attendance_permission_threshold: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 65.0,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
      comment:
        "Attendance % below which HOD permission is required with condonation",
    },
    is_reverification_open: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "Whether reverification window is open for this exam cycle",
    },
    reverification_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Start date for reverification applications",
    },
    reverification_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "End date for reverification applications",
    },
    reverification_fee_per_paper: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
      comment: "Fee charged per subject for reverification",
    },
    is_script_view_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "Whether answer script viewing is enabled",
    },
    script_view_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
      comment: "One-time fee for accessing answer scripts (0 if free)",
    },
    condonation_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
      comment: "Fee charged for attendance condonation",
    },
    exam_month: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Month of the examination (e.g., Jan, Feb)",
    },
    exam_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Year of the examination (e.g., 2024)",
    },
  },
  {
    tableName: "exam_cycles",
    timestamps: true,
    underscored: true,
  },
);

module.exports = ExamCycle;
