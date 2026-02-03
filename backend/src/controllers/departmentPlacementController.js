const {
  User,
  StudentApplication,
  Placement,
  PlacementDrive,
  JobPosting,
  Company,
} = require("../models");
const { sequelize } = require("../config/database");
const logger = require("../utils/logger");

/**
 * Get overall placement stats for a department
 */
exports.getDepartmentStats = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // 1. Total students in department
    const totalStudents = await User.count({
      where: { department_id: departmentId, role_id: 3 }, // Assuming 3 is student role
    });

    // 2. Placed students
    const placedStudents = await Placement.count({
      include: [
        {
          model: User,
          as: "student",
          where: { department_id: departmentId },
        },
      ],
      where: { status: ["offered", "accepted"] },
    });

    // 3. Drive participation
    const totalApplications = await StudentApplication.count({
      include: [
        {
          model: User,
          as: "student",
          where: { department_id: departmentId },
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
exports.getDepartmentStudentList = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const students = await User.findAll({
      where: { department_id: departmentId, role_id: 3 },
      attributes: ["id", "first_name", "last_name", "id_number", "email"],
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
