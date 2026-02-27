import logger from "../../../utils/logger.js";
import { Course, CourseFaculty, Department } from "../models/index.js";
import CoreService from "../../core/services/index.js";
import NotificationService from "../../notifications/services/index.js";




// @desc    Get assignments for a specific batch and semester
// @route   GET /api/academic/faculty-assignments
// @access  HOD, Admin
export const getAssignments = async (req, res) => {
    try {
        const { batch_year, semester, program_id, section } = req.query;

        if (!batch_year || !semester || !program_id) {
            return res.status(400).json({
                success: false,
                error: "Please provide batch_year, semester, and program_id",
            });
        }

        const where = {
            batch_year,
            semester,
        };

        if (section) where.section = section;

        const assignments = await CourseFaculty.findAll({
            where,
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: ["id", "name", "code"],
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        // Hydrate Faculty
        const facultyIds = [...new Set(assignments.map(a => a.faculty_id).filter(Boolean))];
        const facultyMap = await CoreService.getUserMapByIds(facultyIds, {
            attributes: ["id", "first_name", "last_name", "email", "employee_id"]
        });

        const enrichedAssignments = assignments.map(assignment => {
            const assignmentJSON = assignment.toJSON ? assignment.toJSON() : assignment;
            if (assignmentJSON.faculty_id) {
                assignmentJSON.faculty = facultyMap.get(assignmentJSON.faculty_id) || null;
            }
            return assignmentJSON;
        });

        res.status(200).json({
            success: true,
            data: enrichedAssignments,
        });
    } catch (error) {
        logger.error("Error in getAssignments:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};

// @desc    Assign faculty to a course
// @route   POST /api/academic/faculty-assignments
// @access  HOD, Admin
export const assignFaculty = async (req, res) => {
    try {
        const {
            course_id,
            faculty_id,
            batch_year,
            semester,
            sections, // Expecting array of sections
            academic_year,
        } = req.body;

        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Please provide at least one section"
            });
        }

        const assigned_by = req.user.userId;
        const createdAssignments = [];
        const skippedSections = [];

        // Iterate over sections and create assignments
        for (const section of sections) {
            // Check if assignment already exists
            const existingAssignment = await CourseFaculty.findOne({
                where: {
                    course_id,
                    faculty_id,
                    batch_year,
                    semester,
                    section: section
                }
            });

            if (existingAssignment) {
                skippedSections.push(section);
                continue;
            }

            const assignment = await CourseFaculty.create({
                course_id,
                faculty_id,
                batch_year,
                semester,
                section,
                academic_year,
                assigned_by,
            });
            createdAssignments.push(assignment);
        }

        if (createdAssignments.length > 0) {
            // Notify Faculty
            const course = await Course.findByPk(course_id);
            const faculty = await CoreService.findByPk(faculty_id);

            if (course && faculty) {
                const sectionList = createdAssignments.map(a => a.section).join(", ");
                await NotificationService.createNotification({
                    user_id: faculty_id,
                    title: "New Course Assignment",
                    message: `You have been assigned to teach ${course.name} (${course.code}) for Batch ${batch_year}, Semester ${semester}, Sections: ${sectionList}.`,
                    type: "ASSIGNMENT",
                    metadata: {
                        course_id: course_id,
                        count: createdAssignments.length
                    }
                });
            }
        }

        res.status(201).json({
            success: true,
            data: createdAssignments,
            message: `Assigned to ${createdAssignments.length} sections.${skippedSections.length > 0 ? ` Skipped ${skippedSections.length} existing.` : ''}`,
        });
    } catch (error) {
        logger.error("Error in assignFaculty:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};

// @desc    Remove faculty assignment
// @route   DELETE /api/academic/faculty-assignments/:id
// @access  HOD, Admin
export const removeAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await CourseFaculty.findByPk(id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: "Assignment not found",
            });
        }

        await assignment.destroy();

        res.status(200).json({
            success: true,
            message: "Assignment removed",
        });
    } catch (error) {
        logger.error("Error in removeAssignment:", error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

export default {
    getAssignments,
    assignFaculty,
    removeAssignment,
};
