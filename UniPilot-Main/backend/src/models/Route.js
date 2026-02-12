const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * Route Model
 * Represents transport routes (e.g., Route 1 - Kakinada)
 */
const Route = sequelize.define(
  "Route",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Route name (e.g., Route 1 - Kakinada)",
    },
    route_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: "Unique route code (e.g., R001)",
    },
    distance_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Total distance in kilometers",
    },
    start_location: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Starting point of the route",
    },
    end_location: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: "University Campus",
      comment: "Ending point (usually university)",
    },
    description: {
      type: DataTypes.TEXT,
      comment: "Additional route details",
    },
    morning_start_time: {
      type: DataTypes.TIME,
      comment: "Morning trip start time",
    },
    evening_start_time: {
      type: DataTypes.TIME,
      comment: "Evening trip start time",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether route is currently operational",
    },
  },
  {
    tableName: "transport_routes",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["route_code"], unique: true },
      { fields: ["is_active"] },
    ],
  },
);

Route.associate = (models) => {
  Route.hasMany(models.TransportStop, {
    foreignKey: "route_id",
    as: "stops",
  });
  Route.hasMany(models.VehicleRouteAssignment, {
    foreignKey: "route_id",
    as: "assignments",
  });
  Route.hasMany(models.StudentRouteAllocation, {
    foreignKey: "route_id",
    as: "allocations",
  });
  Route.hasMany(models.TripLog, {
    foreignKey: "route_id",
    as: "trip_logs",
  });
};

module.exports = Route;
