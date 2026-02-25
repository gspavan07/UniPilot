import { User } from "../../core/models/index.js";
import {
  AcademicFeePayment,
  FeeCategory,
  FeePayment,
  FeeSemesterConfig,
  FeeStructure,
  FeeWaiver,
  StudentChargePayment,
  StudentFeeCharge,
} from "../models/index.js";
import academicLookupService from "../../academics/services/academicLookupService.js";

export const calculateFeeStatus = async (studentId) => {
  const student = await User.findByPk(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  const {
    program_id,
    department_id,
    batch_year,
    is_hosteller,
    requires_transport,
  } = student;
  const effectiveBatchYear = batch_year || new Date().getFullYear();
  const { program, department } =
    await academicLookupService.getProgramAndDepartmentByIds({
      programId: program_id,
      departmentId: department_id,
      programAttributes: ["id", "name"],
      departmentAttributes: ["id", "name"],
    });

  const results = await Promise.all([
    FeeStructure.findAll({
      where: {
        program_id,
        batch_year: effectiveBatchYear,
        is_active: true,
        student_id: null, // Only return templates here
      },
      include: [{ model: FeeCategory, as: "category" }],
      order: [["semester", "ASC"]],
    }),
    FeePayment.findAll({
      where: { student_id: studentId, status: "completed" },
    }),
    FeeSemesterConfig.findAll({
      where: { program_id, batch_year: effectiveBatchYear },
    }),
    FeeWaiver.findAll({
      where: { student_id: studentId, is_approved: true, is_active: true },
    }),
    StudentFeeCharge.findAll({
      where: { student_id: studentId },
      include: [{ model: FeeCategory, as: "category" }],
    }),

    AcademicFeePayment.findAll({
      where: { student_id: studentId },
      include: [{ model: FeePayment, as: "payment" }], // Get Parent Transaction
    }),
    StudentChargePayment.findAll({
      where: { student_id: studentId },
      include: [{ model: FeePayment, as: "payment" }], // Get Parent Transaction
    }),
  ]);

  const [
    structures,
    globalPayments,
    semesterConfigs,
    waivers,
    individualCharges,

    academicPayments,
    chargePaymentsData,
  ] = results;

  const configMap = {};
  semesterConfigs.forEach((c) => (configMap[c.semester] = c));

  // --- Start Advanced Scholarship Logic ---
  // Group waivers by their application scope
  const allSemWaivers = waivers.filter((w) => w.applies_to === "all_semesters");
  const specificSemWaivers = waivers.filter(
    (w) => w.applies_to === "specific_semester",
  );
  const oneTimeWaivers = waivers.filter((w) => w.applies_to === "one_time");

  // Track one-time waiver consumption using a running balance
  const oneTimeBalance = {};
  oneTimeWaivers.forEach((w) => {
    if (!oneTimeBalance[w.fee_category_id])
      oneTimeBalance[w.fee_category_id] = 0;
    oneTimeBalance[w.fee_category_id] += parseFloat(w.amount);
  });
  // --- End Advanced Scholarship Logic ---

  const semesterWise = {};
  const grandTotals = {
    payable: 0,
    paid: 0,
    due: 0,
    waiver: 0,
    excessBalance: 0,
  };
  const today = new Date();

  for (let i = 1; i <= 8; i++) {
    const paidFines = globalPayments
      .filter((p) => !p.fee_structure_id && p.semester === i)
      .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

    semesterWise[i] = {
      fees: [],
      totals: { payable: 0, paid: 0, due: 0, waiver: 0, excess: 0 },
      fine: {
        amount: 0,
        paid: paidFines,
        due: 0,
        isOverdue: false,
        deadline: configMap[i]?.due_date || null,
      },
    };
  }

  structures.forEach((s) => {
    // Correct filtering for Convener/Management (Applies to ALL fees)
    if (s.applies_to === "convener" && student.admission_type !== "convener")
      return;
    if (
      s.applies_to === "management" &&
      student.admission_type !== "management"
    )
      return;

    // Use fetch from AcademicFeePayment table
    const structPayments = academicPayments.filter(
      (p) => p.fee_structure_id === s.id,
    );
    const paid = structPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );
    const payable = parseFloat(s.amount);

    // --- Start Multi-tier Waiver Application ---
    let currentWaiver = 0;

    // 1. All-Semesters Waivers (e.g. JVD Tuition)
    const globalW = allSemWaivers.find(
      (w) => w.fee_category_id === s.category_id,
    );
    if (globalW) {
      if (globalW.value_type === "percentage") {
        currentWaiver += (payable * parseFloat(globalW.percentage)) / 100;
      } else {
        currentWaiver += parseFloat(globalW.amount);
      }
    }

    // 2. Specific Semester Waivers
    const semW = specificSemWaivers.find(
      (w) => w.fee_category_id === s.category_id && w.semester === s.semester,
    );
    if (semW) {
      if (semW.value_type === "percentage") {
        currentWaiver += (payable * parseFloat(semW.percentage)) / 100;
      } else {
        currentWaiver += parseFloat(semW.amount);
      }
    }

    // 3. One-Time Waivers (Consumed greedily sem by sem)
    if (oneTimeBalance[s.category_id] > 0) {
      const remainingNeed = payable - currentWaiver;
      if (remainingNeed > 0) {
        const consumed = Math.min(remainingNeed, oneTimeBalance[s.category_id]);
        currentWaiver += consumed;
        oneTimeBalance[s.category_id] -= consumed;
      }
    }

    // Enforce cap
    currentWaiver = Math.min(payable, currentWaiver);
    // --- End Multi-tier Waiver Application ---

    const due = Math.max(0, payable - paid - currentWaiver);
    const excess = Math.max(0, paid + currentWaiver - payable);

    semesterWise[s.semester].fees.push({
      id: s.id,
      category: s.category?.name || "Other",
      category_id: s.category_id,
      payable,
      paid,
      waiver: currentWaiver,
      due,
      excess,
      receipts: structPayments.map((p) => ({
        number: p.payment?.transaction_id || "N/A",
        date: p.payment?.payment_date,
        amount: p.amount,
        method: p.payment?.payment_method,
      })),
    });

    semesterWise[s.semester].totals.payable += payable;
    semesterWise[s.semester].totals.paid += paid;
    semesterWise[s.semester].totals.waiver += currentWaiver;
    semesterWise[s.semester].totals.due += due;
    semesterWise[s.semester].totals.excess += excess; // Track per semester

    grandTotals.waiver += currentWaiver;
    grandTotals.excessBalance += excess; // Cumulative Credit Balance
  });

  // Process Individual Charges
  individualCharges.forEach((c) => {
    // Use fetch from StudentChargePayment table
    const chargePayments = chargePaymentsData.filter(
      (p) => p.student_fee_charge_id === c.id,
    );
    const paid = chargePayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );
    const payable = parseFloat(c.amount);
    const due = Math.max(0, payable - paid);
    const excess = Math.max(0, paid - payable);

    const sem = c.semester || 1;
    if (!semesterWise[sem]) {
      // Ensure- [x] Research error and identify cause <!-- id: 0 -->
      // - [x] Create implementation plan <!-- id: 1 -->
      // - [x] Correct aliases in `feeController.js` (Done by user) <!-- id: 2 -->
      // - [/] Verify fix and investigate new 404 error <!-- id: 3 -->
      //   - [ ] Check API response for transactions <!-- id: 4 -->
      //   - [ ] Investigate 404 for `/api/fees/sections` <!-- id: 6 -->
      //   - [ ] Manual verification in UI <!-- id: 5 -->
      semesterWise[sem] = {
        fees: [],
        totals: { payable: 0, paid: 0, due: 0, waiver: 0, excess: 0 },
        fine: {
          amount: 0,
          paid: 0,
          due: 0,
          isOverdue: false,
          deadline: null,
        },
      };
    }

    semesterWise[sem].fees.push({
      id: c.id,
      is_charge: true,
      charge_type: c.charge_type,
      category: c.category?.name || "Individual Charge",
      category_id: c.category_id,
      payable,
      paid,
      waiver: 0, // Individual charges don't usually have waivers in this flow
      due,
      excess,
      description: c.description,
      receipts: chargePayments.map((p) => ({
        number: p.payment?.transaction_id || "N/A",
        date: p.payment?.payment_date,
        amount: p.amount,
        method: p.payment?.payment_method,
      })),
    });

    semesterWise[sem].totals.payable += payable;
    semesterWise[sem].totals.paid += paid;
    semesterWise[sem].totals.due += due;
    semesterWise[sem].totals.excess += excess;
  });

  Object.keys(semesterWise).forEach((sem) => {
    const data = semesterWise[sem];
    const config = configMap[sem];

    if (config && config.due_date && data.totals.due > 0) {
      const deadline = new Date(config.due_date);
      if (today > deadline) {
        let totalFine = 0;
        if (config.fine_type === "fixed") {
          totalFine = parseFloat(config.fine_amount);
        } else if (config.fine_type === "percentage") {
          totalFine = (data.totals.due * parseFloat(config.fine_amount)) / 100;
        }

        data.fine.amount = totalFine;
        data.fine.isOverdue = true;
        data.fine.due = Math.max(0, totalFine - data.fine.paid);

        data.totals.due += data.fine.due;
        data.totals.payable += totalFine;
        data.totals.paid += data.fine.paid;
      }
    }

    grandTotals.payable += data.totals.payable;
    grandTotals.paid += data.totals.paid;
    grandTotals.due += data.totals.due;
  });

  // Fix: Deduct amount used from Wallet (internal payments) from the calculated Excess Balance
  // Otherwise, the original excess remains "available" even after being used.
  const totalWalletUsage = globalPayments
    .filter((p) => p.payment_method === "WALLET")
    .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

  grandTotals.excessBalance = Math.max(
    0,
    grandTotals.excessBalance - totalWalletUsage,
  );

  return {
    semesterWise,
    grandTotals,
    transactions: globalPayments,
    scholarships: waivers.map((w) => ({
      id: w.id,
      type: w.waiver_type,
      amount: w.amount,
      approved_at: w.approved_at,
    })),
    studentInfo: {
      batch_year: effectiveBatchYear,
      is_hosteller,
      requires_transport,
      admission_type: student.admission_type,
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      admission_number: student.admission_number,
      student_id: student.student_id,
      program: program ? { name: program.name } : null,
      department: department ? { name: department.name } : null,
    },
  };
}

export default {
  calculateFeeStatus,
};
