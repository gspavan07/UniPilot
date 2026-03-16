import StaffAttendance from "./StaffAttendance.js";
import LeaveBalance from "./LeaveBalance.js";
import SalaryStructure from "./SalaryStructure.js";
import Payslip from "./Payslip.js";
import SalaryGrade from "./SalaryGrade.js";
import StaffProfile from "./StaffProfile.js";

export {
  StaffAttendance,
  LeaveBalance,
  SalaryStructure,
  Payslip,
  SalaryGrade,
  StaffProfile,
};

// -----------------------------------------------------------------------------
// HR Module Internal Associations
// -----------------------------------------------------------------------------

// SalaryStructure -> SalaryGrade
SalaryStructure.belongsTo(SalaryGrade, { as: "grade", foreignKey: "grade_id" });
SalaryGrade.hasMany(SalaryStructure, { as: "staff_structures", foreignKey: "grade_id" });

export default {
  StaffAttendance,
  LeaveBalance,
  SalaryStructure,
  Payslip,
  SalaryGrade,
  StaffProfile,
};
