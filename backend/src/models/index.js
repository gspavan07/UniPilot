const { sequelize } = require("../config/database");

// Import models
const User = require("./User");
const Department = require("./Department");
const Program = require("./Program");
const Course = require("./Course");
const Role = require("./Role");
const Permission = require("./Permission");
const ProctorAssignment = require("./ProctorAssignment");
const ProctorSession = require("./ProctorSession");
const ProctorFeedback = require("./ProctorFeedback");
const ProctorAlert = require("./ProctorAlert");
const PromotionCriteria = require("./PromotionCriteria");
const PromotionEvaluation = require("./PromotionEvaluation");
const Graduation = require("./Graduation");
const Attendance = require("./Attendance");
const LeaveRequest = require("./LeaveRequest");
const Holiday = require("./Holiday");
const ExamCycle = require("./ExamCycle");
const ExamSchedule = require("./ExamSchedule");
const ExamMark = require("./ExamMark");
const HallTicket = require("./HallTicket");
const FeeCategory = require("./FeeCategory");
const FeeStructure = require("./FeeStructure");
const FeePayment = require("./FeePayment");
const FeeWaiver = require("./FeeWaiver");
const Book = require("./Book");
const BookIssue = require("./BookIssue");
const Timetable = require("./Timetable");
const TimetableSlot = require("./TimetableSlot");
const FeeSemesterConfig = require("./FeeSemesterConfig");
const StudentDocument = require("./StudentDocument");
const AdmissionConfig = require("./AdmissionConfig");

const models = {
  User,
  Department,
  Program,
  Course,
  Role,
  Permission,
  ProctorAssignment,
  ProctorSession,
  ProctorFeedback,
  ProctorAlert,
  PromotionCriteria,
  PromotionEvaluation,
  Graduation,
  Attendance,
  LeaveRequest,
  Holiday,
  ExamCycle,
  ExamSchedule,
  ExamMark,
  HallTicket,
  FeeCategory,
  FeeStructure,
  FeePayment,
  FeeWaiver,
  Book,
  BookIssue,
  Timetable,
  TimetableSlot,
  FeeSemesterConfig,
  StudentDocument,
  AdmissionConfig,
};

// Define associations
// Department <-> User (HOD)
Department.belongsTo(User, {
  as: "hod",
  foreignKey: "hod_id",
});
User.hasMany(Department, {
  as: "departments_as_hod",
  foreignKey: "hod_id",
});

// Department <-> User (Faculty/Students)
User.belongsTo(Department, {
  as: "department",
  foreignKey: "department_id",
});
Department.hasMany(User, {
  as: "members",
  foreignKey: "department_id",
});

// Program <-> Department
Program.belongsTo(Department, {
  as: "department",
  foreignKey: "department_id",
});
Department.hasMany(Program, {
  as: "programs",
  foreignKey: "department_id",
});

// Program <-> User (Students)
User.belongsTo(Program, {
  as: "program",
  foreignKey: "program_id",
});
Program.hasMany(User, {
  as: "students",
  foreignKey: "program_id",
});

// Course <-> Department
Course.belongsTo(Department, {
  as: "department",
  foreignKey: "department_id",
});
Department.hasMany(Course, {
  as: "courses",
  foreignKey: "department_id",
});

// Course <-> Program
Course.belongsTo(Program, {
  as: "program",
  foreignKey: "program_id",
});
Program.hasMany(Course, {
  as: "courses",
  foreignKey: "program_id",
});

// Self-referencing for parent-child departments
Department.belongsTo(Department, {
  as: "parentDepartment",
  foreignKey: "parent_department_id",
});
Department.hasMany(Department, {
  as: "sub_departments",
  foreignKey: "parent_department_id",
});

// Role <-> User
User.belongsTo(Role, {
  as: "role_data",
  foreignKey: "role_id",
});
Role.hasMany(User, {
  as: "users",
  foreignKey: "role_id",
});

// Role <-> Permission
Role.belongsToMany(Permission, {
  through: "role_permissions",
  as: "permissions",
  foreignKey: "role_id",
  otherKey: "permission_id",
});
Permission.belongsToMany(Role, {
  through: "role_permissions",
  as: "roles",
  foreignKey: "permission_id",
  otherKey: "role_id",
});

// Proctoring Associations
ProctorAssignment.belongsTo(User, { as: "proctor", foreignKey: "proctor_id" });
User.hasMany(ProctorAssignment, {
  as: "proctor_assignments_as_proctor",
  foreignKey: "proctor_id",
});

ProctorAssignment.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(ProctorAssignment, {
  as: "proctor_assignments_as_student",
  foreignKey: "student_id",
});

ProctorAssignment.belongsTo(Department, {
  as: "department",
  foreignKey: "department_id",
});
Department.hasMany(ProctorAssignment, {
  as: "proctor_assignments",
  foreignKey: "department_id",
});

ProctorSession.belongsTo(ProctorAssignment, {
  as: "assignment",
  foreignKey: "assignment_id",
});
ProctorAssignment.hasMany(ProctorSession, {
  as: "sessions",
  foreignKey: "assignment_id",
});

ProctorFeedback.belongsTo(ProctorAssignment, {
  as: "assignment",
  foreignKey: "assignment_id",
});
ProctorAssignment.hasMany(ProctorFeedback, {
  as: "feedback",
  foreignKey: "assignment_id",
});

ProctorFeedback.belongsTo(ProctorSession, {
  as: "session",
  foreignKey: "session_id",
});
ProctorSession.hasMany(ProctorFeedback, {
  as: "feedback",
  foreignKey: "session_id",
});

ProctorAlert.belongsTo(User, { as: "proctor", foreignKey: "proctor_id" });
ProctorAlert.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(ProctorAlert, { as: "proctor_alerts", foreignKey: "proctor_id" });
User.hasMany(ProctorAlert, { as: "student_alerts", foreignKey: "student_id" });

// Promotion & Lifecycle Associations
PromotionCriteria.belongsTo(Program, {
  as: "program",
  foreignKey: "program_id",
});
Program.hasMany(PromotionCriteria, {
  as: "promotion_criteria",
  foreignKey: "program_id",
});

PromotionEvaluation.belongsTo(User, {
  as: "student",
  foreignKey: "student_id",
});
User.hasMany(PromotionEvaluation, {
  as: "evaluations",
  foreignKey: "student_id",
});

Graduation.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasOne(Graduation, { as: "graduation_info", foreignKey: "student_id" });

// Attendance Associations
Attendance.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(Attendance, {
  as: "attendance_records",
  foreignKey: "student_id",
});

Attendance.belongsTo(Course, { as: "course", foreignKey: "course_id" });
Course.hasMany(Attendance, {
  as: "attendance_records",
  foreignKey: "course_id",
});

Attendance.belongsTo(User, { as: "instructor", foreignKey: "marked_by" });

LeaveRequest.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(LeaveRequest, { as: "leave_requests", foreignKey: "student_id" });

LeaveRequest.belongsTo(User, { as: "reviewer", foreignKey: "reviewed_by" });

// Examination Associations
ExamCycle.hasMany(ExamSchedule, {
  as: "schedules",
  foreignKey: "exam_cycle_id",
});
ExamSchedule.belongsTo(ExamCycle, { as: "cycle", foreignKey: "exam_cycle_id" });

ExamSchedule.belongsTo(Course, { as: "course", foreignKey: "course_id" });
Course.hasMany(ExamSchedule, { as: "exam_schedules", foreignKey: "course_id" });

ExamMark.belongsTo(ExamSchedule, {
  as: "schedule",
  foreignKey: "exam_schedule_id",
});
ExamSchedule.hasMany(ExamMark, { as: "marks", foreignKey: "exam_schedule_id" });

ExamMark.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(ExamMark, { as: "exam_marks", foreignKey: "student_id" });

HallTicket.belongsTo(ExamCycle, { as: "cycle", foreignKey: "exam_cycle_id" });
HallTicket.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(HallTicket, { as: "hall_tickets", foreignKey: "student_id" });

// Fee Management Associations
FeeStructure.belongsTo(FeeCategory, {
  as: "category",
  foreignKey: "category_id",
});
FeeCategory.hasMany(FeeStructure, {
  as: "structures",
  foreignKey: "category_id",
});

FeeStructure.belongsTo(Program, { as: "program", foreignKey: "program_id" });
Program.hasMany(FeeStructure, {
  as: "fee_structures",
  foreignKey: "program_id",
});

FeePayment.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(FeePayment, { as: "payments", foreignKey: "student_id" });

FeePayment.belongsTo(FeeStructure, {
  as: "structure",
  foreignKey: "fee_structure_id",
});
FeeStructure.hasMany(FeePayment, {
  as: "payments",
  foreignKey: "fee_structure_id",
});

FeeWaiver.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(FeeWaiver, { as: "waivers", foreignKey: "student_id" });

FeeWaiver.belongsTo(FeeCategory, {
  as: "category",
  foreignKey: "fee_category_id",
});
FeeCategory.hasMany(FeeWaiver, {
  as: "waivers",
  foreignKey: "fee_category_id",
});

// Library Management Associations
BookIssue.belongsTo(Book, { as: "book", foreignKey: "book_id" });
Book.hasMany(BookIssue, { as: "issues", foreignKey: "book_id" });

BookIssue.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(BookIssue, { as: "book_issues", foreignKey: "student_id" });

BookIssue.belongsTo(User, { as: "issuer", foreignKey: "issued_by" });

// Timetable Associations
Timetable.belongsTo(Program, { as: "program", foreignKey: "program_id" });
Program.hasMany(Timetable, { as: "timetables", foreignKey: "program_id" });

Timetable.hasMany(TimetableSlot, { as: "slots", foreignKey: "timetable_id" });
TimetableSlot.belongsTo(Timetable, {
  as: "timetable",
  foreignKey: "timetable_id",
});

TimetableSlot.belongsTo(Course, { as: "course", foreignKey: "course_id" });
TimetableSlot.belongsTo(User, { as: "faculty", foreignKey: "faculty_id" });

// Student Document Associations
StudentDocument.belongsTo(User, { as: "student", foreignKey: "user_id" });
User.hasMany(StudentDocument, { as: "documents", foreignKey: "user_id" });

StudentDocument.belongsTo(User, { as: "verifier", foreignKey: "verified_by" });
User.hasMany(StudentDocument, {
  as: "verified_documents",
  foreignKey: "verified_by",
});

// Export models and sequelize instance
module.exports = {
  ...models,
  sequelize,
};
