const express = require("express");
const router = express.Router();
const hodExamController = require("../../controllers/exam/hodExamController");
const { authenticate, authorize } = require("../../middleware/auth");

// All routes are protected and require 'hod' role
// Assuming 'faculty' includes HOD or explicitly 'hod'
// User model: User.prototype.isFaculty = function () { ... role === "hod" ... }
// But authorize middleware likely checks specific role slug
// I'll use authorize("hod")
router.use(authenticate);
router.use(authorize("hod"));

// Get formatted papers
router.get("/papers", hodExamController.getDepartmentFormattedPapers);

// Update paper format (Save Draft)
router.put("/paper/:timetableId", hodExamController.updatePaperFormat);

// Freeze paper format
router.put("/freeze/:timetableId", hodExamController.freezePaperFormat);

module.exports = router;
