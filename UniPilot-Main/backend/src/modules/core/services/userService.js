import { Op } from "sequelize";
import { User } from "../models/index.js";
import { sequelize } from "../../../config/database.js";

const STUDENT_PROFILE_FIELDS = new Set([
  "student_id",
  "program_id",
  "regulation_id",
  "batch_year",
  "current_semester",
  "section",
  "admission_date",
  "is_hosteller",
  "requires_transport",
  "academic_status",
  "admission_number",
  "admission_type",
  "is_lateral",
  "is_temporary_id",
  "parent_details",
  "previous_academics",
]);

const STAFF_PROFILE_FIELDS = new Set([
  "employee_id",
  "department_id",
  "salary_grade_id",
  "designation",
  "joining_date",
]);

const splitProfileAttributes = (attributes) => {
  if (attributes === null || attributes === undefined) {
    return {
      userAttributes: attributes,
      studentAttributes: [],
      staffAttributes: [],
    };
  }

  const userAttributes = [];
  const studentAttributes = [];
  const staffAttributes = [];

  attributes.forEach((attr) => {
    if (STUDENT_PROFILE_FIELDS.has(attr)) {
      studentAttributes.push(attr);
    } else if (STAFF_PROFILE_FIELDS.has(attr)) {
      staffAttributes.push(attr);
    } else {
      userAttributes.push(attr);
    }
  });

  return { userAttributes, studentAttributes, staffAttributes };
};

const normalizeUserProfiles = (user) => {
  if (!user) return user;

  const studentProfile = user.student_profile;
  if (studentProfile) {
    STUDENT_PROFILE_FIELDS.forEach((field) => {
      if (studentProfile[field] !== undefined) {
        user.setDataValue(field, studentProfile[field]);
      }
    });
  }

  const staffProfile = user.staff_profile;
  if (staffProfile) {
    STAFF_PROFILE_FIELDS.forEach((field) => {
      if (staffProfile[field] !== undefined) {
        user.setDataValue(field, staffProfile[field]);
      }
    });
  }

  return user;
};

const normalizeUserCollection = (users) => {
  if (!users) return users;
  if (Array.isArray(users)) {
    users.forEach((user) => normalizeUserProfiles(user));
    return users;
  }
  return normalizeUserProfiles(users);
};

// Helper to inject profiles if requested or inferred from attributes
const applyProfileIncludes = (options, { studentAttributes = [], staffAttributes = [] } = {}) => {
  const inferredIncludeStudent = studentAttributes.length > 0;
  const inferredIncludeStaff = staffAttributes.length > 0;

  const includeProfiles =
    options.includeProfiles ??
    (inferredIncludeStudent || inferredIncludeStaff ? ["student", "staff"] : undefined);

  if (!includeProfiles) return options;

  const includes = Array.isArray(options.include)
    ? [...options.include]
    : options.include
      ? [options.include]
      : [];

  const includeStudent =
    includeProfiles === "all" ||
    (Array.isArray(includeProfiles) && includeProfiles.includes("student"));
  const includeStaff =
    includeProfiles === "all" ||
    (Array.isArray(includeProfiles) && includeProfiles.includes("staff"));

  if (includeStudent && !includes.some((inc) => inc.as === "student_profile")) {
    includes.push({
      model: sequelize.models.StudentProfile,
      as: "student_profile",
      required: false,
      attributes: studentAttributes.length > 0 ? studentAttributes : undefined,
    });
  }

  if (includeStaff && !includes.some((inc) => inc.as === "staff_profile")) {
    includes.push({
      model: sequelize.models.StaffProfile,
      as: "staff_profile",
      required: false,
      attributes: staffAttributes.length > 0 ? staffAttributes : undefined,
    });
  }

  return { ...options, includeProfiles, include: includes };
};

export const findByPk = async (id, options = {}) => {
  const { userAttributes, studentAttributes, staffAttributes } = splitProfileAttributes(
    options.attributes,
  );
  const resolvedOptions = applyProfileIncludes(
    { ...options, attributes: userAttributes, includeProfiles: options.includeProfiles ?? "all" },
    { studentAttributes, staffAttributes },
  );
  const user = await User.findByPk(id, resolvedOptions);
  return normalizeUserCollection(user);
};

export const findOne = async (options = {}) => {
  const { userAttributes, studentAttributes, staffAttributes } = splitProfileAttributes(
    options.attributes,
  );
  const resolvedOptions = applyProfileIncludes(
    { ...options, attributes: userAttributes },
    { studentAttributes, staffAttributes },
  );
  const user = await User.findOne(resolvedOptions);
  return normalizeUserCollection(user);
};

export const findAll = async (options = {}) => {
  const { userAttributes, studentAttributes, staffAttributes } = splitProfileAttributes(
    options.attributes,
  );
  const resolvedOptions = applyProfileIncludes(
    { ...options, attributes: userAttributes },
    { studentAttributes, staffAttributes },
  );
  const users = await User.findAll(resolvedOptions);
  return normalizeUserCollection(users);
};

export const findAndCountAll = async (options = {}) => {
  const { userAttributes, studentAttributes, staffAttributes } = splitProfileAttributes(
    options.attributes,
  );
  const resolvedOptions = applyProfileIncludes(
    { ...options, attributes: userAttributes },
    { studentAttributes, staffAttributes },
  );
  const result = await User.findAndCountAll(resolvedOptions);
  normalizeUserCollection(result?.rows);
  return result;
};

export const count = (options = {}) => User.count(options);

export const sum = (field, options = {}) => User.sum(field, options);

export const create = (values, options = {}) => User.create(values, options);

export const update = (values, options = {}) => User.update(values, options);

export const destroy = (options = {}) => User.destroy(options);

export const getUsersByIds = async (ids = [], options = {}) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const { userAttributes, studentAttributes, staffAttributes } = splitProfileAttributes(
    options.attributes,
  );
  const resolvedOptions = applyProfileIncludes(
    {
      ...options,
      attributes: userAttributes,
      where: { id: { [Op.in]: uniqueIds } },
    },
    { studentAttributes, staffAttributes },
  );

  const users = await User.findAll(resolvedOptions);
  return normalizeUserCollection(users);
};

export const getUserMapByIds = async (ids = [], options = {}) => {
  const users = await getUsersByIds(ids, options);
  return new Map(users.map((user) => [user.id, user]));
};

export const getDistinctBatchYears = async ({
  role = "student",
  transaction,
} = {}) => {
  const rows = await sequelize.models.StudentProfile.findAll({
    attributes: [
      [
        sequelize.fn("DISTINCT", sequelize.col("batch_year")),
        "batch_year",
      ],
    ],
    where: {
      batch_year: { [Op.ne]: null },
    },
    order: [["batch_year", "DESC"]],
    raw: true,
    transaction,
  });

  return rows.map((row) => row.batch_year).filter(Boolean);
};

export const getMostCommonSemesterForBatch = async (
  batchYear,
  { role = "student", transaction } = {},
) => {
  if (!batchYear) return null;
  const [row] = await sequelize.models.StudentProfile.findAll({
    attributes: [
      "current_semester",
      [sequelize.fn("COUNT", sequelize.col("current_semester")), "count"],
    ],
    where: {
      batch_year: batchYear,
      current_semester: { [Op.ne]: null },
    },
    group: ["current_semester"],
    order: [[sequelize.literal("count"), "DESC"]],
    limit: 1,
    raw: true,
    transaction,
  });

  return row?.current_semester ?? null;
};

export default {
  findByPk,
  findOne,
  findAll,
  findAndCountAll,
  count,
  sum,
  create,
  update,
  destroy,
  getUsersByIds,
  getUserMapByIds,
  getDistinctBatchYears,
  getMostCommonSemesterForBatch,
};
