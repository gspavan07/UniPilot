import { Op } from "sequelize";
import { Graduation, SemesterResult } from "../models/index.js";

export const getGraduationByStudentId = async (studentId, { transaction, raw = false } = {}) => {
    if (!studentId) return null;
    return Graduation.findOne({
        where: { student_id: studentId },
        transaction,
        raw,
    });
};

export const getLatestSemesterResultByStudentId = async (studentId, { transaction, raw = false } = {}) => {
    if (!studentId) return null;
    return SemesterResult.findOne({
        where: { student_id: studentId },
        order: [["semester", "DESC"]],
        transaction,
        raw,
    });
};

export default {
    getGraduationByStudentId,
    getLatestSemesterResultByStudentId,
};
