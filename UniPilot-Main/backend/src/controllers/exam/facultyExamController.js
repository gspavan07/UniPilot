const {
    ExamTimetable,
    ExamCycle,
} = require("../../models/exam/associations");
const { sequelize } = require("../../config/database");
const logger = require("../../utils/logger");
const { Op } = require("sequelize");

/**
 * Get assigned exams for the logged-in faculty
 * GET /api/exam/faculty/assigned-exams
 */
async function getAssignedExams(req, res) {
    try {
        const facultyId = req.user.userId;
        logger.info(`Fetching exams for faculty: ${facultyId}`);

        const exams = await ExamTimetable.findAll({
            where: {
                assigned_faculty_id: facultyId,
                is_deleted: false,
            },
            include: [
                {
                    model: sequelize.models.Course,
                    as: "course",
                    attributes: ["id", "name", "code", "department_id", "course_type"],
                },
                {
                    model: ExamCycle,
                    as: "exam_cycle",
                    attributes: ["id", "cycle_name", "status", "regulation_id", "cycle_type"],
                    // Removed status filter for debugging to see if cycle status is the issue
                },
            ],
            order: [["exam_date", "ASC"]],
        });

        logger.info(`Found ${exams.length} exams for faculty ${facultyId}`);
        if (exams.length > 0) {
            logger.info(`First exam cycle status: ${exams[0].exam_cycle?.status}`);
        }

        // Fetch Regulation details (exam_configuration) for each unique regulation ID
        const regulationIds = [
            ...new Set(exams.map((e) => e.exam_cycle.regulation_id)),
        ];

        const regulations = await sequelize.models.Regulation.findAll({
            where: { id: regulationIds },
            attributes: ["id", "exam_configuration"],
        });

        const regulationMap = {};
        regulations.forEach(r => {
            regulationMap[r.id] = r.exam_configuration;
        });

        // Attach exam configuration to each exam entry
        const examsWithConfig = exams.map(exam => {
            const examJson = exam.toJSON();
            const regId = exam.exam_cycle.regulation_id;
            examJson.exam_configuration = regulationMap[regId] || null;
            return examJson;
        });

        res.json({ success: true, data: examsWithConfig });
    } catch (error) {
        logger.error("Get assigned exams error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Update paper format and exam status
 * PUT /api/exam/faculty/paper-format/:timetableId
 */
async function updatePaperFormat(req, res) {
    try {
        const { timetableId } = req.params;
        const { paper_format } = req.body;
        const facultyId = req.user.userId;

        const exam = await ExamTimetable.findOne({
            where: {
                id: timetableId,
                assigned_faculty_id: facultyId,
            },
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: "Exam not found or you are not assigned to it",
            });
        }

        // Update paper format and status
        await exam.update({
            paper_format,
            exam_status: "format_submitted",
        });

        logger.info(`Paper format updated and status set to 'format_submitted' for exam ${timetableId} by faculty ${facultyId}`);

        res.json({ success: true, message: "Paper format saved successfully", data: exam });
    } catch (error) {
        logger.error("Update paper format error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    getAssignedExams,
    updatePaperFormat,
};
