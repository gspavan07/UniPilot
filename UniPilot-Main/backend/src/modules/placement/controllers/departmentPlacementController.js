import { Op } from "sequelize";
import { sequelize } from "../../../config/database.js";
import logger from "../../../utils/logger.js";
import { User } from "../../core/models/index.js";
import { Company, DriveEligibility, DriveRound, JobPosting, Placement, PlacementDrive, StudentApplication } from "../models/index.js";

/**
 * Get overall placement stats for a department
 */
export const getDepartmentStats = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { batch_year, section } = req.query;

    // Fetch requester for scoping
    const requester = await User.findByPk(req.user.userId);
    if (
      requester.is_placement_coordinator &&
      requester.department_id !== departmentId
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied: You can only view your own department's stats",
      });
    }

    const studentWhere = { department_id: departmentId, role: "student" };
    if (batch_year && batch_year !== "undefined") {
      studentWhere.batch_year = batch_year;
    }
    if (section && section !== "undefined") {
      studentWhere.section = section;
    }

    // 1. Total students in department with filters
    const totalStudents = await User.count({
      where: studentWhere,
    });

    // 2. Placed students with filters
    const placedStudents = await Placement.count({
      include: [
        {
          model: User,
          as: "student",
          where: studentWhere,
        },
      ],
      where: { status: ["offered", "accepted"] },
    });

    // 3. Drive participation with filters
    const totalApplications = await StudentApplication.count({
      include: [
        {
          model: User,
          as: "student",
          where: studentWhere,
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        placedStudents,
        totalApplications,
        placementPercentage:
          totalStudents > 0
            ? ((placedStudents / totalStudents) * 100).toFixed(2)
            : 0,
      },
    });
  } catch (error) {
    logger.error("Error fetching department stats:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Get list of students in department with their placement status
 */
export const getDepartmentStudentList = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { batch_year, section } = req.query;

    // Fetch requester for scoping
    const requester = await User.findByPk(req.user.userId);
    if (
      requester.is_placement_coordinator &&
      requester.department_id !== departmentId
    ) {
      return res.status(403).json({
        success: false,
        error:
          "Access denied: You can only view your own department's students",
      });
    }

    const where = { department_id: departmentId, role: "student" };

    if (batch_year && batch_year !== "undefined") {
      where.batch_year = batch_year;
    }

    if (section && section !== "undefined") {
      where.section = section;
    }

    const students = await User.findAll({
      where,
      attributes: [
        "id",
        "first_name",
        "last_name",
        ["student_id", "id_number"],
        "email",
        "batch_year",
      ],
      include: [
        {
          model: Placement,
          as: "placements",
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
      data: students,
    });
  } catch (error) {
    logger.error("Error fetching department student list:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Get drives eligible for a department with application counts
 */
export const getDepartmentDrives = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Fetch requester for scoping
    const requester = await User.findByPk(req.user.userId);
    if (
      requester.is_placement_coordinator &&
      requester.department_id !== departmentId
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // 1. Find all drives where this department is eligible
    const drives = await PlacementDrive.findAll({
      include: [
        {
          model: DriveEligibility,
          as: "eligibility",
          where: {
            department_ids: { [Op.contains]: [departmentId] },
          },
          required: true,
        },
        {
          model: JobPosting,
          as: "job_posting",
          include: [{ model: Company, as: "company" }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // 2. For each drive, get stats for this department
    const drivesWithStats = await Promise.all(
      drives.map(async (drive) => {
        const eligibility = drive.eligibility;

        // Base criteria for students in this department
        const studentWhere = {
          department_id: departmentId,
          role: "student",
        };

        // Add batch criteria if defined
        if (eligibility.batch_ids && eligibility.batch_ids.length > 0) {
          studentWhere.batch_year = { [Op.in]: eligibility.batch_ids };
        }

        // Count eligible students in this department
        const eligibleCount = await User.count({ where: studentWhere });

        // Count those who applied
        const appliedCount = await StudentApplication.count({
          where: { drive_id: drive.id },
          include: [
            {
              model: User,
              as: "student",
              where: studentWhere,
            },
          ],
        });

        const driveData = drive.toJSON();
        return {
          ...driveData,
          stats: {
            eligibleCount,
            appliedCount,
            pendingCount: eligibleCount - appliedCount,
          },
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: drivesWithStats,
    });
  } catch (error) {
    logger.error("Error fetching department drives:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Get detailed student application matrix for a specific drive in a department
 */
export const getDriveStudentMatrix = async (req, res) => {
  try {
    const { departmentId, driveId } = req.params;

    // Scoping
    const requester = await User.findByPk(req.user.userId);
    if (
      requester.is_placement_coordinator &&
      requester.department_id !== departmentId
    ) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // 1. Get Drive Eligibility
    const eligibility = await DriveEligibility.findOne({
      where: { drive_id: driveId },
    });

    if (!eligibility) {
      return res
        .status(404)
        .json({ success: false, error: "Drive eligibility not found" });
    }

    // 2. Fetch all students in department who match batch/dept criteria
    const studentWhere = {
      department_id: departmentId,
      role: "student",
    };

    if (eligibility.batch_ids && eligibility.batch_ids.length > 0) {
      studentWhere.batch_year = { [Op.in]: eligibility.batch_ids };
    }

    const students = await User.findAll({
      where: studentWhere,
      attributes: [
        "id",
        "first_name",
        "last_name",
        ["student_id", "id_number"],
        "email",
        "batch_year",
        "section",
      ],
      include: [
        {
          model: StudentApplication,
          as: "placement_applications",
          where: { drive_id: driveId },
          required: false,
        },
      ],
      order: [
        ["batch_year", "ASC"],
        ["first_name", "ASC"],
      ],
    });

    // 3. Map status
    const result = students.map((student) => {
      const application = student.placement_applications?.[0];
      return {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        id_number: student.id_number,
        batch: student.batch_year,
        section: student.section,
        email: student.email,
        status: application ? "Applied" : "Not Applied",
        application_status: application?.status || null,
        application_date: application?.created_at || null,
      };
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching drive student matrix:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Get single drive details for coordinator (simple view)
 */
export const getDepartmentDriveDetail = async (req, res) => {
  try {
    const { departmentId, driveId } = req.params;

    // Scoping
    const requester = await User.findByPk(req.user.userId);
    if (
      requester.is_placement_coordinator &&
      requester.department_id !== departmentId
    ) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // 1. Fetch drive with all necessary associations
    const drive = await PlacementDrive.findOne({
      where: { id: driveId },
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
        {
          model: DriveRound,
          as: "rounds",
        },
        {
          model: User,
          as: "coordinator",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    if (!drive) {
      return res.status(404).json({ success: false, error: "Drive not found" });
    }

    // 2. Verify eligibility for this department
    if (
      drive.eligibility &&
      drive.eligibility.department_ids &&
      !drive.eligibility.department_ids.includes(departmentId)
    ) {
      return res.status(403).json({
        success: false,
        error: "This drive is not eligible for your department",
      });
    }

    res.status(200).json({
      success: true,
      data: drive,
    });
  } catch (error) {
    logger.error("Error fetching department drive detail:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export default {
  getDepartmentStats,
  getDepartmentStudentList,
  getDepartmentDrives,
  getDriveStudentMatrix,
  getDepartmentDriveDetail,
};
