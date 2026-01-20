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
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "ongoing",
        "completed",
        "results_published",
      ),
      defaultValue: "scheduled",
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
      type: DataTypes.ENUM("mid_term", "semester_end", "re_exam", "internal"),
      defaultValue: "semester_end",
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
    instance_number: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "1st Mid, 2nd Mid, etc.",
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
  },
  {
    tableName: "exam_cycles",
    timestamps: true,
    underscored: true,
  },
);

module.exports = ExamCycle;
