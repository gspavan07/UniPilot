const { Course, Department, Program, User } = require("../models");
const logger = require("../utils/logger");

/**
 * Course Controller
 * Handles CRUD operations for courses
 */

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getAllCourses = async (req, res) => {
  try {
    const { regulation_id, department_id, program_id, semester, course_type } =
      req.query;
    const whereClause = {};

    if (regulation_id) {
      whereClause.regulation_id = regulation_id;
    }

    if (department_id) {
      whereClause.department_id = department_id;
    }

    if (program_id) {
      whereClause.program_id = program_id;
    }

    if (semester) {
      whereClause.semester = semester;
    }

    if (course_type) {
      whereClause.course_type = course_type;
    }

    const courses = await Course.findAll({
      where: whereClause,
      include: [
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
        ["semester", "ASC"],
        ["name", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    logger.error("Error in getAllCourses:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
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
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error("Error in getCourse:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error("Error in createCourse:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Course code already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    course = await course.update(req.body);

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error("Error in updateCourse:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Course code already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    await course.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error("Error in deleteCourse:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
// @desc    Get CURRENT STUDENT's courses
// @route   GET /api/courses/my-courses
// @access  Private
exports.getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // 1. Get student's program and semester
    const student = await User.findByPk(studentId);

    if (!student || !student.program_id) {
      return res.status(404).json({
        success: false,
        error: "Student program details not found",
      });
    }

    // 2. Fetch courses for their program and semester
    const whereClause = {
      program_id: student.program_id,
      semester: student.current_semester || 1,
    };

    // If student has a regulation assigned, strictly filter by it
    if (student.regulation_id) {
      whereClause.regulation_id = student.regulation_id;
    }

    const courses = await Course.findAll({
      where: whereClause,
      include: [
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
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    logger.error("Error in getMyCourses:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
