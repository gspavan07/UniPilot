import express from "express";
import {
  upsertCriteria,
  evaluatePromotion,
  processBulkPromotion,
  applyForGraduation,
} from "../controllers/promotionController.js";
import { authenticate, checkPermission } from "../middleware/auth.js";

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

export default router;
