const express = require("express");
const {
  upsertCriteria,
  evaluatePromotion,
  processBulkPromotion,
  applyForGraduation,
} = require("../controllers/promotionController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

// Admin routes
router.post(
  "/criteria",
  checkPermission("academics:courses:manage"),
  upsertCriteria
);
router.post(
  "/evaluate",
  checkPermission("academics:courses:manage"),
  evaluatePromotion
);
router.post(
  "/process",
  checkPermission("academics:courses:manage"),
  processBulkPromotion
);

// Student routes
router.post("/graduation/apply", applyForGraduation);

module.exports = router;
