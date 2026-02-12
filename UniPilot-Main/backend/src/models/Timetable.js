const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Timetable = sequelize.define(
  "Timetable",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    program_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "programs", key: "id" },
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    academic_year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "timetables",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Timetable;
