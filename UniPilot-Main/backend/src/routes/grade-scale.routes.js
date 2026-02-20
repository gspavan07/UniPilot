import express from "express";
const router = express.Router();
import {
  getGradeScale,
  updateGradeScale,
  addGrade,
  updateGrade,
  deleteGrade,
} from "../controllers/grade-scale.controller.js";

// Get grade scale for a regulation
router.get("/:regulationId", getGradeScale);

// Update entire grade scale
router.put("/:regulationId", updateGradeScale);

// Add a new grade
router.post("/:regulationId/grades", addGrade);

// Update a specific grade
router.put("/:regulationId/grades/:gradeId", updateGrade);

// Delete a grade
router.delete("/:regulationId/grades/:gradeId", deleteGrade);

export default router;
