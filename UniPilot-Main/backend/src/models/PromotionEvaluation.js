const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PromotionEvaluation = sequelize.define(
  "PromotionEvaluation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    from_semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    to_semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    evaluation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    attendance_percentage: {
      type: DataTypes.DECIMAL(5, 2),
    },
    attendance_met: {
      type: DataTypes.BOOLEAN,
    },
    cgpa: {
      type: DataTypes.DECIMAL(3, 2),
    },
    cgpa_met: {
      type: DataTypes.BOOLEAN,
    },
    backlogs_count: {
      type: DataTypes.INTEGER,
    },
    backlogs_met: {
      type: DataTypes.BOOLEAN,
    },
    fee_cleared: {
      type: DataTypes.BOOLEAN,
    },
    overall_eligible: {
      type: DataTypes.BOOLEAN,
    },
    final_status: {
      type: DataTypes.STRING(50), // PROMOTED, DETAINED, SEMESTER_BACK
    },
    remarks: {
      type: DataTypes.TEXT,
    },
    processed_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "promotion_evaluations",
    timestamps: true,
    underscored: true,
  }
);

module.exports = PromotionEvaluation;
