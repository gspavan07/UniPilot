import express from "express";
import {
  createTimetable,
  addSlot,
  getTimetable,
  getMyTimetable,
  getTimetableByCriteria,
  deleteSlot,
} from "../controllers/timetableController.js";
import { authenticate, checkPermission } from "../../../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

// Admin Routes
router.post(
  "/init",
  checkPermission("academics:timetable:manage"),
  createTimetable,
);
router.post("/slots", checkPermission("academics:timetable:manage"), addSlot);
router.delete(
  "/slots/:id",
  checkPermission("academics:timetable:manage"),
  deleteSlot,
);
router.get(
  "/find",
  checkPermission("academics:timetable:manage"),
  getTimetableByCriteria,
);

// Public/View Routes
router.get("/my/view", getMyTimetable);
router.get("/:id", checkPermission("academics:timetable:view"), getTimetable);

export default router;
