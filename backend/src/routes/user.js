const express = require("express");
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  bulkImportUsers,
  updateBankDetails,
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
// Dynamic Sections route
router.get(
  "/sections",
  checkPermission("users:view"),
  require("../controllers/userController").getStudentSections
);

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

// Bank details route (must be before /:id route)
router.put("/:id/bank-details", authenticate, updateBankDetails);

router
  .route("/:id")
  .get(checkPermission("users:view"), getUser)
  .put(
    checkPermission("users:edit"),
    studentUpload.array("documents"),
    updateUser
  )
  .delete(checkPermission("users:delete"), deleteUser);

module.exports = router;
