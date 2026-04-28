import express from "express";
import {
  assignProctors,
  autoAssignProctors,
  getMyStudents,
  addFeedback,
  createSession,
  getMyProctor,
} from "../controllers/proctorController.js";
import { authenticate, checkPermission } from "../../../middleware/auth.js";

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

export default router;
