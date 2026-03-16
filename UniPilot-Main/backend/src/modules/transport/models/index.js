import Route from "./Route.js";
import TransportStop from "./TransportStop.js";
import Vehicle from "./Vehicle.js";
import TransportDriver from "./TransportDriver.js";
import VehicleRouteAssignment from "./VehicleRouteAssignment.js";
import StudentRouteAllocation from "./StudentRouteAllocation.js";
import SpecialTrip from "./SpecialTrip.js";
import TripLog from "./TripLog.js";

export {
  Route,
  TransportStop,
  Vehicle,
  TransportDriver,
  VehicleRouteAssignment,
  StudentRouteAllocation,
  SpecialTrip,
  TripLog,
};

// -----------------------------------------------------------------------------
// Transport Module Internal Associations
// -----------------------------------------------------------------------------

Route.hasMany(TransportStop, { foreignKey: "route_id", as: "stops" });
TransportStop.belongsTo(Route, { foreignKey: "route_id", as: "route" });

Route.hasMany(VehicleRouteAssignment, { foreignKey: "route_id", as: "assignments" });
VehicleRouteAssignment.belongsTo(Route, { foreignKey: "route_id", as: "route" });

Vehicle.hasMany(VehicleRouteAssignment, { foreignKey: "vehicle_id", as: "assignments" });
VehicleRouteAssignment.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

VehicleRouteAssignment.belongsTo(TransportDriver, { foreignKey: "driver_id", as: "driver" });
VehicleRouteAssignment.belongsTo(TransportDriver, { foreignKey: "conductor_id", as: "conductor" });

Route.hasMany(StudentRouteAllocation, { foreignKey: "route_id", as: "student_allocations" });
StudentRouteAllocation.belongsTo(Route, { foreignKey: "route_id", as: "route" });

TransportStop.hasMany(StudentRouteAllocation, { foreignKey: "stop_id", as: "allocations" });
StudentRouteAllocation.belongsTo(TransportStop, { foreignKey: "stop_id", as: "stop" });

Vehicle.hasMany(SpecialTrip, { foreignKey: "vehicle_id", as: "special_trips" });
SpecialTrip.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

SpecialTrip.belongsTo(TransportDriver, { foreignKey: "driver_id", as: "driver" });

Vehicle.hasMany(TripLog, { foreignKey: "vehicle_id", as: "trip_logs" });
TripLog.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

TripLog.belongsTo(Route, { foreignKey: "route_id", as: "route" });
TripLog.belongsTo(TransportDriver, { foreignKey: "driver_id", as: "driver" });

export default {
  Route,
  TransportStop,
  Vehicle,
  TransportDriver,
  VehicleRouteAssignment,
  StudentRouteAllocation,
  SpecialTrip,
  TripLog,
};
