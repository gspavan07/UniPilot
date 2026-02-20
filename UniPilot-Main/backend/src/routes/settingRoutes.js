import express from "express";
const router = express.Router();
import settingController from "../controllers/settingController.js";
import { authenticate, authorize } from "../middleware/auth.js";

router.use(authenticate);

router.get("/", settingController.getSettings);

router.post(
  "/",
  authorize("admin", "super_admin", "hr_admin", "administrator"),
  settingController.updateSettings
);

export default router;
