import express from "express";
const router = express.Router();
import biometricController from "../controllers/biometricController.js";
import { authenticate, authorize } from "../middleware/auth.js";

// Device Sync Endpoint (Protected by simple key or just public for now with IP whitelist - keeping it open for MVP emulator)
// In prod, this should use a separate API Key middleware.
router.post("/sync", biometricController.syncBiometricData);

// Mapping Endpoint (Admin only)
router.post(
  "/map-user",
  authenticate,
  authorize("admin", "hr_admin"),
  biometricController.mapUserToDevice
);

export default router;
