const express = require("express");
const authRoutes = require("./auth");
const departmentRoutes = require("./department");
const programRoutes = require("./program");
const courseRoutes = require("./course");
const userRoutes = require("./user");
const roleRoutes = require("./role");
const proctorRoutes = require("./proctor");
const promotionRoutes = require("./promotion");
const hrRoutes = require("./hr"); // New HR Routes
const attendanceRoutes = require("./attendance");
const feeRoutes = require("./fee");
const libraryRoutes = require("./library");
const timetableRoutes = require("./timetable");
const admissionRoutes = require("./admission");
const biometricRoutes = require("./biometricRoutes");
const holidayRoutes = require("./holidayRoutes");
const settingRoutes = require("./settingRoutes");
const infrastructureRoutes = require("./infrastructure"); // Infrastructure Management
const regulationRoutes = require("./regulations");
const examConfigRoutes = require("./exam-config.routes");
const gradeScaleRoutes = require("./grade-scale.routes");
const sectionInchargeRoutes = require("./sectionInchargeRoutes");
const transportRoutes = require("./transport"); // Transport Management
const hostelRoutes = require("./hostel"); // Hostel Management
const dashboardRoutes = require("./dashboard");
const placementRoutes = require("./placement"); // Placement Module
const programOutcomeRoutes = require("./programOutcome"); // OBE: Program Outcomes
const courseOutcomeRoutes = require("./courseOutcome"); // OBE: Course Outcomes
const coPoMapRoutes = require("./coPoMap"); // OBE: CO-PO Mapping

// Exam Management Routes
// IMPORTANT: Import associations first to set up model relationships
require("../models/exam/associations");

const examCycleRoutes = require("./exam/examCycle.routes");
const examHallTicketRoutes = require("./exam/hallTicket.routes");
const examScheduleRoutes = require("./exam/examSchedule.routes");
const examSeatingRoutes = require("./exam/seatingArrangement.routes");

const examGradeRoutes = require("./exam/gradeEntry.routes");
const facultyExamRoutes = require("./exam/facultyExam.routes");

const router = express.Router();

// API version
router.get("/", (req, res) => {
  res.json({
    message: "UniPilot API v1.0",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes (login, register, refresh token)
router.use("/auth", authRoutes);

// Tenant-specific routes
router.use("/users", userRoutes);
router.use("/departments", departmentRoutes);
router.use("/programs", programRoutes);
router.use("/courses", courseRoutes);
router.use("/roles", roleRoutes);
router.use("/proctor", proctorRoutes);
router.use("/promotion", promotionRoutes);
router.use("/hr", hrRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/fees", feeRoutes);
router.use("/library", libraryRoutes);
router.use("/timetable", timetableRoutes);
router.use("/admission", admissionRoutes);
router.use("/biometric", biometricRoutes);
router.use("/holidays", holidayRoutes);
router.use("/settings", settingRoutes);
router.use("/infrastructure", infrastructureRoutes);
router.use("/regulations", regulationRoutes);
router.use("/exam-config", examConfigRoutes);
router.use("/grade-scale", gradeScaleRoutes);
router.use("/section-incharges", sectionInchargeRoutes);
router.use("/transport", transportRoutes);
router.use("/hostel", hostelRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/placement", placementRoutes);

// Outcome-Based Education (OBE) routes
router.use("/program-outcomes", programOutcomeRoutes);
router.use("/course-outcomes", courseOutcomeRoutes);
router.use("/co-po-maps", coPoMapRoutes);

// Exam Management routes
router.use("/exam/cycles", examCycleRoutes);
router.use("/exam/hall-tickets", examHallTicketRoutes);
router.use("/exam/schedules", examScheduleRoutes);
router.use("/exam/faculty", facultyExamRoutes);
router.use("/exam/seating", examSeatingRoutes);
router.use("/exam/grades", examGradeRoutes);

module.exports = router;
