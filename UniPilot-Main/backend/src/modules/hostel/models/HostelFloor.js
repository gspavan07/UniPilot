import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const HostelFloor = sequelize.define(
  "HostelFloor",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    building_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hostel_buildings",
        key: "id",
      },
    },
    floor_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_rooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    occupied_rooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "hostel_floors",
    schema: 'hostel',
    underscored: true,
    timestamps: true,
  },
);

export default HostelFloor;
