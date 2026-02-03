const {
  StudentPlacementProfile,
  PlacementDrive,
  DriveEligibility,
  User,
  Placement,
  PlacementPolicy,
} = require("../models");
const logger = require("../utils/logger");

/**
 * Check if a student is eligible for a specific drive
 */
exports.isStudentEligible = async (studentId, driveId) => {
  try {
    const drive = await PlacementDrive.findByPk(driveId, {
      include: [{ model: DriveEligibility, as: "eligibility" }],
    });

    if (!drive) throw new Error("Drive not found");
    if (!drive.eligibility) return { eligible: true }; // No criteria set

    const student = await User.findByPk(studentId, {
      attributes: ["id", "department_id", "regulation_id"],
      // In real system, join with AcademicRecords
    });

    const criteria = drive.eligibility;
    const errors = [];

    // 1. Department Check
    if (
      criteria.department_ids?.length > 0 &&
      !criteria.department_ids.includes(student.department_id)
    ) {
      errors.push("Your department is not eligible for this drive.");
    }

    // 2. Regulation Check
    if (
      criteria.regulation_ids?.length > 0 &&
      !criteria.regulation_ids.includes(student.regulation_id)
    ) {
      errors.push("Your academic regulation is not eligible.");
    }

    // 3. CGPA & Backlogs (Mock for now, would fetch from real records)
    // const academicRecords = await AcademicService.getStudentStats(studentId);
    // if (academicRecords.cgpa < criteria.min_cgpa) errors.push(`Min CGPA required: ${criteria.min_cgpa}`);
    // if (academicRecords.activeBacklogs > criteria.max_active_backlogs) errors.push(`Max backlogs allowed: ${criteria.max_active_backlogs}`);

    return {
      eligible: errors.length === 0,
      errors,
    };
  } catch (error) {
    logger.error("Eligibility check error:", error);
    throw error;
  }
};
