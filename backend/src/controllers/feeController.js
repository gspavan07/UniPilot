const {
  FeeCategory,
  FeeStructure,
  FeePayment,
  FeeWaiver,
  FeeSemesterConfig,
  User,
  Program,
  sequelize,
} = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

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
    const structure = await FeeStructure.create(req.body);
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
  try {
    const { student_id, payments, payment_method, transaction_id, remarks } =
      req.body;

    if (!payments || !Array.isArray(payments)) {
      return res.status(400).json({ error: "Payments array is required" });
    }

    const receipt_url = `REC-${Date.now()}-${student_id.substring(0, 4)}`;

    const createdPayments = [];
    for (const p of payments) {
      const payment = await FeePayment.create(
        {
          student_id,
          fee_structure_id: p.type === "fine" ? null : p.structure_id,
          semester: p.type === "fine" ? p.semester : null,
          amount_paid: p.amount,
          payment_method,
          transaction_id,
          receipt_url,
          remarks:
            p.type === "fine"
              ? `Late Fine for Semester ${p.semester}`
              : remarks,
          status: "completed",
        },
        { transaction }
      );
      createdPayments.push(payment);
    }

    await transaction.commit();
    res.status(201).json({ success: true, data: createdPayments });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error collecting payment:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
};

// @desc    Get student's fee details
exports.getMyFeeStatus = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;

    const student = await User.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { program_id, batch_year, is_hosteller, requires_transport } =
      student;
    const effectiveBatchYear = batch_year || 2023;

    const [structures, payments, semesterConfigs] = await Promise.all([
      FeeStructure.findAll({
        where: { program_id, batch_year: effectiveBatchYear, is_active: true },
        include: [{ model: FeeCategory, as: "category" }],
        order: [["semester", "ASC"]],
      }),
      FeePayment.findAll({
        where: { student_id: studentId, status: "completed" },
      }),
      FeeSemesterConfig.findAll({
        where: { program_id, batch_year: effectiveBatchYear },
      }),
    ]);

    const configMap = {};
    semesterConfigs.forEach((c) => (configMap[c.semester] = c));

    const semesterWise = {};
    const grandTotals = { payable: 0, paid: 0, due: 0 };
    const today = new Date();

    for (let i = 1; i <= 8; i++) {
      // Calculate paid fines for this semester
      const paidFines = payments
        .filter((p) => !p.fee_structure_id && p.semester === i)
        .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

      semesterWise[i] = {
        fees: [],
        totals: { payable: 0, paid: 0, due: 0 },
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

      const structPayments = payments.filter(
        (p) => p.fee_structure_id === s.id
      );
      const paid = structPayments.reduce(
        (sum, p) => sum + parseFloat(p.amount_paid),
        0
      );
      const payable = parseFloat(s.amount);
      const due = Math.max(0, payable - paid);

      semesterWise[s.semester].fees.push({
        id: s.id,
        category: s.category?.name || "Other",
        payable,
        paid,
        due,
        receipts: structPayments.map((p) => ({
          number: p.transaction_id,
          date: p.payment_date,
        })),
      });

      semesterWise[s.semester].totals.payable += payable;
      semesterWise[s.semester].totals.paid += paid;
      semesterWise[s.semester].totals.due += due;
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
            totalFine =
              (data.totals.due * parseFloat(config.fine_amount)) / 100;
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

    res.json({
      success: true,
      data: {
        semesterWise,
        grandTotals,
        studentInfo: {
          batch_year: effectiveBatchYear,
          is_hosteller,
          requires_transport,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching my fee status:", error);
    res.status(500).json({ error: "Failed to fetch fee status" });
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
