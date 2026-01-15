const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const InstitutionSetting = sequelize.define(
  "InstitutionSetting",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    setting_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "institution_settings",
    timestamps: true,
    underscored: true,
  }
);

module.exports = InstitutionSetting;
