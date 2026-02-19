import express from "express";
const router = express.Router({ mergeParams: true });
import { authenticate } from "../../middleware/auth.js";
import feeConfigController from "../../controllers/exam/feeConfigController.js";

import { auditMiddleware } from "../../middleware/exam/auditMiddleware.js";

// Apply authentication middleware
router.use(authenticate);

// Fee configuration routes for a specific cycle
router.get("/:cycleId/fee-config", feeConfigController.getFeeConfigByCycle);
router.post(
  "/:cycleId/fee-config",
  auditMiddleware("CREATE", "FEE_CONFIG"),
  feeConfigController.createFeeConfig,
);

// Individual fee config routes
router.put(
  "/fee-config/:id",
  auditMiddleware("UPDATE", "FEE_CONFIG"),
  feeConfigController.updateFeeConfig,
);
router.get(
  "/fee-config/:id/audit-logs",
  feeConfigController.getFeeConfigAuditLogs,
);

// Late fee slab routes
router.post(
  "/fee-config/:id/slabs",
  auditMiddleware("CREATE_SLAB", "FEE_CONFIG"),
  feeConfigController.addLatFeeSlab,
);
router.put(
  "/late-fee-slabs/:id",
  auditMiddleware("UPDATE_SLAB", "FEE_CONFIG"),
  feeConfigController.updateLatFeeSlab,
);
router.delete(
  "/late-fee-slabs/:id",
  auditMiddleware("DELETE_SLAB", "FEE_CONFIG"),
  feeConfigController.deleteLatFeeSlab,
);

// Fee calculation
router.post("/fee-config/calculate", feeConfigController.calculateFee);

export default router;
