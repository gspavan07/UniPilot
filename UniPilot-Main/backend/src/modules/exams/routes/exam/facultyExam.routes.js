import express from "express";
const router = express.Router();
import facultyExamController from "../../controllers/exam/facultyExamController.js";
import { authenticate, authorize } from "../../../../middleware/auth.js";

// All routes are protected and require 'faculty' role
router.use(authenticate);
router.use(authorize("faculty"));

// Get assigned exams
router.get("/assigned-exams", facultyExamController.getAssignedExams);

// Update paper format
router.put("/paper-format/:timetableId", facultyExamController.updatePaperFormat);

export default router;
