const express = require("express");
const router = express.Router({ mergeParams: true });
const { authenticate } = require("../../middleware/auth");
const feeConfigController = require("../../controllers/exam/feeConfigController");

const { auditMiddleware } = require("../../middleware/exam/auditMiddleware");

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

module.exports = router;
