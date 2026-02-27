import { Op } from "sequelize";
import { sequelize } from "../../../config/database.js";
import { Attendance } from "../models/index.js";

export const getAttendanceCounts = async (
  { studentId, courseIds = [], transaction } = {},
) => {
  if (!studentId) return { total: 0, present: 0 };

  const where = { student_id: studentId };
  if (courseIds.length > 0) {
    where.course_id = { [Op.in]: courseIds };
  }

  const [summary] = await Attendance.findAll({
    where,
    attributes: [
      [sequelize.fn("COUNT", sequelize.col("id")), "total"],
      [
        sequelize.literal("COUNT(CASE WHEN status = 'present' THEN 1 END)"),
        "present",
      ],
    ],
    raw: true,
    transaction,
  });

  return {
    total: parseInt(summary?.total || 0, 10),
    present: parseInt(summary?.present || 0, 10),
  };
};

export default {
  getAttendanceCounts,
};
