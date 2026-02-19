import express from "express";
const router = express.Router();
import {
  getAllGrades,
  getGradeById,
  submitGrade,
  updateGrade,
  deleteGrade,
  publishGrades,
} from "../../controllers/exam/gradeEntryController.js";
import { auditMiddleware } from "../../middleware/exam/auditMiddleware.js";
import { authenticate } from "../../middleware/auth.js";

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

export default router;
