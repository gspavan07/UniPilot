const express = require("express");
const {
  assignProctors,
  autoAssignProctors,
  getMyStudents,
  addFeedback,
  createSession,
  getMyProctor,
} = require("../controllers/proctorController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

// Admin/HOD routes
router.post("/assign", checkPermission("proctoring:manage"), assignProctors);
router.post(
  "/auto-assign",
  checkPermission("proctoring:manage"),
  autoAssignProctors
);

// Faculty/Proctor routes
router.get("/my-students", checkPermission("proctoring:mentor"), getMyStudents);
router.post("/feedback", checkPermission("proctoring:mentor"), addFeedback);
router.post("/sessions", checkPermission("proctoring:mentor"), createSession);

// Student routes
router.get("/my-proctor", getMyProctor);

module.exports = router;
