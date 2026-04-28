import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const HostelBuilding = sequelize.define(
  "HostelBuilding",
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
    type: {
      type: DataTypes.ENUM("boys", "girls", "mixed"),
      allowNull: false,
    },
    total_floors: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_rooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    address: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "maintenance"),
      defaultValue: "active",
    },
  },
  {
    tableName: "hostel_buildings",
    schema: 'hostel',
    underscored: true,
    timestamps: true,
  },
);

export default HostelBuilding;
