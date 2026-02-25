import { SalaryGrade, SalaryStructure } from "../models/index.js";

export const createSalaryStructureFromGrade = async ({
  userId,
  gradeId,
  effectiveFrom = new Date(),
} = {}) => {
  if (!userId || !gradeId) return null;

  const grade = await SalaryGrade.findByPk(gradeId);
  if (!grade) return null;

  return SalaryStructure.create({
    user_id: userId,
    grade_id: grade.id,
    basic_salary: grade.basic_salary,
    allowances: grade.allowances || {},
    deductions: grade.deductions || {},
    effective_from: effectiveFrom,
  });
};

export default {
  createSalaryStructureFromGrade,
};
