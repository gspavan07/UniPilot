const express = require("express");
const router = express.Router();
const facultyExamController = require("../../controllers/exam/facultyExamController");
const { authenticate, authorize } = require("../../middleware/auth");

// All routes are protected and require 'faculty' role
router.use(authenticate);
router.use(authorize("faculty"));

// Get assigned exams
router.get("/assigned-exams", facultyExamController.getAssignedExams);

// Update paper format
router.put("/paper-format/:timetableId", facultyExamController.updatePaperFormat);

module.exports = router;
