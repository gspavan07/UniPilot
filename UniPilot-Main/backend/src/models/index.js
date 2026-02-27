import { sequelize } from "../config/database.js";

import { User, Session, Role, Permission } from "../modules/core/models/index.js";
import AuditLog from "../modules/settings/models/AuditLog.js";
import Department from "../modules/academics/models/Department.js";
import Program from "../modules/academics/models/Program.js";
import Course from "../modules/academics/models/Course.js";
import Regulation from "../modules/academics/models/Regulation.js";
import ProctorAssignment from "../modules/proctoring/models/ProctorAssignment.js";
import ProctorSession from "../modules/proctoring/models/ProctorSession.js";
import ProctorFeedback from "../modules/proctoring/models/ProctorFeedback.js";
import ProctorAlert from "../modules/proctoring/models/ProctorAlert.js";
import PromotionCriteria from "../modules/academics/models/PromotionCriteria.js";
import PromotionEvaluation from "../modules/academics/models/PromotionEvaluation.js";
import Graduation from "../modules/academics/models/Graduation.js";
import Attendance from "../modules/academics/models/Attendance.js";
import LeaveRequest from "../modules/academics/models/LeaveRequest.js";
import Holiday from "../modules/settings/models/Holiday.js";

import FeeCategory from "../modules/fees/models/FeeCategory.js";
import FeeStructure from "../modules/fees/models/FeeStructure.js";
import FeePayment from "../modules/fees/models/FeePayment.js";
import FeeWaiver from "../modules/fees/models/FeeWaiver.js";
import StudentFeeCharge from "../modules/fees/models/StudentFeeCharge.js";
import Book from "../modules/library/models/Book.js";
import BookIssue from "../modules/library/models/BookIssue.js";
import Timetable from "../modules/academics/models/Timetable.js";
import TimetableSlot from "../modules/academics/models/TimetableSlot.js";
import FeeSemesterConfig from "../modules/fees/models/FeeSemesterConfig.js";
import StudentDocument from "../modules/admissions/models/StudentDocument.js";
import SectionIncharge from "../modules/academics/models/SectionIncharge.js";

import AcademicFeePayment from "../modules/fees/models/AcademicFeePayment.js";
import StudentChargePayment from "../modules/fees/models/StudentChargePayment.js";
import AdmissionConfig from "../modules/admissions/models/AdmissionConfig.js";
import StaffAttendance from "../modules/hr/models/StaffAttendance.js";
import LeaveBalance from "../modules/hr/models/LeaveBalance.js";
import SalaryStructure from "../modules/hr/models/SalaryStructure.js";
import Payslip from "../modules/hr/models/Payslip.js";
import SalaryGrade from "../modules/hr/models/SalaryGrade.js";
import InstitutionSetting from "../modules/settings/models/InstitutionSetting.js";
import Block from "../modules/infrastructure/models/Block.js";
import Room from "../modules/infrastructure/models/Room.js";
import SemesterResult from "../modules/academics/models/SemesterResult.js";
import ProgramOutcome from "../modules/obe/models/ProgramOutcome.js";
import CourseOutcome from "../modules/obe/models/CourseOutcome.js";
import CoPoMap from "../modules/obe/models/CoPoMap.js";
import Notification from "../modules/notifications/models/Notification.js";
import CourseFaculty from "../modules/academics/models/CourseFaculty.js";

// Placement Module Models
import Company from "../modules/placement/models/Company.js";
import CompanyContact from "../modules/placement/models/CompanyContact.js";
import JobPosting from "../modules/placement/models/JobPosting.js";
import PlacementDrive from "../modules/placement/models/PlacementDrive.js";
import DriveEligibility from "../modules/placement/models/DriveEligibility.js";
import DriveRound from "../modules/placement/models/DriveRound.js";
import StudentPlacementProfile from "../modules/placement/models/StudentPlacementProfile.js";
import StudentApplication from "../modules/placement/models/StudentApplication.js";
import RoundResult from "../modules/placement/models/RoundResult.js";
import Placement from "../modules/placement/models/Placement.js";
import PlacementPolicy from "../modules/placement/models/PlacementPolicy.js";
import PlacementNotification from "../modules/placement/models/PlacementNotification.js";
import PlacementDocument from "../modules/placement/models/PlacementDocument.js";

// Transport Management Models
import Route from "../modules/transport/models/Route.js";
import TransportStop from "../modules/transport/models/TransportStop.js";
import Vehicle from "../modules/transport/models/Vehicle.js";
import TransportDriver from "../modules/transport/models/TransportDriver.js";
import VehicleRouteAssignment from "../modules/transport/models/VehicleRouteAssignment.js";
import StudentRouteAllocation from "../modules/transport/models/StudentRouteAllocation.js";
import SpecialTrip from "../modules/transport/models/SpecialTrip.js";
import TripLog from "../modules/transport/models/TripLog.js";

// Hostel Management Models
import HostelBuilding from "../modules/hostel/models/HostelBuilding.js";
import HostelFloor from "../modules/hostel/models/HostelFloor.js";
import HostelRoom from "../modules/hostel/models/HostelRoom.js";
import HostelBed from "../modules/hostel/models/HostelBed.js";
import HostelAllocation from "../modules/hostel/models/HostelAllocation.js";
import HostelFeeStructure from "../modules/hostel/models/HostelFeeStructure.js";
import HostelMessFeeStructure from "../modules/hostel/models/HostelMessFeeStructure.js";
import HostelComplaint from "../modules/hostel/models/HostelComplaint.js";
import HostelAttendance from "../modules/hostel/models/HostelAttendance.js";
import HostelGatePass from "../modules/hostel/models/HostelGatePass.js";
import HostelVisitor from "../modules/hostel/models/HostelVisitor.js";
import HostelStayLog from "../modules/hostel/models/HostelStayLog.js";
import HostelFine from "../modules/hostel/models/HostelFine.js";
import HostelRoomBill from "../modules/hostel/models/HostelRoomBill.js";
import HostelRoomBillDistribution from "../modules/hostel/models/HostelRoomBillDistribution.js";

const models = {
  User,
  Session,
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

  // New Faculty Assignment Models
  Notification,
  CourseFaculty,
};

// Define associations

// Notification Associations
Notification.belongsTo(User, { as: "user", foreignKey: "user_id" });
User.hasMany(Notification, { as: "notifications", foreignKey: "user_id" });

// CourseFaculty Associations
CourseFaculty.belongsTo(Course, { as: "course", foreignKey: "course_id" });
Course.hasMany(CourseFaculty, { as: "faculty_assignments", foreignKey: "course_id" });

// Program <-> Department
Program.belongsTo(Department, {
  as: "department",
  foreignKey: "department_id",
});
Department.hasMany(Program, {
  as: "programs",
  foreignKey: "department_id",
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

// Semester Result Associations

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

StudentFeeCharge.belongsTo(FeeCategory, {
  as: "category",
  foreignKey: "category_id",
});
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

// 2. AcademicFeePayment Associations
AcademicFeePayment.belongsTo(FeeStructure, {
  as: "structure",
  foreignKey: "fee_structure_id",
});
FeeStructure.hasMany(AcademicFeePayment, {
  as: "academic_payments", // Renamed from "payments" to avoid conflict
  foreignKey: "fee_structure_id",
});

// 3. StudentChargePayment Associations
StudentChargePayment.belongsTo(StudentFeeCharge, {
  as: "charge",
  foreignKey: "student_fee_charge_id",
});
StudentFeeCharge.hasMany(StudentChargePayment, {
  as: "charge_payments", // Renamed from "payments" to avoid conflict
  foreignKey: "student_fee_charge_id",
});

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
SectionIncharge.belongsTo(SectionIncharge, {
  as: "parentIncharge",
  foreignKey: "parent_incharge_id",
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
StudentApplication.hasMany(Placement, {
  as: "placement_records",
  foreignKey: "application_id",
});
PlacementDrive.hasMany(Placement, {
  as: "placement_records",
  foreignKey: "drive_id",
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
export {
  sequelize,
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
  AcademicFeePayment,
  StudentChargePayment,
  Route,
  TransportStop,
  Vehicle,
  TransportDriver,
  VehicleRouteAssignment,
  StudentRouteAllocation,
  SpecialTrip,
  TripLog,
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
  ProgramOutcome,
  CourseOutcome,
  CoPoMap,
  Notification,
  CourseFaculty,
};

export default {
  ...models,
  sequelize,
};
