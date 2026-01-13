const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const FeeCategory = sequelize.define(
  "FeeCategory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "fee_categories",
    timestamps: true,
    underscored: true,
  }
);

module.exports = FeeCategory;
