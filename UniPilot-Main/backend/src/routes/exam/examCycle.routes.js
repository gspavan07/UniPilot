import express from "express";
const router = express.Router();
import { authenticate } from "../../middleware/auth.js";
import { auditMiddleware } from "../../middleware/exam/auditMiddleware.js";
import cycleController from "../../controllers/exam/examCycleController.js";
import eligibilityController from "../../controllers/exam/examEligibilityController.js";
import helperController from "../../controllers/exam/helperController.js";
import timetableRoutes from "./timetable.routes.js";
import feeConfigRoutes from "./feeConfig.routes.js";

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

export default router;
