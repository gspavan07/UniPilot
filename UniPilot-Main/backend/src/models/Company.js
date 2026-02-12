const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    industry: {
      type: DataTypes.STRING(100),
    },
    location: {
      type: DataTypes.STRING(255),
    },
    website: {
      type: DataTypes.STRING(255),
    },
    company_tier: {
      type: DataTypes.ENUM("dream", "super_dream", "regular"),
      defaultValue: "regular",
    },
    tier_package_min: {
      type: DataTypes.DECIMAL(5, 2),
    },
    logo_url: {
      type: DataTypes.STRING(500),
    },
    description: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "companies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Company;
