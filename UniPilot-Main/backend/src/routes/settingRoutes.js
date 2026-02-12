const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.get("/", settingController.getSettings);

router.post(
  "/",
  authorize("admin", "super_admin", "hr_admin", "administrator"),
  settingController.updateSettings
);

module.exports = router;
