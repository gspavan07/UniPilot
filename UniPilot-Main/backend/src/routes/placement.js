import express from "express";
const router = express.Router();
import { authenticate, checkPermission } from "../middleware/auth.js";

import companyController from "../controllers/companyController.js";
import jobPostingController from "../controllers/jobPostingController.js";
import placementDriveController from "../controllers/placementDriveController.js";
import studentPlacementController from "../controllers/studentPlacementController.js";
import departmentPlacementController from "../controllers/departmentPlacementController.js";
import studentUpload from "../middleware/studentUpload.js";

// ============================================
// COMPANY ROUTES
// ============================================

router.get(
  "/companies",
  authenticate,
  checkPermission(["placement.company.manage", "placement.drive.view"]),
  companyController.getCompanies,
);

router.get(
  "/companies/:id",
  authenticate,
  checkPermission(["placement.company.manage", "placement.drive.view"]),
  companyController.getCompanyById,
);

router.post(
  "/companies",
  authenticate,
  checkPermission("placement.company.manage"),
  companyController.createCompany,
);

router.put(
  "/companies/:id",
  authenticate,
  checkPermission("placement.company.manage"),
  companyController.updateCompany,
);

router.delete(
  "/companies/:id",
  authenticate,
  checkPermission("placement.company.manage"),
  companyController.deleteCompany,
);

// Company Contacts
router.post(
  "/companies/:id/contacts",
  authenticate,
  checkPermission("placement.company.manage"),
  companyController.addCompanyContact,
);

router.put(
  "/contacts/:id",
  authenticate,
  checkPermission("placement.company.manage"),
  companyController.updateCompanyContact,
);

router.delete(
  "/contacts/:id",
  authenticate,
  checkPermission("placement.company.manage"),
  companyController.deleteCompanyContact,
);

// ============================================
// JOB POSTING ROUTES
// ============================================

router.get(
  "/job-postings",
  authenticate,
  checkPermission(["placement.drive.manage", "placement.drive.view"]),
  jobPostingController.getJobPostings,
);

router.get(
  "/job-postings/:id",
  authenticate,
  checkPermission(["placement.drive.manage", "placement.drive.view"]),
  jobPostingController.getJobPostingById,
);

router.post(
  "/job-postings",
  authenticate,
  checkPermission("placement.drive.manage"),
  jobPostingController.createJobPosting,
);

router.put(
  "/job-postings/:id",
  authenticate,
  checkPermission("placement.drive.manage"),
  jobPostingController.updateJobPosting,
);

router.delete(
  "/job-postings/:id",
  authenticate,
  checkPermission("placement.drive.manage"),
  jobPostingController.deleteJobPosting,
);

// ============================================
// PLACEMENT DRIVE ROUTES
// ============================================

router.get(
  "/drives",
  authenticate,
  checkPermission(["placement.drive.manage", "placement.drive.view"]),
  placementDriveController.getDrives,
);

router.get(
  "/drives/:id",
  authenticate,
  checkPermission(["placement.drive.manage", "placement.drive.view"]),
  placementDriveController.getDriveById,
);

router.post(
  "/drives",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.createDrive,
);

router.put(
  "/drives/:id",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.updateDrive,
);

router.delete(
  "/drives/:id",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.deleteDrive,
);

// Drive Eligibility
router.put(
  "/drives/:id/eligibility",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.updateDriveEligibility,
);

// Drive Rounds
router.post(
  "/drives/:id/rounds",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.addDriveRound,
);

router.put(
  "/rounds/:id",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.updateDriveRound,
);

router.delete(
  "/rounds/:id",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.deleteDriveRound,
);

// Drive Applications & Selection Pipeline
router.get(
  "/drives/:id/applications",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.getDriveApplications,
);

router.put(
  "/applications/bulk/status",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.bulkUpdateApplicationStatus,
);

router.put(
  "/applications/:id/status",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.updateApplicationStatus,
);

// Placement Record Management
router.get(
  "/drives/:id/placements",
  authenticate,
  checkPermission(["placement.drive.manage", "placement.drive.view"]),
  placementDriveController.getPlacementRecords,
);

router.put(
  "/placements/:id",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.updatePlacementRecord,
);

// Department Placement Routes
router.get(
  "/department/:departmentId/stats",
  authenticate,
  checkPermission(["placement.department.view", "placement.drive.manage"]),
  departmentPlacementController.getDepartmentStats,
);

router.get(
  "/department/:departmentId/students",
  authenticate,
  checkPermission(["placement.department.view", "placement.drive.manage"]),
  departmentPlacementController.getDepartmentStudentList,
);

router.get(
  "/department/:departmentId/drives",
  authenticate,
  checkPermission(["placement.department.view", "placement.drive.manage"]),
  departmentPlacementController.getDepartmentDrives,
);

router.get(
  "/department/:departmentId/drives/:driveId/students",
  authenticate,
  checkPermission(["placement.department.view", "placement.drive.manage"]),
  departmentPlacementController.getDriveStudentMatrix,
);

router.get(
  "/department/:departmentId/drives/:driveId",
  authenticate,
  checkPermission(["placement.department.view", "placement.drive.manage"]),
  departmentPlacementController.getDepartmentDriveDetail,
);

export default router;

// ============================================
// STUDENT PLACEMENT ROUTES
// ============================================

router.get(
  "/my-profile",
  authenticate,
  checkPermission("placement.profile.manage_own"),
  studentPlacementController.getMyProfile,
);

router.post(
  "/my-profile",
  authenticate,
  checkPermission("placement.profile.manage_own"),
  studentPlacementController.updateMyProfile,
);

router.get(
  "/system-fields",
  authenticate,
  checkPermission("placement.profile.manage_own"),
  studentPlacementController.getStudentSystemFields,
);

router.post(
  "/upload-resume",
  authenticate,
  checkPermission("placement.profile.manage_own"),
  studentUpload.single("resume"),
  studentPlacementController.uploadMasterResume,
);

router.get(
  "/eligible-drives",
  authenticate,
  checkPermission("placement.drive.view"),
  studentPlacementController.getEligibleDrives,
);

router.post(
  "/apply",
  authenticate,
  checkPermission("placement.drive.apply"),
  studentPlacementController.applyToDrive,
);

router.get(
  "/my-applications",
  authenticate,
  // checkPermission("placement.application.view_own"),
  studentPlacementController.getMyApplications,
);

router.get(
  "/my-offers",
  authenticate,
  // checkPermission("placement.application.view_own"),
  studentPlacementController.getMyOffers,
);
