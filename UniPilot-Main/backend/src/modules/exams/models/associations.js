import ExamCycle from "./ExamCycle.js";
import ExamTimetable from "./ExamTimetable.js";
import ExamFeeConfiguration from "./ExamFeeConfiguration.js";
import LateFeeSlab from "./LateFeeSlab.js";
import ExamAuditLog from "./ExamAuditLog.js";
import ExamFeePayment from "./ExamFeePayment.js";
import ExamStudentEligibility from "./ExamStudentEligibility.js";
import { sequelize } from "../../../config/database.js";
import { Course } from "../../academics/models/index.js";
import { User } from "../../core/models/index.js";
import { FeePayment } from "../../fees/models/index.js";

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

ExamTimetable.belongsTo(Course, {
  foreignKey: "course_id",
  as: "course",
});

ExamTimetable.belongsTo(User, {
  foreignKey: "assigned_faculty_id",
  as: "assigned_faculty",
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

ExamFeePayment.belongsTo(User, {
  foreignKey: "student_id",
  as: "student",
});

ExamFeePayment.belongsTo(FeePayment, {
  foreignKey: "fee_payment_id",
  as: "transaction",
});

// 6. ExamStudentEligibility associations
ExamStudentEligibility.belongsTo(ExamCycle, {
  foreignKey: "exam_cycle_id",
  as: "exam_cycle",
});

ExamStudentEligibility.belongsTo(User, {
  foreignKey: "student_id",
  as: "student",
});

ExamStudentEligibility.belongsTo(User, {
  foreignKey: "bypassed_by",
  as: "bypasser",
});

// Add associations to User model for reverse lookups
if (User) {
  User.hasMany(ExamStudentEligibility, {
    foreignKey: "student_id",
    as: "student_eligibilities",
  });

  User.hasMany(ExamStudentEligibility, {
    foreignKey: "bypassed_by",
    as: "bypassed_eligibilities",
  });
}

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
