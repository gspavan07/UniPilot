const express = require("express");
const {
  getAdmissionStats,
  exportAdmissionData,
  getSeatMatrix,
  getStudentDocuments,
  updateDocumentStatus,
  generateAdmissionLetter,
  getFunnelStats,
  getGeoStats,
  reuploadDocument,
  verifyStudent,
  getGenderStats,
  getIdPreviews,
} = require("../controllers/admissionController");
const {
  getAdmissionConfigs,
  saveAdmissionConfig,
  deleteAdmissionConfig,
} = require("../controllers/admissionConfigController");
const {
  previewBulkIds,
  commitBulkIds,
} = require("../controllers/admissionIdController");
const {
  getAdmissionAnalytics,
} = require("../controllers/admissionAnalyticsController");

// Correction: I added the function to admissionController.js (file viewed above).
// But 'previewBulkIds' is in 'admissionIdController'.
// I need to import getIdPreviews from 'admissionController'
// Let me verify where I added it. I added it to 'admissionController.js' in the previous step.
// So I should import it from there.
const bulkUploadController = require("../controllers/bulkUploadController");
const profileUpload = require("../middleware/profileUpload");
const studentUpload = require("../middleware/studentUpload");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Analytics endpoint
router.get("/analytics", checkPermission("admissions:view"), getAdmissionAnalytics);

// Permission-based routes
router.get("/stats", checkPermission("admissions:view"), getAdmissionStats);
router.get("/export", checkPermission("admissions:view"), exportAdmissionData);
router.get("/seat-matrix", checkPermission("admissions:view"), getSeatMatrix);
router.get(
  "/documents/:userId",
  checkPermission("admissions:view"),
  getStudentDocuments
);
router.put(
  "/documents/:id/status",
  checkPermission("admissions:manage"),
  updateDocumentStatus
);
router.get(
  "/letter/:userId",
  checkPermission("admissions:view"),
  generateAdmissionLetter
);
router.get("/funnel", checkPermission("admissions:view"), getFunnelStats);
router.get("/geo-stats", checkPermission("admissions:view"), getGeoStats);
router.get("/gender-stats", checkPermission("admissions:view"), getGenderStats);
router.post(
  "/verify-student/:userId",
  checkPermission("admissions:manage"),
  verifyStudent
);

router.get("/id-previews", checkPermission("admissions:manage"), getIdPreviews);

// Batch Configurations
router.get("/configs", checkPermission("admissions:view"), getAdmissionConfigs);
router.post(
  "/configs",
  checkPermission("admissions:manage"),
  saveAdmissionConfig
);
router.delete(
  "/configs/:id",
  checkPermission("admissions:manage"),
  deleteAdmissionConfig
);

// Bulk ID Generation
router.post(
  "/ids/preview",
  checkPermission("admissions:manage"),
  previewBulkIds
);
router.post("/ids/commit", checkPermission("admissions:manage"), commitBulkIds);

// Document Re-upload
router.post(
  "/documents/:documentId/reupload",
  checkPermission("users:manage"), // Admission can also verify this
  studentUpload.single("document"),
  reuploadDocument
);

// Bulk Photo Upload
router.post(
  "/photos/bulk",
  checkPermission("admissions:manage"), // Or generate_ids? Manage seems appropriate
  profileUpload.array("photos", 100),
  bulkUploadController.uploadStudentPhotos
);

module.exports = router;
