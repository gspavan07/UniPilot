const express = require("express");
const {
  markAttendance,
  getMyAttendance,
  applyLeave,
  getLeaveRequests,
  updateLeaveStatus,
  getTodayClasses,
  getAttendanceStats,
  getSessionAttendance,
} = require("../controllers/attendanceController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

// Student routes
router.get("/my-attendance", getMyAttendance);
router.post("/leave/apply", applyLeave);

// Faculty/Staff routes
router.post(
  "/mark",
  checkPermission("academics:attendance:manage"),
  markAttendance,
);
router.get(
  "/session/:id",
  checkPermission("academics:attendance:manage"),
  getSessionAttendance,
);
router.get(
  "/leave/requests",
  checkPermission("academics:attendance:manage"),
  getLeaveRequests,
);
router.put(
  "/leave/:id",
  checkPermission("academics:attendance:manage"),
  updateLeaveStatus,
);

router.get(
  "/faculty/today",
  checkPermission("academics:attendance:manage"),
  getTodayClasses,
);

router.get(
  "/stats",
  checkPermission("academics:attendance:manage"),
  getAttendanceStats,
);

module.exports = router;
