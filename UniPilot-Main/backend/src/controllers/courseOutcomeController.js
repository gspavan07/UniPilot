import { CourseOutcome, Course } from "../models/index.js";
import logger from "../utils/logger.js";

// @desc    Get all course outcomes (optionally filtered by course_id)
// @route   GET /api/course-outcomes
// @access  Private
export const getAllCourseOutcomes = async (req, res) => {
    try {
        const { course_id } = req.query;
        const where = {};

        if (course_id) {
            where.course_id = course_id;
        }

        const outcomes = await CourseOutcome.findAll({
            where,
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: ["id", "name", "code"],
                },
            ],
            order: [["co_code", "ASC"]],
        });

        res.status(200).json({
            success: true,
            count: outcomes.length,
            data: outcomes,
        });
    } catch (error) {
        logger.error("Error fetching course outcomes:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch course outcomes",
        });
    }
};

// @desc    Get single course outcome by ID
// @route   GET /api/course-outcomes/:id
// @access  Private
export const getCourseOutcomeById = async (req, res) => {
    try {
        const { id } = req.params;

        const outcome = await CourseOutcome.findByPk(id, {
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        if (!outcome) {
            return res.status(404).json({
                success: false,
                error: "Course outcome not found",
            });
        }

        res.status(200).json({
            success: true,
            data: outcome,
        });
    } catch (error) {
        logger.error("Error fetching course outcome:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch course outcome",
        });
    }
};

// @desc    Create a new course outcome
// @route   POST /api/course-outcomes
// @access  Private/Admin
export const createCourseOutcome = async (req, res) => {
    try {
        const { course_id, co_code, description, target_attainment } = req.body;

        // Validate required fields
        if (!course_id || !co_code || !description) {
            return res.status(400).json({
                success: false,
                error: "course_id, co_code, and description are required",
            });
        }

        // Check if course exists
        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                error: "Course not found",
            });
        }

        // Check for duplicate co_code within the same course
        const existing = await CourseOutcome.findOne({
            where: { course_id, co_code },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: `Course outcome with code ${co_code} already exists for this course`,
            });
        }

        const outcome = await CourseOutcome.create({
            course_id,
            co_code,
            description,
            target_attainment: target_attainment || 60, // Default to 60%
        });

        res.status(201).json({
            success: true,
            data: outcome,
        });
    } catch (error) {
        logger.error("Error creating course outcome:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create course outcome",
        });
    }
};

// @desc    Bulk create course outcomes
// @route   POST /api/course-outcomes/bulk
// @access  Private/Admin
export const bulkCreateCourseOutcomes = async (req, res) => {
    try {
        const { course_id, outcomes } = req.body;

        // Validate required fields
        if (!course_id || !outcomes || !Array.isArray(outcomes)) {
            return res.status(400).json({
                success: false,
                error: "course_id and outcomes array are required",
            });
        }

        // Check if course exists
        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                error: "Course not found",
            });
        }

        // Prepare bulk data
        const bulkData = outcomes.map((outcome) => ({
            course_id,
            co_code: outcome.co_code,
            description: outcome.description,
            target_attainment: outcome.target_attainment || 60,
        }));

        // Create all outcomes
        const createdOutcomes = await CourseOutcome.bulkCreate(bulkData, {
            validate: true,
            ignoreDuplicates: false,
        });

        res.status(201).json({
            success: true,
            count: createdOutcomes.length,
            data: createdOutcomes,
        });
    } catch (error) {
        logger.error("Error bulk creating course outcomes:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: "Duplicate CO codes detected. Each CO code must be unique within a course.",
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to bulk create course outcomes",
        });
    }
};

// @desc    Update a course outcome
// @route   PUT /api/course-outcomes/:id
// @access  Private/Admin
export const updateCourseOutcome = async (req, res) => {
    try {
        const { id } = req.params;
        const { co_code, description, target_attainment } = req.body;

        const outcome = await CourseOutcome.findByPk(id);

        if (!outcome) {
            return res.status(404).json({
                success: false,
                error: "Course outcome not found",
            });
        }

        // Check for duplicate co_code if it's being changed
        if (co_code && co_code !== outcome.co_code) {
            const existing = await CourseOutcome.findOne({
                where: {
                    course_id: outcome.course_id,
                    co_code,
                },
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: `Course outcome with code ${co_code} already exists for this course`,
                });
            }
        }

        // Update fields
        if (co_code) outcome.co_code = co_code;
        if (description) outcome.description = description;
        if (target_attainment !== undefined) outcome.target_attainment = target_attainment;

        await outcome.save();

        res.status(200).json({
            success: true,
            data: outcome,
        });
    } catch (error) {
        logger.error("Error updating course outcome:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update course outcome",
        });
    }
};

// @desc    Delete a course outcome
// @route   DELETE /api/course-outcomes/:id
// @access  Private/Admin
export const deleteCourseOutcome = async (req, res) => {
    try {
        const { id } = req.params;

        const outcome = await CourseOutcome.findByPk(id);

        if (!outcome) {
            return res.status(404).json({
                success: false,
                error: "Course outcome not found",
            });
        }

        await outcome.destroy();

        res.status(200).json({
            success: true,
            message: "Course outcome deleted successfully",
        });
    } catch (error) {
        logger.error("Error deleting course outcome:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete course outcome",
        });
    }
};

// @desc    Delete all course outcomes for a course
// @route   DELETE /api/course-outcomes/course/:course_id
// @access  Private/Admin
export const deleteCourseOutcomesByCourse = async (req, res) => {
    try {
        const { course_id } = req.params;

        const result = await CourseOutcome.destroy({
            where: { course_id },
        });

        res.status(200).json({
            success: true,
            message: `${result} course outcome(s) deleted successfully`,
            deletedCount: result,
        });
    } catch (error) {
        logger.error("Error deleting course outcomes:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete course outcomes",
        });
    }
};
