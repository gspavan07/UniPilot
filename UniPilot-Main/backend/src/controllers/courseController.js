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
    const { Regulation } = require("../models");
    const { Op } = require("sequelize");

    // 1. Basic Filters (Columns that exist)
    if (department_id) {
      whereClause.department_id = department_id;
    }

    if (course_type) {
      whereClause.course_type = course_type;
    }

    // 2. Complex Filters (Program/Semester via Regulation)
    if (regulation_id) {
      const regulation = await Regulation.findByPk(regulation_id);

      if (regulation && regulation.courses_list) {
        let targetCourseIds = new Set();
        const coursesList = regulation.courses_list;

        // Helper to add IDs from a specific program's semester list
        const collectIds = (pId, sem) => {
          if (coursesList[pId]) {
            if (sem) {
              const ids = coursesList[pId][sem] || [];
              ids.forEach(id => targetCourseIds.add(id));
            } else {
              Object.values(coursesList[pId]).forEach(semIds => {
                if (Array.isArray(semIds)) {
                  semIds.forEach(id => targetCourseIds.add(id));
                }
              });
            }
          }
        };

        if (program_id) {
          collectIds(program_id, semester);
        } else {
          // If no program_id, iterate ALL programs in this regulation
          Object.keys(coursesList).forEach(pKey => {
            collectIds(pKey, semester);
          });
        }

        if (targetCourseIds.size > 0) {
          whereClause.id = { [Op.in]: Array.from(targetCourseIds) };
        } else {
          return res.status(200).json({ success: true, count: 0, data: [] });
        }
      }
    } else if (program_id || semester) {
      // If program/semester is requested but NO regulation, we technically can't fulfill this 
      // because the link exists only in Regulation.courses_list.
      // Option A: Return empty.
      // Option B: Search ALL regulations (expensive).
      // Option C: Return all courses (ignore filter - bad UX).
      // User said: "In the courses catalog every course ... doesn't need to be in regulation".
      // But "In case if they select a program filter ... fetch from courses_list".
      // This implies the filter is meant to utilize the link. 
      // I will return empty data if filtering by prog/sem without regulation, or maybe query all regulations?
      // Let's assume the UI ensures Regulation is selected or we just return nothing/error.
      // For now, I will treat it as "No results" if you filter by Program without a Regulation context,
      // because a "Program" only owns courses *within* a Regulation context in this new model.
      // Wait, does a Course belong to a Department? Yes. Does Program belong to Department? Yes.
      // Is there a direct Program->Course link? NO, we removed it.
      // So yes, Program filtering requires Regulation context.
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const courses = await Course.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "code"],
        },
        // Program relation on Course model might be deprecated if program_id column is gone?
        // Checking model definition... user said "course table no longer have program_id".
        // So we should REMOVE the include for Program if the relation is broken.
        // Keeping it safe: Only include if model supports it. 
        // For now, I'll comment it out to be safe based on user input.
        /* 
        {
          model: Program,
          as: "program",
          attributes: ["id", "name", "code"],
        },
        */
      ],
      order: [
        ["name", "ASC"], // Semester column also removed from Course?, so sort by Name
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

    // 2. Fetch derived course IDs from Regulation
    // Note: Assuming student.regulation_id is mandatory for course mapping now.
    // If not, we have a problem: "Which courses belong to Semester 1 of Program X?" 
    // without a regulation, this question is unanswerable in the new model.

    if (!student.regulation_id) {
      return res.status(404).json({ error: "Student has no regulation assigned" });
    }

    const { Regulation } = require("../models");
    const { Op } = require("sequelize");
    const regulation = await Regulation.findByPk(student.regulation_id);

    if (!regulation || !regulation.courses_list) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const { program_id, current_semester } = student;
    const coursesList = regulation.courses_list;
    let targetIds = new Set();

    // Add Program Specific Courses
    if (program_id && coursesList[program_id]) {
      const semCourses = coursesList[program_id][current_semester] || [];
      semCourses.forEach(id => targetIds.add(id));
    }

    // Add Common Courses? (If your model supports it, e.g. key "common")
    if (coursesList["common"]) {
      const commonCourses = coursesList["common"][current_semester] || [];
      commonCourses.forEach(id => targetIds.add(id));
    }

    if (targetIds.size === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // 3. Fetch actual course data
    const courses = await Course.findAll({
      where: {
        id: { [Op.in]: Array.from(targetIds) }
      },
      include: [
        {
          model: Department,
          as: "department",
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
