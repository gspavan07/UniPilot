import { ExamCycle, ExamTimetable } from "../../models/associations.js";
import AcademicService from "../../../academics/services/index.js";
import CoreService from "../../../core/services/index.js";
import NotificationService from "../../../notifications/services/index.js";
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
        const hod = await CoreService.findByPk(hodId, {
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
                    model: ExamCycle,
                    as: "exam_cycle",
                    attributes: ["id", "cycle_name", "status", "cycle_type", "regulation_id"],
                },
            ],
            order: [["updated_at", "DESC"]],
        });

        const courseIds = [
            ...new Set(exams.map((exam) => exam.course_id).filter(Boolean)),
        ];
        const facultyIds = [
            ...new Set(
                exams.map((exam) => exam.assigned_faculty_id).filter(Boolean),
            ),
        ];

        const [courses, faculty, regulations] = await Promise.all([
            AcademicService.getCoursesByIds(courseIds, {
                attributes: ["id", "name", "code", "department_id", "course_type"],
                raw: true,
            }),
            CoreService.getUsersByIds(facultyIds, {
                attributes: ["id", "first_name", "last_name"],
            }),
            AcademicService.getRegulationsByIds(
                [...new Set(exams.map((e) => e.exam_cycle?.regulation_id).filter(Boolean))],
                { attributes: ["id", "exam_configuration"], raw: true },
            ),
        ]);

        const courseMap = new Map(courses.map((course) => [course.id, course]));
        const facultyMap = new Map(
            faculty.map((user) => [user.id, user.toJSON?.() ?? user]),
        );
        const regulationMap = new Map(
            regulations.map((regulation) => [regulation.id, regulation.exam_configuration]),
        );

        const filteredExams = exams.filter((exam) => {
            const course = courseMap.get(exam.course_id);
            return course && course.department_id === hod.department_id;
        });

        const examsWithConfig = filteredExams.map((exam) => {
            const examJson = exam.toJSON();
            const regId = exam.exam_cycle?.regulation_id;
            examJson.course = examJson.course_id
                ? courseMap.get(examJson.course_id) || null
                : null;
            examJson.assigned_faculty = examJson.assigned_faculty_id
                ? facultyMap.get(examJson.assigned_faculty_id) || null
                : null;
            examJson.exam_configuration = regId
                ? regulationMap.get(regId) || null
                : null;
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

        const hod = await CoreService.findByPk(hodId, {
            attributes: ["id", "department_id"],
            transaction: t,
        });

        const exam = await ExamTimetable.findOne({
            where: { id: timetableId },
            transaction: t,
        });

        if (!exam) {
            await t.rollback();
            return res.status(404).json({ success: false, error: "Exam not found" });
        }

        const course = await AcademicService.getCourseById(exam.course_id, {
            attributes: ["id", "name", "code", "department_id"],
            transaction: t,
            raw: true,
        });

        if (!course) {
            await t.rollback();
            return res.status(404).json({ success: false, error: "Course not found" });
        }

        // Verify Department Permission
        if (!hod || course.department_id !== hod.department_id) {
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
            await NotificationService.createNotification({
                user_id: exam.assigned_faculty_id,
                title: "Paper Format Updated by HOD",
                message: `The paper format for ${course.name} (${course.code}) has been updated by the HOD. Please review the changes.`,
                type: "INFO",
                metadata: {
                    exam_id: exam.id,
                    action: "hod_update"
                }
            }, { transaction: t });
        }

        await t.commit();

        logger.info(`Paper format updated by HOD ${hodId} for exam ${timetableId}`);
        const examJson = exam.toJSON();
        examJson.course = course;
        res.json({ success: true, message: "Paper format updated successfully", data: examJson });
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
        const hod = await CoreService.findByPk(hodId, {
            attributes: ["id", "department_id"],
            transaction: t,
        });

        const exam = await ExamTimetable.findOne({
            where: { id: timetableId },
            transaction: t,
        });

        if (!exam) {
            await t.rollback();
            return res.status(404).json({ success: false, error: "Exam not found" });
        }

        const course = await AcademicService.getCourseById(exam.course_id, {
            attributes: ["id", "name", "code", "department_id"],
            transaction: t,
            raw: true,
        });

        if (!course) {
            await t.rollback();
            return res.status(404).json({ success: false, error: "Course not found" });
        }

        if (!hod || course.department_id !== hod.department_id) {
            await t.rollback();
            return res.status(403).json({ success: false, error: "Unauthorized" });
        }

        // Freeze
        await exam.update({
            exam_status: "format_freezed", // Using "format_freezed" as discussed
        }, { transaction: t });

        // Notify Faculty
        if (exam.assigned_faculty_id) {
            await NotificationService.createNotification({
                user_id: exam.assigned_faculty_id,
                title: "Paper Format Freezed",
                message: `The paper format for ${course.name} (${course.code}) has been freezed by the HOD. You can no longer edit it.`,
                type: "WARNING", // Using WARNING to grab attention
                metadata: {
                    exam_id: exam.id,
                    action: "hod_freeze"
                }
            }, { transaction: t });
        }

        await t.commit();

        logger.info(`Paper format freezed by HOD ${hodId} for exam ${timetableId}`);
        const examJson = exam.toJSON();
        examJson.course = course;
        res.json({ success: true, message: "Paper format freezed successfully", data: examJson });
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
