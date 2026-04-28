import { Op } from "sequelize";
import { Holiday } from "../models/index.js";

export const getHolidayByDate = async (
  date,
  { targets = ["staff", "both"], transaction, raw = false } = {},
) => {
  if (!date) return null;
  return Holiday.findOne({
    where: {
      date,
      target: { [Op.in]: targets },
    },
    transaction,
    raw,
  });
};

export const listHolidaysFromDate = async (
  fromDate,
  { toDate = null, attributes = ["date"], transaction, raw = true } = {},
) => {
  if (!fromDate) return [];

  const where = { date: { [Op.gte]: fromDate } };
  if (toDate) {
    where.date[Op.lte] = toDate;
  }

  return Holiday.findAll({
    where,
    attributes,
    raw,
    transaction,
  });
};

export default {
  getHolidayByDate,
  listHolidaysFromDate,
};
