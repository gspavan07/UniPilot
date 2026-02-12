const {
  Placement,
  PlacementDrive,
  JobPosting,
  PlacementPolicy,
} = require("../models");
const logger = require("../utils/logger");

/**
 * Check if placement policies allow student to apply
 * (e.g. Dream Company Restriction)
 */
exports.validatePolicyRestrictions = async (studentId, driveId) => {
  try {
    const drive = await PlacementDrive.findByPk(driveId, {
      include: [{ model: JobPosting, as: "job_posting" }],
    });

    // 1. Fetch current placements
    const studentPlacements = await Placement.findAll({
      where: { student_id: studentId, status: ["offered", "accepted"] },
      include: [{ model: JobPosting, as: "job_posting" }],
    });

    if (studentPlacements.length === 0) return { allowed: true };

    // 2. Business Rules (Kakinada/AP context typically has 1-2 offer limits or dream company rules)
    const highestCTC = Math.max(
      ...studentPlacements.map((p) => p.job_posting?.ctc_lpa || 0),
    );
    const currentDriveCTC = drive.job_posting?.ctc_lpa || 0;

    // Rule: Cannot apply for lower/equal package if already placed
    if (currentDriveCTC <= highestCTC) {
      return {
        allowed: false,
        reason: `You are already placed with a package of ${highestCTC} LPA. You can only apply for higher packages.`,
      };
    }

    // Rule: Dream Company Restriction
    // If placed in a "Super Dream" (>15 LPA), typically blocked from further drives
    if (highestCTC >= 15.0) {
      return {
        allowed: false,
        reason:
          "You have already secured a Super Dream placement. Congratulations!",
      };
    }

    return { allowed: true };
  } catch (error) {
    logger.error("Policy check error:", error);
    throw error;
  }
};
