import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * Vehicle Model
 * Manages university transport vehicles (buses, vans)
 */
const Vehicle = sequelize.define(
  "Vehicle",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    registration_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "Vehicle registration number",
    },
    vehicle_type: {
      type: DataTypes.ENUM("bus", "van", "minibus"),
      allowNull: false,
      defaultValue: "bus",
    },
    seating_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Total seats available",
    },
    make_model: {
      type: DataTypes.STRING(100),
      comment: "Manufacturer and model (e.g., Tata Starbus)",
    },
    year_of_manufacture: {
      type: DataTypes.INTEGER,
      comment: "Manufacturing year",
    },
    insurance_number: {
      type: DataTypes.STRING(100),
      comment: "Insurance policy number",
    },
    insurance_expiry: {
      type: DataTypes.DATEONLY,
      comment: "Insurance expiry date",
    },
    fitness_certificate_expiry: {
      type: DataTypes.DATEONLY,
      comment: "Fitness certificate expiry date",
    },
    rc_book_number: {
      type: DataTypes.STRING(100),
      comment: "Registration certificate number",
    },
    current_mileage: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: "Current odometer reading in km",
    },
    status: {
      type: DataTypes.ENUM("active", "maintenance", "retired"),
      defaultValue: "active",
      comment: "Operational status",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "transport_vehicles",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["registration_number"], unique: true },
      { fields: ["status"] },
      { fields: ["is_active"] },
    ],
  },
);

Vehicle.associate = (models) => {
  Vehicle.hasMany(models.VehicleRouteAssignment, {
    foreignKey: "vehicle_id",
    as: "assignments",
  });
  Vehicle.hasMany(models.SpecialTrip, {
    foreignKey: "vehicle_id",
    as: "special_trips",
  });
  Vehicle.hasMany(models.TripLog, {
    foreignKey: "vehicle_id",
    as: "trip_logs",
  });
};

export default Vehicle;
