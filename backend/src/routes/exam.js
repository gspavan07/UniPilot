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
  getScheduleMarks,
  getMarkEntryData,
  updateModerationStatus,
  getConsolidatedResults,
  getMyResults,
  getMyExamSchedules,
  generateHallTickets,
  bulkImportMarks,
  downloadImportTemplate,
  bulkPublishResults,
} = require("../controllers/examController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

const upload = require("../middleware/upload");

router.use(authenticate);

router.get("/my-results", getMyResults);
router.get("/my-schedules", getMyExamSchedules);

// Admin/Faculty routes
router.get("/cycles", checkPermission("exams:view"), getExamCycles);
router.post("/cycles", checkPermission("exams:manage"), createExamCycle);
router.put("/cycles/:id", checkPermission("exams:manage"), updateExamCycle);
router.delete("/cycles/:id", checkPermission("exams:manage"), deleteExamCycle);
router.get("/schedules", checkPermission("exams:view"), getExamSchedules);
router.post("/schedules", checkPermission("exams:manage"), addSchedule);
router.put(
  "/schedules/:id",
  checkPermission("exams:manage"),
  updateExamSchedule,
);
router.delete(
  "/schedules/:id",
  checkPermission("exams:manage"),
  deleteExamSchedule,
);
router.post(
  "/schedules/auto-generate",
  checkPermission("exams:manage"),
  autoGenerateTimetable,
);

// Marks & Results
router.get(
  "/marks/template",
  checkPermission("exams:manage"),
  downloadImportTemplate,
);
router.post(
  "/marks/bulk-import",
  checkPermission("exams:manage"),
  upload.single("file"),
  bulkImportMarks,
);
router.get(
  "/marks/:scheduleId",
  checkPermission("exams:results:entry"),
  getScheduleMarks,
);
router.get(
  "/marks/entry-data/:scheduleId",
  checkPermission("exams:results:entry"),
  getMarkEntryData,
);
router.post("/marks/bulk", checkPermission("exams:results:entry"), enterMarks);
router.put(
  "/marks/moderation",
  checkPermission("exams:results:publish"),
  updateModerationStatus,
);
router.post(
  "/marks/bulk-publish",
  checkPermission("exams:results:publish"),
  bulkPublishResults,
);
router.get(
  "/consolidated-results",
  checkPermission("exams:results:publish"),
  getConsolidatedResults,
);
router.post(
  "/hall-ticket/generate",
  checkPermission("exams:manage"),
  generateHallTickets,
);

module.exports = router;
