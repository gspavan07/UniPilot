const { DataTypes } = require("sequelize");
const sequelize = require("../config/db_connection");

const SalaryGrade = sequelize.define(
  "SalaryGrade",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
  },
  {
    tableName: "salary_grades",
    timestamps: true,
    underscored: true,
  },
);

module.exports = SalaryGrade;
