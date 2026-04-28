import { Op } from "sequelize";
import { FeeCategory, FeeStructure, StudentFeeCharge } from "../models/index.js";

const resolveAttributes = (attributes, fallback) => {
  if (attributes === null) return undefined;
  return attributes ?? fallback;
};

export const getOrCreateCategory = async (
  { name, defaults = {} } = {},
  { transaction } = {},
) => {
  if (!name) throw new Error("Category name is required");
  const [category] = await FeeCategory.findOrCreate({
    where: { name },
    defaults: { name, ...defaults },
    transaction,
  });
  return category;
};

export const getCategoriesByNames = async (
  names = [],
  { attributes = ["id", "name"], transaction } = {},
) => {
  const uniqueNames = [...new Set(names.filter(Boolean))];
  if (uniqueNames.length === 0) return [];

  const resolvedAttributes = resolveAttributes(attributes, ["id", "name"]);
  const options = {
    where: { name: { [Op.in]: uniqueNames } },
    transaction,
  };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return FeeCategory.findAll(options);
};

export const createStudentCharge = async (data, { transaction } = {}) =>
  StudentFeeCharge.create(data, { transaction });

export const findStudentCharge = async ({
  where,
  attributes,
  transaction,
  raw = false,
} = {}) => {
  const options = { where, transaction, raw };
  if (attributes) options.attributes = attributes;
  return StudentFeeCharge.findOne(options);
};

export const findStudentCharges = async ({
  where,
  attributes,
  transaction,
  raw = false,
} = {}) => {
  const options = { where, transaction, raw };
  if (attributes) options.attributes = attributes;
  return StudentFeeCharge.findAll(options);
};

export const updateStudentCharges = async (
  updates,
  { where, transaction } = {},
) => StudentFeeCharge.update(updates, { where, transaction });

export const deleteStudentCharges = async ({ where, transaction } = {}) =>
  StudentFeeCharge.destroy({ where, transaction });

export const countStudentCharges = async ({ where } = {}) =>
  StudentFeeCharge.count({ where });

export const getFeeStructuresByIds = async (
  ids = [],
  { attributes = ["id", "amount", "is_active"], transaction, raw = true } = {},
) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const resolvedAttributes = resolveAttributes(
    attributes,
    ["id", "amount", "is_active"],
  );
  const options = {
    where: { id: { [Op.in]: uniqueIds } },
    transaction,
    raw,
  };
  if (resolvedAttributes) options.attributes = resolvedAttributes;
  return FeeStructure.findAll(options);
};

export const getFeeStructureMapByIds = async (
  ids = [],
  { attributes = ["id", "amount", "is_active"], transaction, raw = true } = {},
) => {
  const structures = await getFeeStructuresByIds(ids, {
    attributes,
    transaction,
    raw,
  });
  return new Map(structures.map((structure) => [structure.id, structure]));
};

export const updateFeeStructures = async (
  updates,
  { where, transaction } = {},
) => FeeStructure.update(updates, { where, transaction });

export default {
  getOrCreateCategory,
  getCategoriesByNames,
  createStudentCharge,
  findStudentCharge,
  findStudentCharges,
  updateStudentCharges,
  deleteStudentCharges,
  countStudentCharges,
  getFeeStructuresByIds,
  getFeeStructureMapByIds,
  updateFeeStructures,
};
