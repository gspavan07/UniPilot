import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const HostelBed = sequelize.define(
  "HostelBed",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "hostel_rooms",
        key: "id",
      },
    },
    bed_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("available", "occupied", "maintenance"),
      defaultValue: "available",
    },
  },
  {
    tableName: "hostel_beds",
    schema: 'hostel',
    underscored: true,
    timestamps: true,
  },
);

export default HostelBed;
