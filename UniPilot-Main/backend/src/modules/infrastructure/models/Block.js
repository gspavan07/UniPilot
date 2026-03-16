import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const Block = sequelize.define(
  "Block",
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
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM("academic", "administrative", "hostel", "other"),
      defaultValue: "academic",
    },
    description: {
      type: DataTypes.TEXT,
    },
    total_floors: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    image_url: {
      type: DataTypes.STRING,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "blocks",
    schema: 'infrastructure',
    timestamps: true,
    underscored: true,
  },
);

export default Block;
