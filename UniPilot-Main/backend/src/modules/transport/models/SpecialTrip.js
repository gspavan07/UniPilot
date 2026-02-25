import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * SpecialTrip Model
 * Manages special/extra trips for events and field trips
 */
const SpecialTrip = sequelize.define(
  "SpecialTrip",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trip_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Trip purpose (e.g., Industrial Visit - CSE)",
    },
    trip_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "transport_vehicles",
        key: "id",
      },
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "transport_drivers",
        key: "id",
      },
    },
    destination: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Destination location",
    },
    departure_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    return_time: {
      type: DataTypes.TIME,
      comment: "Expected return time",
    },
    purpose: {
      type: DataTypes.TEXT,
      comment: "Detailed purpose of the trip",
    },
    requested_by: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
      comment: "User who requested the trip",
    },
    approved_by: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Transport admin who approved",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "completed", "cancelled"),
      defaultValue: "pending",
    },
    total_passengers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of passengers",
    },
    remarks: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "special_trips",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["trip_date"] },
      { fields: ["vehicle_id"] },
      { fields: ["status"] },
    ],
  },
);

SpecialTrip.associate = (models) => {
  SpecialTrip.belongsTo(models.Vehicle, {
    foreignKey: "vehicle_id",
    as: "vehicle",
  });
  SpecialTrip.belongsTo(models.TransportDriver, {
    foreignKey: "driver_id",
    as: "driver",
  });
  SpecialTrip.belongsTo(models.User, {
    foreignKey: "requested_by",
    as: "requester",
  });
  SpecialTrip.belongsTo(models.User, {
    foreignKey: "approved_by",
    as: "approver",
  });
};

export default SpecialTrip;
