const express = require("express");
const {
  getAllRegulations,
  getRegulation,
  createRegulation,
  updateRegulation,
  deleteRegulation,
} = require("../controllers/regulationController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Publicly accessible for viewing (authenticated)
router.get("/", authenticate, getAllRegulations);
router.get("/:id", authenticate, getRegulation);

// Admin / Academics Admin only
router.post(
  "/",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  createRegulation,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  updateRegulation,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  deleteRegulation,
);

module.exports = router;
