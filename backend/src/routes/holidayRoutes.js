const express = require("express");
const router = express.Router();
const holidayController = require("../controllers/holidayController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, holidayController.getHolidays);
router.post(
  "/",
  authenticate,
  authorize("admin", "hr_admin"),
  holidayController.createHoliday
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "hr_admin"),
  holidayController.updateHoliday
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "hr_admin"),
  holidayController.deleteHoliday
);

module.exports = router;
