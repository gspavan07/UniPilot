const {
  FeeCategory,
  FeeStructure,
  FeePayment,
  FeeWaiver,
  FeeSemesterConfig,
  StudentFeeCharge,
  User,
  Program,
  Department,
  sequelize,
} = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

// Template import
const generateDefaultersCsv = require("../templates/fee/defaultersCsv");

// @desc    Create a fee category
exports.createCategory = async (req, res) => {
  try {
    const category = await FeeCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    logger.error("Error creating fee category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// @desc    Get all fee categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await FeeCategory.findAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    logger.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// @desc    Get all fee structures
exports.getStructures = async (req, res) => {
  try {
    const { batch_year, program_id } = req.query;
    const where = {};
    if (batch_year) where.batch_year = batch_year;
    if (program_id) where.program_id = program_id;

    const structures = await FeeStructure.findAll({
      where,
      include: [
        { model: FeeCategory, as: "category" },
        { model: Program, as: "program" },
      ],
      order: [["semester", "ASC"]],
    });
    res.status(200).json({ success: true, data: structures });
  } catch (error) {
    logger.error("Error fetching structures:", error);
    res.status(500).json({ error: "Failed to fetch structures" });
  }
};

// @desc    Clone a fee structure from one batch to another
exports.cloneFeeStructure = async (req, res) => {
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
exports.createStructure = async (req, res) => {
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
exports.updateStructure = async (req, res) => {
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
exports.deleteStructure = async (req, res) => {
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
exports.collectPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  let createdPayments = [];
  try {
    const {
      student_id,
      payments,
      payment_method,
      transaction_id,
      remarks,
      payment_date,
    } = req.body;

    if (!payments || !Array.isArray(payments)) {
      return res.status(400).json({ error: "Payments array is required" });
    }

    const receipt_url = `REC-${Date.now()}-${student_id.substring(0, 4)}`;

    const status = await calculateFeeStatus(student_id);
    let walletCredit = status.grandTotals.excessBalance || 0;

    createdPayments = [];
    for (let i = 0; i < payments.length; i++) {
      const p = payments[i];
      let amountRemaining = p.amount;

      // Robust Type Detection: Check if ID exists in FeeStructure if type is ambiguous
      let resolvedType = p.type;
      let targetStructureId = p.structure_id;

      // If assumed structure but ID might be charge
      if (
        (!resolvedType || resolvedType === "structure") &&
        targetStructureId &&
        !targetStructureId.toString().startsWith("fine")
      ) {
        // Optimization: If calculateFeeStatus ran, we might check there, but a DB check is safer against stale data
        const structExists = await FeeStructure.count({
          where: { id: targetStructureId },
        });
        if (!structExists) {
          resolvedType = "charge";
        } else {
          resolvedType = "structure";
        }
      } else if (
        p.type === "fine" ||
        (p.structure_id && p.structure_id.toString().startsWith("fine"))
      ) {
        resolvedType = "fine";
        targetStructureId = null; // Fines (ad-hoc) don't link to structure table usually, or use semester
      }

      // 1. Consume Wallet Credit first
      if (walletCredit > 0) {
        const canDeduct = Math.min(walletCredit, amountRemaining);
        if (canDeduct > 0) {
          const wPayment = await FeePayment.create(
            {
              student_id,
              fee_structure_id:
                resolvedType === "structure" ? targetStructureId : null,
              fee_charge_id:
                resolvedType === "charge" ? targetStructureId : null,
              semester:
                p.semester || (resolvedType === "fine" ? p.semester : null),
              amount_paid: canDeduct,
              payment_method: "WALLET",
              transaction_id: `WAL-${Date.now()}-${i}`,
              receipt_url,
              payment_date: payment_date || new Date(),
              remarks: `Paid from Wallet: ${resolvedType === "fine" ? "Fine" : "Fee"}`,
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
              resolvedType === "structure" ? targetStructureId : null,
            fee_charge_id: resolvedType === "charge" ? targetStructureId : null,
            semester:
              p.semester || (resolvedType === "fine" ? p.semester : null),
            amount_paid: amountRemaining,
            payment_method: payment_method || "cash",
            transaction_id,
            receipt_url,
            payment_date: payment_date || new Date(),
            remarks:
              resolvedType === "fine"
                ? `Late Fine for Semester ${p.semester}`
                : remarks,
            status: "completed",
          },
          { transaction },
        );
        createdPayments.push(payment);
      }
    }

    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error("Error collecting payment:", error);
    return res.status(500).json({ error: "Failed to process payment" });
  }

  // Hydration logic (separate from transaction)
  try {
    const hydratedPayments = await FeePayment.findAll({
      where: { id: createdPayments.map((p) => p.id) },
      include: [
        {
          model: User,
          as: "student",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "student_id",
            "program_id",
            "department_id",
            "batch_year",
          ],
          include: [
            { model: Department, as: "department", attributes: ["name"] },
            { model: Program, as: "program", attributes: ["name"] },
          ],
        },
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
      ],
    });
    return res.status(201).json({ success: true, data: hydratedPayments });
  } catch (hydrationError) {
    logger.warn("Hydration failed after payment commit:", hydrationError);
    // Fallback to unhydrated data so the user doesn't see an error
    return res.status(201).json({ success: true, data: createdPayments });
  }
};

// @desc    Pay my own fees (Student)
exports.payMyFees = async (req, res) => {
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
              p.type === "charge" || p.type === "fine" ? p.structure_id : null,
            semester: p.semester || (p.type === "fine" ? p.semester : null),
            amount_paid: amountRemaining,
            payment_method: payment_method || "online", // Default to online for students
            transaction_id: transaction_id || `TXN-${Date.now()}`,
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
        {
          model: User,
          as: "student",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "student_id",
            "program_id",
            "department_id",
            "batch_year",
          ],
          include: [
            { model: Department, as: "department", attributes: ["name"] },
            { model: Program, as: "program", attributes: ["name"] },
          ],
        },
        {
          model: FeeStructure,
          as: "fee_structure",
          include: [{ model: FeeCategory, as: "category" }],
        },
      ],
    });
    return res.status(201).json({ success: true, data: hydratedPayments });
  } catch (hydrationError) {
    logger.warn("Hydration failed after payment commit:", hydrationError);
    // Fallback to unhydrated data
    return res.status(201).json({ success: true, data: createdPayments });
  }
};

exports.calculateFeeStatus = calculateFeeStatus = async (studentId) => {
  const student = await User.findByPk(studentId, {
    include: [
      { model: Program, as: "program" },
      { model: Department, as: "department" },
    ],
  });
  if (!student) {
    throw new Error("Student not found");
  }

  const { program_id, batch_year, is_hosteller, requires_transport } = student;
  const effectiveBatchYear = batch_year || new Date().getFullYear();

  const [structures, payments, semesterConfigs, waivers, individualCharges] =
    await Promise.all([
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
    ]);

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
    const paidFines = payments
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
    if (s.is_optional) {
      if (s.applies_to === "hostellers" && !is_hosteller) return;
      if (s.applies_to === "day_scholars" && !requires_transport) return;
    }

    const structPayments = payments.filter((p) => p.fee_structure_id === s.id);
    const paid = structPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount_paid),
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
        number: p.transaction_id,
        date: p.payment_date,
        amount: p.amount_paid,
        method: p.payment_method,
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
    const chargePayments = payments.filter((p) => p.fee_charge_id === c.id);
    const paid = chargePayments.reduce(
      (sum, p) => sum + parseFloat(p.amount_paid),
      0,
    );
    const payable = parseFloat(c.amount);
    const due = Math.max(0, payable - paid);
    const excess = Math.max(0, paid - payable);

    const sem = c.semester || 1;
    if (!semesterWise[sem]) {
      // Ensure semester exists if it's outside 1-8
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
        number: p.transaction_id,
        date: p.payment_date,
        amount: p.amount_paid,
        method: p.payment_method,
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
  const totalWalletUsage = payments
    .filter((p) => p.payment_method === "WALLET")
    .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

  grandTotals.excessBalance = Math.max(
    0,
    grandTotals.excessBalance - totalWalletUsage,
  );

  return {
    semesterWise,
    grandTotals,
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
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      admission_number: student.admission_number,
      student_id: student.student_id,
      program: student.program ? { name: student.program.name } : null,
      department: student.department ? { name: student.department.name } : null,
    },
  };
};

// @desc    Get student's fee details (Self)
exports.getMyFeeStatus = async (req, res) => {
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
exports.getStudentFeeStatus = async (req, res) => {
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
exports.getSemesterConfigs = async (req, res) => {
  try {
    const { program_id, batch_year } = req.query;
    const configs = await FeeSemesterConfig.findAll({
      where: { program_id, batch_year },
    });
    res.json({ success: true, data: configs });
  } catch (err) {
    logger.error("Error fetching semester configs", err);
    res.status(500).json({ success: false, message: "Error fetching configs" });
  }
};

// @desc    Update or create semester config
exports.updateSemesterConfig = async (req, res) => {
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
exports.getCollectionStats = async (req, res) => {
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

    // Program-wise collection (Joined via student to include all payment types)
    const programWise = await FeePayment.findAll({
      attributes: [
        [sequelize.col("student->program.name"), "program_name"],
        [sequelize.fn("SUM", sequelize.col("amount_paid")), "total"],
      ],
      include: [
        {
          model: User,
          as: "student",
          attributes: [],
          include: [
            {
              model: Program,
              as: "program",
              attributes: [],
            },
          ],
        },
      ],
      where: { status: "completed" },
      group: [sequelize.col("student->program.name")],
    });

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
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const where = { status: "completed" };
    if (search) {
      where[Op.or] = [
        { transaction_id: { [Op.iLike]: `%${search}%` } },
        { "$student.first_name$": { [Op.iLike]: `%${search}%` } },
        { "$student.last_name$": { [Op.iLike]: `%${search}%` } },
        { "$student.admission_number$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await FeePayment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "admission_number",
            "student_id",
            "program_id",
            "department_id",
          ],
          include: [
            { model: Department, as: "department", attributes: ["name"] },
            { model: Program, as: "program", attributes: ["name"] },
          ],
        },
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
      ],
      order: [["payment_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        transactions: rows,
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
exports.getBatches = async (req, res) => {
  try {
    // Get unique batches from FeeStructure
    const structureBatches = await FeeStructure.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("batch_year")), "batch_year"],
      ],
      raw: true,
    });

    // Get unique batches from Students (Users)
    const studentBatches = await User.findAll({
      where: { role: "student" },
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
    const currentYear = new Date().getFullYear();
    combined.push(currentYear);

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
exports.applyWaiver = async (req, res) => {
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
exports.getWaivers = async (req, res) => {
  try {
    const { student_id, is_approved } = req.query;
    const where = {};
    if (student_id) where.student_id = student_id;
    if (is_approved !== undefined) where.is_approved = is_approved === "true";

    const waivers = await FeeWaiver.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id"],
        },
        { model: FeeCategory, as: "category" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ success: true, data: waivers });
  } catch (error) {
    logger.error("Error fetching waivers:", error);
    res.status(500).json({ error: "Failed to fetch waivers" });
  }
};

// @desc    Approve a pending waiver
exports.approveWaiver = async (req, res) => {
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
exports.updateWaiver = async (req, res) => {
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
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id"],
        },
        { model: FeeCategory, as: "category" },
      ],
    });

    res.status(200).json({ success: true, data: waiver });
  } catch (error) {
    logger.error("Error updating scholarship:", error);
    res.status(500).json({ error: "Failed to update scholarship" });
  }
};

// @desc    Delete a waiver record
exports.deleteWaiver = async (req, res) => {
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
exports.validateScholarshipImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const XLSX = require("xlsx");
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
    const [students, categories] = await Promise.all([
      User.findAll({
        where: {
          [Op.or]: [
            { admission_number: { [Op.in]: identifiers } },
            { student_id: { [Op.in]: identifiers } },
          ],
        },
        attributes: [
          "id",
          "admission_number",
          "student_id",
          "first_name",
          "last_name",
        ],
      }),
      FeeCategory.findAll({
        where: { name: { [Op.in]: categoryNames } },
      }),
    ]);

    const studentMap = {};
    students.forEach((s) => {
      if (s.admission_number) studentMap[s.admission_number] = s;
      if (s.student_id) studentMap[s.student_id] = s;
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
exports.finalizeScholarshipImport = async (req, res) => {
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
exports.getDefaulters = async (req, res) => {
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

    const studentWhere = { is_active: true };
    if (batch_year) studentWhere.batch_year = batch_year;
    if (program_id) studentWhere.program_id = program_id;
    if (department_id) studentWhere.department_id = department_id;
    if (section) studentWhere.section = section;

    // Bulk Fetch
    const [students, structures, payments, waivers, configs] =
      await Promise.all([
        User.findAll({
          where: studentWhere,
          include: [
            { model: Program, as: "program" },
            { model: Department, as: "department" },
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
            "department_id",
            "section",
            "is_hosteller",
            "requires_transport",
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

    const defaulters = [];
    const today = new Date();

    for (const student of students) {
      const applicableStructures = structures.filter(
        (s) =>
          s.program_id === student.program_id &&
          s.batch_year === student.batch_year &&
          (semester ? s.semester === parseInt(semester) : true) &&
          (s.applies_to === "all" ||
            (s.applies_to === "hostellers" && student.is_hosteller) ||
            (s.applies_to === "day_scholars" && student.requires_transport)),
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
exports.sendBulkReminders = async (req, res) => {
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
exports.getSections = async (req, res) => {
  try {
    const { batch_year, program_id, department_id, semester } = req.query;
    const where = {};
    if (batch_year) where.batch_year = batch_year;
    if (program_id) where.program_id = program_id;
    if (department_id) where.department_id = department_id;
    if (semester) where.current_semester = semester;

    where.is_active = true;

    const sections = await User.findAll({
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

// @desc    Export defaulters to CSV
exports.exportDefaulters = async (req, res) => {
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

    const studentWhere = { is_active: true };
    if (batch_year) studentWhere.batch_year = batch_year;
    if (program_id) studentWhere.program_id = program_id;
    if (department_id) studentWhere.department_id = department_id;
    if (section) studentWhere.section = section;
    if (semester) studentWhere.current_semester = semester;

    // Fetch All Match (No Pagination)
    const [students, structures, payments, waivers, configs] =
      await Promise.all([
        User.findAll({
          where: studentWhere,
          include: [
            { model: Program, as: "program" },
            { model: Department, as: "department" },
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
            "department_id",
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
          (s.applies_to === "all" ||
            (s.applies_to === "hostellers" && student.is_hosteller) ||
            (s.applies_to === "day_scholars" && student.requires_transport)),
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
    res.status(500).json({ error: "Failed to export defaulters" });
  }
  res.status(500).json({ error: "Failed to export defaulters" });
};

exports.addStudentFine = async (req, res) => {
  try {
    const { student_id, category_id, amount, semester, remarks } = req.body;

    const student = await User.findByPk(student_id);
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

// @desc    Get Daily Collection Report (with Audit Reconciliation)
exports.getDailyCollection = async (req, res) => {
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

    const studentWhere = {};
    if (department_id) studentWhere.department_id = department_id;
    if (program_id) studentWhere.program_id = program_id;
    if (batch_year) studentWhere.batch_year = batch_year;

    const payments = await FeePayment.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          where:
            Object.keys(studentWhere).length > 0 ? studentWhere : undefined,
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
          include: [
            { model: Department, as: "department", attributes: ["name"] },
            { model: Program, as: "program", attributes: ["name"] },
          ],
        },
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
      ],
      order: [["payment_date", "ASC"]],
    });

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
