const { QuestionPaperTemplate, Course, Program } = require("../models");
const logger = require("../utils/logger");

// @desc    Get templates (all or for a specific course)
// @route   GET /api/question-paper-templates
// @access  Private
exports.getTemplate = async (req, res) => {
    try {
        const { course_id, program_id } = req.query;

        const where = {};
        if (course_id) where.course_id = course_id;
        if (program_id) where.program_id = program_id;

        // If specific course requested, findOne (for backward compat if needed, but returning array is safer for lists)
        // If course_id is present, let's keep findOne logic for now to avoid breaking existing frontend logic which expects an object if finding by course_id
        // Wait, the current frontend usage fetches by course_id and expects an object or null.
        // Let's check `QuestionPaperFormat.jsx`:
        // const tmplRes = await api.get(`/question-paper-templates?course_id=${selectedCourse}&program_id=${selectedProgram}`);
        // if (tmplRes.data.success && tmplRes.data.data) { setQuestions(tmplRes.data.data.questions || []); }

        // So it expects `data` to be the template object.

        if (course_id) {
            const template = await QuestionPaperTemplate.findOne({
                where,
                include: [
                    {
                        model: Course,
                        as: "course",
                        attributes: ["id", "name", "code"],
                    },
                    {
                        model: Program,
                        as: "program",
                        attributes: ["id", "name", "code"],
                    },
                ],
                order: [["created_at", "DESC"]],
            });

            return res.status(200).json({
                success: true,
                data: template,
            });
        }

        // If no course_id, return ALL templates (list view)
        const templates = await QuestionPaperTemplate.findAll({
            where,
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: ["id", "name", "code"],
                },
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "name", "code"],
                },
            ],
            order: [["updated_at", "DESC"]], // Show recently modified first
        });

        res.status(200).json({
            success: true,
            data: templates,
        });
    } catch (error) {
        logger.error("Error fetching question paper template(s):", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch question paper template(s)",
        });
    }
};

// @desc    Delete a template
// @route   DELETE /api/question-paper-templates/:id
// @access  Private
exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await QuestionPaperTemplate.findByPk(id);

        if (!template) {
            return res.status(404).json({
                success: false,
                error: "Template not found",
            });
        }

        await template.destroy();

        res.status(200).json({
            success: true,
            message: "Template deleted successfully",
        });
    } catch (error) {
        logger.error("Error deleting question paper template:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete question paper template",
        });
    }
};

// @desc    Create or Update template
// @route   POST /api/question-paper-templates
// @access  Private
exports.saveTemplate = async (req, res) => {
    try {
        const { course_id, program_id, questions, total_marks } = req.body;

        if (!course_id || !questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                error: "course_id and questions (array) are required",
            });
        }

        // Calculate total marks if not provided
        const calculatedTotal = total_marks || questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

        // Check if template exists
        const where = { course_id };
        if (program_id) where.program_id = program_id;

        let template = await QuestionPaperTemplate.findOne({ where });

        if (template) {
            // Update existing
            template.questions = questions;
            template.total_marks = calculatedTotal;
            if (req.user) template.created_by = req.user.id; // Track last modifier
            await template.save();
        } else {
            // Create new
            template = await QuestionPaperTemplate.create({
                course_id,
                program_id: program_id || null,
                questions,
                total_marks: calculatedTotal,
                created_by: req.user ? req.user.id : null,
            });
        }

        res.status(200).json({
            success: true,
            message: "Question paper template saved successfully",
            data: template,
        });
    } catch (error) {
        logger.error("Error saving question paper template:", error);
        res.status(500).json({
            success: false,
            error: "Failed to save question paper template",
        });
    }
};
