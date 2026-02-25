import { Op } from "sequelize";
import { Course, Department, Program, Regulation } from "../models/index.js";

const DEFAULT_PROGRAM_ATTRIBUTES = ["id", "name", "code"];
const DEFAULT_DEPARTMENT_ATTRIBUTES = ["id", "name", "code"];
const DEFAULT_REGULATION_ATTRIBUTES = ["id", "name", "academic_year"];
const DEFAULT_COURSE_ATTRIBUTES = ["id", "name", "code"];

const resolveAttributes = (attributes, defaults) => {
  if (attributes === null) return undefined; // Explicitly request all columns
  return attributes ?? defaults;
};

export const getProgramById = async (
  programId,
  { attributes = DEFAULT_PROGRAM_ATTRIBUTES, transaction, raw = false } = {},
) => {
  if (!programId) return null;
  const resolvedAttributes = resolveAttributes(attributes, DEFAULT_PROGRAM_ATTRIBUTES);
  const options = { transaction, raw };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Program.findByPk(programId, options);
};

export const getDepartmentById = async (
  departmentId,
  { attributes = DEFAULT_DEPARTMENT_ATTRIBUTES, transaction, raw = false } = {},
) => {
  if (!departmentId) return null;
  const resolvedAttributes = resolveAttributes(
    attributes,
    DEFAULT_DEPARTMENT_ATTRIBUTES,
  );
  const options = { transaction, raw };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Department.findByPk(departmentId, options);
};

export const getRegulationById = async (
  regulationId,
  { attributes = DEFAULT_REGULATION_ATTRIBUTES, transaction, raw = false } = {},
) => {
  if (!regulationId) return null;
  const resolvedAttributes = resolveAttributes(
    attributes,
    DEFAULT_REGULATION_ATTRIBUTES,
  );
  const options = { transaction, raw };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Regulation.findByPk(regulationId, options);
};

export const getCourseById = async (
  courseId,
  { attributes = DEFAULT_COURSE_ATTRIBUTES, transaction, raw = false } = {},
) => {
  if (!courseId) return null;
  const resolvedAttributes = resolveAttributes(
    attributes,
    DEFAULT_COURSE_ATTRIBUTES,
  );
  const options = { transaction, raw };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Course.findByPk(courseId, options);
};

export const getProgramsByIds = async (
  programIds = [],
  { attributes = DEFAULT_PROGRAM_ATTRIBUTES, transaction, raw = true } = {},
) => {
  const uniqueIds = [...new Set(programIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const resolvedAttributes = resolveAttributes(attributes, DEFAULT_PROGRAM_ATTRIBUTES);
  const options = {
    where: { id: { [Op.in]: uniqueIds } },
    raw,
    transaction,
  };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Program.findAll(options);
};

export const getDepartmentsByIds = async (
  departmentIds = [],
  { attributes = DEFAULT_DEPARTMENT_ATTRIBUTES, transaction, raw = true } = {},
) => {
  const uniqueIds = [...new Set(departmentIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const resolvedAttributes = resolveAttributes(
    attributes,
    DEFAULT_DEPARTMENT_ATTRIBUTES,
  );
  const options = {
    where: { id: { [Op.in]: uniqueIds } },
    raw,
    transaction,
  };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Department.findAll(options);
};

export const getRegulationsByIds = async (
  regulationIds = [],
  { attributes = DEFAULT_REGULATION_ATTRIBUTES, transaction, raw = true } = {},
) => {
  const uniqueIds = [...new Set(regulationIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const resolvedAttributes = resolveAttributes(
    attributes,
    DEFAULT_REGULATION_ATTRIBUTES,
  );
  const options = {
    where: { id: { [Op.in]: uniqueIds } },
    raw,
    transaction,
  };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Regulation.findAll(options);
};

export const getCoursesByIds = async (
  courseIds = [],
  { attributes = DEFAULT_COURSE_ATTRIBUTES, transaction, raw = true } = {},
) => {
  const uniqueIds = [...new Set(courseIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const resolvedAttributes = resolveAttributes(
    attributes,
    DEFAULT_COURSE_ATTRIBUTES,
  );
  const options = {
    where: { id: { [Op.in]: uniqueIds } },
    raw,
    transaction,
  };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Course.findAll(options);
};

export const listPrograms = async ({
  where = {},
  attributes = DEFAULT_PROGRAM_ATTRIBUTES,
  transaction,
  raw = true,
} = {}) => {
  const resolvedAttributes = resolveAttributes(attributes, DEFAULT_PROGRAM_ATTRIBUTES);
  const options = { where, raw, transaction };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Program.findAll(options);
};

export const listDepartments = async ({
  where = {},
  attributes = DEFAULT_DEPARTMENT_ATTRIBUTES,
  transaction,
  raw = true,
} = {}) => {
  const resolvedAttributes = resolveAttributes(
    attributes,
    DEFAULT_DEPARTMENT_ATTRIBUTES,
  );
  const options = { where, raw, transaction };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Department.findAll(options);
};

export const countDepartments = async ({ where = {}, transaction } = {}) =>
  Department.count({ where, transaction });

export const countPrograms = async ({ where = {}, transaction } = {}) =>
  Program.count({ where, transaction });

export const listCourses = async ({
  where = {},
  attributes = DEFAULT_COURSE_ATTRIBUTES,
  transaction,
  raw = true,
} = {}) => {
  const resolvedAttributes = resolveAttributes(
    attributes,
    DEFAULT_COURSE_ATTRIBUTES,
  );
  const options = { where, raw, transaction };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return Course.findAll(options);
};

export const getProgramMapByIds = async (
  programIds = [],
  { attributes = DEFAULT_PROGRAM_ATTRIBUTES } = {},
) => {
  const programs = await getProgramsByIds(programIds, { attributes });
  return new Map(programs.map((program) => [program.id, program]));
};

export const getDepartmentMapByIds = async (
  departmentIds = [],
  { attributes = DEFAULT_DEPARTMENT_ATTRIBUTES } = {},
) => {
  const departments = await getDepartmentsByIds(departmentIds, { attributes });
  return new Map(departments.map((department) => [department.id, department]));
};

export const getRegulationMapByIds = async (
  regulationIds = [],
  { attributes = DEFAULT_REGULATION_ATTRIBUTES } = {},
) => {
  const regulations = await getRegulationsByIds(regulationIds, { attributes });
  return new Map(regulations.map((regulation) => [regulation.id, regulation]));
};

export const getCourseMapByIds = async (
  courseIds = [],
  { attributes = DEFAULT_COURSE_ATTRIBUTES } = {},
) => {
  const courses = await getCoursesByIds(courseIds, { attributes });
  return new Map(courses.map((course) => [course.id, course]));
};

export const getProgramAndDepartmentByIds = async ({
  programId,
  departmentId,
  programAttributes = DEFAULT_PROGRAM_ATTRIBUTES,
  departmentAttributes = DEFAULT_DEPARTMENT_ATTRIBUTES,
} = {}) => {
  const [program, department] = await Promise.all([
    getProgramById(programId, { attributes: programAttributes }),
    getDepartmentById(departmentId, { attributes: departmentAttributes }),
  ]);

  return { program, department };
};

export default {
  getProgramById,
  getDepartmentById,
  getRegulationById,
  getCourseById,
  getProgramsByIds,
  getDepartmentsByIds,
  getRegulationsByIds,
  getCoursesByIds,
  listPrograms,
  listDepartments,
  countDepartments,
  countPrograms,
  listCourses,
  getProgramMapByIds,
  getDepartmentMapByIds,
  getRegulationMapByIds,
  getCourseMapByIds,
  getProgramAndDepartmentByIds,
};
