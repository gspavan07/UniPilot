import express from "express";
const router = express.Router();
import {
  getExamConfig,
  updateExamConfig,
  addCourseType,
  updateCourseType,
  deleteCourseType,
} from "../controllers/exam-config.controller.js";

// Get exam configuration for a regulation
router.get("/:regulationId", getExamConfig);

// Update entire exam configuration
router.put("/:regulationId", updateExamConfig);

// Add a new course type
router.post("/:regulationId/course-types", addCourseType);

// Update a specific course type
router.put("/:regulationId/course-types/:courseTypeId", updateCourseType);

// Delete a course type
router.delete("/:regulationId/course-types/:courseTypeId", deleteCourseType);

export default router;
