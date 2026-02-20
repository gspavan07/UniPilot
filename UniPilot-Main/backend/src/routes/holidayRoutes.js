import express from "express";
const router = express.Router();
import holidayController from "../controllers/holidayController.js";
import { authenticate, authorize } from "../middleware/auth.js";

router.get("/", authenticate, holidayController.getHolidays);
router.post(
  "/",
  authenticate,
  authorize("super_admin", "admin", "hr_admin"),
  holidayController.createHoliday
);
router.put(
  "/:id",
  authenticate,
  authorize("super_admin", "admin", "hr_admin"),
  holidayController.updateHoliday
);
router.delete(
  "/:id",
  authenticate,
  authorize("super_admin", "admin", "hr_admin"),
  holidayController.deleteHoliday
);

export default router;
