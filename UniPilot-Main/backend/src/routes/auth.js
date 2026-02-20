import express from "express";
import authController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post(
  "/forgot-password",
  authController.forgotPassword.bind(authController)
);
router.post(
  "/reset-password",
  authController.resetPassword.bind(authController)
);

// Protected routes (require authentication)
router.get("/me", authenticate, authController.getProfile.bind(authController));
router.post(
  "/change-password",
  authenticate,
  authController.changePassword.bind(authController)
);
router.post(
  "/logout",
  authenticate,
  authController.logout.bind(authController)
);

export default router;
