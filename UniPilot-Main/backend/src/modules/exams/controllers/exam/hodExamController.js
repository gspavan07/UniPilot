import { ExamCycle, ExamTimetable } from "../../models/associations.js";
import { Course, Regulation } from "../../../academics/models/index.js";
import { User } from "../../../core/models/index.js";
import { Notification } from "../../../notifications/models/index.js";
import { sequelize } from "../../../../config/database.js";
import logger from "../../../../utils/logger.js";
import { Op } from "sequelize";

/**
 * Get formatted papers for HOD's department
 * GET /api/exam/hod/papers
 */
async function getDepartmentFormattedPapers(req, res) {
    try {
        const hodId = req.user.userId;
        const hod = await User.findByPk(hodId, {
            attributes: ["id", "department_id"],
        });

        if (!hod || !hod.department_id) {
            return res.status(403).json({
                success: false,
                error: "You must be associated with a department to view papers.",
            });
        }

        logger.info(`Fetching formatted papers for HOD: ${hodId} in Department: ${hod.department_id}`);

        // Fetch exams where course belongs to HOD's department AND status is formatted
        const exams = await ExamTimetable.findAll({
            where: {
                exam_status: {
                    [Op.in]: ["format_submitted", "format_freezed"],
                },
                is_deleted: false,
            },
            include: [
                {
                    model: Course,
                    as: "course",
                    where: {
                        department_id: hod.department_id,
                    },
                    attributes: ["id", "name", "code", "department_id", "course_type"],
                },
                {
                    model: ExamCycle,
                    as: "exam_cycle",
                    attributes: ["id", "cycle_name", "status", "cycle_type", "regulation_id"],
                },
                {
                    model: User,
                    as: "assigned_faculty",
                    attributes: ["id", "first_name", "last_name"],
                },
            ],
            order: [["updated_at", "DESC"]],
        });

        // Fetch Regulation details similarly to faculty controller
        const regulationIds = [...new Set(exams.map((e) => e.exam_cycle.regulation_id))];
        const regulations = await Regulation.findAll({
            where: { id: regulationIds },
            attributes: ["id", "exam_configuration"],
        });

        const regulationMap = {};
        regulations.forEach(r => {
            regulationMap[r.id] = r.exam_configuration;
        });

        const examsWithConfig = exams.map(exam => {
            const examJson = exam.toJSON();
            const regId = exam.exam_cycle.regulation_id;
            examJson.exam_configuration = regulationMap[regId] || null;
            return examJson;
        });

        res.json({ success: true, data: examsWithConfig });
    } catch (error) {
        logger.error("Get HOD papers error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * HOD Update paper format (Save Draft)
 * PUT /api/exam/hod/paper/:timetableId
 */
async function updatePaperFormat(req, res) {
    const t = await sequelize.transaction();
    try {
        const { timetableId } = req.params;
        const { paper_format } = req.body;
        const hodId = req.user.userId;

        const hod = await User.findByPk(hodId);

        const exam = await ExamTimetable.findOne({
            where: { id: timetableId },
            include: [
                {
                    model: Course,
                    as: "course",
                },
            ],
            transaction: t,
        });

        if (!exam) {
            await t.rollback();
            return res.status(404).json({ success: false, error: "Exam not found" });
        }

        // Verify Department Permission
        if (exam.course.department_id !== hod.department_id) {
            await t.rollback();
            return res.status(403).json({ success: false, error: "Unauthorized: Different Department" });
        }

        // Update paper format
        await exam.update({
            paper_format,
            // Status remains formatted/submitted so faculty sees updates but can still edit until freezed?
            // User requirement: "updated paper format will be shown in faculty login"
            // If HOD edits, it's still "format_submitted" until freezed.
        }, { transaction: t });

        // Notify Faculty
        if (exam.assigned_faculty_id) {
            await Notification.create({
                user_id: exam.assigned_faculty_id,
                title: "Paper Format Updated by HOD",
                message: `The paper format for ${exam.course.name} (${exam.course.code}) has been updated by the HOD. Please review the changes.`,
                type: "INFO",
                metadata: {
                    exam_id: exam.id,
                    action: "hod_update"
                }
            }, { transaction: t });
        }

        await t.commit();

        logger.info(`Paper format updated by HOD ${hodId} for exam ${timetableId}`);
        res.json({ success: true, message: "Paper format updated successfully", data: exam });
    } catch (error) {
        await t.rollback();
        logger.error("HOD Update paper format error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * HOD Freeze paper format
 * PUT /api/exam/hod/freeze/:timetableId
 */
async function freezePaperFormat(req, res) {
    const t = await sequelize.transaction();
    try {
        const { timetableId } = req.params;
        const hodId = req.user.userId;
        const hod = await User.findByPk(hodId);

        const exam = await ExamTimetable.findOne({
            where: { id: timetableId },
            include: [
                {
                    model: Course,
                    as: "course",
                },
            ],
            transaction: t,
        });

        if (!exam) {
            await t.rollback();
            return res.status(404).json({ success: false, error: "Exam not found" });
        }

        if (exam.course.department_id !== hod.department_id) {
            await t.rollback();
            return res.status(403).json({ success: false, error: "Unauthorized" });
        }

        // Freeze
        await exam.update({
            exam_status: "format_freezed", // Using "format_freezed" as discussed
        }, { transaction: t });

        // Notify Faculty
        if (exam.assigned_faculty_id) {
            await Notification.create({
                user_id: exam.assigned_faculty_id,
                title: "Paper Format Freezed",
                message: `The paper format for ${exam.course.name} (${exam.course.code}) has been freezed by the HOD. You can no longer edit it.`,
                type: "WARNING", // Using WARNING to grab attention
                metadata: {
                    exam_id: exam.id,
                    action: "hod_freeze"
                }
            }, { transaction: t });
        }

        await t.commit();

        logger.info(`Paper format freezed by HOD ${hodId} for exam ${timetableId}`);
        res.json({ success: true, message: "Paper format freezed successfully", data: exam });
    } catch (error) {
        await t.rollback();
        logger.error("HOD Freeze paper format error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export default {
    getDepartmentFormattedPapers,
    updatePaperFormat,
    freezePaperFormat,
};
