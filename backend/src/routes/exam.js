const express = require("express");
const {
  getExamCycles,
  createExamCycle,
  updateExamCycle,
  deleteExamCycle,
  addSchedule,
  getExamSchedules,
  updateExamSchedule,
  deleteExamSchedule,
  autoGenerateTimetable,
  enterMarks,
  getMyResults,
  generateHallTickets,
} = require("../controllers/examController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

// Student routes
router.get("/my-results", getMyResults);

// Admin/Faculty routes
router.get("/cycles", checkPermission("exams:results:view"), getExamCycles);
router.post(
  "/cycles",
  checkPermission("academics:exams:manage"),
  createExamCycle
);
router.put(
  "/cycles/:id",
  checkPermission("academics:exams:manage"),
  updateExamCycle
);
router.delete(
  "/cycles/:id",
  checkPermission("academics:exams:manage"),
  deleteExamCycle
);
router.get(
  "/schedules",
  checkPermission("academics:exams:manage"),
  getExamSchedules
);
router.post(
  "/schedules",
  checkPermission("academics:exams:manage"),
  addSchedule
);
router.put(
  "/schedules/:id",
  checkPermission("academics:exams:manage"),
  updateExamSchedule
);
router.delete(
  "/schedules/:id",
  checkPermission("academics:exams:manage"),
  deleteExamSchedule
);
router.post(
  "/schedules/auto-generate",
  checkPermission("academics:exams:manage"),
  autoGenerateTimetable
);
router.post("/marks/bulk", checkPermission("exams:manage"), enterMarks);
router.post(
  "/hall-ticket/generate",
  checkPermission("exams:manage"),
  generateHallTickets
);

module.exports = router;
