import { CoPoMap, CourseOutcome, ProgramOutcome, Course, Program } from "../models/index.js";
import logger from "../utils/logger.js";
import { Op } from "sequelize";

// @desc    Get CO-PO mappings (filtered by course_id and/or program_id)
// @route   GET /api/co-po-maps
// @access  Private
export const getCoPoMappings = async (req, res) => {
    try {
        const { course_id, program_id } = req.query;

        let where = {};
        let coWhere = {};
        let poWhere = {};

        if (course_id) {
            coWhere.course_id = course_id;
        }

        if (program_id) {
            poWhere.program_id = program_id;
        }

        const mappings = await CoPoMap.findAll({
            where,
            include: [
                {
                    model: CourseOutcome,
                    as: "courseOutcome",
                    where: Object.keys(coWhere).length > 0 ? coWhere : undefined,
                    include: [
                        {
                            model: Course,
                            as: "course",
                            attributes: ["id", "name", "code"],
                        },
                    ],
                },
                {
                    model: ProgramOutcome,
                    as: "programOutcome",
                    where: Object.keys(poWhere).length > 0 ? poWhere : undefined,
                    include: [
                        {
                            model: Program,
                            as: "program",
                            attributes: ["id", "name", "code"],
                        },
                    ],
                },
            ],
            order: [
                ["courseOutcome", "co_code", "ASC"],
                ["programOutcome", "po_code", "ASC"],
            ],
        });

        res.status(200).json({
            success: true,
            count: mappings.length,
            data: mappings,
        });
    } catch (error) {
        logger.error("Error fetching CO-PO mappings:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch CO-PO mappings",
        });
    }
};

// @desc    Get CO-PO mapping matrix (for visual representation)
// @route   GET /api/co-po-maps/matrix
// @access  Private
export const getCoPoMatrix = async (req, res) => {
    try {
        const { course_id, program_id } = req.query;

        if (!course_id || !program_id) {
            return res.status(400).json({
                success: false,
                error: "course_id and program_id are required",
            });
        }

        // Get all COs for the course
        const courseOutcomes = await CourseOutcome.findAll({
            where: { course_id },
            order: [["co_code", "ASC"]],
        });

        // Get all POs for the program
        const programOutcomes = await ProgramOutcome.findAll({
            where: { program_id },
            order: [["po_code", "ASC"]],
        });

        // Get all existing mappings
        const mappings = await CoPoMap.findAll({
            include: [
                {
                    model: CourseOutcome,
                    as: "courseOutcome",
                    where: { course_id },
                    attributes: ["id"],
                },
                {
                    model: ProgramOutcome,
                    as: "programOutcome",
                    where: { program_id },
                    attributes: ["id"],
                },
            ],
        });

        // Build matrix
        const matrix = {};
        courseOutcomes.forEach((co) => {
            matrix[co.id] = {};
            programOutcomes.forEach((po) => {
                matrix[co.id][po.id] = 0; // Default to 0 (no mapping)
            });
        });

        // Fill in existing mappings
        mappings.forEach((mapping) => {
            if (matrix[mapping.course_outcome_id]) {
                matrix[mapping.course_outcome_id][mapping.program_outcome_id] = mapping.weightage;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                courseOutcomes: courseOutcomes.map((co) => ({
                    id: co.id,
                    co_code: co.co_code,
                    description: co.description,
                })),
                programOutcomes: programOutcomes.map((po) => ({
                    id: po.id,
                    po_code: po.po_code,
                    description: po.description,
                })),
                matrix,
            },
        });
    } catch (error) {
        logger.error("Error fetching CO-PO matrix:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch CO-PO matrix",
        });
    }
};

// @desc    Create or update a CO-PO mapping (upsert)
// @route   POST /api/co-po-maps
// @access  Private/Admin
export const createOrUpdateMapping = async (req, res) => {
    try {
        const { course_outcome_id, program_outcome_id, weightage } = req.body;

        // Validate required fields
        if (!course_outcome_id || !program_outcome_id || weightage === undefined) {
            return res.status(400).json({
                success: false,
                error: "course_outcome_id, program_outcome_id, and weightage are required",
            });
        }

        // Validate weightage range
        if (weightage < 0 || weightage > 3) {
            return res.status(400).json({
                success: false,
                error: "Weightage must be between 0 and 3",
            });
        }

        // If weightage is 0, delete the mapping if it exists
        if (weightage === 0) {
            await CoPoMap.destroy({
                where: {
                    course_outcome_id,
                    program_outcome_id,
                },
            });

            return res.status(200).json({
                success: true,
                message: "Mapping removed (weightage set to 0)",
            });
        }

        // Check if CO exists
        const co = await CourseOutcome.findByPk(course_outcome_id);
        if (!co) {
            return res.status(404).json({
                success: false,
                error: "Course outcome not found",
            });
        }

        // Check if PO exists
        const po = await ProgramOutcome.findByPk(program_outcome_id);
        if (!po) {
            return res.status(404).json({
                success: false,
                error: "Program outcome not found",
            });
        }

        // Upsert mapping
        const [mapping, created] = await CoPoMap.findOrCreate({
            where: {
                course_outcome_id,
                program_outcome_id,
            },
            defaults: {
                weightage,
            },
        });

        if (!created) {
            mapping.weightage = weightage;
            await mapping.save();
        }

        res.status(created ? 201 : 200).json({
            success: true,
            message: created ? "Mapping created successfully" : "Mapping updated successfully",
            data: mapping,
        });
    } catch (error) {
        logger.error("Error creating/updating CO-PO mapping:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create/update CO-PO mapping",
        });
    }
};

// @desc    Bulk update CO-PO mappings (for entire matrix update)
// @route   POST /api/co-po-maps/bulk
// @access  Private/Admin
export const bulkUpdateMappings = async (req, res) => {
    try {
        const { course_id, program_id, mappings } = req.body;

        // Validate required fields
        if (!course_id || !program_id || !mappings) {
            return res.status(400).json({
                success: false,
                error: "course_id, program_id, and mappings object are required",
            });
        }

        // Get all COs for the course
        const courseOutcomes = await CourseOutcome.findAll({
            where: { course_id },
            attributes: ["id"],
        });

        // Get all POs for the program
        const programOutcomes = await ProgramOutcome.findAll({
            where: { program_id },
            attributes: ["id"],
        });

        const coIds = courseOutcomes.map((co) => co.id);
        const poIds = programOutcomes.map((po) => po.id);

        // Delete all existing mappings for this course-program combination
        if (coIds.length > 0 && poIds.length > 0) {
            await CoPoMap.destroy({
                where: {
                    course_outcome_id: { [Op.in]: coIds },
                    program_outcome_id: { [Op.in]: poIds },
                },
            });
        }

        // Prepare bulk data (only for weightage > 0)
        const bulkData = [];
        Object.keys(mappings).forEach((coId) => {
            if (coIds.includes(coId)) {
                Object.keys(mappings[coId]).forEach((poId) => {
                    const weightage = mappings[coId][poId];
                    if (poIds.includes(poId) && weightage > 0) {
                        bulkData.push({
                            course_outcome_id: coId,
                            program_outcome_id: poId,
                            weightage: parseInt(weightage, 10),
                        });
                    }
                });
            }
        });

        // Bulk create mappings
        let createdMappings = [];
        if (bulkData.length > 0) {
            createdMappings = await CoPoMap.bulkCreate(bulkData, {
                validate: true,
            });
        }

        res.status(200).json({
            success: true,
            message: "Mappings updated successfully",
            count: createdMappings.length,
            data: createdMappings,
        });
    } catch (error) {
        logger.error("Error bulk updating CO-PO mappings:", error);
        res.status(500).json({
            success: false,
            error: "Failed to bulk update CO-PO mappings",
        });
    }
};

// @desc    Delete a CO-PO mapping
// @route   DELETE /api/co-po-maps/:id
// @access  Private/Admin
export const deleteMapping = async (req, res) => {
    try {
        const { id } = req.params;

        const mapping = await CoPoMap.findByPk(id);

        if (!mapping) {
            return res.status(404).json({
                success: false,
                error: "CO-PO mapping not found",
            });
        }

        await mapping.destroy();

        res.status(200).json({
            success: true,
            message: "CO-PO mapping deleted successfully",
        });
    } catch (error) {
        logger.error("Error deleting CO-PO mapping:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete CO-PO mapping",
        });
    }
};

// @desc    Get mapping statistics (for analytics)
// @route   GET /api/co-po-maps/stats
// @access  Private
export const getMappingStats = async (req, res) => {
    try {
        const { course_id, program_id } = req.query;

        if (!course_id || !program_id) {
            return res.status(400).json({
                success: false,
                error: "course_id and program_id are required",
            });
        }

        const mappings = await CoPoMap.findAll({
            include: [
                {
                    model: CourseOutcome,
                    as: "courseOutcome",
                    where: { course_id },
                    attributes: ["co_code"],
                },
                {
                    model: ProgramOutcome,
                    as: "programOutcome",
                    where: { program_id },
                    attributes: ["po_code"],
                },
            ],
        });

        // Calculate statistics
        const stats = {
            totalMappings: mappings.length,
            weightageDistribution: {
                low: mappings.filter((m) => m.weightage === 1).length,
                medium: mappings.filter((m) => m.weightage === 2).length,
                high: mappings.filter((m) => m.weightage === 3).length,
            },
            averageWeightage: mappings.length > 0
                ? (mappings.reduce((sum, m) => sum + m.weightage, 0) / mappings.length).toFixed(2)
                : 0,
        };

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        logger.error("Error fetching mapping statistics:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch mapping statistics",
        });
    }
};
