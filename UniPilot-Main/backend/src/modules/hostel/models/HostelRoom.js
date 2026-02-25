import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const HostelRoom = sequelize.define(
  "HostelRoom",
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
    floor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hostel_floors",
        key: "id",
      },
    },
    room_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current_occupancy: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    room_type: {
      type: DataTypes.ENUM("ac", "non_ac"),
      defaultValue: "non_ac",
    },
    amenities: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM("available", "occupied", "maintenance", "full"),
      defaultValue: "available",
    },
  },
  {
    tableName: "hostel_rooms",
    underscored: true,
    timestamps: true,
  },
);

export default HostelRoom;
