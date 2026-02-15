const { DataTypes } = require("sequelize");
const sequelize = require("../config/db_connection");

const Department = sequelize.define(
  "Department",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    type: DataTypes.STRING,
  },
  {
    tableName: "departments",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Department;
