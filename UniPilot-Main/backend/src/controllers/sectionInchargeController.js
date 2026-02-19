import {
  SectionIncharge,
  User,
  Department,
  Program,
  Role,
} from "../models/index.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";

/**
 * Section Incharge Controller
 */

// @desc    Assign faculty as incharge for a section
// @route   POST /api/section-incharges
// @access  Private/Admin/HOD
export const assignSectionIncharge = async (req, res) => {
  try {
    const {
      faculty_id,
      department_id,
      program_id,
      batch_year,
      section,
      academic_year,
    } = req.body;

    if (
      !faculty_id ||
      !department_id ||
      !program_id ||
      !batch_year ||
      !section ||
      !academic_year
    ) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Permission Check
    if (req.user && req.user.userId) {
      const requester = await User.findByPk(req.user.userId, {
        include: [{ model: Role, as: "role_data" }],
      });
      const requesterSlug = requester?.role_data?.slug;

      if (requesterSlug !== "admin" && requesterSlug !== "super_admin") {
        if (requesterSlug === "hod") {
          if (department_id !== requester.department_id) {
            return res.status(403).json({
              success: false,
              error: "You can only assign incharges for your own department",
            });
          }
        } else {
          return res.status(403).json({
            success: false,
            error: "Permission denied",
          });
        }
      }
    }

    // Check if faculty exists and has correct role (faculty or hod)
    const facultyUser = await User.findByPk(faculty_id, {
      include: [{ model: Role, as: "role_data" }],
    });

    if (!facultyUser) {
      return res.status(404).json({
        success: false,
        error: "Faculty user not found",
      });
    }

    const facultySlug = facultyUser.role_data?.slug;
    if (facultySlug !== "faculty" && facultySlug !== "hod") {
      return res.status(400).json({
        success: false,
        error: "Assigned user must have Faculty or HOD role",
      });
    }

    // Upsert logic: Find existing for this section/batch/program/academic_year
    let incharge = await SectionIncharge.findOne({
      where: {
        program_id,
        batch_year,
        section,
        academic_year,
      },
    });

    if (incharge) {
      incharge = await incharge.update({
        faculty_id,
        department_id,
        is_active: true,
        assigned_by: req.user.userId,
      });
    } else {
      incharge = await SectionIncharge.create({
        faculty_id,
        department_id,
        program_id,
        batch_year,
        section,
        academic_year,
        assigned_by: req.user.userId,
      });
    }

    res.status(200).json({
      success: true,
      data: incharge,
    });
  } catch (error) {
    logger.error("Error in assignSectionIncharge:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get all section incharges
// @route   GET /api/section-incharges
// @access  Private
export const getSectionIncharges = async (req, res) => {
  try {
    const { department_id, program_id, batch_year, academic_year, faculty_id } =
      req.query;

    const where = {};
    if (department_id) where.department_id = department_id;
    if (program_id) where.program_id = program_id;
    if (batch_year) where.batch_year = batch_year;
    if (academic_year) where.academic_year = academic_year;
    if (faculty_id) where.faculty_id = faculty_id;

    const incharges = await SectionIncharge.findAll({
      where,
      include: [
        {
          model: User,
          as: "faculty",
          attributes: ["id", "first_name", "last_name", "email", "employee_id"],
        },
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "code"],
        },
        {
          model: Program,
          as: "program",
          attributes: ["id", "name", "code"],
        },
      ],
      order: [
        ["batch_year", "DESC"],
        ["section", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: incharges.length,
      data: incharges,
    });
  } catch (error) {
    logger.error("Error in getSectionIncharges:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Remove a section incharge assignment
// @route   DELETE /api/section-incharges/:id
// @access  Private/Admin/HOD
export const removeSectionIncharge = async (req, res) => {
  try {
    const incharge = await SectionIncharge.findByPk(req.params.id);

    if (!incharge) {
      return res.status(404).json({
        success: false,
        error: "Section incharge assignment not found",
      });
    }

    // Permission Check
    if (req.user && req.user.userId) {
      const requester = await User.findByPk(req.user.userId, {
        include: [{ model: Role, as: "role_data" }],
      });
      const requesterSlug = requester?.role_data?.slug;

      if (requesterSlug !== "admin" && requesterSlug !== "super_admin") {
        if (requesterSlug === "hod") {
          if (incharge.department_id !== requester.department_id) {
            return res.status(403).json({
              success: false,
              error: "You can only remove incharges in your own department",
            });
          }
        } else {
          return res.status(403).json({
            success: false,
            error: "Permission denied",
          });
        }
      }
    }

    await incharge.destroy();

    res.status(200).json({
      success: true,
      message: "Section incharge assignment removed",
    });
  } catch (error) {
    logger.error("Error in removeSectionIncharge:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export default {
  assignSectionIncharge,
  getSectionIncharges,
  removeSectionIncharge,
};
