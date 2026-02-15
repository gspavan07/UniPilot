const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");
const { auditMiddleware } = require("../../middleware/exam/auditMiddleware");
const cycleController = require("../../controllers/exam/examCycleController");
const eligibilityController = require("../../controllers/exam/examEligibilityController");
const helperController = require("../../controllers/exam/helperController");
const timetableRoutes = require("./timetable.routes");
const feeConfigRoutes = require("./feeConfig.routes");

// Apply authentication to all routes
router.use(authenticate);

// Eligibility endpoints
router.get("/my/eligibility", eligibilityController.getStudentEligibility);
router.get(
  "/:cycle_id/eligibilities",
  eligibilityController.getCycleEligibilities,
);
router.post("/eligibility/bypass", eligibilityController.updateBypass);
router.post(
  "/:cycle_id/recalculate-all",
  eligibilityController.recalculateAllEligibilities,
);

// Cycle CRUD routes
router.get("/my/exams", cycleController.getMyExams);
router.get("/my/payments", cycleController.getExamPaymentHistory);
router.post("/:id/pay-fee", cycleController.payExamFee);
router.post("/:id/verify-payment", cycleController.verifyPayment);
router.get("/", cycleController.getAllCycles);
router.get("/:id", cycleController.getCycleById);
router.post("/", cycleController.createCycle);
router.put("/:id", cycleController.updateCycle);
router.delete("/:id", cycleController.deleteCycle);
router.get("/:id/students", cycleController.getCycleStudents);

// Helper routes for dropdown data
router.get("/helpers/regulations", helperController.getAllRegulations);
router.get("/helpers/batches", helperController.getAllBatches);
router.get("/helpers/degrees", helperController.getAllDegrees);
router.get(
  "/helpers/course-types/:regulationId",
  helperController.getCourseTypes,
);
router.get(
  "/helpers/cycle-types/:regulationId/:courseType",
  helperController.getCycleTypes,
);
router.get("/helpers/semester/:batch", helperController.getCurrentSemester);
router.get("/helpers/programs/:degree", helperController.getProgramsByDegree);

// Mount timetable and fee config routes as sub-routes
router.use("/", timetableRoutes);
router.use("/", feeConfigRoutes);

module.exports = router;
