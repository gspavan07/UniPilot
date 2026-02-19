import express from "express";
import authRoutes from "./auth.js";
import departmentRoutes from "./department.js";
import programRoutes from "./program.js";
import courseRoutes from "./course.js";
import userRoutes from "./user.js";
import roleRoutes from "./role.js";
import proctorRoutes from "./proctor.js";
import promotionRoutes from "./promotion.js";
import hrRoutes from "./hr.js"; // New HR Routes
import attendanceRoutes from "./attendance.js";
import feeRoutes from "./fee.js";
import libraryRoutes from "./library.js";
import timetableRoutes from "./timetable.js";
import admissionRoutes from "./admission.js";
import biometricRoutes from "./biometricRoutes.js";
import holidayRoutes from "./holidayRoutes.js";
import settingRoutes from "./settingRoutes.js";
import infrastructureRoutes from "./infrastructure.js"; // Infrastructure Management
import regulationRoutes from "./regulations.js";
import examConfigRoutes from "./exam-config.routes.js";
import gradeScaleRoutes from "./grade-scale.routes.js";
import sectionInchargeRoutes from "./sectionInchargeRoutes.js";
import transportRoutes from "./transport.js"; // Transport Management
import hostelRoutes from "./hostel.js"; // Hostel Management
import dashboardRoutes from "./dashboard.js";
import placementRoutes from "./placement.js"; // Placement Module
import programOutcomeRoutes from "./programOutcome.js"; // OBE: Program Outcomes
import courseOutcomeRoutes from "./courseOutcome.js"; // OBE: Course Outcomes
import coPoMapRoutes from "./coPoMap.js"; // OBE: CO-PO Mapping

// Exam Management Routes
// IMPORTANT: Import associations first to set up model relationships
import "../models/exam/associations.js";

import examCycleRoutes from "./exam/examCycle.routes.js";
import examHallTicketRoutes from "./exam/hallTicket.routes.js";
import examScheduleRoutes from "./exam/examSchedule.routes.js";
import examSeatingRoutes from "./exam/seatingArrangement.routes.js";

import examGradeRoutes from "./exam/gradeEntry.routes.js";
import facultyExamRoutes from "./exam/facultyExam.routes.js";
import hodExamRoutes from "./exam/hod.routes.js";

import notificationRoutes from "./notifications.js";
import academicRoutes from "./academic.js";

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

// Faculty Assignment & Notifications
router.use("/notifications", notificationRoutes);
router.use("/academic", academicRoutes);

// Exam Management routes
router.use("/exam/cycles", examCycleRoutes);
router.use("/exam/hall-tickets", examHallTicketRoutes);
router.use("/exam/schedules", examScheduleRoutes);
router.use("/exam/faculty", facultyExamRoutes);
router.use("/exam/hod", hodExamRoutes);
router.use("/exam/seating", examSeatingRoutes);
router.use("/exam/grades", examGradeRoutes);

export default router;
