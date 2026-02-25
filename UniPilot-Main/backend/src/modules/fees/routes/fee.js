import express from "express";
import {
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
  getCollectionStats,
  getTransactions,
  getBatches,
  applyWaiver,
  getWaivers,
  approveWaiver,
  updateWaiver,
  deleteWaiver,
  validateScholarshipImport,
  finalizeScholarshipImport,
  getDefaulters,
  addStudentFine,
  deleteStudentFine,
  getDailyCollection,
  getSections,
  createPaymentOrder,
  payMyFees,
} from "../controllers/feeController.js";
import { authenticate, checkPermission } from "../../../middleware/auth.js";

const router = express.Router();
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// Student routes
router.get("/my-status", authenticate, getMyFeeStatus);
router.post("/payment/order", authenticate, createPaymentOrder);
router.post("/my-payment", authenticate, payMyFees);

// @Users/pavang/UniPilot/backend/src/routes/fee.js
// Admin/Accounts routes
router.get(
  "/categories",
  checkPermission("finance:fees:oversight"),
  getCategories,
);
router.get(
  "/structures",
  checkPermission("finance:fees:oversight"),
  getStructures,
);
router.post(
  "/categories",
  checkPermission("finance:fees:admin"),
  createCategory,
);
router.post(
  "/structures",
  checkPermission("finance:fees:admin"),
  createStructure,
);
router.put(
  "/structures/:id",
  checkPermission("finance:fees:admin"),
  updateStructure,
);
router.delete(
  "/structures/:id",
  checkPermission("finance:fees:admin"),
  deleteStructure,
);
router.post(
  "/structures/clone",
  checkPermission("finance:fees:admin"),
  cloneFeeStructure,
);
router.post(
  "/payments",
  checkPermission("finance:fees:manage"),
  collectPayment,
);
router.get("/summary/:studentId", getStudentFeeStatus);

// Semester Configs
router.get(
  "/semester-configs",
  checkPermission("finance:fees:admin"),
  getSemesterConfigs,
);
router.put(
  "/semester-configs",
  checkPermission("finance:fees:admin"),
  updateSemesterConfig,
);

// Analytics & Transactions
router.get(
  "/stats",
  checkPermission("finance:fees:oversight"),
  getCollectionStats,
);
router.get(
  "/transactions",
  checkPermission("finance:fees:oversight"),
  getTransactions,
);

router.get(
  "/reports/daily",
  checkPermission("finance:fees:oversight"),
  getDailyCollection,
);

router.get("/batches", checkPermission("finance:fees:oversight"), getBatches);

// Waivers & Scholarships
router.post("/waivers", checkPermission("finance:fees:admin"), applyWaiver);
router.get("/waivers", checkPermission("finance:fees:oversight"), getWaivers);
router.put(
  "/waivers/:id/approve",
  checkPermission("finance:fees:admin"),
  approveWaiver,
);
router.put("/waivers/:id", checkPermission("finance:fees:admin"), updateWaiver);
router.delete(
  "/waivers/:id",
  checkPermission("finance:fees:admin"),
  deleteWaiver,
);

// Bulk Import
router.post(
  "/validate-scholarships",
  checkPermission("finance:fees:admin"),
  upload.single("file"),
  validateScholarshipImport,
);
router.post(
  "/finalize-scholarships",
  checkPermission("finance:fees:admin"),
  finalizeScholarshipImport,
);

// Defaulters & Automation
router.get(
  "/defaulters",
  checkPermission("finance:fees:oversight"),
  getDefaulters,
);

router.get("/sections", checkPermission("finance:fees:oversight"), getSections);

router.post("/fines", checkPermission("finance:fees:manage"), addStudentFine);

router.delete(
  "/fines/:id",
  authenticate,
  checkPermission("finance:fees:manage"),
  deleteStudentFine,
);

export default router;
