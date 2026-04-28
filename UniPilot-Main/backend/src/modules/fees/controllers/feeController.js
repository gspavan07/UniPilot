import logger from "../../../utils/logger.js";
import { Op } from "sequelize";
import XLSX from "xlsx";
import { sequelize } from "../../../config/database.js";
import CoreService from "../../core/services/index.js";
import { AcademicFeePayment, FeeCategory, FeePayment, FeeSemesterConfig, FeeStructure, FeeWaiver, StudentChargePayment, StudentFeeCharge } from "../models/index.js";
import feeStatusService from "../services/feeStatusService.js";
import academicLookupService from "../../academics/services/academicLookupService.js";

// Template import
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
// Prioritize RAZORPAY_MODE env var, otherwise fallback to NODE_ENV
const isLive =
  process.env.RAZORPAY_MODE === "live" || process.env.NODE_ENV === "production";

const razorpayKeyId = isLive
  ? process.env.RAZORPAY_KEY_ID_LIVE
  : process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = isLive
  ? process.env.RAZORPAY_KEY_SECRET_LIVE
  : process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
if (razorpayKeyId && razorpayKeySecret) {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} else {
  logger.warn(
    "Razorpay keys missing. Payment functionality will be disabled.",
  );
}

const hydrateStudentsWithAcademics = async (
  students,
  { programAttributes = ["name"], departmentAttributes = ["name"] } = {},
) => {
  const list = Array.isArray(students)
    ? students.filter(Boolean)
    : students
      ? [students]
      : [];
  if (list.length === 0) return;

  const programIds = list
    .map((student) => student.program_id || student.student_profile?.program_id)
    .filter(Boolean);

  const programMap = await academicLookupService.getProgramMapByIds(programIds, {
    attributes: programAttributes,
  });

  const departmentIds = [
    ...new Set(
      Array.from(programMap.values())
        .map((program) => program?.department_id)
        .filter(Boolean),
    ),
  ];

  const departmentMap = await academicLookupService.getDepartmentMapByIds(
    departmentIds,
    { attributes: departmentAttributes },
  );

  list.forEach((student) => {
    const programId =
      student.program_id || student.student_profile?.program_id || null;
    const program = programId ? programMap.get(programId) || null : null;
    const department = program?.department_id
      ? departmentMap.get(program.department_id) || null
      : null;

    if (typeof student?.setDataValue === "function") {
      if (programId) student.setDataValue("program_id", programId);
      student.setDataValue("program", program);
      student.setDataValue("department", department);
    } else {
      if (programId) student.program_id = programId;
      student.program = program;
      student.department = department;
    }
  });
};

const hydrateStructuresWithPrograms = async (
  structures,
  { programAttributes = null } = {},
) => {
  const list = Array.isArray(structures)
    ? structures.filter(Boolean)
    : structures
      ? [structures]
      : [];
  if (list.length === 0) return;

  const programIds = list.map((s) => s.program_id).filter(Boolean);
  const programMap = await academicLookupService.getProgramMapByIds(programIds, {
    attributes: programAttributes,
  });

  list.forEach((structure) => {
    const program = programMap.get(structure.program_id) || null;
    if (typeof structure?.setDataValue === "function") {
      structure.setDataValue("program", program);
    } else {
      structure.program = program;
    }
  });
};

// @desc    Create a fee category
export const createCategory = async (req, res) => {
  try {
    const category = await FeeCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    logger.error("Error creating fee category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// @desc    Get all fee categories
export const getCategories = async (req, res) => {
  try {
    const categories = await FeeCategory.findAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    logger.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// @desc    Get all fee structures
export const getStructures = async (req, res) => {
  try {
    const { batch_year, program_id } = req.query;
    const where = {};
    if (batch_year) where.batch_year = batch_year;
    if (program_id) where.program_id = program_id;

    const structures = await FeeStructure.findAll({
      where,
      include: [{ model: FeeCategory, as: "category" }],
      order: [["semester", "ASC"]],
    });
    await hydrateStructuresWithPrograms(structures, { programAttributes: null });
    res.status(200).json({ success: true, data: structures });
  } catch (error) {
    logger.error("Error fetching structures:", error);
    res.status(500).json({ error: "Failed to fetch structures" });
  }
};

// @desc    Clone a fee structure from one batch to another
export const cloneFeeStructure = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { fromBatch, toBatch, program_id } = req.body;

    if (!fromBatch || !toBatch || !program_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sourceStructures = await FeeStructure.findAll({
      where: { batch_year: fromBatch, program_id },
    });

    if (sourceStructures.length === 0) {
      return res
        .status(404)
        .json({ error: "No source structures found to clone" });
    }

    await FeeStructure.destroy({
      where: { batch_year: toBatch, program_id },
      transaction,
    });

    const newStructures = sourceStructures.map((s) => ({
      category_id: s.category_id,
      program_id: s.program_id,
      batch_year: toBatch,
      semester: s.semester,
      amount: s.amount,
      is_optional: s.is_optional,
      applies_to: s.applies_to,
      is_active: s.is_active,
    }));

    await FeeStructure.bulkCreate(newStructures, { transaction });

    // Also clone semester configs (deadlines/fines)
    const sourceConfigs = await FeeSemesterConfig.findAll({
      where: { batch_year: fromBatch, program_id },
    });

    if (sourceConfigs.length > 0) {
      // Clear existing for target batch to avoid duplicates
      await FeeSemesterConfig.destroy({
        where: { batch_year: toBatch, program_id },
        transaction,
      });

      const newConfigs = sourceConfigs.map((c) => ({
        program_id: c.program_id,
        batch_year: toBatch,
        semester: c.semester,
        due_date: c.due_date,
        fine_type: c.fine_type,
        fine_amount: c.fine_amount,
      }));

      await FeeSemesterConfig.bulkCreate(newConfigs, { transaction });
    }

    await transaction.commit();
    res.status(201).json({
      success: true,
      message: `Cloned ${newStructures.length} structures to ${toBatch}`,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error cloning fee structure:", error);
    res.status(500).json({ error: "Failed to clone structure" });
  }
};

// @desc    Create a fee structure
export const createStructure = async (req, res) => {
  try {
    const { apply_to_all_semesters, ...data } = req.body;

    if (apply_to_all_semesters) {
      const structures = [];
      for (let sem = 1; sem <= 8; sem++) {
        structures.push({
          ...data,
          semester: sem,
        });
      }
      await FeeStructure.bulkCreate(structures);
      return res.status(201).json({
        success: true,
        message: "Fee structure applied to all 8 semesters",
      });
    }

    const structure = await FeeStructure.create(data);
    res.status(201).json({ success: true, data: structure });
  } catch (error) {
    logger.error("Error creating fee structure:", error);
    res.status(500).json({ error: "Failed to create structure" });
  }
};

// @desc    Update a fee structure
export const updateStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const structure = await FeeStructure.findByPk(id);
    if (!structure) {
      return res.status(404).json({ error: "Structure not found" });
    }
    await structure.update(req.body);
    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    logger.error("Error updating fee structure:", error);
    res.status(500).json({ error: "Failed to update structure" });
  }
};

// @desc    Delete a fee structure
export const deleteStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const structure = await FeeStructure.findByPk(id);
    if (!structure) {
      return res.status(404).json({ error: "Structure not found" });
    }
    await structure.destroy();
    res.status(200).json({ success: true, message: "Structure deleted" });
  } catch (error) {
    logger.error("Error deleting fee structure:", error);
    res.status(500).json({ error: "Failed to delete structure" });
  }
};

// @desc    Collect a fee payment
// @desc    Collect a fee payment
export const collectPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  let createdParentPayments = [];

  try {
    const {
      student_id,
      payments, // Array of { type, structure_id/charge_id, amount, semester }
      payment_method,
      transaction_id,
      remarks,
      payment_date,
    } = req.body;

    if (!payments || !Array.isArray(payments)) {
      return res.status(400).json({ error: "Payments array is required" });
    }

    // 1. Calculate Wallet Balance
    const status = await calculateFeeStatus(student_id);
    let walletBalance = status.grandTotals.excessBalance || 0;

    // 2. Distribute items into Wallet vs External (Cash/Online) Lists
    const walletItems = [];
    const externalItems = [];

    for (const p of payments) {
      let amountRemaining = parseFloat(p.amount);
      if (amountRemaining <= 0) continue;

      // Determine Type (Same logic as before)
      let resolvedType = p.type;
      let targetId = p.structure_id || p.charge_id;

      if (
        (!resolvedType || resolvedType === "structure") &&
        targetId &&
        !targetId.toString().startsWith("fine")
      ) {
        // Optimization: assume structure if ID exists and not "fine"
        // In a strict world we check DB, but relying on frontend "type" or fallback is usually okay if IDs are distinct UUIDs
        // For safety, let's keep it simple or trust the input type if provided, else infer.
        // If structure_id is provided, it's likely structure.
        resolvedType = "structure";
      } else if (
        p.type === "fine" ||
        (p.structure_id && p.structure_id.toString().startsWith("fine"))
      ) {
        resolvedType = "fine";
        targetId = null;
      } else if (!resolvedType && p.charge_id) {
        resolvedType = "charge";
      }

      // Additional safety check if type is still ambiguous could go here,
      // but let's assume valid input from frontend for now or basic inference.

      // A. Try to pay with Wallet
      if (walletBalance > 0) {
        const canDeduct = Math.min(walletBalance, amountRemaining);
        if (canDeduct > 0) {
          walletItems.push({
            type: resolvedType,
            id: targetId,
            amount: canDeduct,
            semester: p.semester,
          });
          walletBalance -= canDeduct;
          amountRemaining -= canDeduct;
        }
      }

      // B. Remainder goes to External
      if (amountRemaining > 0) {
        externalItems.push({
          type: resolvedType,
          id: targetId,
          amount: amountRemaining,
          semester: p.semester,
        });
      }
    }

    const receiptBase = `REC-${Date.now()}-${student_id.substring(0, 4)}`;

    // 3. Create Parent Records for Wallet (Split by Semester)
    if (walletItems.length > 0) {
      // Group items by semester
      const walletBySem = walletItems.reduce((acc, item) => {
        const sem = item.semester || 0;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(item);
        return acc;
      }, {});

      for (const [semester, semItems] of Object.entries(walletBySem)) {
        const semTotal = semItems.reduce((sum, i) => sum + i.amount, 0);

        const walletParent = await FeePayment.create(
          {
            student_id,
            amount_paid: semTotal,
            payment_method: "WALLET",
            semester: semester === "0" ? null : parseInt(semester),
            transaction_id: `WAL-${Date.now()}-${semester}`,
            receipt_url: `${receiptBase}-W-${semester}`,
            payment_date: payment_date || new Date(),
            remarks: `Paid from Wallet: ${remarks || "Fee Payment"}`,
            status: "completed",
          },
          { transaction },
        );
        createdParentPayments.push(walletParent);

        for (const item of semItems) {
          if (item.type === "structure") {
            await AcademicFeePayment.create(
              {
                fee_payment_id: walletParent.id,
                student_id,
                fee_structure_id: item.id,
                amount: item.amount,
              },
              { transaction },
            );
          } else if (item.type === "charge" || item.type === "fine") {
            if (item.id && item.type === "charge") {
              await StudentChargePayment.create(
                {
                  fee_payment_id: walletParent.id,
                  student_id,
                  student_fee_charge_id: item.id,
                  amount: item.amount,
                },
                { transaction },
              );
              await StudentFeeCharge.update(
                {
                  is_paid: true,
                  paid_at: new Date(),
                  payment_id: walletParent.id,
                },
                { where: { id: item.id }, transaction },
              );
            }
          }
        }
      }
    }

    // 4. Create Parent Records for External (Split by Semester)
    if (externalItems.length > 0) {
      // Group items by semester
      const externalBySem = externalItems.reduce((acc, item) => {
        const sem = item.semester || 0;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(item);
        return acc;
      }, {});

      for (const [semester, semItems] of Object.entries(externalBySem)) {
        const semTotal = semItems.reduce((sum, i) => sum + i.amount, 0);

        const externalParent = await FeePayment.create(
          {
            student_id,
            amount_paid: semTotal,
            payment_method: payment_method || "cash",
            semester: semester === "0" ? null : parseInt(semester),
            transaction_id: transaction_id || `TXN-${Date.now()}`,
            receipt_url: `${receiptBase}-E-${semester}`,
            payment_date: payment_date || new Date(),
            remarks: remarks || "Fee Collection",
            status: "completed",
          },
          { transaction },
        );
        createdParentPayments.push(externalParent);

        for (const item of semItems) {
          if (item.type === "structure") {
            await AcademicFeePayment.create(
              {
                fee_payment_id: externalParent.id,
                student_id,
                fee_structure_id: item.id,
                amount: item.amount,
              },
              { transaction },
            );
          } else if (item.id && item.type === "charge") {
            await StudentChargePayment.create(
              {
                fee_payment_id: externalParent.id,
                student_id,
                student_fee_charge_id: item.id,
                amount: item.amount,
              },
              { transaction },
            );
            await StudentFeeCharge.update(
              {
                is_paid: true,
                paid_at: new Date(),
                payment_id: externalParent.id,
              },
              { where: { id: item.id }, transaction },
            );
          }
        }
      }
    }

    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error("Error collecting payment:", error);
    return res.status(500).json({ error: "Failed to process payment" });
  }

  // Hydration
  try {
    const hydrated = await FeePayment.findAll({
      where: { id: createdParentPayments.map((p) => p.id) },
      include: [
        // Include children
        {
          model: AcademicFeePayment,
          as: "academic_fee_payments", // Ensure association exists in models!
          include: [
            { model: FeeStructure, as: "structure", include: ["category"] },
          ],
        },
        {
          model: StudentChargePayment,
          as: "student_charge_payments", // Ensure association exists!
          include: [
            { model: StudentFeeCharge, as: "charge", include: ["category"] },
          ],
        },
      ],
    });

    const studentIds = [...new Set(hydrated.map((p) => p.student_id))];
    const userMap = await CoreService.getUserMapByIds(studentIds, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "student_id",
        "program_id",
        "department_id",
        "batch_year",
      ],
    });

    hydrated.forEach((payment) => {
      const studentData = userMap.get(payment.student_id);
      if (studentData) {
        payment.setDataValue("student", studentData);
      }
    });

    const studentsToHydrate = hydrated.map((payment) => payment.getDataValue("student")).filter(Boolean);
    await hydrateStudentsWithAcademics(studentsToHydrate, { programAttributes: ["name"], departmentAttributes: ["name"] });
    return res.status(201).json({ success: true, data: hydrated });
  } catch (err) {
    logger.warn("Hydration failed:", err);
    return res.status(201).json({ success: true, data: createdParentPayments });
  }
};

// @desc    Pay my own fees (Student)
export const payMyFees = async (req, res) => {
  const transaction = await sequelize.transaction();
  let createdPayments = [];
  try {
    const student_id = req.user.userId; // Securely get ID from token
    const { payments, payment_method, transaction_id, remarks } = req.body;

    if (!payments || !Array.isArray(payments)) {
      return res.status(400).json({ error: "Payments array is required" });
    }

    const receipt_url = `REC-${Date.now()}-${student_id.substring(0, 4)}`;

    const status = await calculateFeeStatus(student_id);
    let walletCredit = status.grandTotals.excessBalance || 0;

    // Razorpay Verification Logic
    if (payment_method === "razorpay") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res
          .status(400)
          .json({ error: "Missing Razorpay payment details" });
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const isLive =
        process.env.RAZORPAY_MODE === "live" ||
        process.env.NODE_ENV === "production";

      const expectedSignature = crypto
        .createHmac(
          "sha256",
          isLive
            ? process.env.RAZORPAY_KEY_SECRET_LIVE
            : process.env.RAZORPAY_KEY_SECRET,
        )
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: "Invalid Razorpay signature" });
      }

      // If verified, proceed to record payment
      // Use razorpay_payment_id as transaction_id
      // Calculate total amount from the payments array
      const totalAmount = payments.reduce(
        (sum, p) => sum + parseFloat(p.amount),
        0,
      );

      // 3. Create Global Fee Payment Record
      // Add the master payment to createdPayments

      // 4. Create Detailed Payment Records
      // Process each payment in the payments array
      for (const payment of payments) {
        const paymentType = payment.type || "structure"; // Default to structure if not specified

        if (
          paymentType === "structure" ||
          paymentType === "academic_fee_payment"
        ) {
          // Academic fee payment (linked to fee structure)
          if (payment.structure_id) {
            const feePayment = await FeePayment.create(
              {
                student_id,
                amount_paid: totalAmount,
                payment_date: new Date(),
                fee_structure_id: payment.structure_id,
                transaction_id: razorpay_payment_id,
                semester: payment.semester,
                payment_method: "razorpay", // Could be card/netbanking etc from webhook, simplified here
                receipt_url: receipt_url,
                status: "completed",
                remarks: `Online Payment (Order: ${razorpay_order_id})`,
              },
              { transaction },
            );
            createdPayments.push(feePayment);
            await AcademicFeePayment.create(
              {
                fee_payment_id: feePayment.id,
                student_id,
                fee_structure_id: payment.structure_id,
                amount: parseFloat(payment.amount),
                semester: payment.semester,
              },
              { transaction },
            );
          }
        } else if (
          paymentType === "charge" ||
          paymentType === "fee_charge_payment"
        ) {
          // Student fee charge payment
          if (payment.structure_id || payment.charge_id) {
            const chargeId = payment.charge_id || payment.structure_id;
            const charge = await StudentFeeCharge.findByPk(chargeId, {
              transaction,
            });
            if (charge) {
              const feePayment = await FeePayment.create(
                {
                  student_id,
                  amount_paid: totalAmount,
                  payment_date: new Date(),
                  fee_charge_id: chargeId,
                  transaction_id: razorpay_payment_id,
                  semester: payment.semester,
                  payment_method: "razorpay", // Could be card/netbanking etc from webhook, simplified here
                  receipt_url: receipt_url,
                  status: "completed",
                  remarks: `Online Payment (Order: ${razorpay_order_id})`,
                },
                { transaction },
              );
              createdPayments.push(feePayment);
              await StudentChargePayment.create(
                {
                  fee_payment_id: feePayment.id,
                  student_id,
                  student_fee_charge_id: chargeId,
                  amount: parseFloat(payment.amount),
                  semester: payment.semester,
                },
                { transaction },
              );
            }
          }
        }
      }
    } else {
      // Original loop for non-razorpay payments
      createdPayments = [];
      for (let i = 0; i < payments.length; i++) {
        const p = payments[i];
        let amountRemaining = p.amount;

        // 1. Consume Wallet Credit first
        if (walletCredit > 0) {
          const canDeduct = Math.min(walletCredit, amountRemaining);
          if (canDeduct > 0) {
            const wPayment = await FeePayment.create(
              {
                student_id,
                fee_structure_id:
                  p.type === "structure" || !p.type ? p.structure_id : null,
                fee_charge_id:
                  p.type === "charge" || p.type === "fine"
                    ? p.structure_id
                    : null,
                semester: p.semester || (p.type === "fine" ? p.semester : null),
                amount_paid: canDeduct,
                payment_method: "WALLET",
                transaction_id: `WAL-${Date.now()}-${i}`,
                receipt_url,
                payment_date: new Date(),
                remarks: `Paid from Wallet: ${p.type === "fine" ? "Fine" : "Fee"}`,
                status: "completed",
              },
              { transaction },
            );
            createdPayments.push(wPayment);
            walletCredit -= canDeduct;
            amountRemaining -= canDeduct;
          }
        }

        // 2. Process external payment for the rest
        if (amountRemaining > 0) {
          const payment = await FeePayment.create(
            {
              student_id,
              fee_structure_id:
                p.type === "structure" || !p.type ? p.structure_id : null,
              fee_charge_id:
                p.type === "charge" || p.type === "fine"
                  ? p.structure_id
                  : null,
              semester: p.semester || (p.type === "fine" ? p.semester : null),
              amount_paid: amountRemaining,
              payment_method: payment_method || "online", // Default to online for students
              transaction_id:
                payment_method === "razorpay"
                  ? req.body.razorpay_payment_id
                  : transaction_id || `TXN-${Date.now()}`,
              receipt_url,
              payment_date: new Date(),
              remarks:
                p.type === "fine"
                  ? `Late Fine for Semester ${p.semester}`
                  : remarks || "Online Payment",
              status: "completed",
            },
            { transaction },
          );
          createdPayments.push(payment);
        }
      }
    }

    // Commit the transaction for both payment flows
    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error("Error processing student payment:", error);
    return res.status(500).json({ error: "Failed to process payment" });
  }

  // Hydration logic (separate from transaction)
  try {
    const hydratedPayments = await FeePayment.findAll({
      where: { id: createdPayments.map((p) => p.id) },
      include: [
        // {
        //   model: FeeStructure,
        //   as: "fee_structure",
        //   include: [{ model: FeeCategory, as: "category" }],
        // },
      ],
    });

    const studentIds = [...new Set(hydratedPayments.map((p) => p.student_id))];
    const userMap = await CoreService.getUserMapByIds(studentIds, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "student_id",
        "program_id",
        "department_id",
        "batch_year",
      ],
    });

    hydratedPayments.forEach((payment) => {
      const studentData = userMap.get(payment.student_id);
      if (studentData) {
        payment.setDataValue("student", studentData);
      }
    });

    const studentsToHydrate = hydratedPayments.map((payment) => payment.getDataValue("student")).filter(Boolean);
    await hydrateStudentsWithAcademics(studentsToHydrate, { programAttributes: ["name"], departmentAttributes: ["name"] });
    return res.status(201).json({ success: true, data: hydratedPayments });
  } catch (hydrationError) {
    logger.warn("Hydration failed after payment commit:", hydrationError);
    // Fallback to unhydrated data
    return res.status(201).json({ success: true, data: createdPayments });
  }
};

export const calculateFeeStatus = async (studentId) =>
  feeStatusService.calculateFeeStatus(studentId);


// @desc    Get student's fee details (Self)
export const getMyFeeStatus = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const data = await calculateFeeStatus(studentId);
    res.json({ success: true, data });
  } catch (error) {
    logger.error("Error fetching my fee status:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch fee status" });
  }
};

// @desc    Get any student's fee details (Admin)
export const getStudentFeeStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const data = await calculateFeeStatus(studentId);
    res.json({ success: true, data });
  } catch (error) {
    logger.error("Error fetching student fee status:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch fee status" });
  }
};

// @desc    Get semester configs
export const getSemesterConfigs = async (req, res) => {
  try {
    const { program_id, batch_year } = req.query;
    const where = {};
    if (program_id) where.program_id = program_id;
    if (batch_year) where.batch_year = batch_year;

    const configs = await FeeSemesterConfig.findAll({ where });
    res.status(200).json({ success: true, data: configs });
  } catch (error) {
    logger.error("Error fetching semester configs:", error);
    res.status(500).json({ error: "Failed to fetch configs" });
  }
};

// @desc    Create Razorpay Order
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency,
      receipt: `REC-${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: order,
      key_id: razorpay.key_id, // Send key_id to frontend
    });
  } catch (error) {
    logger.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
};

// @desc    Update or create semester config
export const updateSemesterConfig = async (req, res) => {
  try {
    const {
      program_id,
      batch_year,
      semester,
      due_date,
      fine_type,
      fine_amount,
    } = req.body;
    const [config, created] = await FeeSemesterConfig.findOrCreate({
      where: { program_id, batch_year, semester },
      defaults: { due_date, fine_type, fine_amount },
    });
    if (!created) {
      await config.update({ due_date, fine_type, fine_amount });
    }
    res.json({ success: true, data: config });
  } catch (err) {
    logger.error("Error updating semester config", err);
    res.status(500).json({ success: false, message: "Error updating config" });
  }
};

// @desc    Get dashboard statistics for admins
export const getCollectionStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalCollected = await FeePayment.sum("amount_paid", {
      where: { status: "completed" },
    });

    const todayCollected = await FeePayment.sum("amount_paid", {
      where: {
        status: "completed",
        payment_date: { [Op.gte]: today },
      },
    });

    // Program-wise collection (Fetch payments, then map programs manually avoiding SQL join on User)
    const allCompletedPayments = await FeePayment.findAll({
      attributes: ["student_id", "amount_paid"],
      where: { status: "completed" },
      raw: true,
    });

    const studentIds = [...new Set(allCompletedPayments.map(p => p.student_id))];
    const userMap = await CoreService.getUserMapByIds(studentIds, { attributes: ["id", "program_id"] });

    const programWiseTotals = {};
    allCompletedPayments.forEach(payment => {
      const student = userMap.get(payment.student_id);
      if (student && student.program_id) {
        if (!programWiseTotals[student.program_id]) {
          programWiseTotals[student.program_id] = 0;
        }
        programWiseTotals[student.program_id] += parseFloat(payment.amount_paid);
      }
    });

    const programIds = Object.keys(programWiseTotals);
    const programMap = await academicLookupService.getProgramMapByIds(programIds, { attributes: ["id", "name"] });

    const programWise = programIds.map((pid) => ({
      program_id: pid,
      program_name: programMap.get(pid)?.name || null,
      total: programWiseTotals[pid],
    }));

    // Payment method distribution
    const methodWise = await FeePayment.findAll({
      attributes: [
        "payment_method",
        [sequelize.fn("SUM", sequelize.col("amount_paid")), "total"],
      ],
      where: { status: "completed" },
      group: ["payment_method"],
    });

    res.json({
      success: true,
      data: {
        totalCollected: totalCollected || 0,
        todayCollected: todayCollected || 0,
        programWise,
        methodWise,
      },
    });
  } catch (err) {
    logger.error("Error fetching collection stats", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching statistics" });
  }
};

// @desc    Get all transactions (Paginated)
export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let rowsToReturn = [];
    let count = 0;

    // Manual search on hydrated students
    if (search) {
      const allPaymentsForSearch = await FeePayment.findAll({
        where: { status: "completed" }
      });
      const allStudentIds = [...new Set(allPaymentsForSearch.map(p => p.student_id))];
      const searchPattern = `%${search}%`;
      // Match by name on User, and by admission/student ID on StudentProfile
      const [matchingUsers, matchingProfiles] = await Promise.all([
        CoreService.findAll({
          where: {
            id: { [Op.in]: allStudentIds },
            [Op.or]: [
              { first_name: { [Op.iLike]: searchPattern } },
              { last_name: { [Op.iLike]: searchPattern } },
            ],
          },
          attributes: ["id"],
        }),
        sequelize.models.StudentProfile.findAll({
          where: {
            user_id: { [Op.in]: allStudentIds },
            [Op.or]: [
              { admission_number: { [Op.iLike]: searchPattern } },
              { student_id: { [Op.iLike]: searchPattern } },
            ],
          },
          attributes: ["user_id"],
          raw: true,
        }),
      ]);

      const matchingStudentIds = [
        ...new Set([
          ...matchingUsers.map((s) => s.id),
          ...matchingProfiles.map((p) => p.user_id),
        ]),
      ];

      where[Op.or] = [
        { transaction_id: { [Op.iLike]: `%${search}%` } },
        { student_id: { [Op.in]: matchingStudentIds } }
      ];

      const paginatedResult = await FeePayment.findAndCountAll({
        where,
        include: [
          {
            model: FeeStructure,
            as: "fee_structure",
            include: [{ model: FeeCategory, as: "category" }],
          },
          {
            model: StudentFeeCharge,
            as: "student_fee_charge",
            include: [{ model: FeeCategory, as: "category" }],
          },
          {
            model: AcademicFeePayment,
            as: "academic_fee_payments",
            include: [
              {
                model: FeeStructure,
                as: "structure",
                include: [{ model: FeeCategory, as: "category" }],
              },
            ],
          },
          {
            model: StudentChargePayment,
            as: "student_charge_payments",
            include: [
              {
                model: StudentFeeCharge,
                as: "charge",
                include: [{ model: FeeCategory, as: "category" }],
              },
            ],
          },
        ],
        order: [["payment_date", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      count = paginatedResult.count;
      rowsToReturn = paginatedResult.rows;
    } else {
      const paginatedResult = await FeePayment.findAndCountAll({
        where,
        include: [
          {
            model: FeeStructure,
            as: "fee_structure",
            include: [{ model: FeeCategory, as: "category" }],
          },
          {
            model: StudentFeeCharge,
            as: "student_fee_charge",
            include: [{ model: FeeCategory, as: "category" }],
          },
          {
            model: AcademicFeePayment,
            as: "academic_fee_payments",
            include: [
              {
                model: FeeStructure,
                as: "structure",
                include: [{ model: FeeCategory, as: "category" }],
              },
            ],
          },
          {
            model: StudentChargePayment,
            as: "student_charge_payments",
            include: [
              {
                model: StudentFeeCharge,
                as: "charge",
                include: [{ model: FeeCategory, as: "category" }],
              },
            ],
          },
        ],
        order: [["payment_date", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      count = paginatedResult.count;
      rowsToReturn = paginatedResult.rows;
    }

    const studentIds = [...new Set(rowsToReturn.map((p) => p.student_id))];
    const userMap = await CoreService.getUserMapByIds(studentIds, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "admission_number",
        "student_id",
        "program_id",
        "department_id",
      ],
    });

    rowsToReturn.forEach((payment) => {
      const studentData = userMap.get(payment.student_id);
      if (studentData) {
        payment.setDataValue("student", studentData);
      }
    });

    const studentsToHydrate = rowsToReturn.map((payment) => payment.getDataValue("student")).filter(Boolean);
    await hydrateStudentsWithAcademics(studentsToHydrate, { programAttributes: ["name"], departmentAttributes: ["name"] });

    res.json({
      success: true,
      data: {
        transactions: rowsToReturn,
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (err) {
    logger.error("Error fetching transactions", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching transactions" });
  }
};

// @desc    Get all available admission batches
export const getBatches = async (req, res) => {
  try {
    // Get unique batches from FeeStructure
    const structureBatches = await FeeStructure.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("batch_year")), "batch_year"],
      ],
      raw: true,
    });

    // Get unique batches from Students (Users)
    const studentBatches = await sequelize.models.StudentProfile.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("batch_year")), "batch_year"],
      ],
      raw: true,
    });

    // Combine and deduplicate
    const combined = [
      ...structureBatches.map((b) => b.batch_year),
      ...studentBatches.map((b) => b.batch_year),
    ];

    // Add current year to ensure it always exists for planning
    // const currentYear = new Date().getFullYear();
    // combined.push(currentYear);

    const uniqueBatches = [...new Set(combined)]
      .filter(Boolean)
      .sort((a, b) => b - a);

    res.status(200).json({ success: true, data: uniqueBatches });
  } catch (error) {
    logger.error("Error fetching batches:", error);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
};
// @desc    Apply a waiver or scholarship to a student
export const applyWaiver = async (req, res) => {
  try {
    const {
      student_id,
      fee_category_id,
      waiver_type,
      amount,
      is_approved,
      applies_to,
      semester,
      value_type,
      percentage,
    } = req.body;

    const waiver = await FeeWaiver.create({
      student_id,
      fee_category_id,
      waiver_type,
      amount: amount || 0,
      is_approved: is_approved || false,
      approved_by: is_approved ? req.user.userId || req.user.id : null,
      approved_at: is_approved ? new Date() : null,
      applies_to: applies_to || "one_time",
      semester: semester || null,
      value_type: value_type || "fixed",
      percentage: percentage || null,
    });

    res.status(201).json({ success: true, data: waiver });
  } catch (error) {
    logger.error("Error applying waiver:", error);
    res.status(500).json({ error: "Failed to apply waiver" });
  }
};

// @desc    Get all waivers with filtering
export const getWaivers = async (req, res) => {
  try {
    const { student_id, is_approved } = req.query;
    const where = {};
    if (student_id) where.student_id = student_id;
    if (is_approved !== undefined) where.is_approved = is_approved === "true";

    const waivers = await FeeWaiver.findAll({
      where,
      include: [
        { model: FeeCategory, as: "category" },
      ],
      order: [["created_at", "DESC"]],
    });

    const studentIds = [...new Set(waivers.map((w) => w.student_id))];
    const userMap = await CoreService.getUserMapByIds(studentIds, {
      attributes: ["id", "first_name", "last_name", "student_id"],
    });

    waivers.forEach((waiver) => {
      const studentData = userMap.get(waiver.student_id);
      if (studentData) {
        waiver.setDataValue("student", studentData);
      }
    });

    res.status(200).json({ success: true, data: waivers });
  } catch (error) {
    logger.error("Error fetching waivers:", error);
    res.status(500).json({ error: "Failed to fetch waivers" });
  }
};

// @desc    Approve a pending waiver
export const approveWaiver = async (req, res) => {
  try {
    const { id } = req.params;
    const waiver = await FeeWaiver.findByPk(id);

    if (!waiver) {
      return res.status(404).json({ error: "Waiver not found" });
    }

    await waiver.update({
      is_approved: true,
      approved_by: req.user.userId || req.user.id,
      approved_at: new Date(),
    });

    res.status(200).json({ success: true, data: waiver });
  } catch (error) {
    logger.error("Error approving waiver:", error);
    res.status(500).json({ error: "Failed to approve waiver" });
  }
};

// @desc    Update a waiver record (Edit or Toggle Status)
export const updateWaiver = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      waiver_type,
      applies_to,
      semester,
      value_type,
      percentage,
      is_active,
    } = req.body;

    const waiver = await FeeWaiver.findByPk(id);

    if (!waiver) {
      return res.status(404).json({ error: "Scholarship record not found" });
    }

    await waiver.update({
      amount: amount !== undefined ? amount : waiver.amount,
      waiver_type: waiver_type !== undefined ? waiver_type : waiver.waiver_type,
      applies_to: applies_to !== undefined ? applies_to : waiver.applies_to,
      semester: semester !== undefined ? semester : waiver.semester,
      value_type: value_type !== undefined ? value_type : waiver.value_type,
      percentage: percentage !== undefined ? percentage : waiver.percentage,
      is_active: is_active !== undefined ? is_active : waiver.is_active,
    });

    // Reload with associations to return complete data
    await waiver.reload({
      include: [
        { model: FeeCategory, as: "category" },
      ],
    });

    const studentData = await CoreService.findByPk(waiver.student_id, {
      attributes: ["id", "first_name", "last_name", "student_id"],
    });
    waiver.setDataValue("student", studentData);

    res.status(200).json({ success: true, data: waiver });
  } catch (error) {
    logger.error("Error updating scholarship:", error);
    res.status(500).json({ error: "Failed to update scholarship" });
  }
};

// @desc    Delete a waiver record
export const deleteWaiver = async (req, res) => {
  try {
    const { id } = req.params;
    const waiver = await FeeWaiver.findByPk(id);

    if (!waiver) {
      return res.status(404).json({ error: "Waiver not found" });
    }

    await waiver.destroy();
    res.status(200).json({ success: true, message: "Waiver deleted" });
  } catch (error) {
    logger.error("Error deleting waiver:", error);
    res.status(500).json({ error: "Failed to delete waiver" });
  }
};
// @desc    Validate scholarship import file and return preview
export const validateScholarshipImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      return res.status(400).json({ error: "The uploaded file is empty" });
    }

    // Prepare validation results
    const results = [];
    const identifiers = data
      .map((row) => {
        const val = row.RegNo || row.AdmissionNo || row.student_id;
        return val ? String(val) : null;
      })
      .filter(Boolean);

    const categoryNames = [
      ...new Set(
        data
          .map((row) => {
            const val = row.FeeCategory || row.category;
            return val ? String(val).trim() : null;
          })
          .filter(Boolean),
      ),
    ];

    // Bulk fetch students and categories for validation
    const [profiles, categories] = await Promise.all([
      sequelize.models.StudentProfile.findAll({
        where: {
          [Op.or]: [
            { admission_number: { [Op.in]: identifiers } },
            { student_id: { [Op.in]: identifiers } },
          ],
        },
        include: [
          {
            model: sequelize.models.User,
            as: "user",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
        attributes: ["student_id", "admission_number", "user_id"],
      }),
      FeeCategory.findAll({
        where: { name: { [Op.in]: categoryNames } },
      }),
    ]);

    const studentMap = {};
    profiles.forEach((profile) => {
      const user = profile.user;
      if (!user) return;
      const entry = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        student_id: profile.student_id,
        admission_number: profile.admission_number,
      };
      if (profile.admission_number) studentMap[profile.admission_number] = entry;
      if (profile.student_id) studentMap[profile.student_id] = entry;
    });

    const categoryMap = {};
    categories.forEach((c) => (categoryMap[c.name.toLowerCase()] = c));

    for (const row of data) {
      const identifier = String(
        row.RegNo || row.AdmissionNo || row.student_id || "",
      );
      const catName = String(row.FeeCategory || row.category || "")
        .trim()
        .toLowerCase();
      const student = studentMap[identifier];
      const category = categoryMap[catName];

      const errors = [];
      if (!student) errors.push("Student not found");
      // Allow missing category and amount for "Roll No Only" flow
      // The frontend will handle the "Missing" state and bulk apply logic.

      results.push({
        regNo: identifier,
        studentName: student
          ? `${student.first_name} ${student.last_name}`
          : row.StudentName || row.Name || "Unknown",
        student_id: student?.id,
        categoryName: row.FeeCategory || row.category,
        fee_category_id: category?.id || null,
        waiver_type: row.ScholarshipType || row.type || "Scholarship",
        amount: parseFloat(row.Amount || 0),
        // Advanced fields from Excel or defaults
        applies_to: row.AppliesTo || row.applies_to || "one_time",
        semester: row.Semester || row.semester || null,
        value_type: row.ValueType || row.value_type || "fixed",
        percentage: row.Percentage || row.percentage || null,
        status: errors.length > 0 ? "error" : "valid",
        errors,
      });
    }

    res.json({ success: true, data: results });
  } catch (error) {
    logger.error("Error validating scholarship import:", error);
    res.status(500).json({ error: "Failed to validate file" });
  }
};

// @desc    Finalize bulk scholarship import
export const finalizeScholarshipImport = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { records } = req.body; // Array of valid records from frontend preview

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: "No records to import" });
    }

    const waiversToCreate = records
      .filter((r) => r.status === "valid" || !r.errors?.length)
      .map((r) => ({
        student_id: r.student_id,
        fee_category_id: r.fee_category_id,
        waiver_type: r.waiver_type,
        amount: r.amount,
        is_approved: true,
        approved_by: req.user.userId || req.user.id,
        approved_at: new Date(),
        // New advanced fields
        applies_to: r.applies_to || "one_time",
        semester: r.semester || null,
        value_type: r.value_type || "fixed",
        percentage: r.percentage || null,
      }));

    if (waiversToCreate.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid records found for import" });
    }

    await FeeWaiver.bulkCreate(waiversToCreate, { transaction });

    await transaction.commit();
    res.json({ success: true, count: waiversToCreate.length });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error finalizing scholarship import:", error);
    res.status(500).json({ error: "Failed to finalize import" });
  }
};

// @desc    Get defaulters list with filters
export const getDefaulters = async (req, res) => {
  try {
    const {
      batch_year,
      program_id,
      department_id,
      section,
      semester,
      min_due = 0,
      days_overdue,
      limit = 100,
      page = 1,
    } = req.query;

    const studentProfileWhere = {};
    if (batch_year) studentProfileWhere.batch_year = batch_year;
    if (program_id) studentProfileWhere.program_id = program_id;
    if (section) studentProfileWhere.section = section;

    if (department_id) {
      const programs = await academicLookupService.listPrograms({
        where: { department_id },
        attributes: ["id"],
      });
      const programIds = programs.map((program) => program.id);
      if (programIds.length === 0) {
        return res.json({
          success: true,
          meta: { total: 0, page: parseInt(page), limit: parseInt(limit), total_outstanding: 0 },
          data: [],
        });
      }
      studentProfileWhere.program_id = { [Op.in]: programIds };
    }

    // Bulk Fetch
    const [students, structures, payments, waivers, configs] =
      await Promise.all([
        CoreService.findAll({
          where: { role: "student", is_active: true },
          includeProfiles: ["student"],
          include: [
            {
              model: sequelize.models.StudentProfile,
              as: "student_profile",
              required: true,
              where: studentProfileWhere,
            },
          ],
          attributes: [
            "id",
            "first_name",
            "last_name",
            "student_id",
            "email",
            "phone",
            "parent_details",
            "batch_year",
            "program_id",
            "section",
            "is_hosteller",
            "requires_transport",
            "admission_type",
          ],
        }),
        FeeStructure.findAll({
          where: { is_active: true },
          include: [{ model: FeeCategory, as: "category" }],
        }),
        FeePayment.findAll({ where: { status: "completed" } }),
        FeeWaiver.findAll({ where: { is_approved: true, is_active: true } }),
        FeeSemesterConfig.findAll(),
      ]);

    await hydrateStudentsWithAcademics(students, {
      programAttributes: ["name"],
      departmentAttributes: ["name"],
    });

    const paymentMap = {};
    payments.forEach((p) => {
      if (!paymentMap[p.student_id]) paymentMap[p.student_id] = [];
      paymentMap[p.student_id].push(p);
    });

    console.log("paymentMap", paymentMap);

    const waiverMap = {};
    waivers.forEach((w) => {
      if (!waiverMap[w.student_id]) waiverMap[w.student_id] = [];
      waiverMap[w.student_id].push(w);
    });

    const configMap = {};
    configs.forEach((c) => {
      configMap[`${c.program_id}_${c.batch_year}_${c.semester}`] = c;
    });

    const defaulters = [];
    const today = new Date();

    for (const student of students) {
      const applicableStructures = structures.filter(
        (s) =>
          s.program_id === student.program_id &&
          s.batch_year === student.batch_year &&
          (semester ? s.semester === parseInt(semester) : true) &&
          (s.applies_to === "all" ||
            (s.applies_to === "convener" &&
              student.admission_type === "convener") ||
            (s.applies_to === "management" &&
              student.admission_type === "management")),
      );

      if (applicableStructures.length === 0) continue;

      let totalPayable = 0;
      let totalPaid = 0;
      let totalWaiver = 0;
      let studentTotalDue = 0;

      // Group by Category to calculate Net Payable
      const catTotals = {}; // catId -> { payable, paid }

      applicableStructures.forEach((s) => {
        if (!catTotals[s.category_id])
          catTotals[s.category_id] = { payable: 0, paid: 0 };
        const sPayments = (paymentMap[student.id] || []).filter(
          (p) => p.fee_structure_id === s.id,
        );
        const sPaid = sPayments.reduce(
          (sum, p) => sum + parseFloat(p.amount_paid),
          0,
        );
        catTotals[s.category_id].payable += parseFloat(s.amount);
        catTotals[s.category_id].paid += sPaid;
      });

      // Calculate logic
      for (const catId in catTotals) {
        const cat = catTotals[catId];
        const catWaivers = (waiverMap[student.id] || []).filter(
          (w) => w.fee_category_id === catId,
        );
        // If filtering by semester, we should theoretically only apply waivers intended for that semester?
        // But waivers are currently category-global or fixed amount.
        // For now, we assume waivers apply generally.
        // Refinement: If semester filter is on, maybe scale waiver?
        // No, simplicity: Apply available waiver to the due amount for this specific view.
        const totalCatWaiver = catWaivers.reduce(
          (sum, w) => sum + parseFloat(w.amount),
          0,
        );

        const netPayable = Math.max(0, cat.payable - totalCatWaiver);
        const due = Math.max(0, netPayable - cat.paid);

        studentTotalDue += due;
        totalPayable += cat.payable;
        totalPaid += cat.paid;
        totalWaiver += Math.min(cat.payable, totalCatWaiver);
      }

      let maxOverdueDays = 0;
      // Simple overdue calculation
      if (studentTotalDue > 0) {
        const relevantSemesters = [
          ...new Set(applicableStructures.map((s) => s.semester)),
        ];
        relevantSemesters.forEach((sem) => {
          const config =
            configMap[`${student.program_id}_${student.batch_year}_${sem}`];
          if (config && config.due_date) {
            const dueDate = new Date(config.due_date);
            if (today > dueDate) {
              const diffTime = Math.abs(today - dueDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > maxOverdueDays) maxOverdueDays = diffDays;
            }
          }
        });
      }

      if (Math.round(studentTotalDue) > 0 && studentTotalDue >= min_due) {
        if (days_overdue && maxOverdueDays < days_overdue) continue;

        defaulters.push({
          id: student.id,
          student_id: student.student_id,
          name: `${student.first_name} ${student.last_name}`,
          batch: student.batch_year,
          program: student.program?.name,
          department: student.department?.name,
          section: student.section,
          semester: semester || "All",
          phone: student.phone,
          parent_phone:
            student.parent_details?.father_mobile ||
            student.parent_details?.mother_mobile,
          email: student.email,
          total_payable: totalPayable,
          total_paid: totalPaid,
          total_waiver: totalWaiver,
          total_due: studentTotalDue,
          days_overdue: maxOverdueDays,
        });
      }
    }

    defaulters.sort((a, b) => b.total_due - a.total_due);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = defaulters.slice(startIndex, endIndex);

    res.json({
      success: true,
      meta: {
        total: defaulters.length,
        page: parseInt(page),
        limit: parseInt(limit),
        total_outstanding: defaulters.reduce((sum, d) => sum + d.total_due, 0),
      },
      data: paginatedResults,
    });
  } catch (error) {
    logger.error("Error fetching defaulters:", error);
    res.status(500).json({ error: "Failed to fetch defaulters list" });
  }
};

// @desc    Send bulk reminders (Mock)
export const sendBulkReminders = async (req, res) => {
  try {
    const { student_ids, mode = "email" } = req.body;

    if (!student_ids || student_ids.length === 0) {
      return res.status(400).json({ error: "No students selected" });
    }

    // In a real app, queue a background job here
    logger.info(`Sending ${mode} reminders to ${student_ids.length} students`);

    res.json({
      success: true,
      message: `Successfully queued ${student_ids.length} ${mode} reminders.`,
      data: { count: student_ids.length },
    });
  } catch (error) {
    logger.error("Error sending reminders:", error);
    res.status(500).json({ error: "Failed to send reminders" });
  }
};

// @desc    Get unique sections
export const getSections = async (req, res) => {
  try {
    const { batch_year, program_id, department_id, semester } = req.query;
    const where = {};
    if (batch_year) where.batch_year = batch_year;
    if (program_id) where.program_id = program_id;
    if (semester) where.current_semester = semester;

    if (department_id) {
      const programs = await academicLookupService.listPrograms({
        where: { department_id },
        attributes: ["id"],
      });
      const programIds = programs.map((program) => program.id);
      if (programIds.length === 0) {
        return res.json({ success: true, data: [] });
      }
      where.program_id = { [Op.in]: programIds };
    }

    const sections = await sequelize.models.StudentProfile.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("section")), "section"],
      ],
      where,
      order: [["section", "ASC"]],
      raw: true,
    });

    const sectionList = sections
      .map((s) => s.section)
      .filter((s) => s && s.trim() !== "")
      .sort();

    res.json({ success: true, data: sectionList });
  } catch (error) {
    logger.error("Error fetching sections:", error);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
};

// @desc    export default ers to CSV
export const exportDefaulters = async (req, res) => {
  try {
    const {
      batch_year,
      program_id,
      department_id,
      section,
      semester,
      min_due = 0,
      days_overdue,
    } = req.query;

    const studentProfileWhere = {};
    if (batch_year) studentProfileWhere.batch_year = batch_year;
    if (program_id) studentProfileWhere.program_id = program_id;
    if (section) studentProfileWhere.section = section;
    if (semester) studentProfileWhere.current_semester = semester;

    if (department_id) {
      const programs = await academicLookupService.listPrograms({
        where: { department_id },
        attributes: ["id"],
      });
      const programIds = programs.map((program) => program.id);
      if (programIds.length === 0) {
        return res.status(200).send("Student ID,Name,Department,Program,Semester,Section,Total Payable,Total Paid,Net Due,Days Overdue,Mobile,Parent Mobile\n");
      }
      studentProfileWhere.program_id = { [Op.in]: programIds };
    }

    // Fetch All Match (No Pagination)
    const [students, structures, payments, waivers, configs] =
      await Promise.all([
        CoreService.findAll({
          where: { role: "student", is_active: true },
          includeProfiles: ["student"],
          include: [
            {
              model: sequelize.models.StudentProfile,
              as: "student_profile",
              required: true,
              where: studentProfileWhere,
            },
          ],
          attributes: [
            "id",
            "first_name",
            "last_name",
            "student_id",
            "email",
            "phone",
            "parent_details",
            "batch_year",
            "program_id",
            "section",
            "is_hosteller",
            "requires_transport",
            "current_semester",
          ],
          order: [["student_id", "ASC"]],
        }),
        FeeStructure.findAll({
          where: { is_active: true },
          include: [{ model: FeeCategory, as: "category" }],
        }),
        FeePayment.findAll({ where: { status: "completed" } }),
        FeeWaiver.findAll({ where: { is_approved: true, is_active: true } }),
        FeeSemesterConfig.findAll(),
      ]);

    await hydrateStudentsWithAcademics(students, {
      programAttributes: ["name"],
      departmentAttributes: ["name"],
    });

    const paymentMap = {};
    payments.forEach((p) => {
      if (!paymentMap[p.student_id]) paymentMap[p.student_id] = [];
      paymentMap[p.student_id].push(p);
    });

    const waiverMap = {};
    waivers.forEach((w) => {
      if (!waiverMap[w.student_id]) waiverMap[w.student_id] = [];
      waiverMap[w.student_id].push(w);
    });

    const configMap = {};
    configs.forEach((c) => {
      configMap[`${c.program_id}_${c.batch_year}_${c.semester}`] = c;
    });

    let csvContent =
      "Student ID,Name,Department,Program,Semester,Section,Total Payable,Total Paid,Net Due,Days Overdue,Mobile,Parent Mobile\n";
    const today = new Date();

    for (const student of students) {
      const applicableStructures = structures.filter(
        (s) =>
          s.program_id === student.program_id &&
          s.batch_year === student.batch_year &&
          (semester ? s.semester === parseInt(semester) : true) &&
          javascript(
            s.applies_to === "all" ||
            (s.applies_to === "convener" &&
              student.admission_type === "convener") ||
            (s.applies_to === "management" &&
              student.admission_type === "management"),
          ),
      );

      if (applicableStructures.length === 0) continue;

      let totalPayable = 0;
      let totalPaid = 0;
      let totalWaiver = 0;
      let studentTotalDue = 0;

      // Group by Category
      const catTotals = {};
      applicableStructures.forEach((s) => {
        if (!catTotals[s.category_id])
          catTotals[s.category_id] = { payable: 0, paid: 0 };
        const sPayments = (paymentMap[student.id] || []).filter(
          (p) => p.fee_structure_id === s.id,
        );
        const sPaid = sPayments.reduce(
          (sum, p) => sum + parseFloat(p.amount_paid),
          0,
        );
        catTotals[s.category_id].payable += parseFloat(s.amount);
        catTotals[s.category_id].paid += sPaid;
      });

      for (const catId in catTotals) {
        const cat = catTotals[catId];
        const catWaivers = (waiverMap[student.id] || []).filter(
          (w) => w.fee_category_id === catId,
        );
        const totalCatWaiver = catWaivers.reduce(
          (sum, w) => sum + parseFloat(w.amount),
          0,
        );
        const netPayable = Math.max(0, cat.payable - totalCatWaiver);
        const due = Math.max(0, netPayable - cat.paid);
        studentTotalDue += due;
        totalPayable += cat.payable;
        totalPaid += cat.paid;
      }

      let maxOverdueDays = 0;
      if (studentTotalDue > 0) {
        const relevantSemesters = [
          ...new Set(applicableStructures.map((s) => s.semester)),
        ];
        relevantSemesters.forEach((sem) => {
          const config =
            configMap[`${student.program_id}_${student.batch_year}_${sem}`];
          if (config && config.due_date) {
            const dueDate = new Date(config.due_date);
            if (today > dueDate) {
              const diffTime = Math.abs(today - dueDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > maxOverdueDays) maxOverdueDays = diffDays;
            }
          }
        });
      }

      if (Math.round(studentTotalDue) > 0 && studentTotalDue >= min_due) {
        if (days_overdue && maxOverdueDays < days_overdue) continue;

        const row = [
          student.student_id,
          `"${student.first_name} ${student.last_name}"`,
          `"${student.department?.name || ""}"`,
          `"${student.program?.name || ""}"`,
          student.current_semester,
          student.section || "",
          totalPayable.toFixed(2),
          totalPaid.toFixed(2),
          studentTotalDue.toFixed(2),
          maxOverdueDays,
          student.phone || "",
          student.parent_details?.father_mobile ||
          student.parent_details?.mother_mobile ||
          "",
        ].join(",");
        csvContent += row + "\n";
      }
    }

    res.header("Content-Type", "text/csv");
    res.header(
      "Content-Disposition",
      `attachment; filename="defaulters_export_${Date.now()}.csv"`,
    );
    res.send(csvContent);
  } catch (error) {
    logger.error("Error exporting defaulters:", error);
    res.status(500).json({ error: "Failed to export default ers" });
  }
  res.status(500).json({ error: "Failed to export default ers" });
};

export const addStudentFine = async (req, res) => {
  try {
    const { student_id, category_id, amount, semester, remarks } = req.body;

    const student = await CoreService.findByPk(student_id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const charge = await StudentFeeCharge.create({
      student_id,
      category_id,
      charge_type: "fine", // or other if needed
      amount,
      description: remarks || "Individual Fine Imposed",
      semester: semester || student.current_semester || 1,
      is_paid: false,
      created_by: req.user.userId || req.user.id,
    });

    res.status(201).json({ success: true, data: charge });
  } catch (error) {
    logger.error("Error imposing fine:", error);
    res.status(500).json({ error: "Failed to impose fine" });
  }
};

export const deleteStudentFine = async (req, res) => {
  try {
    const { id } = req.params;
    const charge = await StudentFeeCharge.findByPk(id);

    if (!charge) {
      return res.status(404).json({ error: "Fine record not found" });
    }

    if (charge.is_paid) {
      return res.status(400).json({ error: "Cannot delete a paid fine" });
    }

    // Check partial payments (if any exist in StudentChargePayment)
    const payments = await StudentChargePayment.count({
      where: { student_fee_charge_id: id },
    });

    if (payments > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete fine with partial payments" });
    }

    await charge.destroy();
    res.json({ success: true, message: "Fine removed successfully" });
  } catch (error) {
    logger.error("Error deleting fine:", error);
    res.status(500).json({ error: "Failed to remove fine" });
  }
};

// @desc    Get Daily Collection Report (with Audit Reconciliation)
export const getDailyCollection = async (req, res) => {
  try {
    const {
      date,
      startDate,
      endDate,
      department_id,
      program_id,
      batch_year,
      payment_type = "all",
    } = req.query;

    let dateRange = null;
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateRange = [start, end];
    } else if (date) {
      const targetDate = new Date(date);
      const start = new Date(targetDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(targetDate);
      end.setHours(23, 59, 59, 999);
      dateRange = [start, end];
    }

    const where = { status: "completed" };
    if (dateRange) {
      where.payment_date = { [Op.between]: dateRange };
    }

    // Filter by External (Cash/Bank) vs Internal (Wallet)
    if (payment_type === "external") {
      where.payment_method = { [Op.not]: "WALLET" };
    } else if (payment_type === "internal") {
      where.payment_method = "WALLET";
    }

    const studentProfileWhere = {};
    if (program_id) studentProfileWhere.program_id = program_id;
    if (batch_year) studentProfileWhere.batch_year = batch_year;

    if (department_id) {
      const programs = await academicLookupService.listPrograms({
        where: { department_id },
        attributes: ["id"],
      });
      const programIds = programs.map((program) => program.id);
      if (programIds.length === 0) {
        return res.json({ success: true, data: [] });
      }
      studentProfileWhere.program_id = { [Op.in]: programIds };
    }

    let allowedStudentIds = null;
    if (Object.keys(studentProfileWhere).length > 0) {
      const matchedStudents = await sequelize.models.StudentProfile.findAll({
        where: studentProfileWhere,
        attributes: ["user_id"],
        raw: true,
      });
      allowedStudentIds = matchedStudents.map((s) => s.user_id);

      if (allowedStudentIds.length === 0) {
        // No students match the criteria, so no payments to return
        return res.json({ success: true, data: [] });
      } else {
        where.student_id = { [Op.in]: allowedStudentIds };
      }
    }

    const payments = await FeePayment.findAll({
      where,
      include: [
        {
          model: AcademicFeePayment,
          as: "academic_fee_payments",
          include: [
            {
              model: FeeStructure,
              as: "structure",
              include: [{ model: FeeCategory, as: "category" }],
            },
          ],
        },
        {
          model: StudentChargePayment,
          as: "student_charge_payments",
          include: [
            {
              model: StudentFeeCharge,
              as: "charge",
              include: [{ model: FeeCategory, as: "category" }],
            },
          ],
        },
      ],
      order: [["payment_date", "ASC"]],
    });

    const studentIds = [...new Set(payments.map(p => p.student_id))];
    const userMap = await CoreService.getUserMapByIds(studentIds, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "student_id",
        "email",
        "batch_year",
        "program_id",
        "department_id",
      ],
    });

    payments.forEach(payment => {
      const studentData = userMap.get(payment.student_id);
      if (studentData) {
        payment.setDataValue("student", studentData);
      }
    });

    const studentsToHydrate = payments.map((p) => p.getDataValue("student")).filter(Boolean);
    await hydrateStudentsWithAcademics(studentsToHydrate, { programAttributes: ["name"], departmentAttributes: ["name"] });

    const summary = {
      total_collected: 0,
      total_external: 0,
      total_internal: 0,
      cash: 0,
      online: 0,
      cheque: 0,
      bank_transfer: 0,
      wallet: 0,
      transaction_count: payments.length,
    };

    payments.forEach((p) => {
      const amount = parseFloat(p.amount_paid);
      summary.total_collected += amount;

      if (p.payment_method === "WALLET") {
        summary.wallet += amount;
        summary.total_internal += amount;
      } else {
        summary.total_external += amount;
        if (p.payment_method === "cash") summary.cash += amount;
        else if (p.payment_method === "cheque") summary.cheque += amount;
        else if (p.payment_method === "bank_transfer")
          summary.bank_transfer += amount;
        else summary.online += amount;
      }
    });

    res.json({
      success: true,
      data: {
        summary,
        transactions: payments,
      },
    });
  } catch (error) {
    logger.error("Error fetching daily report:", error);
    res.status(500).json({ error: "Failed to fetch daily report" });
  }
};

export default {
  createCategory,
  getCategories,
  getStructures,
  cloneFeeStructure,
  createStructure,
  updateStructure,
  deleteStructure,
  collectPayment,
  payMyFees,
  getMyFeeStatus,
  getStudentFeeStatus,
  getSemesterConfigs,
  createPaymentOrder,
  updateSemesterConfig,
  getCollectionStats,
  getTransactions,
  getBatches,
  applyWaiver,
  getWaivers,
  approveWaiver,
  updateWaiver,
  deleteWaiver,
  validateScholarshipImport,
  finalizeScholarshipImport,
  getDefaulters,
  sendBulkReminders,
  getSections,
  exportDefaulters,
  addStudentFine,
  deleteStudentFine,
  getDailyCollection,
};
