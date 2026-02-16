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
  bulkUpdateSections,
  getAllBatches,
  getStudentSemesters,
  getBatchDetails,
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
// Dynamic middleware to check permission based on target role
const checkDynamicPermission = (action) => {
  return (req, res, next) => {
    // Determine the target role context
    // 1. From query param (e.g., list filtering)
    // 2. From body (e.g., creating user)
    // 3. From URL param (requires pre-fetching user, handled below or via convention)

    let role = req.query.role || req.body.role;

    // If we only have ID (PUT/DELETE/GET:id), we might not know the role yet without fetching.
    // However, usually the frontend filters by role or we can rely on 'users:view/manage' as a fallback for mixed.
    // For strict separation, we'd need to fetch the user first.
    // BUT, 'checkPermission' middleware runs BEFORE controller.

    // Strategy:
    // If 'role' is provided, enforce specific permission.
    // If 'role' is NOT provided (e.g. generic fetch), enforce 'users:view' (Admin level).
    // This effectively "separates" them because non-admins won't have 'users:view',
    // they will only have 'students:view' or 'hr:staff:view'.
    // So they MUST provide ?role=student to access the endpoint if they only have student permissions.

    let permissionsToCheck = [`users:${action}`]; // Admin always works

    if (role === "student" || role === "students") {
      permissionsToCheck.push(`students:${action}`);
    } else if (
      role === "staff" ||
      role === "employee" ||
      role === "employees"
    ) {
      permissionsToCheck.push(`hr:staff:${action}`);
    }

    // Pass array to checkPermission (OR logic)
    return checkPermission(permissionsToCheck)(req, res, next);
  };
};

router.get("/stats", checkDynamicPermission("view"), getUserStats);
// Dynamic Sections route
router.get(
  "/sections",
  checkDynamicPermission("view"),
  require("../controllers/userController").getStudentSections,
);
router.get("/batch-years", getAllBatches);

// Dynamic Semesters route
router.get(
  "/semesters",
  checkDynamicPermission("view"),
  getStudentSemesters,
  getStudentSemesters,
);

router.get("/batch-details", getBatchDetails);

router
  .route("/")
  .get(checkDynamicPermission("view"), getAllUsers)
  .post(
    checkDynamicPermission("manage"),
    studentUpload.array("documents"),
    createUser,
  );

router.post(
  "/bulk-import",
  checkDynamicPermission("manage"),
  upload.single("file"),
  bulkImportUsers,
);

// Bank details route (must be before /:id route)
router.put("/:id/bank-details", authenticate, updateBankDetails);

// Bulk update sections
router.post(
  "/bulk-update-sections",
  checkPermission([
    "users:manage",
    "students:manage",
    "academics:sections:manage",
  ]),
  bulkUpdateSections,
);

router
  .route("/:id")
  .get(checkDynamicPermission("view"), getUser) // Note: getUser might need 'role' query param for strict check if user doesn't have users:view
  .put(
    checkDynamicPermission("manage"),
    studentUpload.array("documents"),
    updateUser,
  )
  .delete(checkDynamicPermission("manage"), deleteUser);

module.exports = router;
