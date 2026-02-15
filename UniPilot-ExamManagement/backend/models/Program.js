const { DataTypes } = require("sequelize");
const sequelize = require("../config/db_connection");

const Program = sequelize.define(
  "Program",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
  },
  {
    tableName: "programs",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Program;
