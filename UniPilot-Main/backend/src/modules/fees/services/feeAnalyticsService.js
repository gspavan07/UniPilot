import { Op, fn, col } from "sequelize";
import { User } from "../../core/models/index.js";
import {
  FeePayment,
  FeeStructure,
  StudentFeeCharge,
} from "../models/index.js";

export const getTotalRevenue = async ({ batchYear } = {}) => {
  const paymentWhere = { status: "completed" };
  if (batchYear) {
    paymentWhere["$student.batch_year$"] = parseInt(batchYear, 10);
  }

  const totalRevenueResult = await FeePayment.sum("amount_paid", {
    where: paymentWhere,
    include: [
      {
        model: User,
        as: "student",
        attributes: [],
        required: !!batchYear,
      },
    ],
  });

  return totalRevenueResult || 0;
};

export const getRevenueTrend = async ({ sinceDate, batchYear } = {}) =>
  FeePayment.findAll({
    attributes: [
      [fn("date_trunc", "month", col("payment_date")), "month"],
      [fn("sum", col("amount_paid")), "collected"],
    ],
    where: {
      status: "completed",
      payment_date: sinceDate ? { [Op.gte]: sinceDate } : undefined,
      ...(batchYear
        ? {
            "$student.batch_year$": parseInt(batchYear, 10),
          }
        : {}),
    },
    include:
      batchYear
        ? [
            {
              model: User,
              as: "student",
              attributes: [],
              required: true,
            },
          ]
        : [],
    group: [fn("date_trunc", "month", col("payment_date"))],
    order: [[fn("date_trunc", "month", col("payment_date")), "ASC"]],
  });

export const getTotalCollectableStructure = async ({ studentWhere } = {}) => {
  const students = await User.findAll({
    where: studentWhere,
    attributes: ["id", "program_id", "admission_type", "batch_year"],
    raw: true,
  });

  const studentIds = students.map((s) => s.id);
  if (studentIds.length === 0) return 0;

  const feeStructures = await FeeStructure.findAll({
    where: {
      is_active: true,
      [Op.or]: [{ student_id: studentIds }, { student_id: null }],
    },
    raw: true,
  });

  let totalCollectableStructure = 0;

  students.forEach((student) => {
    const studentStructures = feeStructures.filter((fs) => {
      if (fs.student_id === student.id) return true;
      if (
        fs.student_id === null &&
        fs.program_id === student.program_id &&
        fs.batch_year === student.batch_year &&
        (fs.applies_to === "all" || fs.applies_to === student.admission_type)
      ) {
        return true;
      }
      return false;
    });

    const studentTotal = studentStructures.reduce(
      (sum, fs) => sum + parseFloat(fs.amount),
      0,
    );
    totalCollectableStructure += studentTotal;
  });

  const extraChargesResult = await StudentFeeCharge.sum("amount", {
    where: { student_id: studentIds },
  });

  return totalCollectableStructure + parseFloat(extraChargesResult || 0);
};

export default {
  getTotalRevenue,
  getRevenueTrend,
  getTotalCollectableStructure,
};
