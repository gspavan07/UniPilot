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
  getBacklogSubjects,
  registerForExams,
  getRegistrationStatus,
  getRegistrations,
  updateRegistrationStatus,
  bulkUpdateRegistrationStatus,
  getMyRegistrations,
  downloadReceipt,
  waiveExamFine,
  downloadHallTicket,
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
router.get("/backlogs", getBacklogSubjects);
router.post("/register", registerForExams);
router.get("/registration/status/:cycleId", getRegistrationStatus);
router.get("/registration/:cycleId/download-hall-ticket", downloadHallTicket);

// Admin/Faculty routes
// Exam cycles (Students can view filtered cycles, Admins view all)
router.get("/cycles", getExamCycles);
router.post("/cycles", checkPermission("exams:manage"), createExamCycle);
router.put("/cycles/:id", checkPermission("exams:manage"), updateExamCycle);
router.delete("/cycles/:id", checkPermission("exams:manage"), deleteExamCycle);
// Exam schedules (Students can view filtered schedules for their cycle)
router.get("/schedules", getExamSchedules);
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

router.get(
  "/registrations/:cycleId",
  checkPermission("exams:manage"),
  getRegistrations,
);

router.get(
  "/my-registrations",
  checkPermission("exams:view"),
  getMyRegistrations,
);

router.get(
  "/registration/:id/receipt",
  checkPermission("exams:view"),
  downloadReceipt,
);

router.put(
  "/registration/:id",
  checkPermission("exams:manage"),
  updateRegistrationStatus,
);

router.put(
  "/registrations/bulk-override",
  checkPermission("exams:manage"),
  bulkUpdateRegistrationStatus,
);

router.post(
  "/registration/:id/waive-fine",
  checkPermission("exams:manage"),
  waiveExamFine,
);

module.exports = router;
