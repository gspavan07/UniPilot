const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

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
    underscored: true,
    timestamps: true,
  },
);

module.exports = HostelBed;
