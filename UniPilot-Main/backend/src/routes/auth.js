import express from "express";
import authController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { verifyCsrfHeader } from "../middleware/csrfDoubleSubmit.js";

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
router.post(
  "/refresh",
  verifyCsrfHeader,
  authController.refresh.bind(authController)
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
router.post(
  "/logout-all",
  authenticate,
  authController.logoutAll.bind(authController)
);

export default router;
