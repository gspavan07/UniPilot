const express = require("express");
const router = express.Router();
const transportController = require("../controllers/transportController");
const {
  authenticate: protect,
  checkPermission: authorize,
} = require("../middleware/auth");

// ============================================
// ROUTE MANAGEMENT
// ============================================

router.get(
  "/routes",
  protect,
  authorize("transport:read"),
  transportController.getRoutes,
);

router.post(
  "/routes",
  protect,
  authorize("transport:write"),
  transportController.createRoute,
);

router.put(
  "/routes/:id",
  protect,
  authorize("transport:write"),
  transportController.updateRoute,
);

router.delete(
  "/routes/:id",
  protect,
  authorize("transport:admin"),
  transportController.deleteRoute,
);

// ============================================
// STOP MANAGEMENT
// ============================================

router.post(
  "/stops",
  protect,
  authorize("transport:write"),
  transportController.createStop,
);

router.put(
  "/stops/:id",
  protect,
  authorize("transport:write"),
  transportController.updateStop,
);

router.delete(
  "/stops/:id",
  protect,
  authorize("transport:admin"),
  transportController.deleteStop,
);

// ============================================
// VEHICLE MANAGEMENT
// ============================================

router.get(
  "/vehicles",
  protect,
  authorize("transport:read"),
  transportController.getVehicles,
);

router.get(
  "/vehicles/expiring",
  protect,
  authorize("transport:read"),
  transportController.getExpiringVehicles,
);

router.post(
  "/vehicles",
  protect,
  authorize("transport:write"),
  transportController.createVehicle,
);

router.put(
  "/vehicles/:id",
  protect,
  authorize("transport:write"),
  transportController.updateVehicle,
);

router.delete(
  "/vehicles/:id",
  protect,
  authorize("transport:admin"),
  transportController.deleteVehicle,
);

// ============================================
// DRIVER MANAGEMENT
// ============================================

router.get(
  "/drivers",
  protect,
  authorize("transport:read"),
  transportController.getDrivers,
);

router.get(
  "/drivers/expiring-license",
  protect,
  authorize("transport:read"),
  transportController.getExpiringDriverLicenses,
);

router.post(
  "/drivers",
  protect,
  authorize("transport:write"),
  transportController.createDriver,
);

router.put(
  "/drivers/:id",
  protect,
  authorize("transport:write"),
  transportController.updateDriver,
);

router.delete(
  "/drivers/:id",
  protect,
  authorize("transport:admin"),
  transportController.deleteDriver,
);

// ============================================
// VEHICLE-ROUTE ASSIGNMENTS
// ============================================

router.get(
  "/assignments",
  protect,
  authorize("transport:read"),
  transportController.getAssignments,
);

router.post(
  "/assignments",
  protect,
  authorize("transport:write"),
  transportController.createAssignment,
);

router.put(
  "/assignments/:id",
  protect,
  authorize("transport:write"),
  transportController.updateAssignment,
);

router.delete(
  "/assignments/:id",
  protect,
  authorize("transport:admin"),
  transportController.deleteAssignment,
);

// ============================================
// STUDENT ROUTE ALLOCATIONS
// ============================================

router.get(
  "/allocations",
  protect,
  authorize("transport:read"),
  transportController.getAllocations,
);

router.post(
  "/allocations",
  protect,
  authorize("transport:write"),
  transportController.createAllocation,
);

router.put(
  "/allocations/:id",
  protect,
  authorize("transport:write"),
  transportController.updateAllocation,
);

router.delete(
  "/allocations/:id",
  protect,
  authorize("transport:write"),
  transportController.deleteAllocation,
);

router.post(
  "/sync-fees",
  protect,
  authorize("transport:admin"),
  transportController.syncSemesterFees,
);

// ============================================
// SPECIAL TRIPS
// ============================================

router.get(
  "/special-trips",
  protect,
  authorize("transport:read"),
  transportController.getSpecialTrips,
);

router.post(
  "/special-trips",
  protect,
  authorize("transport:write"),
  transportController.createSpecialTrip,
);

router.put(
  "/special-trips/:id",
  protect,
  authorize("transport:write"),
  transportController.updateSpecialTrip,
);

router.put(
  "/special-trips/:id/approve",
  protect,
  authorize("transport:admin"),
  transportController.approveSpecialTrip,
);

router.delete(
  "/special-trips/:id",
  protect,
  authorize("transport:admin"),
  transportController.deleteSpecialTrip,
);

// ============================================
// TRIP LOGS
// ============================================

router.get(
  "/trip-logs",
  protect,
  authorize("transport:read"),
  transportController.getTripLogs,
);

router.post(
  "/trip-logs",
  protect,
  authorize("transport:write"),
  transportController.createTripLog,
);

router.put(
  "/trip-logs/:id",
  protect,
  authorize("transport:write"),
  transportController.updateTripLog,
);

// ============================================
// ANALYTICS & REPORTS
// ============================================

router.get(
  "/analytics/route-utilization",
  protect,
  authorize("transport:read"),
  transportController.getRouteUtilization,
);

router.get(
  "/analytics/zone-revenue",
  protect,
  authorize("transport:read"),
  transportController.getZoneRevenue,
);

router.get(
  "/analytics/trip-stats",
  protect,
  authorize("transport:read"),
  transportController.getTripStats,
);

router.get(
  "/analytics/dashboard",
  protect,
  authorize("transport:read"),
  transportController.getDashboardOverview,
);

module.exports = router;
