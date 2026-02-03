const express = require("express");
const router = express.Router();
const { authenticate, checkPermission } = require("../middleware/auth");

const companyController = require("../controllers/companyController");
const jobPostingController = require("../controllers/jobPostingController");
const placementDriveController = require("../controllers/placementDriveController");
const studentPlacementController = require("../controllers/studentPlacementController");
const departmentPlacementController = require("../controllers/departmentPlacementController");

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
  "/applications/:id/status",
  authenticate,
  checkPermission("placement.drive.manage"),
  placementDriveController.updateApplicationStatus,
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

module.exports = router;

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
  checkPermission("placement.application.view_own"),
  studentPlacementController.getMyApplications,
);
