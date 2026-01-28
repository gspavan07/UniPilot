const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticate, authorize } = require("../middleware/auth"); // Assuming middleware location

// All routes here require super_admin role
router.get(
  "/super-admin",
  authenticate,
  authorize("super_admin"),
  dashboardController.getSuperAdminStats,
);

module.exports = router;
