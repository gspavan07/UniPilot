const express = require("express");
const router = express.Router();
const {
  getGradeScale,
  updateGradeScale,
  addGrade,
  updateGrade,
  deleteGrade,
} = require("../controllers/grade-scale.controller");

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

module.exports = router;
