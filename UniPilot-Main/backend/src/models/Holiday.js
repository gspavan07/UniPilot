import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Holiday = sequelize.define(
  "Holiday",
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
    },
    description: {
      type: DataTypes.TEXT,
    },
    target: {
      type: DataTypes.STRING(50),
      defaultValue: "staff",
      allowNull: false,
      validate: {
        isIn: [["staff", "student", "both"]],
      },
    },
  },
  {
    tableName: "holidays",
    timestamps: true,
    underscored: true,
  }
);

export default Holiday;
