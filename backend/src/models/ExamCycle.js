const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamCycle = sequelize.define(
  "ExamCycle",
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
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "ongoing",
        "completed",
        "results_published"
      ),
      defaultValue: "scheduled",
    },
    batch_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    exam_type: {
      type: DataTypes.ENUM("mid_term", "semester_end", "re_exam", "internal"),
      defaultValue: "semester_end",
    },
  },
  {
    tableName: "exam_cycles",
    timestamps: true,
    underscored: true,
  }
);

module.exports = ExamCycle;
