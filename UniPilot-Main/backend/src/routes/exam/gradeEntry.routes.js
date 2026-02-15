const express = require("express");
const router = express.Router();
const {
  getAllGrades,
  getGradeById,
  submitGrade,
  updateGrade,
  deleteGrade,
  publishGrades,
} = require("../../controllers/exam/gradeEntryController");
const { auditMiddleware } = require("../../middleware/exam/auditMiddleware");
const { authenticate } = require("../../middleware/auth");

// Get all grades (with filters)
router.get("/", authenticate, getAllGrades);

// Get grade by ID
router.get("/:id", authenticate, getGradeById);

// Submit a new grade
router.post("/", authenticate, auditMiddleware("SUBMIT", "GRADE"), submitGrade);

// Update a grade
router.put(
  "/:id",
  authenticate,
  auditMiddleware("UPDATE", "GRADE"),
  updateGrade,
);

// Delete a grade
router.delete(
  "/:id",
  authenticate,
  auditMiddleware("DELETE", "GRADE"),
  deleteGrade,
);

// Publish grades for a semester/course
router.post(
  "/publish",
  authenticate,
  auditMiddleware("PUBLISH", "GRADE"),
  publishGrades,
);

module.exports = router;
