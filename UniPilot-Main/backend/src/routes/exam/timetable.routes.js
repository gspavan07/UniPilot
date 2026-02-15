const express = require("express");
const router = express.Router({ mergeParams: true });
const { authenticate } = require("../../middleware/auth");
const { auditMiddleware } = require("../../middleware/exam/auditMiddleware");
const timetableController = require("../../controllers/exam/timetableController");

// Apply authentication to all routes
router.use(authenticate);

// Timetable routes for a specific cycle
router.get("/:cycleId/timetables", timetableController.getTimetablesByCycle);
router.post(
  "/:cycleId/timetables",
  auditMiddleware("CREATE", "EXAM_TIMETABLE"),
  timetableController.addTimetableEntry,
);
router.post(
  "/:cycleId/timetables/auto-generate",
  auditMiddleware("GENERATE", "EXAM_TIMETABLE"),
  timetableController.autoGenerateTimetable,
);
router.delete(
  "/:cycleId/timetables/all",
  auditMiddleware("DELETE_ALL", "EXAM_TIMETABLE"),
  timetableController.deleteAllTimetables,
);

// Individual timetable entry routes
router.put(
  "/timetables/:id",
  auditMiddleware("UPDATE", "EXAM_TIMETABLE"),
  timetableController.updateTimetableEntry,
);
router.delete(
  "/timetables/:id",
  auditMiddleware("DELETE", "EXAM_TIMETABLE"),
  timetableController.deleteTimetableEntry,
);

module.exports = router;
