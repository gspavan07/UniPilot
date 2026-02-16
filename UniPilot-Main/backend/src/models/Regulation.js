const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * Regulation Model
 * Represents an academic regulation version (e.g., R18, R23).
 * Courses and Grading logic are often tied to specific regulations.
 */
const Regulation = sequelize.define(
  "Regulation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    academic_year: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("semester", "year"),
      defaultValue: "semester",
    },
    grading_system: {
      type: DataTypes.STRING(100),
      defaultValue: "CBCS",
    },
    description: {
      type: DataTypes.TEXT,
    },

    courses_list: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment:
        "Mapping of courses: { 'program_id': { 'batch_year': { 'Semester Number': [Course IDs] } } }",
    },
    exam_configuration: {
      type: DataTypes.JSONB,
      defaultValue: { course_types: [] },
      comment:
        "Exam configuration for different course types with hierarchical component structure, relations, and max marks",
    },
    grade_scale: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Array of grade mappings: [{grade, min, max, points}]",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "regulations",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Regulation;
