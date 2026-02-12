const {
  StudentPlacementProfile,
  PlacementDrive,
  DriveEligibility,
  User,
  Placement,
  PlacementPolicy,
  Graduation,
  SemesterResult,
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
      attributes: [
        "id",
        "department_id",
        "regulation_id",
        "previous_academics",
      ],
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

    // 3. CGPA Check
    const graduation = await Graduation.findOne({
      where: { student_id: studentId },
    });

    let studentCgpa = 0;
    if (graduation?.final_cgpa) {
      studentCgpa = parseFloat(graduation.final_cgpa);
    } else {
      const latestResult = await SemesterResult.findOne({
        where: { student_id: studentId },
        order: [["semester", "DESC"]],
      });
      if (latestResult) studentCgpa = parseFloat(latestResult.sgpa || 0);
    }

    if (criteria.min_cgpa > 0 && studentCgpa < parseFloat(criteria.min_cgpa)) {
      errors.push(
        `Minimum CGPA required: ${criteria.min_cgpa}. Your CGPA: ${studentCgpa.toFixed(2)}`,
      );
    }

    // 4. Schooling Check (10th & Inter)
    const academics = student.previous_academics || [];
    const studentTen =
      parseFloat(
        academics.find((a) => a.qualification?.toLowerCase().includes("10"))
          ?.percentage,
      ) || 0;
    const studentInter =
      parseFloat(
        academics.find(
          (a) =>
            a.qualification?.toLowerCase().includes("12") ||
            a.qualification?.toLowerCase().includes("inter") ||
            a.qualification?.toLowerCase().includes("diploma"),
        )?.percentage,
      ) || 0;

    if (
      criteria.min_10th_percent > 0 &&
      studentTen < parseFloat(criteria.min_10th_percent)
    ) {
      errors.push(
        `Minimum 10th percentage required: ${criteria.min_10th_percent}%. Your 10th%: ${studentTen}%`,
      );
    }

    if (
      criteria.min_inter_percent > 0 &&
      studentInter < parseFloat(criteria.min_inter_percent)
    ) {
      errors.push(
        `Minimum Inter/Diploma percentage required: ${criteria.min_inter_percent}%. Your Inter/Diploma%: ${studentInter}%`,
      );
    }

    return {
      eligible: errors.length === 0,
      errors,
    };
  } catch (error) {
    logger.error("Eligibility check error:", error);
    throw error;
  }
};
