const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StudentApplication = sequelize.define(
  "StudentApplication",
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
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    registration_form_data: {
      type: DataTypes.JSONB,
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_eligible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    eligibility_check_data: {
      type: DataTypes.JSONB,
    },
    status: {
      type: DataTypes.ENUM(
        "applied",
        "withdrawn",
        "shortlisted",
        "rejected",
        "placed",
      ),
      defaultValue: "applied",
    },
    current_round_id: {
      type: DataTypes.UUID,
    },
    withdrawal_reason: {
      type: DataTypes.TEXT,
    },
    withdrawn_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "student_applications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["drive_id", "student_id"],
      },
    ],
  },
);

module.exports = StudentApplication;
