import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * TransportDriver Model
 * Manages transport drivers and staff (separate from HR employees)
 */
const TransportDriver = sequelize.define(
  "TransportDriver",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      validate: {
        isEmail: true,
      },
    },
    driver_license_number: {
      type: DataTypes.STRING(50),
      unique: true,
      comment: "Driving license number",
    },
    license_expiry: {
      type: DataTypes.DATEONLY,
      comment: "License expiry date",
    },
    address: {
      type: DataTypes.TEXT,
      comment: "Residential address",
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
    },
    date_of_joining: {
      type: DataTypes.DATEONLY,
      comment: "Date of joining as transport staff",
    },
    staff_type: {
      type: DataTypes.ENUM("driver", "conductor", "helper"),
      allowNull: false,
      defaultValue: "driver",
      comment: "Type of transport staff",
    },
    emergency_contact_name: {
      type: DataTypes.STRING(100),
      comment: "Emergency contact person name",
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
      comment: "Emergency contact phone",
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Background verification status",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "transport_drivers",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["driver_license_number"], unique: true },
      { fields: ["staff_type"] },
      { fields: ["is_active"] },
    ],
  },
);

TransportDriver.associate = (models) => {
  TransportDriver.hasMany(models.VehicleRouteAssignment, {
    foreignKey: "driver_id",
    as: "driver_assignments",
  });
  TransportDriver.hasMany(models.VehicleRouteAssignment, {
    foreignKey: "conductor_id",
    as: "conductor_assignments",
  });
  TransportDriver.hasMany(models.SpecialTrip, {
    foreignKey: "driver_id",
    as: "special_trips",
  });
  TransportDriver.hasMany(models.TripLog, {
    foreignKey: "driver_id",
    as: "trip_logs",
  });
};

TransportDriver.prototype.getFullName = function () {
  return `${this.first_name} ${this.last_name}`;
};

export default TransportDriver;
