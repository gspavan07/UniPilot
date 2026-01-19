const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const FeeStructure = sequelize.define(
  "FeeStructure",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "fee_categories", key: "id" },
    },
    program_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "programs", key: "id" },
    },
    batch_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2025,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_optional: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    applies_to: {
      type: DataTypes.ENUM("all", "hostellers", "day_scholars"),
      defaultValue: "all",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "fee_structures",
    timestamps: true,
    underscored: true,
  },
);

module.exports = FeeStructure;
