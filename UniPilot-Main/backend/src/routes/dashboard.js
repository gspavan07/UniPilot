import express from "express";
const router = express.Router();
import dashboardController from "../controllers/dashboardController.js";
import { authenticate, authorize } from "../middleware/auth.js"; // Assuming middleware location

// All routes here require super_admin role
router.get(
  "/super-admin",
  authenticate,
  authorize("super_admin"),
  dashboardController.getSuperAdminStats,
);

export default router;
