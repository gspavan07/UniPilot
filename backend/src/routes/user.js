const express = require("express");
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  bulkImportUsers,
} = require("../controllers/userController");
const upload = require("../middleware/upload");
const studentUpload = require("../middleware/studentUpload");
const {
  authenticate,
  authorize,
  checkPermission,
} = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Stats route
router.get("/stats", checkPermission("users:view"), getUserStats);

router
  .route("/")
  .get(checkPermission("users:view"), getAllUsers)
  .post(
    checkPermission("users:create"),
    studentUpload.array("documents"),
    createUser
  );

router.post(
  "/bulk-import",
  checkPermission("users:create"),
  upload.single("file"),
  bulkImportUsers
);

router
  .route("/:id")
  .get(checkPermission("users:view"), getUser)
  .put(checkPermission("users:edit"), updateUser)
  .delete(checkPermission("users:delete"), deleteUser);

module.exports = router;
