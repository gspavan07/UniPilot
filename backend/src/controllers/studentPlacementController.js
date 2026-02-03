const {
  StudentPlacementProfile,
  PlacementDrive,
  StudentApplication,
  JobPosting,
  Company,
  DriveEligibility,
  User,
} = require("../models");
const eligibilityService = require("../services/eligibilityService");
const policyService = require("../services/placementPolicyService");
const logger = require("../utils/logger");

/**
 * Get student's placement profile
 */
exports.getMyProfile = async (req, res) => {
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
exports.updateMyProfile = async (req, res) => {
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
 * Get eligible drives for the student
 */
exports.getEligibleDrives = async (req, res) => {
  try {
    // 1. Fetch student data (CGPA, backlogs, department)
    const student = await User.findByPk(req.user.userId, {
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

    // 3. Filter drives based on eligibility rules
    // For this POC, we'll mark eligibility on each drive
    const eligibleDrives = drives.map((drive) => {
      const eligibility = drive.eligibility;
      let isEligible = true;
      let reason = "";

      if (eligibility) {
        if (
          eligibility.department_ids?.length > 0 &&
          !eligibility.department_ids.includes(student.department_id)
        ) {
          isEligible = false;
          reason = "Department not eligible";
        }
        // Additional checks (CGPA, etc.) would go here
      }

      return {
        ...drive.toJSON(),
        isEligible,
        ineligible_reason: reason,
      };
    });

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
exports.applyToDrive = async (req, res) => {
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
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await StudentApplication.findAll({
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
