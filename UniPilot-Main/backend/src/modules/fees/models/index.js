import FeeCategory from "./FeeCategory.js";
import FeeStructure from "./FeeStructure.js";
import FeePayment from "./FeePayment.js";
import FeeWaiver from "./FeeWaiver.js";
import StudentFeeCharge from "./StudentFeeCharge.js";
import FeeSemesterConfig from "./FeeSemesterConfig.js";
import AcademicFeePayment from "./AcademicFeePayment.js";
import StudentChargePayment from "./StudentChargePayment.js";

export {
  FeeCategory,
  FeeStructure,
  FeePayment,
  FeeWaiver,
  StudentFeeCharge,
  FeeSemesterConfig,
  AcademicFeePayment,
  StudentChargePayment,
};

// -----------------------------------------------------------------------------
// Fees Module Internal Associations
// -----------------------------------------------------------------------------

// Fee Management Associations
FeeStructure.belongsTo(FeeCategory, { as: "category", foreignKey: "category_id" });
FeeCategory.hasMany(FeeStructure, { as: "structures", foreignKey: "category_id" });

FeePayment.belongsTo(FeeStructure, { as: "fee_structure", foreignKey: "fee_structure_id" });
FeeStructure.hasMany(FeePayment, { as: "payments", foreignKey: "fee_structure_id" });

FeePayment.belongsTo(StudentFeeCharge, { as: "student_fee_charge", foreignKey: "fee_charge_id" });
StudentFeeCharge.hasMany(FeePayment, { as: "payments", foreignKey: "fee_charge_id" });

StudentFeeCharge.belongsTo(FeeCategory, { as: "category", foreignKey: "category_id" });
FeeCategory.hasMany(StudentFeeCharge, { as: "fee_charges", foreignKey: "category_id" });

// New Fee Payment Architecture Associations

// 1. FeePayment (Global) -> Children
FeePayment.hasMany(AcademicFeePayment, { as: "academic_fee_payments", foreignKey: "fee_payment_id" });
AcademicFeePayment.belongsTo(FeePayment, { as: "payment", foreignKey: "fee_payment_id" });

FeePayment.hasMany(StudentChargePayment, { as: "student_charge_payments", foreignKey: "fee_payment_id" });
StudentChargePayment.belongsTo(FeePayment, { as: "payment", foreignKey: "fee_payment_id" });

// 2. AcademicFeePayment Associations
AcademicFeePayment.belongsTo(FeeStructure, { as: "structure", foreignKey: "fee_structure_id" });
FeeStructure.hasMany(AcademicFeePayment, { as: "academic_payments", foreignKey: "fee_structure_id" });

// 3. StudentChargePayment Associations
StudentChargePayment.belongsTo(StudentFeeCharge, { as: "charge", foreignKey: "student_fee_charge_id" });
StudentFeeCharge.hasMany(StudentChargePayment, { as: "charge_payments", foreignKey: "student_fee_charge_id" });

FeeWaiver.belongsTo(FeeCategory, { as: "category", foreignKey: "fee_category_id" });
FeeCategory.hasMany(FeeWaiver, { as: "waivers", foreignKey: "fee_category_id" });

export default {
  FeeCategory,
  FeeStructure,
  FeePayment,
  FeeWaiver,
  StudentFeeCharge,
  FeeSemesterConfig,
  AcademicFeePayment,
  StudentChargePayment,
};
