import { Op } from "sequelize";
import FeePayment from "../models/FeePayment.js";

export const createPayment = (values, options = {}) =>
  FeePayment.create(values, options);

export const findByPk = (id, options = {}) => FeePayment.findByPk(id, options);

export const findAll = (options = {}) => FeePayment.findAll(options);

export const getPaymentsByIds = async (ids = [], options = {}) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];
  return FeePayment.findAll({
    where: { id: { [Op.in]: uniqueIds } },
    ...options,
  });
};

export const getPaymentMapByIds = async (ids = [], options = {}) => {
  const payments = await getPaymentsByIds(ids, options);
  return new Map(payments.map((payment) => [payment.id, payment]));
};

export default {
  createPayment,
  findByPk,
  findAll,
  getPaymentsByIds,
  getPaymentMapByIds,
};
