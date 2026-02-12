const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DriveEligibility = sequelize.define(
  "DriveEligibility",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    drive_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    department_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
    },
    regulation_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
    },
    batch_ids: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      comment: "Eligible student joining years (e.g. 2022, 2023)",
    },
    min_cgpa: {
      type: DataTypes.DECIMAL(3, 2),
    },
    min_10th_percent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    min_inter_percent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    max_active_backlogs: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    max_total_backlogs: {
      type: DataTypes.INTEGER,
    },
    min_semester: {
      type: DataTypes.INTEGER,
    },
    max_semester: {
      type: DataTypes.INTEGER,
    },
    custom_conditions: {
      type: DataTypes.JSONB,
    },
  },
  {
    tableName: "drive_eligibility",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = DriveEligibility;
