import eligibilityService from "../services/eligibilityService.js";
import policyService from "../services/placementPolicyService.js";
import logger from "../../../utils/logger.js";
import CoreService from "../../core/services/index.js";
import AcademicService from "../../academics/services/index.js";
import { Company, DriveEligibility, DriveRound, JobPosting, Placement, PlacementDrive, StudentApplication, StudentPlacementProfile } from "../models/index.js";

/**
 * Get system-mapped fields for student (CGPA, 10th%, email, mobile)
 */
export const getStudentSystemFields = async (req, res) => {
  try {
    const student = await CoreService.findByPk(req.user.userId, {
      attributes: ["email", "phone", "previous_academics"],
    });

    const profile = await StudentPlacementProfile.findOne({
      where: { student_id: req.user.userId },
      attributes: ["resume_url"],
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, error: "Student not found" });
    }

    // 1. Get CGPA from latest SemesterResult or Graduation
    let cgpa = 0;
    const graduation = await AcademicService.getGraduationByStudentId(req.user.userId);

    if (graduation?.final_cgpa) {
      cgpa = graduation.final_cgpa;
    } else {
      const latestResult = await AcademicService.getLatestSemesterResultByStudentId(req.user.userId);
      if (latestResult) cgpa = latestResult.sgpa; // Simplification: using SGPA of latest sem if CGPA not calculated
    }

    // 2. Extract 10th and Inter/Diploma from previous_academics
    // Assuming structure: [{ type: '10th', percentage: 90 }, { type: 'Inter', percentage: 85 }]
    const academics = student.previous_academics || [];

    const ten =
      academics.find((a) => a.qualification?.toLowerCase().includes("10"))
        ?.percentage || "";

    const inter =
      academics.find(
        (a) =>
          a.qualification?.toLowerCase().includes("12") ||
          a.qualification?.toLowerCase().includes("inter") ||
          a.qualification?.toLowerCase().includes("diploma"),
      )?.percentage || "";

    res.status(200).json({
      success: true,
      data: {
        cgpa: parseFloat(cgpa).toFixed(2),
        ten_percent: ten,
        inter_percent: inter,
        email: student.email,
        mobile: student.phone,
        resume: profile?.resume_url || "",
      },
    });
  } catch (error) {
    logger.error("Error fetching system fields:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Get student's placement profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const profile = await StudentPlacementProfile.findOne({
      where: { student_id: req.user.userId },
    });

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "Profile not found. Please create one.",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error("Error fetching student profile:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Update student's placement profile
 */
export const updateMyProfile = async (req, res) => {
  try {
    const [profile, created] = await StudentPlacementProfile.findOrCreate({
      where: { student_id: req.user.userId },
      defaults: { ...req.body, student_id: req.user.userId },
    });

    if (!created) {
      await profile.update(req.body);
    }

    res.status(200).json({
      success: true,
      data: profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    logger.error("Error updating student profile:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Upload master resume
 */
export const uploadMasterResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const resumeUrl = `/uploads/student_docs/resumes/${req.file.filename}`;

    const [profile, created] = await StudentPlacementProfile.findOrCreate({
      where: { student_id: req.user.userId },
      defaults: { student_id: req.user.userId, resume_url: resumeUrl },
    });

    if (!created) {
      await profile.update({ resume_url: resumeUrl });
    }

    res.status(200).json({
      success: true,
      data: { resume_url: resumeUrl },
      message: "Master resume updated successfully",
    });
  } catch (error) {
    logger.error("Error uploading master resume:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Get eligible drives for the student
 */
export const getEligibleDrives = async (req, res) => {
  try {
    // 1. Fetch student data (CGPA, backlogs, department)
    const student = await CoreService.findByPk(req.user.userId, {
      attributes: ["id", "department_id", "regulation_id"],
      // Note: In real system, we'd fetch actual CGPA/Backlogs from academic records
    });

    // 2. Fetch all active drives with their eligibility
    const drives = await PlacementDrive.findAll({
      where: { status: ["scheduled", "ongoing"] },
      include: [
        {
          model: JobPosting,
          as: "job_posting",
          include: [{ model: Company, as: "company" }],
        },
        {
          model: DriveEligibility,
          as: "eligibility",
        },
      ],
    });

    // 3. Fetch student's existing applications
    const studentApplications = await StudentApplication.findAll({
      where: { student_id: req.user.userId },
      attributes: ["drive_id", "status"],
    });

    const appliedDriveIds = new Set(
      studentApplications.map((app) => app.drive_id),
    );

    // 4. Filter drives based on eligibility rules
    const eligibleDrives = await Promise.all(
      drives.map(async (drive) => {
        const eligibilityRes = await eligibilityService.isStudentEligible(
          req.user.userId,
          drive.id,
        );

        return {
          ...drive.toJSON(),
          isEligible: eligibilityRes.eligible,
          ineligible_reason: eligibilityRes.errors.join(". "),
          hasApplied: appliedDriveIds.has(drive.id),
          applicationStatus: studentApplications.find(
            (app) => app.drive_id === drive.id,
          )?.status,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: eligibleDrives,
    });
  } catch (error) {
    logger.error("Error fetching eligible drives:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Apply for a placement drive
 */
export const applyToDrive = async (req, res) => {
  try {
    const { driveId, registrationFormData } = req.body;

    // Check if drive exists and is open
    const drive = await PlacementDrive.findByPk(driveId);
    if (!drive || drive.status !== "scheduled") {
      return res
        .status(400)
        .json({ success: false, error: "Drive is not open for applications" });
    }

    // 1. Check Technical Eligibility (CGPA, Department etc)
    const eligibility = await eligibilityService.isStudentEligible(
      req.user.userId,
      driveId,
    );
    if (!eligibility.eligible) {
      return res.status(403).json({
        success: false,
        error: "You do not meet the eligibility criteria",
        details: eligibility.errors,
      });
    }

    // 2. Check Placement Policy (Offer limits, Dream rules)
    const policy = await policyService.validatePolicyRestrictions(
      req.user.userId,
      driveId,
    );
    if (!policy.allowed) {
      return res.status(403).json({ success: false, error: policy.reason });
    }

    // Check if already applied
    const existingApp = await StudentApplication.findOne({
      where: { drive_id: driveId, student_id: req.user.userId },
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        error: "You have already applied for this drive",
      });
    }

    // Create application
    const application = await StudentApplication.create({
      drive_id: driveId,
      student_id: req.user.userId,
      registration_form_data: registrationFormData,
      status: "applied",
    });

    // Sync master resume if a resume was uploaded/changed in the form
    // We look for any field that might be a resume URL (typically string ending in .pdf)
    // Or we check if the drive has any 'system' field mapped to 'resume'
    const driveFields = await PlacementDrive.findByPk(driveId, {
      attributes: ["registration_form_fields"],
    });

    const resumeField = driveFields?.registration_form_fields?.find(
      (f) => f.type === "system" && f.systemField === "resume",
    );

    if (resumeField && registrationFormData[resumeField.id]) {
      const newResumeUrl = registrationFormData[resumeField.id];
      const [profile] = await StudentPlacementProfile.findOrCreate({
        where: { student_id: req.user.userId },
        defaults: { student_id: req.user.userId, resume_url: newResumeUrl },
      });
      if (profile.resume_url !== newResumeUrl) {
        await profile.update({ resume_url: newResumeUrl });
      }
    }

    res.status(201).json({
      success: true,
      data: application,
      message: "Application submitted successfully",
    });
  } catch (error) {
    logger.error("Error applying to drive:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Get my applications
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await StudentApplication.findAll({
      where: { student_id: req.user.userId },
      include: [
        {
          model: DriveRound,
          as: "current_round",
        },
        {
          model: PlacementDrive,
          as: "drive",
          include: [
            {
              model: JobPosting,
              as: "job_posting",
              include: [{ model: Company, as: "company" }],
            },
            {
              model: DriveRound,
              as: "rounds",
            },
          ],
          order: [[{ model: DriveRound, as: "rounds" }, "round_number", "ASC"]],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    logger.error("Error fetching student applications:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Get student's placement offers
 */
export const getMyOffers = async (req, res) => {
  try {
    const placements = await Placement.findAll({
      where: { student_id: req.user.userId },
      include: [
        {
          model: PlacementDrive,
          as: "drive",
          include: [
            {
              model: JobPosting,
              as: "job_posting",
              include: [{ model: Company, as: "company" }],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: placements,
    });
  } catch (error) {
    logger.error("Error fetching student offers:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export default {
  getStudentSystemFields,
  getMyProfile,
  updateMyProfile,
  uploadMasterResume,
  getEligibleDrives,
  applyToDrive,
  getMyApplications,
  getMyOffers,
};
