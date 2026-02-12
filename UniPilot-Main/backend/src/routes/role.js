const express = require("express");
const roleController = require("../controllers/roleController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

// All role routes are protected
router.use(authenticate);

router.get(
  "/",
  checkPermission(["settings:roles:manage", "settings:roles:view"]),
  roleController.getAllRoles
);
router.get(
  "/permissions",
  checkPermission(["settings:roles:manage", "settings:roles:view"]),
  roleController.getAllPermissions
);
router.post(
  "/",
  checkPermission("settings:roles:manage"),
  roleController.createRole
);
router.put(
  "/:id",
  checkPermission("settings:roles:manage"),
  roleController.updateRole
);

module.exports = router;
