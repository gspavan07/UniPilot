const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SalaryStructure = sequelize.define(
  "SalaryStructure",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: "users", key: "id" },
    },
    basic_salary: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    grade_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "salary_grades",
        key: "id",
      },
    },
    hra: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    allowances: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Key-value pairs for other allowances",
    },
    deductions: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Key-value pairs for fixed deductions like PF, Tax",
    },
    effective_from: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "salary_structures",
    timestamps: true,
    underscored: true,
  }
);

SalaryStructure.associate = (models) => {
  SalaryStructure.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "staff",
  });
  SalaryStructure.belongsTo(models.SalaryGrade, {
    foreignKey: "grade_id",
    as: "grade",
  });
};

module.exports = SalaryStructure;
