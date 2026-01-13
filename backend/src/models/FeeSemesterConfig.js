const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const FeeSemesterConfig = sequelize.define(
  "FeeSemesterConfig",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    program_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    batch_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    fine_type: {
      type: DataTypes.ENUM("none", "fixed", "percentage"),
      defaultValue: "none",
    },
    fine_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: "fee_semester_configs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["program_id", "batch_year", "semester"],
      },
    ],
  }
);

module.exports = FeeSemesterConfig;
