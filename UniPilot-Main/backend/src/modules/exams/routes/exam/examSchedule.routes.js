import express from "express";
const router = express.Router();
import {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByRegulation,
} from "../../controllers/exam/examScheduleController.js";
import { auditMiddleware } from "../../../../middleware/exam/auditMiddleware.js";
import { authenticate } from "../../../../middleware/auth.js";

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

export default router;
