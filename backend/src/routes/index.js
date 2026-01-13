const express = require("express");
const authRoutes = require("./auth");
const departmentRoutes = require("./department");
const programRoutes = require("./program");
const courseRoutes = require("./course");
const userRoutes = require("./user");
const roleRoutes = require("./role");
const proctorRoutes = require("./proctor");
const promotionRoutes = require("./promotion");
const attendanceRoutes = require("./attendance");
const examRoutes = require("./exam");
const feeRoutes = require("./fee");
const libraryRoutes = require("./library");
const timetableRoutes = require("./timetable");
const admissionRoutes = require("./admission");

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

// Super admin routes (will be added)
// router.use('/super-admin', superAdminRoutes);

// Tenant-specific routes (will be added)
router.use("/users", userRoutes);
router.use("/departments", departmentRoutes);
router.use("/programs", programRoutes);
router.use("/courses", courseRoutes);
router.use("/roles", roleRoutes);
router.use("/proctor", proctorRoutes);
router.use("/promotion", promotionRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/exam", examRoutes);
router.use("/fees", feeRoutes);
router.use("/library", libraryRoutes);
router.use("/timetable", timetableRoutes);
router.use("/admission", admissionRoutes);
// router.use('/attendance', attendanceRoutes);
// router.use('/exams', examRoutes);
// router.use('/fees', feeRoutes);
// router.use('/proctor', proctorRoutes);
// router.use('/promotion', promotionRoutes);
// router.use('/graduation', graduationRoutes);
// router.use('/alumni', alumniRoutes);

module.exports = router;
