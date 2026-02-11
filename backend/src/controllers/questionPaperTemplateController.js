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
            // Support both new nested structure and old flat structure
            let courseFormat = paperFormat.theory?.[course_id] || paperFormat.lab?.[course_id];

            // Backward compatibility for flat formats
            if (!courseFormat) {
                courseFormat = paperFormat[course_id];
            }

            // Return in the format the frontend expects (normalized to "questions" for consistency in basic template structure)
            return res.status(200).json({
                success: true,
                data: courseFormat ? {
                    course_id,
                    questions: courseFormat.questions || courseFormat.experiments || [],
                    total_marks: courseFormat.total_marks
                } : null,
            });
        }

        // Return all formats across both categories
        const formats = [];
        const theoryFormats = paperFormat.theory || {};
        const labFormats = paperFormat.lab || {};

        // Merge flat formats into a temporary list if transitioning
        const flatFormats = {};
        Object.entries(paperFormat).forEach(([k, v]) => {
            if (k !== 'theory' && k !== 'lab') flatFormats[k] = v;
        });

        const allMapped = { ...flatFormats, ...theoryFormats, ...labFormats };

        for (const [cId, format] of Object.entries(allMapped)) {
            formats.push({
                course_id: cId,
                questions: format.questions || format.experiments || [],
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

        // Try to delete from all possible locations
        if (paperFormat.theory) delete paperFormat.theory[course_id];
        if (paperFormat.lab) delete paperFormat.lab[course_id];
        delete paperFormat[course_id]; // Fallback for old structure

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

        const course = await Course.findByPk(course_id);
        const type = course?.course_type === 'lab' ? 'lab' : 'theory';

        const paperFormat = { ...(cycle.paper_format || {}) };

        // Ensure structure exists
        if (!paperFormat.theory) paperFormat.theory = {};
        if (!paperFormat.lab) paperFormat.lab = {};

        const templateData = {
            total_marks: calculatedTotal,
            updated_at: new Date()
        };

        if (type === 'lab') {
            templateData.experiments = questions;
            paperFormat.lab[course_id] = templateData;
            // Clean up from top level or theory if it exists (migration)
            delete paperFormat[course_id];
            if (paperFormat.theory) delete paperFormat.theory[course_id];
        } else {
            templateData.questions = questions;
            paperFormat.theory[course_id] = templateData;
            // Clean up from top level or lab if it exists (migration)
            delete paperFormat[course_id];
            if (paperFormat.lab) delete paperFormat.lab[course_id];
        }

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
