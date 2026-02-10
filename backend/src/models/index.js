const { sequelize } = require("../config/database");

// Import models
const User = require("./User");
const AuditLog = require("./AuditLog");
const Department = require("./Department");
const Program = require("./Program");
const Course = require("./Course");
const Regulation = require("./Regulation");
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
const ExamReverification = require("./ExamReverification");
const ExamScript = require("./ExamScript");
const HallTicket = require("./HallTicket");
const ExamRegistration = require("./ExamRegistration");
const FeeCategory = require("./FeeCategory");
const FeeStructure = require("./FeeStructure");
const FeePayment = require("./FeePayment");
const FeeWaiver = require("./FeeWaiver");
const StudentFeeCharge = require("./StudentFeeCharge");
const Book = require("./Book");
const BookIssue = require("./BookIssue");
const Timetable = require("./Timetable");
const TimetableSlot = require("./TimetableSlot");
const FeeSemesterConfig = require("./FeeSemesterConfig");
const StudentDocument = require("./StudentDocument");
const SectionIncharge = require("./SectionIncharge");
const ExamFeePayment = require("./ExamFeePayment");
const AcademicFeePayment = require("./AcademicFeePayment");
const StudentChargePayment = require("./StudentChargePayment");
const AdmissionConfig = require("./AdmissionConfig");
const StaffAttendance = require("./StaffAttendance");
const LeaveBalance = require("./LeaveBalance");
const SalaryStructure = require("./SalaryStructure");
const Payslip = require("./Payslip");
const SalaryGrade = require("./SalaryGrade");
const InstitutionSetting = require("./InstitutionSetting");
const Block = require("./Block");
const Room = require("./Room");
const SemesterResult = require("./SemesterResult");
const ProgramOutcome = require("./ProgramOutcome");
const CourseOutcome = require("./CourseOutcome");
const CoPoMap = require("./CoPoMap");

// Placement Module Models
const Company = require("./Company");
const CompanyContact = require("./CompanyContact");
const JobPosting = require("./JobPosting");
const PlacementDrive = require("./PlacementDrive");
const DriveEligibility = require("./DriveEligibility");
const DriveRound = require("./DriveRound");
const StudentPlacementProfile = require("./StudentPlacementProfile");
const StudentApplication = require("./StudentApplication");
const RoundResult = require("./RoundResult");
const Placement = require("./Placement");
const PlacementPolicy = require("./PlacementPolicy");
const PlacementNotification = require("./PlacementNotification");
const PlacementDocument = require("./PlacementDocument");

// Transport Management Models
const Route = require("./Route");
const TransportStop = require("./TransportStop");
const Vehicle = require("./Vehicle");
const TransportDriver = require("./TransportDriver");
const VehicleRouteAssignment = require("./VehicleRouteAssignment");
const StudentRouteAllocation = require("./StudentRouteAllocation");
const SpecialTrip = require("./SpecialTrip");
const TripLog = require("./TripLog");

// Hostel Management Models
const HostelBuilding = require("./HostelBuilding");
const HostelFloor = require("./HostelFloor");
const HostelRoom = require("./HostelRoom");
const HostelBed = require("./HostelBed");
const HostelAllocation = require("./HostelAllocation");
const HostelFeeStructure = require("./HostelFeeStructure");
const HostelMessFeeStructure = require("./HostelMessFeeStructure");
const HostelComplaint = require("./HostelComplaint");
const HostelAttendance = require("./HostelAttendance");
const HostelGatePass = require("./HostelGatePass");
const HostelVisitor = require("./HostelVisitor");
const HostelStayLog = require("./HostelStayLog");
const HostelFine = require("./HostelFine");
const HostelRoomBill = require("./HostelRoomBill");
const HostelRoomBillDistribution = require("./HostelRoomBillDistribution");

const models = {
  User,
  AuditLog,
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
  ExamReverification,
  ExamScript,
  HallTicket,
  ExamRegistration,
  FeeCategory,
  FeeStructure,
  FeePayment,
  FeeWaiver,
  StudentFeeCharge,
  Book,
  BookIssue,
  Timetable,
  TimetableSlot,
  FeeSemesterConfig,
  StudentDocument,

  AdmissionConfig,
  StaffAttendance,
  LeaveBalance,
  SalaryStructure,
  Payslip,
  SalaryGrade,
  InstitutionSetting,
  Regulation,
  Block,
  Room,
  SemesterResult,
  SectionIncharge,
  ExamFeePayment,
  AcademicFeePayment,
  StudentChargePayment,
  // Transport Management Models
  Route,
  TransportStop,
  Vehicle,
  TransportDriver,
  VehicleRouteAssignment,
  StudentRouteAllocation,
  SpecialTrip,
  TripLog,

  // Hostel Management Models
  HostelBuilding,
  HostelFloor,
  HostelRoom,
  HostelBed,
  HostelAllocation,
  HostelFeeStructure,
  HostelMessFeeStructure,
  HostelComplaint,
  HostelAttendance,
  HostelGatePass,
  HostelVisitor,
  HostelStayLog,
  HostelFine,
  HostelRoomBill,
  HostelRoomBillDistribution,

  // Placement Module Models
  Company,
  CompanyContact,
  JobPosting,
  PlacementDrive,
  DriveEligibility,
  DriveRound,
  StudentPlacementProfile,
  StudentApplication,
  RoundResult,
  Placement,
  PlacementPolicy,
  PlacementNotification,
  PlacementDocument,

  // Outcome-Based Education (OBE) Models
  ProgramOutcome,
  CourseOutcome,
  CoPoMap,
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
User.belongsTo(Regulation, {
  as: "regulation",
  foreignKey: "regulation_id",
});
Regulation.hasMany(User, {
  as: "students",
  foreignKey: "regulation_id",
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

// NOTE: Course <-> Program association removed
// Courses are now mapped to programs via Regulation.courses_list JSON field

// Regulation <-> Course association removed as courses are now mapped via JSONB

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

// Audit Log Associations
AuditLog.belongsTo(User, { as: "actor", foreignKey: "user_id" });
User.hasMany(AuditLog, { as: "audit_logs", foreignKey: "user_id" });

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

Attendance.belongsTo(TimetableSlot, {
  as: "slot",
  foreignKey: "timetable_slot_id",
});
TimetableSlot.hasMany(Attendance, {
  as: "attendance_records",
  foreignKey: "timetable_slot_id",
});

Attendance.belongsTo(User, { as: "instructor", foreignKey: "marked_by" });

LeaveRequest.belongsTo(User, { as: "student", foreignKey: "student_id" });
LeaveRequest.belongsTo(User, { as: "applicant", foreignKey: "student_id" });
User.hasMany(LeaveRequest, { as: "leave_requests", foreignKey: "student_id" });

LeaveRequest.belongsTo(User, { as: "reviewer", foreignKey: "reviewed_by" });
LeaveRequest.belongsTo(User, { as: "approver", foreignKey: "approver_id" });

// Examination Associations
ExamCycle.hasMany(ExamSchedule, {
  as: "schedules",
  foreignKey: "exam_cycle_id",
});
ExamSchedule.belongsTo(ExamCycle, { as: "cycle", foreignKey: "exam_cycle_id" });
ExamCycle.belongsTo(Regulation, {
  as: "regulation",
  foreignKey: "regulation_id",
});
Regulation.hasMany(ExamCycle, {
  as: "exam_cycles",
  foreignKey: "regulation_id",
});

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

ExamRegistration.belongsTo(ExamCycle, {
  as: "cycle",
  foreignKey: "exam_cycle_id",
});
ExamCycle.hasMany(ExamRegistration, {
  as: "registrations",
  foreignKey: "exam_cycle_id",
});
ExamRegistration.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(ExamRegistration, {
  as: "exam_registrations",
  foreignKey: "student_id",
});

// Exam Reverification Associations
ExamReverification.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(ExamReverification, {
  as: "exam_reverifications",
  foreignKey: "student_id",
});

ExamReverification.belongsTo(ExamSchedule, {
  as: "schedule",
  foreignKey: "exam_schedule_id",
});
ExamSchedule.hasMany(ExamReverification, {
  as: "reverifications",
  foreignKey: "exam_schedule_id",
});

ExamReverification.belongsTo(ExamMark, {
  as: "exam_mark",
  foreignKey: "exam_mark_id",
});
ExamMark.hasOne(ExamReverification, {
  as: "reverification",
  foreignKey: "exam_mark_id",
});

ExamReverification.belongsTo(StudentFeeCharge, {
  as: "fee_charge",
  foreignKey: "fee_charge_id",
});
StudentFeeCharge.hasMany(ExamReverification, {
  as: "reverifications",
  foreignKey: "fee_charge_id",
});

ExamReverification.belongsTo(User, {
  as: "reviewer",
  foreignKey: "reviewed_by",
});

ExamReverification.belongsTo(ExamFeePayment, {
  as: "exam_fee_payment",
  foreignKey: "exam_fee_payment_id",
});
ExamFeePayment.hasMany(ExamReverification, {
  as: "reverifications",
  foreignKey: "exam_fee_payment_id",
});

// Exam Fee Payment Associations
ExamFeePayment.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(ExamFeePayment, { as: "exam_payments", foreignKey: "student_id" });
ExamFeePayment.belongsTo(ExamCycle, {
  as: "cycle",
  foreignKey: "exam_cycle_id",
});
ExamCycle.hasMany(ExamFeePayment, {
  as: "exam_payments",
  foreignKey: "exam_cycle_id",
});

// Exam Script Associations
ExamScript.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(ExamScript, {
  as: "exam_scripts",
  foreignKey: "student_id",
});

ExamScript.belongsTo(ExamSchedule, {
  as: "schedule",
  foreignKey: "exam_schedule_id",
});
ExamSchedule.hasMany(ExamScript, {
  as: "scripts",
  foreignKey: "exam_schedule_id",
});

ExamScript.belongsTo(User, {
  as: "uploader",
  foreignKey: "uploaded_by",
});

// Semester Result Associations
SemesterResult.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(SemesterResult, {
  as: "semester_results",
  foreignKey: "student_id",
});

SemesterResult.belongsTo(ExamCycle, {
  as: "cycle",
  foreignKey: "exam_cycle_id",
});
ExamCycle.hasMany(SemesterResult, {
  as: "semester_results",
  foreignKey: "exam_cycle_id",
});

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
  as: "fee_structure", // Deprecated, use AcademicFeePayment
  foreignKey: "fee_structure_id",
});
FeeStructure.hasMany(FeePayment, {
  as: "payments",
  foreignKey: "fee_structure_id",
});

FeePayment.belongsTo(StudentFeeCharge, {
  as: "student_fee_charge", // Deprecated, use StudentChargePayment
  foreignKey: "fee_charge_id",
});
StudentFeeCharge.hasMany(FeePayment, {
  as: "payments",
  foreignKey: "fee_charge_id",
});

StudentFeeCharge.belongsTo(User, { as: "student", foreignKey: "student_id" });
StudentFeeCharge.belongsTo(FeeCategory, {
  as: "category",
  foreignKey: "category_id",
});
User.hasMany(StudentFeeCharge, { as: "fee_charges", foreignKey: "student_id" });
FeeCategory.hasMany(StudentFeeCharge, {
  as: "fee_charges",
  foreignKey: "category_id",
});

// New Fee Payment Architecture Associations

// 1. FeePayment (Global) -> Children
// 1. FeePayment (Global) -> Children
FeePayment.hasMany(AcademicFeePayment, {
  as: "academic_fee_payments",
  foreignKey: "fee_payment_id",
});
AcademicFeePayment.belongsTo(FeePayment, {
  as: "payment",
  foreignKey: "fee_payment_id",
});

FeePayment.hasMany(StudentChargePayment, {
  as: "student_charge_payments",
  foreignKey: "fee_payment_id",
});
StudentChargePayment.belongsTo(FeePayment, {
  as: "payment",
  foreignKey: "fee_payment_id",
});

FeePayment.hasOne(ExamFeePayment, {
  as: "exam_payment",
  foreignKey: "fee_payment_id",
});
ExamFeePayment.belongsTo(FeePayment, {
  as: "payment",
  foreignKey: "fee_payment_id",
});

// 2. AcademicFeePayment Associations
AcademicFeePayment.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(AcademicFeePayment, { as: "academic_payments", foreignKey: "student_id" });

AcademicFeePayment.belongsTo(FeeStructure, {
  as: "fee_structure",
  foreignKey: "fee_structure_id",
});
FeeStructure.hasMany(AcademicFeePayment, {
  as: "academic_payments", // Renamed from "payments" to avoid conflict
  foreignKey: "fee_structure_id",
});

// 3. StudentChargePayment Associations
StudentChargePayment.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(StudentChargePayment, { as: "charge_payments", foreignKey: "student_id" });

StudentChargePayment.belongsTo(StudentFeeCharge, {
  as: "fee_charge",
  foreignKey: "student_fee_charge_id",
});
StudentFeeCharge.hasMany(StudentChargePayment, {
  as: "charge_payments", // Renamed from "payments" to avoid conflict
  foreignKey: "student_fee_charge_id",
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
TimetableSlot.belongsTo(Block, { as: "block", foreignKey: "block_id" });
TimetableSlot.belongsTo(Room, { as: "room", foreignKey: "room_id" });
Block.hasMany(TimetableSlot, { as: "timetable_slots", foreignKey: "block_id" });
Room.hasMany(TimetableSlot, { as: "timetable_slots", foreignKey: "room_id" });

// Student Document Associations
StudentDocument.belongsTo(User, { as: "student", foreignKey: "user_id" });
User.hasMany(StudentDocument, { as: "documents", foreignKey: "user_id" });

StudentDocument.belongsTo(User, { as: "verifier", foreignKey: "verified_by" });
User.hasMany(StudentDocument, {
  as: "verified_documents",
  foreignKey: "verified_by",
});

// HR Management Associations
StaffAttendance.belongsTo(User, { as: "staff", foreignKey: "user_id" });
User.hasMany(StaffAttendance, {
  as: "staff_attendance",
  foreignKey: "user_id",
});

LeaveBalance.belongsTo(User, { as: "user", foreignKey: "user_id" });
User.hasMany(LeaveBalance, {
  as: "leave_balances",
  foreignKey: "user_id",
});

SalaryStructure.belongsTo(User, { as: "staff", foreignKey: "user_id" });
User.hasOne(SalaryStructure, {
  as: "salary_structure",
  foreignKey: "user_id",
});

Payslip.belongsTo(User, { as: "staff", foreignKey: "user_id" });
User.hasMany(Payslip, { as: "payslips", foreignKey: "user_id" });

SalaryStructure.belongsTo(SalaryGrade, { as: "grade", foreignKey: "grade_id" });
SalaryGrade.hasMany(SalaryStructure, {
  as: "staff_structures",
  foreignKey: "grade_id",
});

// Infrastructure Associations
Block.hasMany(Room, { foreignKey: "block_id", as: "rooms" });
Room.belongsTo(Block, { foreignKey: "block_id", as: "block" });

Department.belongsTo(Block, { foreignKey: "block_id", as: "block" });
Department.belongsTo(Room, { foreignKey: "room_id", as: "room" });
Block.hasMany(Department, { foreignKey: "block_id", as: "departments" });
Room.hasOne(Department, { foreignKey: "room_id", as: "department" });

// Section Incharge Associations
SectionIncharge.belongsTo(User, { as: "faculty", foreignKey: "faculty_id" });
User.hasMany(SectionIncharge, {
  as: "section_assignments",
  foreignKey: "faculty_id",
});

SectionIncharge.belongsTo(Department, {
  as: "department",
  foreignKey: "department_id",
});
Department.hasMany(SectionIncharge, {
  as: "section_incharges",
  foreignKey: "department_id",
});

SectionIncharge.belongsTo(Program, {
  as: "program",
  foreignKey: "program_id",
});
Program.hasMany(SectionIncharge, {
  as: "section_incharges",
  foreignKey: "program_id",
});

SectionIncharge.belongsTo(User, { as: "assigner", foreignKey: "assigned_by" });

// Transport Management Associations
if (models.Route && models.TransportStop) {
  Route.hasMany(TransportStop, { foreignKey: "route_id", as: "stops" });
  TransportStop.belongsTo(Route, { foreignKey: "route_id", as: "route" });
}

if (models.Route && models.VehicleRouteAssignment) {
  Route.hasMany(VehicleRouteAssignment, {
    foreignKey: "route_id",
    as: "assignments",
  });
}

if (models.Vehicle && models.VehicleRouteAssignment) {
  Vehicle.hasMany(VehicleRouteAssignment, {
    foreignKey: "vehicle_id",
    as: "assignments",
  });
  VehicleRouteAssignment.belongsTo(Vehicle, {
    foreignKey: "vehicle_id",
    as: "vehicle",
  });
}

if (models.TransportDriver && models.VehicleRouteAssignment) {
  VehicleRouteAssignment.belongsTo(TransportDriver, {
    foreignKey: "driver_id",
    as: "driver",
  });
  VehicleRouteAssignment.belongsTo(TransportDriver, {
    foreignKey: "conductor_id",
    as: "conductor",
  });
}

if (models.Route && models.VehicleRouteAssignment) {
  VehicleRouteAssignment.belongsTo(Route, {
    foreignKey: "route_id",
    as: "route",
  });
}

if (models.User && models.StudentRouteAllocation) {
  User.hasMany(StudentRouteAllocation, {
    foreignKey: "student_id",
    as: "route_allocations",
  });
  StudentRouteAllocation.belongsTo(User, {
    foreignKey: "student_id",
    as: "student",
  });
}

if (models.Route && models.StudentRouteAllocation) {
  Route.hasMany(StudentRouteAllocation, {
    foreignKey: "route_id",
    as: "student_allocations",
  });
  StudentRouteAllocation.belongsTo(Route, {
    foreignKey: "route_id",
    as: "route",
  });
}

if (models.TransportStop && models.StudentRouteAllocation) {
  TransportStop.hasMany(StudentRouteAllocation, {
    foreignKey: "stop_id",
    as: "allocations",
  });
  StudentRouteAllocation.belongsTo(TransportStop, {
    foreignKey: "stop_id",
    as: "stop",
  });
}

if (models.FeeStructure && models.StudentRouteAllocation) {
  StudentRouteAllocation.belongsTo(FeeStructure, {
    foreignKey: "fee_structure_id",
    as: "fee_structure",
  });
}

if (models.StudentFeeCharge && models.StudentRouteAllocation) {
  StudentRouteAllocation.belongsTo(StudentFeeCharge, {
    foreignKey: "fee_charge_id",
    as: "fee_charge",
  });
}

if (models.Vehicle && models.SpecialTrip) {
  Vehicle.hasMany(SpecialTrip, {
    foreignKey: "vehicle_id",
    as: "special_trips",
  });
  SpecialTrip.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });
}

if (models.TransportDriver && models.SpecialTrip) {
  SpecialTrip.belongsTo(TransportDriver, {
    foreignKey: "driver_id",
    as: "driver",
  });
}

if (models.User && models.SpecialTrip) {
  SpecialTrip.belongsTo(User, { foreignKey: "requested_by", as: "requester" });
  SpecialTrip.belongsTo(User, { foreignKey: "approved_by", as: "approver" });
}

if (models.Vehicle && models.TripLog) {
  Vehicle.hasMany(TripLog, { foreignKey: "vehicle_id", as: "trip_logs" });
  TripLog.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });
}

if (models.Route && models.TripLog) {
  TripLog.belongsTo(Route, { foreignKey: "route_id", as: "route" });
}

if (models.TransportDriver && models.TripLog) {
  TripLog.belongsTo(TransportDriver, { foreignKey: "driver_id", as: "driver" });
}

if (models.User && models.TripLog) {
  TripLog.belongsTo(User, { foreignKey: "logged_by", as: "logger" });
}

// ============================================
// HOSTEL MANAGEMENT ASSOCIATIONS
// ============================================

// HostelBuilding -> HostelFloor
if (models.HostelBuilding && models.HostelFloor) {
  HostelBuilding.hasMany(HostelFloor, {
    foreignKey: "building_id",
    as: "floors",
  });
  HostelFloor.belongsTo(HostelBuilding, {
    foreignKey: "building_id",
    as: "building",
  });
}

// HostelBuilding -> HostelRoom
if (models.HostelBuilding && models.HostelRoom) {
  HostelBuilding.hasMany(HostelRoom, {
    foreignKey: "building_id",
    as: "rooms",
  });
  HostelRoom.belongsTo(HostelBuilding, {
    foreignKey: "building_id",
    as: "building",
  });
}

// HostelFloor -> HostelRoom
if (models.HostelFloor && models.HostelRoom) {
  HostelFloor.hasMany(HostelRoom, { foreignKey: "floor_id", as: "rooms" });
  HostelRoom.belongsTo(HostelFloor, { foreignKey: "floor_id", as: "floor" });
}

// HostelRoom -> HostelBed
if (models.HostelRoom && models.HostelBed) {
  HostelRoom.hasMany(HostelBed, { foreignKey: "room_id", as: "beds" });
  HostelBed.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });
}

// HostelAllocation associations
if (models.HostelAllocation && models.User) {
  HostelAllocation.belongsTo(User, { foreignKey: "student_id", as: "student" });
  User.hasMany(HostelAllocation, {
    foreignKey: "student_id",
    as: "hostelAllocations",
  });
}

if (models.HostelAllocation && models.HostelRoom) {
  HostelAllocation.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });
  HostelRoom.hasMany(HostelAllocation, {
    foreignKey: "room_id",
    as: "allocations",
  });
}

if (models.HostelAllocation && models.HostelBed) {
  HostelAllocation.belongsTo(HostelBed, { foreignKey: "bed_id", as: "bed" });
  HostelBed.hasOne(HostelAllocation, {
    foreignKey: "bed_id",
    as: "allocation",
  });
}

if (models.HostelAllocation && models.HostelFeeStructure) {
  HostelAllocation.belongsTo(HostelFeeStructure, {
    foreignKey: "fee_structure_id",
    as: "fee_structure",
  });
}

if (models.HostelAllocation && models.HostelMessFeeStructure) {
  HostelAllocation.belongsTo(HostelMessFeeStructure, {
    as: "mess_fee_structure",
    foreignKey: "mess_fee_structure_id",
  });
}

if (models.HostelAllocation && models.FeeStructure) {
  HostelAllocation.belongsTo(FeeStructure, {
    as: "rent_fee",
    foreignKey: "rent_fee_id",
  });
  HostelAllocation.belongsTo(FeeStructure, {
    as: "mess_fee",
    foreignKey: "mess_fee_id",
  });
  HostelAllocation.belongsTo(StudentFeeCharge, {
    as: "rent_fee_charge",
    foreignKey: "rent_fee_charge_id",
  });
  HostelAllocation.belongsTo(StudentFeeCharge, {
    as: "mess_fee_charge",
    foreignKey: "mess_fee_charge_id",
  });
}

// HostelComplaint associations
if (models.HostelComplaint && models.User) {
  HostelComplaint.belongsTo(User, { foreignKey: "student_id", as: "student" });
  HostelComplaint.belongsTo(User, {
    foreignKey: "assigned_to",
    as: "assignedTo",
  });
}

if (models.HostelComplaint && models.HostelRoom) {
  HostelComplaint.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });
}

// HostelAttendance associations
if (models.HostelAttendance && models.User) {
  HostelAttendance.belongsTo(User, { foreignKey: "student_id", as: "student" });
}

// HostelGatePass associations
if (models.HostelGatePass && models.User) {
  HostelGatePass.belongsTo(User, { foreignKey: "student_id", as: "student" });
  HostelGatePass.belongsTo(User, { foreignKey: "approved_by", as: "approver" });
}

// HostelVisitor associations
if (models.HostelVisitor && models.User) {
  HostelVisitor.belongsTo(User, { foreignKey: "student_id", as: "student" });
}

// HostelStayLog associations
if (models.HostelStayLog) {
  HostelStayLog.belongsTo(User, { foreignKey: "student_id", as: "student" });
  HostelStayLog.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });
  HostelStayLog.belongsTo(HostelBed, { foreignKey: "bed_id", as: "bed" });
  HostelStayLog.belongsTo(HostelAllocation, {
    foreignKey: "allocation_id",
    as: "allocation",
  });

  User.hasMany(HostelStayLog, {
    foreignKey: "student_id",
    as: "hostelStayLogs",
  });
  HostelAllocation.hasMany(HostelStayLog, {
    foreignKey: "allocation_id",
    as: "stayLogs",
  });
}

// HostelFine associations
if (models.HostelFine) {
  HostelFine.belongsTo(User, { foreignKey: "student_id", as: "student" });
  HostelFine.belongsTo(User, { foreignKey: "issued_by", as: "issued_by_user" });
  HostelFine.belongsTo(HostelAllocation, {
    foreignKey: "allocation_id",
    as: "allocation",
  });
  HostelFine.belongsTo(FeeStructure, {
    foreignKey: "fee_structure_id",
    as: "feeStructure",
  });
  HostelFine.belongsTo(StudentFeeCharge, {
    foreignKey: "fee_charge_id",
    as: "feeCharge",
  });

  User.hasMany(HostelFine, {
    foreignKey: "student_id",
    as: "hostelFines",
  });
}

// HostelRoomBill associations
if (models.HostelRoomBill) {
  HostelRoomBill.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });
  HostelRoomBill.belongsTo(User, { foreignKey: "created_by", as: "creator" });
  HostelRoomBill.hasMany(HostelRoomBillDistribution, {
    foreignKey: "room_bill_id",
    as: "distributions",
  });

  HostelRoom.hasMany(HostelRoomBill, {
    foreignKey: "room_id",
    as: "roomBills",
  });
}

// HostelRoomBillDistribution associations
if (models.HostelRoomBillDistribution) {
  HostelRoomBillDistribution.belongsTo(HostelRoomBill, {
    foreignKey: "room_bill_id",
    as: "roomBill",
  });
  HostelRoomBillDistribution.belongsTo(User, {
    foreignKey: "student_id",
    as: "student",
  });
  HostelRoomBillDistribution.belongsTo(HostelAllocation, {
    foreignKey: "allocation_id",
    as: "allocation",
  });
  HostelRoomBillDistribution.belongsTo(FeeStructure, {
    foreignKey: "fee_structure_id",
    as: "feeStructure",
  });
  HostelRoomBillDistribution.belongsTo(StudentFeeCharge, {
    foreignKey: "fee_charge_id",
    as: "feeCharge",
  });

  User.hasMany(HostelRoomBillDistribution, {
    foreignKey: "student_id",
    as: "roomBillDistributions",
  });
}

// ============================================
// PLACEMENT MODULE ASSOCIATIONS
// ============================================

// Company <-> CompanyContact
Company.hasMany(CompanyContact, { foreignKey: "company_id", as: "contacts" });
CompanyContact.belongsTo(Company, { foreignKey: "company_id", as: "company" });

// Company <-> JobPosting
Company.hasMany(JobPosting, { foreignKey: "company_id", as: "job_postings" });
JobPosting.belongsTo(Company, { foreignKey: "company_id", as: "company" });

// JobPosting <-> PlacementDrive
JobPosting.hasMany(PlacementDrive, {
  foreignKey: "job_posting_id",
  as: "drives",
});
PlacementDrive.belongsTo(JobPosting, {
  foreignKey: "job_posting_id",
  as: "job_posting",
});

// PlacementDrive <-> DriveEligibility
PlacementDrive.hasOne(DriveEligibility, {
  foreignKey: "drive_id",
  as: "eligibility",
});
DriveEligibility.belongsTo(PlacementDrive, {
  foreignKey: "drive_id",
  as: "drive",
});

// PlacementDrive <-> DriveRound
PlacementDrive.hasMany(DriveRound, { foreignKey: "drive_id", as: "rounds" });
DriveRound.belongsTo(PlacementDrive, { foreignKey: "drive_id", as: "drive" });

// User (Coordinator) <-> PlacementDrive
PlacementDrive.belongsTo(User, {
  as: "coordinator",
  foreignKey: "coordinator_id",
});
User.hasMany(PlacementDrive, {
  as: "coordinated_drives",
  foreignKey: "coordinator_id",
});

// User (Student) <-> StudentPlacementProfile
User.hasOne(StudentPlacementProfile, {
  as: "placement_profile",
  foreignKey: "student_id",
});
StudentPlacementProfile.belongsTo(User, {
  as: "student",
  foreignKey: "student_id",
});

// StudentApplication Associations
StudentApplication.belongsTo(PlacementDrive, {
  as: "drive",
  foreignKey: "drive_id",
});
PlacementDrive.hasMany(StudentApplication, {
  as: "applications",
  foreignKey: "drive_id",
});
StudentApplication.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(StudentApplication, {
  as: "placement_applications",
  foreignKey: "student_id",
});
StudentApplication.belongsTo(DriveRound, {
  as: "current_round",
  foreignKey: "current_round_id",
});

// RoundResult Associations
RoundResult.belongsTo(DriveRound, { as: "round", foreignKey: "round_id" });
DriveRound.hasMany(RoundResult, { as: "results", foreignKey: "round_id" });
RoundResult.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(RoundResult, { as: "round_results", foreignKey: "student_id" });

// Placement Associations
Placement.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(Placement, { as: "placements", foreignKey: "student_id" });
Placement.belongsTo(PlacementDrive, { as: "drive", foreignKey: "drive_id" });
Placement.belongsTo(JobPosting, {
  as: "job_posting",
  foreignKey: "job_posting_id",
});
Placement.belongsTo(StudentApplication, {
  as: "application",
  foreignKey: "application_id",
});

// PlacementNotification Associations
PlacementNotification.belongsTo(User, { as: "user", foreignKey: "user_id" });
User.hasMany(PlacementNotification, {
  as: "placement_notifications",
  foreignKey: "user_id",
});
PlacementNotification.belongsTo(PlacementDrive, {
  as: "drive",
  foreignKey: "related_drive_id",
});

// PlacementDocument Associations
PlacementDocument.belongsTo(User, {
  as: "uploader",
  foreignKey: "uploaded_by",
});

// ===============================
// Outcome-Based Education (OBE) Associations
// ===============================

// Program <-> ProgramOutcome
Program.hasMany(ProgramOutcome, {
  foreignKey: "program_id",
  as: "outcomes",
  onDelete: "CASCADE",
});
ProgramOutcome.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

// Course <-> CourseOutcome
Course.hasMany(CourseOutcome, {
  foreignKey: "course_id",
  as: "outcomes",
  onDelete: "CASCADE",
});
CourseOutcome.belongsTo(Course, {
  foreignKey: "course_id",
  as: "course",
});

// CourseOutcome <-> ProgramOutcome (Many-to-Many through CoPoMap)
CourseOutcome.belongsToMany(ProgramOutcome, {
  through: CoPoMap,
  foreignKey: "course_outcome_id",
  otherKey: "program_outcome_id",
  as: "programOutcomes",
});

ProgramOutcome.belongsToMany(CourseOutcome, {
  through: CoPoMap,
  foreignKey: "program_outcome_id",
  otherKey: "course_outcome_id",
  as: "courseOutcomes",
});

// Direct access to CoPoMap for explicit mapping queries
CoPoMap.belongsTo(CourseOutcome, {
  foreignKey: "course_outcome_id",
  as: "courseOutcome",
});
CoPoMap.belongsTo(ProgramOutcome, {
  foreignKey: "program_outcome_id",
  as: "programOutcome",
});


// Export models and sequelize instance
module.exports = {
  ...models,
  sequelize,
};
