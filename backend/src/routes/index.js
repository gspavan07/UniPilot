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
const examRoutes = require("./exam");
const feeRoutes = require("./fee");
const libraryRoutes = require("./library");
const timetableRoutes = require("./timetable");
const admissionRoutes = require("./admission");
const biometricRoutes = require("./biometricRoutes");
const holidayRoutes = require("./holidayRoutes");
const settingRoutes = require("./settingRoutes");
const infrastructureRoutes = require("./infrastructure"); // Infrastructure Management
const regulationRoutes = require("./regulations");
const sectionInchargeRoutes = require("./sectionInchargeRoutes");

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
router.use("/exam", examRoutes);
router.use("/fees", feeRoutes);
router.use("/library", libraryRoutes);
router.use("/timetable", timetableRoutes);
router.use("/admission", admissionRoutes);
router.use("/biometric", biometricRoutes);
router.use("/holidays", holidayRoutes);
router.use("/settings", settingRoutes);
router.use("/infrastructure", infrastructureRoutes);
router.use("/regulations", regulationRoutes);
router.use("/section-incharges", sectionInchargeRoutes);

module.exports = router;
