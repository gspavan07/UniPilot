import express from "express";
import authRoutes from "../modules/core/routes/auth.js";
import userRoutes from "../modules/core/routes/user.js";
import roleRoutes from "../modules/core/routes/role.js";
import departmentRoutes from "../modules/academics/routes/department.js";
import programRoutes from "../modules/academics/routes/program.js";
import courseRoutes from "../modules/academics/routes/course.js";
import timetableRoutes from "../modules/academics/routes/timetable.js";
import promotionRoutes from "../modules/academics/routes/promotion.js";
import attendanceRoutes from "../modules/academics/routes/attendance.js";
import regulationRoutes from "../modules/academics/routes/regulations.js";
import gradeScaleRoutes from "../modules/academics/routes/grade-scale.routes.js";
import sectionInchargeRoutes from "../modules/academics/routes/sectionInchargeRoutes.js";
import academicRoutes from "../modules/academics/routes/academic.js";
import admissionRoutes from "../modules/admissions/routes/admission.js";
import examConfigRoutes from "../modules/exams/routes/exam-config.routes.js";
import feeRoutes from "../modules/fees/routes/fee.js";
import libraryRoutes from "../modules/library/routes/library.js";
import hostelRoutes from "../modules/hostel/routes/hostel.js";
import transportRoutes from "../modules/transport/routes/transport.js"; // Transport Management
import placementRoutes from "../modules/placement/routes/placement.js"; // Placement Module
import hrRoutes from "../modules/hr/routes/hr.js"; // New HR Routes
import biometricRoutes from "../modules/hr/routes/biometricRoutes.js";
import proctorRoutes from "../modules/proctoring/routes/proctor.js";
import notificationRoutes from "../modules/notifications/routes/notifications.js";
import infrastructureRoutes from "../modules/infrastructure/routes/infrastructure.js"; // Infrastructure Management
import settingRoutes from "../modules/settings/routes/settingRoutes.js";
import holidayRoutes from "../modules/settings/routes/holidayRoutes.js";
import dashboardRoutes from "../modules/settings/routes/dashboard.js";
import auditLogRoutes from "../modules/settings/routes/auditLog.js";
import programOutcomeRoutes from "../modules/obe/routes/programOutcome.js"; // OBE: Program Outcomes
import courseOutcomeRoutes from "../modules/obe/routes/courseOutcome.js"; // OBE: Course Outcomes
import coPoMapRoutes from "../modules/obe/routes/coPoMap.js"; // OBE: CO-PO Mapping

// Exam Management Routes
// IMPORTANT: Import associations first to set up model relationships
import "../modules/exams/models/associations.js";

import examCycleRoutes from "../modules/exams/routes/exam/examCycle.routes.js";
import examHallTicketRoutes from "../modules/exams/routes/exam/hallTicket.routes.js";
import examScheduleRoutes from "../modules/exams/routes/exam/examSchedule.routes.js";
import examSeatingRoutes from "../modules/exams/routes/exam/seatingArrangement.routes.js";
import examGradeRoutes from "../modules/exams/routes/exam/gradeEntry.routes.js";
import facultyExamRoutes from "../modules/exams/routes/exam/facultyExam.routes.js";
import hodExamRoutes from "../modules/exams/routes/exam/hod.routes.js";

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
router.use("/audit-logs", auditLogRoutes);

// Exam Management routes
router.use("/exam/cycles", examCycleRoutes);
router.use("/exam/hall-tickets", examHallTicketRoutes);
router.use("/exam/schedules", examScheduleRoutes);
router.use("/exam/faculty", facultyExamRoutes);
router.use("/exam/hod", hodExamRoutes);
router.use("/exam/seating", examSeatingRoutes);
router.use("/exam/grades", examGradeRoutes);

export default router;
