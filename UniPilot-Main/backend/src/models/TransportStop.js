const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * TransportStop Model
 * Represents pickup/drop points along a route with zone-based pricing
 */
const TransportStop = sequelize.define(
  "TransportStop",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    route_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "transport_routes",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    stop_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Name of the stop (e.g., Gandhinagar Circle)",
    },
    stop_sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Order of stop on the route (1, 2, 3...)",
    },
    distance_from_start_km: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "Distance from route start in km",
    },
    zone_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Transport fee for this stop/zone",
    },
    morning_pickup_time: {
      type: DataTypes.TIME,
      comment: "Estimated morning pickup time",
    },
    evening_drop_time: {
      type: DataTypes.TIME,
      comment: "Estimated evening drop time",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether stop is currently in use",
    },
  },
  {
    tableName: "transport_stops",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["route_id"] },
      { fields: ["stop_sequence"] },
      { fields: ["is_active"] },
    ],
  },
);

TransportStop.associate = (models) => {
  TransportStop.belongsTo(models.Route, {
    foreignKey: "route_id",
    as: "route",
  });
  TransportStop.hasMany(models.StudentRouteAllocation, {
    foreignKey: "stop_id",
    as: "allocations",
  });
};

module.exports = TransportStop;
