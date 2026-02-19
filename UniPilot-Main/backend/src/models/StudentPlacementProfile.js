import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const StudentPlacementProfile = sequelize.define(
  "StudentPlacementProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    technical_skills: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    soft_skills: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    programming_languages: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    certifications: {
      type: DataTypes.JSONB,
    },
    projects: {
      type: DataTypes.JSONB,
    },
    internships: {
      type: DataTypes.JSONB,
    },
    achievements: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    linkedin_url: {
      type: DataTypes.STRING(255),
    },
    github_url: {
      type: DataTypes.STRING(255),
    },
    portfolio_url: {
      type: DataTypes.STRING(255),
    },
    resume_versions: {
      type: DataTypes.JSONB,
    },
    resume_url: {
      type: DataTypes.TEXT,
      comment: "URL/Path to the latest master resume",
    },
    profile_completion_percentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "student_placement_profiles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default StudentPlacementProfile;
