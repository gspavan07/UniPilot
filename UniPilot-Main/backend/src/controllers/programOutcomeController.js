const { ProgramOutcome, Program } = require("../models");
const logger = require("../utils/logger");

// @desc    Get all program outcomes (optionally filtered by program_id)
// @route   GET /api/program-outcomes
// @access  Private
exports.getAllProgramOutcomes = async (req, res) => {
    try {
        const { program_id } = req.query;
        const where = {};

        if (program_id) {
            where.program_id = program_id;
        }

        const outcomes = await ProgramOutcome.findAll({
            where,
            include: [
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "name", "code"],
                },
            ],
            order: [["po_code", "ASC"]],
        });

        res.status(200).json({
            success: true,
            count: outcomes.length,
            data: outcomes,
        });
    } catch (error) {
        logger.error("Error fetching program outcomes:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch program outcomes",
        });
    }
};

// @desc    Get single program outcome by ID
// @route   GET /api/program-outcomes/:id
// @access  Private
exports.getProgramOutcomeById = async (req, res) => {
    try {
        const { id } = req.params;

        const outcome = await ProgramOutcome.findByPk(id, {
            include: [
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        if (!outcome) {
            return res.status(404).json({
                success: false,
                error: "Program outcome not found",
            });
        }

        res.status(200).json({
            success: true,
            data: outcome,
        });
    } catch (error) {
        logger.error("Error fetching program outcome:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch program outcome",
        });
    }
};

// @desc    Create a new program outcome
// @route   POST /api/program-outcomes
// @access  Private/Admin
exports.createProgramOutcome = async (req, res) => {
    try {
        const { program_id, po_code, description } = req.body;

        // Validate required fields
        if (!program_id || !po_code || !description) {
            return res.status(400).json({
                success: false,
                error: "program_id, po_code, and description are required",
            });
        }

        // Check if program exists
        const program = await Program.findByPk(program_id);
        if (!program) {
            return res.status(404).json({
                success: false,
                error: "Program not found",
            });
        }

        // Check for duplicate po_code within the same program
        const existing = await ProgramOutcome.findOne({
            where: { program_id, po_code },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: `Program outcome with code ${po_code} already exists for this program`,
            });
        }

        const outcome = await ProgramOutcome.create({
            program_id,
            po_code,
            description,
        });

        res.status(201).json({
            success: true,
            data: outcome,
        });
    } catch (error) {
        logger.error("Error creating program outcome:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create program outcome",
        });
    }
};

// @desc    Bulk create program outcomes
// @route   POST /api/program-outcomes/bulk
// @access  Private/Admin
exports.bulkCreateProgramOutcomes = async (req, res) => {
    try {
        const { program_id, outcomes } = req.body;

        // Validate required fields
        if (!program_id || !outcomes || !Array.isArray(outcomes)) {
            return res.status(400).json({
                success: false,
                error: "program_id and outcomes array are required",
            });
        }

        // Check if program exists
        const program = await Program.findByPk(program_id);
        if (!program) {
            return res.status(404).json({
                success: false,
                error: "Program not found",
            });
        }

        // Prepare bulk data
        const bulkData = outcomes.map((outcome) => ({
            program_id,
            po_code: outcome.po_code,
            description: outcome.description,
        }));

        // Create all outcomes
        const createdOutcomes = await ProgramOutcome.bulkCreate(bulkData, {
            validate: true,
            ignoreDuplicates: false, // Will throw error if duplicates exist
        });

        res.status(201).json({
            success: true,
            count: createdOutcomes.length,
            data: createdOutcomes,
        });
    } catch (error) {
        logger.error("Error bulk creating program outcomes:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: "Duplicate PO codes detected. Each PO code must be unique within a program.",
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to bulk create program outcomes",
        });
    }
};

// @desc    Update a program outcome
// @route   PUT /api/program-outcomes/:id
// @access  Private/Admin
exports.updateProgramOutcome = async (req, res) => {
    try {
        const { id } = req.params;
        const { po_code, description } = req.body;

        const outcome = await ProgramOutcome.findByPk(id);

        if (!outcome) {
            return res.status(404).json({
                success: false,
                error: "Program outcome not found",
            });
        }

        // Check for duplicate po_code if it's being changed
        if (po_code && po_code !== outcome.po_code) {
            const existing = await ProgramOutcome.findOne({
                where: {
                    program_id: outcome.program_id,
                    po_code,
                },
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: `Program outcome with code ${po_code} already exists for this program`,
                });
            }
        }

        // Update fields
        if (po_code) outcome.po_code = po_code;
        if (description) outcome.description = description;

        await outcome.save();

        res.status(200).json({
            success: true,
            data: outcome,
        });
    } catch (error) {
        logger.error("Error updating program outcome:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update program outcome",
        });
    }
};

// @desc    Delete a program outcome
// @route   DELETE /api/program-outcomes/:id
// @access  Private/Admin
exports.deleteProgramOutcome = async (req, res) => {
    try {
        const { id } = req.params;

        const outcome = await ProgramOutcome.findByPk(id);

        if (!outcome) {
            return res.status(404).json({
                success: false,
                error: "Program outcome not found",
            });
        }

        await outcome.destroy();

        res.status(200).json({
            success: true,
            message: "Program outcome deleted successfully",
        });
    } catch (error) {
        logger.error("Error deleting program outcome:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete program outcome",
        });
    }
};

// @desc    Delete all program outcomes for a program
// @route   DELETE /api/program-outcomes/program/:program_id
// @access  Private/Admin
exports.deleteProgramOutcomesByProgram = async (req, res) => {
    try {
        const { program_id } = req.params;

        const result = await ProgramOutcome.destroy({
            where: { program_id },
        });

        res.status(200).json({
            success: true,
            message: `${result} program outcome(s) deleted successfully`,
            deletedCount: result,
        });
    } catch (error) {
        logger.error("Error deleting program outcomes:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete program outcomes",
        });
    }
};
