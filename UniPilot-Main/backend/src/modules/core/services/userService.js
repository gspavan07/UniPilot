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
};
