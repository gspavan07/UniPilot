import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * Course Model
 * Represents courses offered by departments
 */
const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Basic Information
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },

    // Course Details
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    course_type: {
      type: DataTypes.ENUM("theory", "lab", "project", "internship"),
      defaultValue: "theory",
    },

    // Relations
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "departments",
        key: "id",
      },
    },



    // Syllabus
    syllabus_url: {
      type: DataTypes.STRING(500),
      comment: "S3 URL or file path to syllabus PDF",
    },
    syllabus_data: {
      type: DataTypes.JSONB,
      defaultValue: [], // Structure: [{ unit: 1, title: "Intro", topics: ["Topic A", "Topic B"] }]
      comment: "Structured syllabus (Units and Topics)",
    },

    // Prerequisites
    prerequisites: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Array of course IDs that are prerequisites",
    },

    // Status
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    // Timestamps
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
    tableName: "courses",
    schema: 'academics',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["code"], unique: true },
      { fields: ["department_id"] },

      { fields: ["is_active"] },
    ],
  },
);

export default Course;
