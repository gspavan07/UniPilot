const ExamCycle = require("./ExamCycle");
const ExamTimetable = require("./ExamTimetable");
const ExamFeeConfiguration = require("./ExamFeeConfiguration");
const LateFeeSlab = require("./LateFeeSlab");
const ExamAuditLog = require("./ExamAuditLog");
const ExamFeePayment = require("./ExamFeePayment");
const ExamStudentEligibility = require("./ExamStudentEligibility");
const { sequelize } = require("../../config/database");

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

ExamTimetable.belongsTo(sequelize.models.Course, {
  foreignKey: "course_id",
  as: "course",
});

ExamTimetable.belongsTo(sequelize.models.User, {
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

ExamFeePayment.belongsTo(sequelize.models.User, {
  foreignKey: "student_id",
  as: "student",
});

ExamFeePayment.belongsTo(sequelize.models.FeePayment, {
  foreignKey: "fee_payment_id",
  as: "transaction",
});

// 6. ExamStudentEligibility associations
ExamStudentEligibility.belongsTo(ExamCycle, {
  foreignKey: "exam_cycle_id",
  as: "exam_cycle",
});

ExamStudentEligibility.belongsTo(sequelize.models.User, {
  foreignKey: "student_id",
  as: "student",
});

ExamStudentEligibility.belongsTo(sequelize.models.User, {
  foreignKey: "bypassed_by",
  as: "bypasser",
});

// Add associations to User model for reverse lookups
if (sequelize.models.User) {
  sequelize.models.User.hasMany(ExamStudentEligibility, {
    foreignKey: "student_id",
    as: "student_eligibilities",
  });

  sequelize.models.User.hasMany(ExamStudentEligibility, {
    foreignKey: "bypassed_by",
    as: "bypassed_eligibilities",
  });
}

module.exports = {
  ExamCycle,
  ExamTimetable,
  ExamFeeConfiguration,
  LateFeeSlab,
  ExamAuditLog,
  ExamFeePayment,
  ExamStudentEligibility,
};
