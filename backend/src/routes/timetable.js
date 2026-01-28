const express = require("express");
const {
  createTimetable,
  addSlot,
  getTimetable,
  getMyTimetable,
  getTimetableByCriteria,
} = require("../controllers/timetableController");
const { authenticate, checkPermission } = require("../middleware/auth");

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
  require("../controllers/timetableController").deleteSlot,
);
router.get(
  "/find",
  checkPermission("academics:timetable:manage"),
  getTimetableByCriteria,
);

// Public/View Routes
router.get("/my/view", getMyTimetable);
router.get("/:id", checkPermission("academics:timetable:view"), getTimetable);

module.exports = router;
