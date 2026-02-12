const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const JobPosting = sequelize.define(
  "JobPosting",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    job_description: {
      type: DataTypes.TEXT,
    },
    ctc_lpa: {
      type: DataTypes.DECIMAL(5, 2),
    },
    ctc_breakdown: {
      type: DataTypes.JSONB,
    },
    work_location: {
      type: DataTypes.STRING(255),
    },
    bond_details: {
      type: DataTypes.TEXT,
    },
    number_of_positions: {
      type: DataTypes.INTEGER,
    },
    application_deadline: {
      type: DataTypes.DATE,
    },
    required_skills: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    preferred_skills: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    jd_document_url: {
      type: DataTypes.STRING(500),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "job_postings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = JobPosting;
