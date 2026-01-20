const express = require("express");
const {
  getAllRegulations,
  getRegulationById,
  createRegulation,
  updateRegulation,
  deleteRegulation,
  updateExamStructure,
  getExamStructure,
} = require("../controllers/regulationController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Publicly accessible for viewing (authenticated)
router.get("/", authenticate, getAllRegulations);
router.get("/:id", authenticate, getRegulationById);

// Admin / Academics Admin only
router.post(
  "/",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  createRegulation,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  updateRegulation,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  deleteRegulation,
);

// Exam Structure Configuration
router.get("/:id/exam-structure", authenticate, getExamStructure);
router.put(
  "/:id/exam-structure",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  updateExamStructure,
);

module.exports = router;
