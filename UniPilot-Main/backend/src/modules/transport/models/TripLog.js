import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * TripLog Model
 * Daily trip logging for accountability and tracking
 */
const TripLog = sequelize.define(
  "TripLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "transport_vehicles",
        key: "id",
      },
    },
    route_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "transport_routes",
        key: "id",
      },
      comment: "Route covered (nullable for special trips)",
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "transport_drivers",
        key: "id",
      },
    },
    trip_type: {
      type: DataTypes.ENUM("regular_morning", "regular_evening", "special"),
      allowNull: false,
      defaultValue: "regular_morning",
    },
    trip_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: "Actual start time",
    },
    end_time: {
      type: DataTypes.TIME,
      comment: "Actual end time",
    },
    start_mileage: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "Odometer at start",
    },
    end_mileage: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "Odometer at end",
    },
    distance_covered: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "Calculated distance in km",
    },
    fuel_consumed: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "Fuel consumption in liters",
    },
    students_transported: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of students",
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: "Any incidents or notes",
    },
    logged_by: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
      comment: "User who logged (driver or admin)",
    },
  },
  {
    tableName: "trip_logs",
    schema: 'transport',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["trip_date"] },
      { fields: ["vehicle_id"] },
      { fields: ["route_id"] },
      { fields: ["driver_id"] },
      { fields: ["trip_type"] },
    ],
  },
);

TripLog.associate = (models) => {
  TripLog.belongsTo(models.Vehicle, {
    foreignKey: "vehicle_id",
    as: "vehicle",
  });
  TripLog.belongsTo(models.Route, {
    foreignKey: "route_id",
    as: "route",
  });
  TripLog.belongsTo(models.TransportDriver, {
    foreignKey: "driver_id",
    as: "driver",
  });
  TripLog.belongsTo(models.User, {
    foreignKey: "logged_by",
    as: "logger",
  });
};

export default TripLog;
