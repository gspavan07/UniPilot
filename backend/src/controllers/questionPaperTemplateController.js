const { ExamCycle, Course, Program } = require("../models");
const logger = require("../utils/logger");

// @desc    Get templates (all or for a specific course)
// @route   GET /api/question-paper-templates
// @access  Private
exports.getTemplate = async (req, res) => {
    try {
        const { course_id, cycle_id } = req.query;

        if (!cycle_id) {
            return res.status(400).json({
                success: false,
                error: "cycle_id is required",
            });
        }

        const cycle = await ExamCycle.findByPk(cycle_id);

        if (!cycle) {
            return res.status(404).json({
                success: false,
                error: "Exam cycle not found",
            });
        }

        const paperFormat = cycle.paper_format || {};

        if (course_id) {
            const courseFormat = paperFormat[course_id];

            // Return in the format the frontend expects
            return res.status(200).json({
                success: true,
                data: courseFormat ? {
                    course_id,
                    questions: courseFormat.questions || [],
                    total_marks: courseFormat.total_marks
                } : null,
            });
        }

        // Return all formats in this cycle as a list
        const formats = [];
        for (const [cId, format] of Object.entries(paperFormat)) {
            formats.push({
                course_id: cId,
                ...format
            });
        }

        res.status(200).json({
            success: true,
            data: formats,
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
// @route   DELETE /api/question-paper-templates/:id?cycle_id=...&course_id=...
// @access  Private
exports.deleteTemplate = async (req, res) => {
    try {
        const { cycle_id, course_id } = req.query;

        if (!cycle_id || !course_id) {
            return res.status(400).json({
                success: false,
                error: "cycle_id and course_id are required",
            });
        }

        const cycle = await ExamCycle.findByPk(cycle_id);

        if (!cycle) {
            return res.status(404).json({
                success: false,
                error: "Cycle not found",
            });
        }

        const paperFormat = { ...(cycle.paper_format || {}) };
        delete paperFormat[course_id];

        cycle.paper_format = paperFormat;
        await cycle.save();

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
        const { course_id, cycle_id, questions, total_marks } = req.body;

        if (!course_id || !cycle_id || !questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                error: "course_id, cycle_id and questions (array) are required",
            });
        }

        const cycle = await ExamCycle.findByPk(cycle_id);
        if (!cycle) {
            return res.status(404).json({
                success: false,
                error: "Cycle not found",
            });
        }

        const calculatedTotal = total_marks || questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

        const paperFormat = { ...(cycle.paper_format || {}) };
        paperFormat[course_id] = {
            questions,
            total_marks: calculatedTotal,
            updated_at: new Date()
        };

        cycle.paper_format = paperFormat;
        await cycle.save();

        res.status(200).json({
            success: true,
            message: "Question paper format saved successfully",
            data: {
                course_id,
                questions,
                total_marks: calculatedTotal
            },
        });
    } catch (error) {
        logger.error("Error saving question paper template:", error);
        res.status(500).json({
            success: false,
            error: "Failed to save question paper template",
        });
    }
};
