const express = require("express");
const {
  createCategory,
  getCategories,
  getStructures,
  createStructure,
  updateStructure,
  deleteStructure,
  cloneFeeStructure,
  collectPayment,
  getMyFeeStatus,
  getStudentFeeStatus,
  getSemesterConfigs,
  updateSemesterConfig,
} = require("../controllers/feeController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

// Student routes
router.get("/my-status", getMyFeeStatus);

// Admin/Accounts routes
router.get(
  "/categories",
  checkPermission("finance:fees:oversight"),
  getCategories
);
router.get(
  "/structures",
  checkPermission("finance:fees:oversight"),
  getStructures
);
router.post(
  "/categories",
  checkPermission("finance:fees:admin"),
  createCategory
);
router.post(
  "/structures",
  checkPermission("finance:fees:admin"),
  createStructure
);
router.put(
  "/structures/:id",
  checkPermission("finance:fees:admin"),
  updateStructure
);
router.delete(
  "/structures/:id",
  checkPermission("finance:fees:admin"),
  deleteStructure
);
router.post(
  "/structures/clone",
  checkPermission("finance:fees:admin"),
  cloneFeeStructure
);
router.post(
  "/payments",
  checkPermission("finance:fees:collect"),
  collectPayment
);
router.get(
  "/summary/:studentId",
  checkPermission("finance:fees:oversight"),
  getStudentFeeStatus
);

// Semester Configs
router.get(
  "/semester-configs",
  checkPermission("finance:fees:admin"),
  getSemesterConfigs
);
router.put(
  "/semester-configs",
  checkPermission("finance:fees:admin"),
  updateSemesterConfig
);

module.exports = router;
