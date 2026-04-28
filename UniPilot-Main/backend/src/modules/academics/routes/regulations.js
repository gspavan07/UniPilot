import express from "express";
import {
  getAllRegulations,
  getRegulationById,
  createRegulation,
  updateRegulation,
  deleteRegulation,
} from "../controllers/regulationController.js";
import { authenticate, authorize } from "../../../middleware/auth.js";

const router = express.Router();

// Publicly accessible for viewing (authenticated)
router.get("/", authenticate, getAllRegulations);
router.get("/:id", authenticate, getRegulationById);

// Admin / Academics Admin only
router.post(
  "/",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  createRegulation,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  updateRegulation,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin", "academics_admin"),
  deleteRegulation,
);



export default router;
