import express from "express";
const router = express.Router();
import hostelController from "../controllers/hostelController.js";
import finesController from "../controllers/hostelFinesController.js";
import roomBillsController from "../controllers/hostelRoomBillsController.js";
import gatePassController from "../controllers/hostelGatePassController.js";
import reportController from "../controllers/hostelReportController.js";
import {
  authenticate,
  checkPermission as authorize,
} from "../../../middleware/auth.js";

// All routes require authentication
router.use(authenticate);

// ============================================
// BUILDING MANAGEMENT
// ============================================
router.get(
  "/buildings",
  authorize("hostel:read"),
  hostelController.getBuildings,
);
router.post(
  "/buildings",
  authorize("hostel:write"),
  hostelController.createBuilding,
);
router.put(
  "/buildings/:id",
  authorize("hostel:write"),
  hostelController.updateBuilding,
);
router.delete(
  "/buildings/:id",
  authorize("hostel:delete"),
  hostelController.deleteBuilding,
);

// ============================================
// ROOM MANAGEMENT
// ============================================
router.get("/rooms", authorize("hostel:read"), hostelController.getRooms);
router.get(
  "/rooms/available",
  authorize("hostel:read"),
  hostelController.getAvailableRooms,
);
router.post("/rooms", authorize("hostel:write"), hostelController.createRoom);
router.put(
  "/rooms/:id",
  authorize("hostel:write"),
  hostelController.updateRoom,
);
router.delete(
  "/rooms/:id",
  authorize("hostel:delete"),
  hostelController.deleteRoom,
);
router.put(
  "/rooms/:id/status",
  authorize("hostel:write"),
  hostelController.updateRoomStatus,
);

// ============================================
// STUDENT ALLOCATION
// ============================================
router.get(
  "/allocations",
  authorize("hostel:read"),
  hostelController.getAllocations,
);
router.post(
  "/allocations",
  authorize("hostel:write"),
  hostelController.allocateStudent,
);
router.put(
  "/allocations/:id",
  authorize("hostel:write"),
  hostelController.updateAllocation,
);
router.delete(
  "/allocations/:id",
  authorize("hostel:delete"),
  hostelController.deleteAllocation,
);
router.get(
  "/allocations/:id/history",
  authorize("hostel:read"),
  hostelController.getStayHistory,
);
router.post(
  "/allocations/:id/checkout",
  authorize("hostel:write"),
  hostelController.checkoutStudent,
);

// ============================================
// FEE MANAGEMENT
// ============================================
router.get(
  "/fee-structures",
  authorize("hostel:read"),
  hostelController.getFeeStructures,
);
router.post(
  "/fee-structures",
  authorize("hostel:write"),
  hostelController.createFeeStructure,
);
router.put(
  "/fee-structures/:id",
  authorize("hostel:write"),
  hostelController.updateFeeStructure,
);
router.delete(
  "/fee-structures/:id",
  authorize("hostel:delete"),
  hostelController.deleteFeeStructure,
);

router.get(
  "/mess-fee-structures",
  authorize("hostel:read"),
  hostelController.getMessFeeStructures,
);
router.post(
  "/mess-fee-structures",
  authorize("hostel:write"),
  hostelController.createMessFeeStructure,
);
router.put(
  "/mess-fee-structures/:id",
  authorize("hostel:write"),
  hostelController.updateMessFeeStructure,
);
router.delete(
  "/mess-fee-structures/:id",
  authorize("hostel:delete"),
  hostelController.deleteMessFeeStructure,
);

// ============================================
// COMPLAINTS
// ============================================
router.get("/complaints", hostelController.getComplaints);
router.post("/complaints", hostelController.createComplaint);
router.put(
  "/complaints/:id",
  authorize("hostel:write"),
  hostelController.updateComplaint,
);

// ============================================
// ATTENDANCE
// ============================================
router.get(
  "/attendance",
  authorize("hostel:read"),
  hostelController.getAttendance,
);
router.post(
  "/attendance",
  authorize("hostel:write"),
  hostelController.markAttendance,
);

// ============================================
// GATE PASS
// ============================================
router.get("/gate-passes", gatePassController.getGatePasses);
router.post("/gate-passes", gatePassController.requestGatePass);
router.put(
  "/gate-passes/:id/verify",
  authorize("hostel:write"),
  gatePassController.verifyOtpAndApprove,
);
router.put(
  "/gate-passes/:id/reject",
  authorize("hostel:write"),
  gatePassController.rejectGatePass,
);
router.put(
  "/gate-passes/:id/return",
  authorize("hostel:write"),
  hostelController.markGatePassReturn,
);

// ============================================
// FINES MANAGEMENT
// ============================================
router.post("/fines", authorize("hostel:manage"), finesController.issueFine);
router.get("/fines", authorize("hostel:read"), finesController.getAllFines);
router.get(
  "/students/:studentId/fines",
  authorize("hostel:read"),
  finesController.getStudentFines,
);
router.put(
  "/fines/:id",
  authorize("hostel:manage"),
  finesController.updateFine,
);
router.delete(
  "/fines/:id",
  authorize("hostel:manage"),
  finesController.deleteFine,
);

// ============================================
// ROOM BILLS MANAGEMENT
// ============================================
router.post(
  "/room-bills",
  authorize("hostel:manage"),
  roomBillsController.createRoomBill,
);
router.post(
  "/room-bills/:id/distribute",
  authorize("hostel:manage"),
  roomBillsController.distributeRoomBill,
);
router.get(
  "/room-bills",
  authorize("hostel:read"),
  roomBillsController.getAllRoomBills,
);
router.get(
  "/rooms/:roomId/bills",
  authorize("hostel:read"),
  roomBillsController.getRoomBills,
);
router.put(
  "/room-bills/:id",
  authorize("hostel:manage"),
  roomBillsController.updateRoomBill,
);
router.delete(
  "/room-bills/:id",
  authorize("hostel:manage"),
  roomBillsController.deleteRoomBill,
);

// Bulk billing routes
router.get(
  "/rooms/billing-view",
  authorize("hostel:read"),
  roomBillsController.getRoomsForBilling,
);
router.get(
  "/rooms/billing-template",
  authorize("hostel:read"),
  roomBillsController.downloadBillingTemplate,
);
router.post(
  "/room-bills/bulk-create",
  authorize("hostel:manage"),
  roomBillsController.bulkCreateBills,
);

// ============================================
// REPORTS & DASHBOARD
// ============================================
router.get(
  "/reports/occupancy",
  authorize("hostel:read"),
  hostelController.getOccupancyReport,
);
router.get(
  "/dashboard/stats",
  authorize("hostel:read"),
  hostelController.getDashboardStats,
);

router.get(
  "/reports/download/occupancy",
  authorize("hostel:read"),
  reportController.downloadOccupancyReport,
);
router.get(
  "/reports/download/attendance",
  authorize("hostel:read"),
  reportController.downloadAttendanceReport,
);
router.get(
  "/reports/download/complaints",
  authorize("hostel:read"),
  reportController.downloadComplaintReport,
);
router.get(
  "/reports/download/gate-passes",
  authorize("hostel:read"),
  reportController.downloadGatePassReport,
);

export default router;
