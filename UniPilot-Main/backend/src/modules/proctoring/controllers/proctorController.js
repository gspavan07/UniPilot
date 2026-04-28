import logger from "../../../utils/logger.js";
import { Op } from "sequelize";
import { sequelize } from "../../../config/database.js";
import CoreService from "../../core/services/index.js";
import AcademicService from "../../academics/services/index.js";
import { ProctorAlert, ProctorAssignment, ProctorFeedback, ProctorSession } from "../models/index.js";

const hydrateListWithUser = async (list, userIdField, asField, attributes) => {
  const items = Array.isArray(list) ? list.filter(Boolean) : list ? [list] : [];
  if (items.length === 0) return;

  const userIdsRaw = items.map(item => item[userIdField]).filter(Boolean);
  const userIds = [...new Set(userIdsRaw)];
  if (userIds.length === 0) return;

  const userMap = await CoreService.getUserMapByIds(userIds, { attributes });

  items.forEach(item => {
    const user = userMap.get(item[userIdField]) || null;
    if (typeof item?.setDataValue === 'function') {
      item.setDataValue(asField, user);
    } else {
      item[asField] = user;
    }
  });
};

// @desc    Assign students to a proctor
// @route   POST /api/proctor/assign
// @access  Private/Admin
export const assignProctors = async (req, res) => {
  try {
    const { proctor_id, student_ids, department_id, assignment_type } =
      req.body;

    if (!proctor_id || !student_ids || !Array.isArray(student_ids)) {
      return res.status(400).json({
        success: false,
        error: "Please provide proctor_id and an array of student_ids",
      });
    }

    const assignments = [];
    const now = new Date();

    await sequelize.transaction(async (t) => {
      for (const student_id of student_ids) {
        // Deactivate previous active assignment for the student
        await ProctorAssignment.update(
          { is_active: false, end_date: now },
          {
            where: { student_id, is_active: true },
            transaction: t,
          }
        );

        // Create new assignment
        const assignment = await ProctorAssignment.create(
          {
            proctor_id,
            student_id,
            department_id,
            assignment_type: assignment_type || "ACADEMIC",
            start_date: now,
            assigned_by: req.user.userId,
          },
          { transaction: t }
        );
        assignments.push(assignment);
      }
    });

    res.status(201).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    logger.error("Error assigning proctors:", error);
    res.status(500).json({
      success: false,
      error: "Failed to assign proctors",
    });
  }
};

// @desc    Auto-assign proctors based on department load
// @route   POST /api/proctor/auto-assign
// @access  Private/Admin
export const autoAssignProctors = async (req, res) => {
  try {
    const { department_id, batch_year } = req.body;

    if (!department_id) {
      return res.status(400).json({
        success: false,
        error: "Department ID is required",
      });
    }

    // 1. Get all faculty in department
    const faculty = await CoreService.findAll({
      where: {
        role: { [Op.in]: ["faculty", "hod"] },
        is_active: true,
      },
      include: [
        {
          model: sequelize.models.StaffProfile,
          as: "staff_profile",
          required: true,
          where: { department_id },
          attributes: [],
        },
      ],
      attributes: ["id", "first_name", "last_name"],
    });

    if (faculty.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No faculty found in this department to assign as proctors",
      });
    }

    // 2. Get students in department (optionally filter by batch)
    const programs = await AcademicService.listPrograms({
      where: { department_id },
      attributes: ["id"],
    });
    const programIds = programs.map((program) => program.id);
    if (programIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No programs found for this department",
      });
    }

    const studentProfileWhere = {
      program_id: { [Op.in]: programIds },
    };
    if (batch_year) studentProfileWhere.batch_year = batch_year;

    const students = await CoreService.findAll({
      where: {
        role: "student",
        is_active: true,
      },
      include: [
        {
          model: sequelize.models.StudentProfile,
          as: "student_profile",
          required: true,
          where: studentProfileWhere,
          attributes: [],
        },
      ],
      attributes: ["id"],
    });

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No students found to assign",
      });
    }

    // 3. Shuffle students and assign round-robin to faculty
    const assignments = [];
    const now = new Date();

    await sequelize.transaction(async (t) => {
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const proctor = faculty[i % faculty.length];

        // Deactivate previous
        await ProctorAssignment.update(
          { is_active: false, end_date: now },
          {
            where: { student_id: student.id, is_active: true },
            transaction: t,
          }
        );

        const assignment = await ProctorAssignment.create(
          {
            proctor_id: proctor.id,
            student_id: student.id,
            department_id,
            start_date: now,
            assigned_by: req.user.userId,
          },
          { transaction: t }
        );
        assignments.push(assignment);
      }
    });

    res.status(200).json({
      success: true,
      count: assignments.length,
      message: `Successfully auto-assigned ${assignments.length} students to ${faculty.length} proctors`,
    });
  } catch (error) {
    logger.error("Auto-assign error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to auto-assign proctors",
    });
  }
};

// @desc    Get students assigned to current proctor
// @route   GET /api/proctor/my-students
// @access  Private (Faculty/HOD)
export const getMyStudents = async (req, res) => {
  try {
    const assignments = await ProctorAssignment.findAll({
      where: { proctor_id: req.user.userId, is_active: true }
    });

    await hydrateListWithUser(assignments, "student_id", "student", [
      "id",
      "first_name",
      "last_name",
      "email",
      "student_id",
      "current_semester",
      "phone",
      "profile_picture",
    ]);

    res.status(200).json({
      success: true,
      data: assignments.map((a) => a.student || null).filter(Boolean),
    });
  } catch (error) {
    logger.error("Error fetching proctor's students:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch student list",
    });
  }
};

// @desc    Post a feedback for a student
// @route   POST /api/proctor/feedback
// @access  Private (Faculty/Admin)
export const addFeedback = async (req, res) => {
  try {
    const { student_id, feedback_text, category, severity, is_visible } =
      req.body;

    const assignment = await ProctorAssignment.findOne({
      where: { student_id, is_active: true },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: "No active proctor assignment found for this student",
      });
    }

    const feedback = await ProctorFeedback.create({
      assignment_id: assignment.id,
      feedback_text,
      feedback_category: category || "GENERAL",
      severity: severity || "NEUTRAL",
      is_visible_to_student: is_visible || false,
      created_by: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logger.error("Error adding feedback:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add feedback",
    });
  }
};

// @desc    Schedule/Record a proctoring session
// @route   POST /api/proctor/sessions
// @access  Private (Faculty)
export const createSession = async (req, res) => {
  try {
    const { student_id, session_date, type, agenda, location } = req.body;

    const assignment = await ProctorAssignment.findOne({
      where: { student_id, is_active: true },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: "Active proctor assignment required",
      });
    }

    const session = await ProctorSession.create({
      assignment_id: assignment.id,
      session_date,
      session_type: type || "ONE_ON_ONE",
      agenda,
      location,
      created_by: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error("Error creating proctor session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create session",
    });
  }
};

// @desc    Get proctor details for a student
// @route   GET /api/proctor/my-proctor
// @access  Private (Student)
export const getMyProctor = async (req, res) => {
  try {
    const assignment = await ProctorAssignment.findOne({
      where: { student_id: req.user.userId, is_active: true }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: "No proctor assigned yet",
      });
    }

    await hydrateListWithUser(assignment, "proctor_id", "proctor", [
      "first_name",
      "last_name",
      "email",
      "phone",
      "profile_picture",
    ]);

    res.status(200).json({
      success: true,
      data: assignment.proctor,
    });
  } catch (error) {
    logger.error("Error fetching proctor info:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load proctor details",
    });
  }
};
