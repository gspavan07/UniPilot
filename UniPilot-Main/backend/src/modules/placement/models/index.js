import Company from "./Company.js";
import CompanyContact from "./CompanyContact.js";
import JobPosting from "./JobPosting.js";
import PlacementDrive from "./PlacementDrive.js";
import DriveEligibility from "./DriveEligibility.js";
import DriveRound from "./DriveRound.js";
import StudentPlacementProfile from "./StudentPlacementProfile.js";
import StudentApplication from "./StudentApplication.js";
import RoundResult from "./RoundResult.js";
import Placement from "./Placement.js";
import PlacementPolicy from "./PlacementPolicy.js";
import PlacementNotification from "./PlacementNotification.js";
import PlacementDocument from "./PlacementDocument.js";

export {
  Company,
  CompanyContact,
  JobPosting,
  PlacementDrive,
  DriveEligibility,
  DriveRound,
  StudentPlacementProfile,
  StudentApplication,
  RoundResult,
  Placement,
  PlacementPolicy,
  PlacementNotification,
  PlacementDocument,
};

// -----------------------------------------------------------------------------
// Placement Module Internal Associations
// -----------------------------------------------------------------------------

// Company <-> CompanyContact
Company.hasMany(CompanyContact, { foreignKey: "company_id", as: "contacts" });
CompanyContact.belongsTo(Company, { foreignKey: "company_id", as: "company" });

// Company <-> JobPosting
Company.hasMany(JobPosting, { foreignKey: "company_id", as: "job_postings" });
JobPosting.belongsTo(Company, { foreignKey: "company_id", as: "company" });

// JobPosting <-> PlacementDrive
JobPosting.hasMany(PlacementDrive, { foreignKey: "job_posting_id", as: "drives" });
PlacementDrive.belongsTo(JobPosting, { foreignKey: "job_posting_id", as: "job_posting" });

// PlacementDrive <-> DriveEligibility
PlacementDrive.hasOne(DriveEligibility, { foreignKey: "drive_id", as: "eligibility" });
DriveEligibility.belongsTo(PlacementDrive, { foreignKey: "drive_id", as: "drive" });

// PlacementDrive <-> DriveRound
PlacementDrive.hasMany(DriveRound, { foreignKey: "drive_id", as: "rounds" });
DriveRound.belongsTo(PlacementDrive, { foreignKey: "drive_id", as: "drive" });

// StudentApplication Associations
StudentApplication.belongsTo(PlacementDrive, { as: "drive", foreignKey: "drive_id" });
PlacementDrive.hasMany(StudentApplication, { as: "applications", foreignKey: "drive_id" });
StudentApplication.belongsTo(DriveRound, { as: "current_round", foreignKey: "current_round_id" });

// RoundResult Associations
RoundResult.belongsTo(DriveRound, { as: "round", foreignKey: "round_id" });
DriveRound.hasMany(RoundResult, { as: "results", foreignKey: "round_id" });

// Placement Associations
Placement.belongsTo(PlacementDrive, { as: "drive", foreignKey: "drive_id" });
Placement.belongsTo(JobPosting, { as: "job_posting", foreignKey: "job_posting_id" });
Placement.belongsTo(StudentApplication, { as: "application", foreignKey: "application_id" });
StudentApplication.hasMany(Placement, { as: "placement_records", foreignKey: "application_id" });
PlacementDrive.hasMany(Placement, { as: "placement_records", foreignKey: "drive_id" });

// PlacementNotification Associations
PlacementNotification.belongsTo(PlacementDrive, { as: "drive", foreignKey: "related_drive_id" });

export default {
  Company,
  CompanyContact,
  JobPosting,
  PlacementDrive,
  DriveEligibility,
  DriveRound,
  StudentPlacementProfile,
  StudentApplication,
  RoundResult,
  Placement,
  PlacementPolicy,
  PlacementNotification,
  PlacementDocument,
};
