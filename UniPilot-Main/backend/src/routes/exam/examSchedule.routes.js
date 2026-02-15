const express = require("express");
const router = express.Router();
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByRegulation,
} = require("../../controllers/exam/examScheduleController");
const { auditMiddleware } = require("../../middleware/exam/auditMiddleware");
const { authenticate } = require("../../middleware/auth");

// Get all exam schedules
router.get("/", authenticate, getAllSchedules);

// Get schedules by regulation
router.get("/regulation/:regulationId", authenticate, getSchedulesByRegulation);

// Get schedule by ID
router.get("/:id", authenticate, getScheduleById);

// Create new exam schedule
router.post(
  "/",
  authenticate,
  auditMiddleware("CREATE", "EXAM_SCHEDULE"),
  createSchedule,
);

// Update exam schedule
router.put(
  "/:id",
  authenticate,
  auditMiddleware("UPDATE", "EXAM_SCHEDULE"),
  updateSchedule,
);

// Delete exam schedule
router.delete(
  "/:id",
  authenticate,
  auditMiddleware("DELETE", "EXAM_SCHEDULE"),
  deleteSchedule,
);

module.exports = router;
