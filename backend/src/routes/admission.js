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
} = require("../controllers/admissionController");
const {
  getAdmissionConfigs,
  saveAdmissionConfig,
} = require("../controllers/admissionConfigController");
const studentUpload = require("../middleware/studentUpload");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

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
router.post(
  "/verify-student/:userId",
  checkPermission("admissions:manage"),
  verifyStudent
);

// Batch Configurations
router.get("/configs", checkPermission("admissions:view"), getAdmissionConfigs);
router.post(
  "/configs",
  checkPermission("admissions:manage"),
  saveAdmissionConfig
);

// Document Re-upload
router.post(
  "/documents/:documentId/reupload",
  checkPermission("students:edit"), // Admission can also verify this
  studentUpload.single("document"),
  reuploadDocument
);

module.exports = router;
