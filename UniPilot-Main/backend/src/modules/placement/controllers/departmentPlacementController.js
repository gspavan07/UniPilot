import { Op } from "sequelize";
import { sequelize } from "../../../config/database.js";
import logger from "../../../utils/logger.js";
import CoreService from "../../core/services/index.js";
import AcademicService from "../../academics/services/index.js";
import { Company, DriveEligibility, DriveRound, JobPosting, Placement, PlacementDrive, StudentApplication } from "../models/index.js";

const getProgramIdsForDepartment = async (departmentId) => {
  if (!departmentId) return [];
  const programs = await AcademicService.listPrograms({
    where: { department_id: departmentId },
    attributes: ["id"],
  });
  return programs.map((program) => program.id);
};

const buildStudentProfileWhere = async ({
  departmentId,
  batch_year,
  section,
  batch_years,
} = {}) => {
  const programIds = await getProgramIdsForDepartment(departmentId);
  if (programIds.length === 0) return null;

  const whereProfile = { program_id: { [Op.in]: programIds } };
  if (batch_year) whereProfile.batch_year = batch_year;
  if (Array.isArray(batch_years) && batch_years.length > 0) {
    whereProfile.batch_year = { [Op.in]: batch_years };
  }
  if (section) whereProfile.section = section;
  return whereProfile;
};

/**
 * Get overall placement stats for a department
 */
export const getDepartmentStats = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { batch_year, section } = req.query;

    const requester = await CoreService.findByPk(req.user.userId);
    if (
      requester.is_placement_coordinator &&
      requester.department_id !== departmentId
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied: You can only view your own department's stats",
      });
    }

    const profileWhere = await buildStudentProfileWhere({
      departmentId,
      batch_year: batch_year && batch_year !== "undefined" ? batch_year : null,
      section: section && section !== "undefined" ? section : null,
    });

    if (!profileWhere) {
      return res.status(200).json({
        success: true,
        data: {
          totalStudents: 0,
          placedStudents: 0,
          totalApplications: 0,
          placementPercentage: 0,
        },
      });
    }

    const profiles = await sequelize.models.StudentProfile.findAll({
      where: profileWhere,
      attributes: ["user_id"],
      include: [
        {
          model: sequelize.models.User,
          as: "user",
          attributes: [],
          required: true,
          where: { role: "student" },
        },
      ],
      raw: true,
    });
    const studentIds = [
      ...new Set(profiles.map((profile) => profile.user_id).filter(Boolean)),
    ];
    const totalStudents = studentIds.length;

    // 2. Placed students with filters
    const placedStudents = await Placement.count({
      where: { student_id: { [Op.in]: studentIds }, status: ["offered", "accepted"] },
    });

    // 3. Drive participation with filters
    const totalApplications = await StudentApplication.count({
      where: { student_id: { [Op.in]: studentIds } },
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

    const requester = await CoreService.findByPk(req.user.userId);
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

    const profileWhere = await buildStudentProfileWhere({
      departmentId,
      batch_year: batch_year && batch_year !== "undefined" ? batch_year : null,
      section: section && section !== "undefined" ? section : null,
    });

    if (!profileWhere) {
      return res.status(200).json({ success: true, data: [] });
    }

    const students = await CoreService.findAll({
      where: { role: "student" },
      include: [
        {
          model: sequelize.models.StudentProfile,
          as: "student_profile",
          required: true,
          where: profileWhere,
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "first_name",
        "last_name",
        ["student_id", "id_number"],
        "email",
        "batch_year",
        "section",
      ],
    });

    const studentIds = students.map(s => s.id);

    const placements = await Placement.findAll({
      where: { student_id: { [Op.in]: studentIds } },
      include: [
        {
          model: JobPosting,
          as: "job_posting",
          include: [{ model: Company, as: "company" }],
        },
      ],
    });

    const placementMap = new Map();
    studentIds.forEach(id => placementMap.set(id, []));
    placements.forEach(p => {
      placementMap.get(p.student_id).push(p);
    });

    const result = students.map(student => {
      const studentJSON = student.toJSON ? student.toJSON() : student;
      studentJSON.placements = placementMap.get(studentJSON.id) || [];
      return studentJSON;
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

    const requester = await CoreService.findByPk(req.user.userId);
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

        const profileWhere = await buildStudentProfileWhere({
          departmentId,
          batch_years: eligibility.batch_ids && eligibility.batch_ids.length > 0
            ? eligibility.batch_ids
            : null,
        });

        let eligibleStudentIds = [];
        if (profileWhere) {
          const profiles = await sequelize.models.StudentProfile.findAll({
            where: profileWhere,
            attributes: ["user_id"],
            include: [
              {
                model: sequelize.models.User,
                as: "user",
                attributes: [],
                required: true,
                where: { role: "student" },
              },
            ],
            raw: true,
          });
          eligibleStudentIds = [
            ...new Set(profiles.map((profile) => profile.user_id).filter(Boolean)),
          ];
        }

        const eligibleCount = eligibleStudentIds.length;

        // Count those who applied
        const appliedCount = await StudentApplication.count({
          where: { drive_id: drive.id, student_id: { [Op.in]: eligibleStudentIds } },
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

    const requester = await CoreService.findByPk(req.user.userId);
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
    const profileWhere = await buildStudentProfileWhere({
      departmentId,
      batch_years:
        eligibility.batch_ids && eligibility.batch_ids.length > 0
          ? eligibility.batch_ids
          : null,
    });

    if (!profileWhere) {
      return res.status(200).json({ success: true, data: [] });
    }

    const students = await CoreService.findAll({
      where: { role: "student" },
      include: [
        {
          model: sequelize.models.StudentProfile,
          as: "student_profile",
          required: true,
          where: profileWhere,
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "first_name",
        "last_name",
        ["student_id", "id_number"],
        "email",
        "batch_year",
        "section",
      ],
      order: [
        [{ model: sequelize.models.StudentProfile, as: "student_profile" }, "batch_year", "ASC"],
        ["first_name", "ASC"],
      ],
    });

    const studentIds = students.map(s => s.id);

    const applications = await StudentApplication.findAll({
      where: { drive_id: driveId, student_id: { [Op.in]: studentIds } }
    });

    const applicationMap = new Map();
    applications.forEach(app => applicationMap.set(app.student_id, app));

    // 3. Map status
    const result = students.map((student) => {
      const studentJSON = student.toJSON ? student.toJSON() : student;
      const application = applicationMap.get(studentJSON.id);
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

    const requester = await CoreService.findByPk(req.user.userId);
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
      ],
    });

    if (!drive) {
      return res.status(404).json({ success: false, error: "Drive not found" });
    }

    const driveJson = drive.toJSON();
    if (driveJson.coordinator_id) {
      const userMap = await CoreService.getUserMapByIds([driveJson.coordinator_id]);
      const user = userMap.get(driveJson.coordinator_id);
      if (user) {
        driveJson.coordinator = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        };
      }
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
      data: driveJson,
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
