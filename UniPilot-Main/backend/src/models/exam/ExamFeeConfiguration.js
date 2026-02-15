const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

/**
 * ExamFeeConfiguration Model
 * Base fee configuration with registration date windows
 */
const ExamFeeConfiguration = sequelize.define(
  "exam_fee_configuration",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    exam_cycle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "exam_cycles",
        key: "id",
      },
    },
    base_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    regular_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    regular_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    final_registration_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "exam_fee_configurations",
    underscored: true,
    timestamps: true,
  },
);

module.exports = ExamFeeConfiguration;
