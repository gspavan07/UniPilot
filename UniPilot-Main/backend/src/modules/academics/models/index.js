import Department from "./Department.js";
import Program from "./Program.js";
import Course from "./Course.js";
import CourseFaculty from "./CourseFaculty.js";
import Regulation from "./Regulation.js";
import Timetable from "./Timetable.js";
import TimetableSlot from "./TimetableSlot.js";
import SectionIncharge from "./SectionIncharge.js";
import SemesterResult from "./SemesterResult.js";
import Attendance from "./Attendance.js";
import PromotionCriteria from "./PromotionCriteria.js";
import PromotionEvaluation from "./PromotionEvaluation.js";
import Graduation from "./Graduation.js";
import LeaveRequest from "./LeaveRequest.js";
import StudentProfile from "./StudentProfile.js";

export {
  Department,
  Program,
  Course,
  CourseFaculty,
  Regulation,
  Timetable,
  TimetableSlot,
  SectionIncharge,
  SemesterResult,
  Attendance,
  PromotionCriteria,
  PromotionEvaluation,
  Graduation,
  LeaveRequest,
  StudentProfile,
};

// -----------------------------------------------------------------------------
// Academics Module Internal Associations
// -----------------------------------------------------------------------------

// Program <-> Department
Program.belongsTo(Department, { as: "department", foreignKey: "department_id" });
Department.hasMany(Program, { as: "programs", foreignKey: "department_id" });

// Course <-> Department
Course.belongsTo(Department, { as: "department", foreignKey: "department_id" });
Department.hasMany(Course, { as: "courses", foreignKey: "department_id" });

// Self-referencing for parent-child departments
Department.belongsTo(Department, { as: "parentDepartment", foreignKey: "parent_department_id" });
Department.hasMany(Department, { as: "sub_departments", foreignKey: "parent_department_id" });

// CourseFaculty <-> Course
CourseFaculty.belongsTo(Course, { as: "course", foreignKey: "course_id" });
Course.hasMany(CourseFaculty, { as: "faculty_assignments", foreignKey: "course_id" });

// Promotion & Lifecycle Associations
PromotionCriteria.belongsTo(Program, { as: "program", foreignKey: "program_id" });
Program.hasMany(PromotionCriteria, { as: "promotion_criteria", foreignKey: "program_id" });

Attendance.belongsTo(Course, { as: "course", foreignKey: "course_id" });
Course.hasMany(Attendance, { as: "attendance_records", foreignKey: "course_id" });

Attendance.belongsTo(TimetableSlot, { as: "slot", foreignKey: "timetable_slot_id" });
TimetableSlot.hasMany(Attendance, { as: "attendance_records", foreignKey: "timetable_slot_id" });

// Timetable Associations
Timetable.belongsTo(Program, { as: "program", foreignKey: "program_id" });
Program.hasMany(Timetable, { as: "timetables", foreignKey: "program_id" });

Timetable.hasMany(TimetableSlot, { as: "slots", foreignKey: "timetable_id" });
TimetableSlot.belongsTo(Timetable, { as: "timetable", foreignKey: "timetable_id" });

TimetableSlot.belongsTo(Course, { as: "course", foreignKey: "course_id" });

// Student Profile Associations (Academics-owned)
StudentProfile.belongsTo(Program, { as: "program", foreignKey: "program_id" });
Program.hasMany(StudentProfile, { as: "student_profiles", foreignKey: "program_id" });

StudentProfile.belongsTo(Regulation, { as: "regulation", foreignKey: "regulation_id" });
Regulation.hasMany(StudentProfile, { as: "student_profiles", foreignKey: "regulation_id" });

// Section Incharge Associations
SectionIncharge.belongsTo(SectionIncharge, { as: "parentIncharge", foreignKey: "parent_incharge_id" });
SectionIncharge.belongsTo(Department, { as: "department", foreignKey: "department_id" });
Department.hasMany(SectionIncharge, { as: "section_incharges", foreignKey: "department_id" });

SectionIncharge.belongsTo(Program, { as: "program", foreignKey: "program_id" });
Program.hasMany(SectionIncharge, { as: "section_incharges", foreignKey: "program_id" });

export default {
  Department,
  Program,
  Course,
  CourseFaculty,
  Regulation,
  Timetable,
  TimetableSlot,
  SectionIncharge,
  SemesterResult,
  Attendance,
  PromotionCriteria,
  PromotionEvaluation,
  Graduation,
  LeaveRequest,
  StudentProfile,
};
