import express from "express";
const router = express.Router();
import hodExamController from "../../controllers/exam/hodExamController.js";
import { authenticate, authorize } from "../../../../middleware/auth.js";

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

export default router;
