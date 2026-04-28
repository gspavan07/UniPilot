import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

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
    current_admission_sequence: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    admission_number_prefix: {
      type: DataTypes.STRING,
      defaultValue: "ADM",
      allowNull: false,
    },
  },
  {
    tableName: "institution_settings",
    schema: 'settings',
    timestamps: true,
    underscored: true,
  }
);

export default InstitutionSetting;
