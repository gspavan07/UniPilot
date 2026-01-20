const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SemesterResult = sequelize.define(
  "SemesterResult",
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
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batch_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sgpa: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
    },
    total_credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    earned_credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_cycle_id: {
      type: DataTypes.UUID,
      references: { model: "exam_cycles", key: "id" },
    },
    published_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    published_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "semester_results",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["student_id", "semester", "batch_year"],
      },
    ],
  },
);

module.exports = SemesterResult;
