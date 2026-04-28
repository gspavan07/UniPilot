import ExamCycle from "./ExamCycle.js";
import ExamTimetable from "./ExamTimetable.js";
import ExamFeeConfiguration from "./ExamFeeConfiguration.js";
import LateFeeSlab from "./LateFeeSlab.js";
import ExamAuditLog from "./ExamAuditLog.js";
import ExamFeePayment from "./ExamFeePayment.js";
import ExamStudentEligibility from "./ExamStudentEligibility.js";

// Define associations
// 1. ExamCycle associations
ExamCycle.hasMany(ExamTimetable, {
  foreignKey: "exam_cycle_id",
  as: "timetables",
});

ExamCycle.hasOne(ExamFeeConfiguration, {
  foreignKey: "exam_cycle_id",
  as: "fee_configuration",
});

ExamCycle.hasMany(ExamStudentEligibility, {
  foreignKey: "exam_cycle_id",
  as: "student_eligibilities",
});

ExamCycle.hasMany(ExamFeePayment, {
  foreignKey: "exam_cycle_id",
  as: "student_payments",
});

// 2. ExamTimetable associations
ExamTimetable.belongsTo(ExamCycle, {
  foreignKey: "exam_cycle_id",
  as: "exam_cycle",
});

// 3. ExamFeeConfiguration associations
ExamFeeConfiguration.belongsTo(ExamCycle, {
  foreignKey: "exam_cycle_id",
  as: "exam_cycle",
});

ExamFeeConfiguration.hasMany(LateFeeSlab, {
  foreignKey: "fee_config_id",
  as: "slabs",
});

// 4. LateFeeSlab associations
LateFeeSlab.belongsTo(ExamFeeConfiguration, {
  foreignKey: "fee_config_id",
  as: "fee_configuration",
});

// 5. ExamFeePayment associations
ExamFeePayment.belongsTo(ExamCycle, {
  foreignKey: "exam_cycle_id",
  as: "exam_cycle",
});

// 6. ExamStudentEligibility associations
ExamStudentEligibility.belongsTo(ExamCycle, {
  foreignKey: "exam_cycle_id",
  as: "exam_cycle",
});

export {
  ExamCycle,
  ExamTimetable,
  ExamFeeConfiguration,
  LateFeeSlab,
  ExamAuditLog,
  ExamFeePayment,
  ExamStudentEligibility,
};

export default {
  ExamCycle,
  ExamTimetable,
  ExamFeeConfiguration,
  LateFeeSlab,
  ExamAuditLog,
  ExamFeePayment,
  ExamStudentEligibility,
};
