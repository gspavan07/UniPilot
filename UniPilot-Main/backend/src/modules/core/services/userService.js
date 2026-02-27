import { Op } from "sequelize";
import { User } from "../models/index.js";

export const findByPk = (id, options = {}) => User.findByPk(id, options);

export const findOne = (options = {}) => User.findOne(options);

export const findAll = (options = {}) => User.findAll(options);

export const findAndCountAll = (options = {}) => User.findAndCountAll(options);

export const count = (options = {}) => User.count(options);

export const sum = (field, options = {}) => User.sum(field, options);

export const create = (values, options = {}) => User.create(values, options);

export const update = (values, options = {}) => User.update(values, options);

export const destroy = (options = {}) => User.destroy(options);

export const getUsersByIds = async (ids = [], options = {}) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];
  return User.findAll({ where: { id: { [Op.in]: uniqueIds } }, ...options });
};

export const getUserMapByIds = async (ids = [], options = {}) => {
  const users = await getUsersByIds(ids, options);
  return new Map(users.map((user) => [user.id, user]));
};

export const getDistinctBatchYears = async ({
  role = "student",
  transaction,
} = {}) => {
  const rows = await User.findAll({
    attributes: [
      [
        User.sequelize.fn("DISTINCT", User.sequelize.col("batch_year")),
        "batch_year",
      ],
    ],
    where: {
      batch_year: { [Op.ne]: null },
      role,
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
  const [row] = await User.findAll({
    attributes: [
      "current_semester",
      [User.sequelize.fn("COUNT", User.sequelize.col("current_semester")), "count"],
    ],
    where: {
      batch_year: batchYear,
      role,
      current_semester: { [Op.ne]: null },
    },
    group: ["current_semester"],
    order: [[User.sequelize.literal("count"), "DESC"]],
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
