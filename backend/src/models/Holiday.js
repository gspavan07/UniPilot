const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Holiday = sequelize.define(
  "Holiday",
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "holidays",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Holiday;
