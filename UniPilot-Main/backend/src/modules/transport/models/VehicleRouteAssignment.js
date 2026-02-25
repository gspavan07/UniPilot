import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/database.js";

/**
 * VehicleRouteAssignment Model
 * Maps vehicles to routes with driver allocation
 */
const VehicleRouteAssignment = sequelize.define(
  "VehicleRouteAssignment",
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
      allowNull: false,
      references: {
        model: "transport_routes",
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
      comment: "Primary driver for this route",
    },
    conductor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "transport_drivers",
        key: "id",
      },
      comment: "Conductor/helper (optional)",
    },
    shift_type: {
      type: DataTypes.ENUM("morning", "evening", "both"),
      allowNull: false,
      defaultValue: "both",
      comment: "Which shift this assignment covers",
    },
    assigned_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Assignment start date",
    },
    assigned_to: {
      type: DataTypes.DATEONLY,
      comment: "Assignment end date (null if ongoing)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "vehicle_route_assignments",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["vehicle_id"] },
      { fields: ["route_id"] },
      { fields: ["driver_id"] },
      { fields: ["is_active"] },
    ],
  },
);

VehicleRouteAssignment.associate = (models) => {
  VehicleRouteAssignment.belongsTo(models.Vehicle, {
    foreignKey: "vehicle_id",
    as: "vehicle",
  });
  VehicleRouteAssignment.belongsTo(models.Route, {
    foreignKey: "route_id",
    as: "route",
  });
  VehicleRouteAssignment.belongsTo(models.TransportDriver, {
    foreignKey: "driver_id",
    as: "driver",
  });
  VehicleRouteAssignment.belongsTo(models.TransportDriver, {
    foreignKey: "conductor_id",
    as: "conductor",
  });
};

export default VehicleRouteAssignment;
