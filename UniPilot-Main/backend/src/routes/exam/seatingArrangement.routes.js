const express = require("express");
const router = express.Router();
const {
  getAllSeatingPlans,
  getSeatingPlanById,
  generateSeatingPlan,
  updateSeatingPlan,
  deleteSeatingPlan,
} = require("../../controllers/exam/seatingArrangementController");
const { auditMiddleware } = require("../../middleware/exam/auditMiddleware");
const { authenticate } = require("../../middleware/auth");

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

module.exports = router;
