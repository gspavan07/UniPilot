import logger from "../../../utils/logger.js";
import { Op } from "sequelize";
import { Course, Department, Program, Regulation } from "../models/index.js";
import { User } from "../../core/models/index.js";



/**
 * Course Controller
 * Handles CRUD operations for courses
 */

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
export const getAllCourses = async (req, res) => {
  try {
    const {
      regulation_id,
      department_id,
      program_id,
      semester,
      course_type,
      batch_year,
    } = req.query;
    const whereClause = {};


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

        // Helper to add IDs from a specific program's structure
        const collectIds = (pId, batch, sem) => {
          if (coursesList[pId]) {
            // Level 1: Program ID
            const programData = coursesList[pId];

            const processBatch = (bYear) => {
              if (programData[bYear]) {
                // Level 2: Batch Year
                const batchData = programData[bYear];

                if (sem) {
                  // Level 3: Semester
                  const ids = batchData[sem] || [];
                  ids.forEach((id) => targetCourseIds.add(id));
                } else {
                  // All semesters in this batch
                  Object.values(batchData).forEach((semIds) => {
                    if (Array.isArray(semIds)) {
                      semIds.forEach((id) => targetCourseIds.add(id));
                    }
                  });
                }
              }
            };

            if (batch) {
              processBatch(batch);
            } else {
              // Iterate all batches if no batch specified
              Object.keys(programData).forEach((bKey) => {
                processBatch(bKey);
              });
            }
          }
        };

        if (program_id) {
          collectIds(program_id, batch_year, semester);
        } else {
          // If no program_id, iterate ALL programs in this regulation
          Object.keys(coursesList).forEach((pKey) => {
            collectIds(pKey, batch_year, semester);
          });
        }

        if (targetCourseIds.size > 0) {
          whereClause.id = { [Op.in]: Array.from(targetCourseIds) };
        } else {
          return res.status(200).json({ success: true, count: 0, data: [] });
        }
      }
    } else if (program_id || semester) {
      // Filtering by program/semester without regulation context is ambiguous in new model
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
      ],
      order: [["name", "ASC"]],
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
export const getCourse = async (req, res) => {
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
export const createCourse = async (req, res) => {
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
export const updateCourse = async (req, res) => {
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
export const deleteCourse = async (req, res) => {
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
export const getMyCourses = async (req, res) => {
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

    if (!student.regulation_id) {
      return res
        .status(404)
        .json({ error: "Student has no regulation assigned" });
    }


    const regulation = await Regulation.findByPk(student.regulation_id);

    if (!regulation || !regulation.courses_list) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const { program_id, batch_year } = student;
    const coursesList = regulation.courses_list;
    let targetIds = new Set();
    let courseToSemesterMap = {};

    // 2. Collect courses from all semesters for this student's program and batch
    if (program_id && coursesList[program_id] && batch_year) {
      if (coursesList[program_id][batch_year]) {
        const programBatchData = coursesList[program_id][batch_year];
        Object.keys(programBatchData).forEach((sem) => {
          const semCourses = programBatchData[sem] || [];
          semCourses.forEach((id) => {
            targetIds.add(id);
            courseToSemesterMap[id] = parseInt(sem);
          });
        });
      }
    }

    // Add Common Courses (All Semesters)
    if (coursesList["common"]) {
      const addFromSource = (source) => {
        Object.keys(source).forEach((sem) => {
          const semCourses = source[sem] || [];
          semCourses.forEach((id) => {
            targetIds.add(id);
            if (!courseToSemesterMap[id]) {
              courseToSemesterMap[id] = parseInt(sem);
            }
          });
        });
      };

      if (coursesList["common"][batch_year]) {
        addFromSource(coursesList["common"][batch_year]);
      } else if (coursesList["common"]["all_batches"]) {
        addFromSource(coursesList["common"]["all_batches"]);
      }
    }

    if (targetIds.size === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // 3. Fetch actual course data
    const courses = await Course.findAll({
      where: {
        id: { [Op.in]: Array.from(targetIds) },
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

    // 4. Attach mapping context
    const coursesWithContext = courses.map((course) => {
      const courseJson = course.toJSON();
      return {
        ...courseJson,
        program_id: student.program_id,
        semester: courseToSemesterMap[course.id],
      };
    });

    res.status(200).json({
      success: true,
      count: coursesWithContext.length,
      data: coursesWithContext,
    });
  } catch (error) {
    logger.error("Error in getMyCourses:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
