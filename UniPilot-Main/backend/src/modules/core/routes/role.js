import {
  getAllRoles,
  getAllPermissions,
  createRole,
  updateRole,
} from "../controllers/roleController.js";
import express from "express";
import { authenticate, checkPermission } from "../../../middleware/auth.js";

const router = express.Router();

// All role routes are protected
router.use(authenticate);

router.get(
  "/",
  checkPermission(["settings:roles:manage", "settings:roles:view"]),
  getAllRoles
);
router.get(
  "/permissions",
  checkPermission(["settings:roles:manage", "settings:roles:view"]),
  getAllPermissions
);
router.post("/", checkPermission("settings:roles:manage"), createRole);
router.put("/:id", checkPermission("settings:roles:manage"), updateRole);

export default router;
