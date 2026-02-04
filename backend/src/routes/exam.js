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
  getStudentAcademicDetails,
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
  createRegistrationOrder,
} = require("../controllers/examController");

// Reverification controllers
const {
  configureReverification,
  getReverificationRequests,
  closeReverificationWindow,
  reviewReverification,
  waiveReverificationFee,
} = require("../controllers/reverificationController");

const {
  getMyReverificationEligibility,
  applyForReverification,
  getMyReverificationRequests,
} = require("../controllers/studentReverificationController");

const {
  payReverificationFee,
} = require("../controllers/reverificationPaymentController");

const {
  applyWithPayment,
  createReverificationOrder,
} = require("../controllers/applyWithPaymentController");

// Script management controllers
const {
  uploadScripts,
  updateScriptVisibility,
  getUploadedScripts,
} = require("../controllers/scriptController");

const {
  getMyScripts,
  viewScript,
  payScriptViewAccess,
} = require("../controllers/studentScriptController");

const { authenticate, checkPermission } = require("../middleware/auth");
const { scriptUpload } = require("../middleware/scriptUpload");

const router = express.Router();

const upload = require("../middleware/upload");

router.use(authenticate);

router.get("/my-results", getMyResults);
router.get("/my-schedules", getMyExamSchedules);
router.get("/backlogs", getBacklogSubjects);
router.post("/register", registerForExams);
router.post("/create-order", createRegistrationOrder);
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
router.get(
  "/results/:studentId",
  checkPermission("exams:view"),
  getStudentAcademicDetails,
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

// ============================================
// REVERIFICATION ROUTES
// ============================================

// Exam Cell - Reverification Management
router.post(
  "/reverification/configure",
  checkPermission("exams:reverification:manage"),
  configureReverification,
);

router.get(
  "/reverification/requests",
  checkPermission("exams:reverification:view"),
  getReverificationRequests,
);

router.put(
  "/reverification/:id/review",
  checkPermission("exams:reverification:manage"),
  reviewReverification,
);

router.post(
  "/reverification/:id/waive-fee",
  checkPermission("exams:reverification:manage"),
  waiveReverificationFee,
);

router.post(
  "/reverification/:cycleId/close-window",
  checkPermission("exams:reverification:manage"),
  closeReverificationWindow,
);

// Student - Reverification
router.get("/my-reverification-eligibility", getMyReverificationEligibility);
router.post("/reverification/apply", applyForReverification);
router.post("/reverification/create-order", createReverificationOrder);
router.post("/reverification/apply-with-payment", applyWithPayment);
router.get("/my-reverification-requests", getMyReverificationRequests);
router.post("/reverification/pay", payReverificationFee);

// ============================================
// SCRIPT MANAGEMENT ROUTES
// ============================================

// Exam Cell - Script Management
router.post(
  "/scripts/upload",
  checkPermission("exams:scripts:manage"),
  scriptUpload.array("scripts", 100),
  uploadScripts,
);

router.put(
  "/scripts/visibility",
  checkPermission("exams:scripts:manage"),
  updateScriptVisibility,
);

router.get(
  "/scripts/uploaded",
  checkPermission("exams:scripts:view"),
  getUploadedScripts,
);

// Student - Script Viewing
router.get("/my-scripts", getMyScripts);
router.get("/scripts/:id/view", viewScript);
router.post("/scripts/pay-access", payScriptViewAccess);

module.exports = router;
