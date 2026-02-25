import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    block_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "blocks", key: "id" },
    },
    room_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    floor_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "classroom",
        "lab",
        "seminar_hall",
        "staff_room",
        "auditorium",
        "utility",
      ),
      defaultValue: "classroom",
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    exam_capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
    seating_config: {
      type: DataTypes.JSONB,
    },
    facilities: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "rooms",
    timestamps: true,
    underscored: true,
  },
);

export default Room;
