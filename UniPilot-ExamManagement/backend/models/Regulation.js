const { DataTypes } = require("sequelize");
const sequelize = require("../config/db_connection");

const Regulation = sequelize.define(
  "Regulation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
  },
  {
    tableName: "regulations",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Regulation;
