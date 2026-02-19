import express from "express";
const router = express.Router();
import {
  getAllSeatingPlans,
  getSeatingPlanById,
  generateSeatingPlan,
  updateSeatingPlan,
  deleteSeatingPlan,
} from "../../controllers/exam/seatingArrangementController.js";
import { auditMiddleware } from "../../middleware/exam/auditMiddleware.js";
import { authenticate } from "../../middleware/auth.js";

// Get all seating plans
router.get("/", authenticate, getAllSeatingPlans);

// Get seating plan by ID
router.get("/:id", authenticate, getSeatingPlanById);

// Generate seating plan
router.post(
  "/generate",
  authenticate,
  auditMiddleware("GENERATE", "SEATING_PLAN"),
  generateSeatingPlan,
);

// Update seating plan
router.put(
  "/:id",
  authenticate,
  auditMiddleware("UPDATE", "SEATING_PLAN"),
  updateSeatingPlan,
);

// Delete seating plan
router.delete(
  "/:id",
  authenticate,
  auditMiddleware("DELETE", "SEATING_PLAN"),
  deleteSeatingPlan,
);

export default router;
