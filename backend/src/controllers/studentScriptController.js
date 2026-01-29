const {
  ExamCycle,
  ExamSchedule,
  ExamScript,
  User,
  Course,
  StudentFeeCharge,
  FeeCategory,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

// @desc    Get student's available scripts
// @route   GET /api/exam/my-scripts
// @access  Private/Student
const getMyScripts = async (req, res) => {
  try {
    const student_id = req.user.userId;

    const scripts = await ExamScript.findAll({
      where: {
        student_id,
        is_visible: true,
      },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "name", "code"],
            },
            {
              model: ExamCycle,
              as: "cycle",
              attributes: ["id", "name", "exam_type", "script_view_fee"],
            },
          ],
        },
      ],
      order: [["schedule", "exam_date", "DESC"]],
    });

    // Add access status to each script (Simplified: no payment wall)
    const scriptsWithAccess = scripts.map((script) => ({
      ...script.toJSON(),
      can_access: true,
      requires_payment: false,
      fee_amount: 0,
    }));

    res.json({
      scripts: scriptsWithAccess,
    });
  } catch (error) {
    console.error("Error fetching student scripts:", error);
    res.status(500).json({
      message: "Server error while fetching scripts",
      error: error.message,
    });
  }
};

// @desc    View/download a specific script
// @route   GET /api/exam/scripts/:id/view
// @access  Private/Student
const viewScript = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.userId;

    const script = await ExamScript.findOne({
      where: { id, student_id },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          include: [
            {
              model: ExamCycle,
              as: "cycle",
              attributes: ["id", "script_view_fee"],
            },
          ],
        },
      ],
    });

    if (!script) {
      return res.status(404).json({ message: "Script not found" });
    }

    // Check visibility
    if (!script.is_visible) {
      return res.status(403).json({
        message: "This script is not available for viewing yet",
      });
    }

    // Check payment if fee is required (REMOVED: Access is now free if visible)
    /*
    if (script.schedule.cycle.script_view_fee > 0) {
      const payment = await StudentFeeCharge.findOne({
        where: {
          student_id,
          charge_type: "exam_script_view",
          reference_id: script.schedule.cycle.id,
          is_paid: true,
        },
      });

      if (!payment) {
        return res.status(402).json({
          message: "Payment required to view scripts",
          fee_amount: script.schedule.cycle.script_view_fee,
          cycle_id: script.schedule.cycle.id,
        });
      }
    }
    */

    // Get file path
    const filePath = path.join(__dirname, "../../uploads", script.file_path);

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Script file not found on server" });
    }

    // Update view count
    await script.increment("view_count");
    await script.update({ last_viewed_at: new Date() });

    // Stream the file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.basename(script.file_path)}"`,
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error viewing script:", error);
    res.status(500).json({
      message: "Server error while viewing script",
      error: error.message,
    });
  }
};

// @desc    Pay for script view access
// @route   POST /api/exam/scripts/pay-access
// @access  Private/Student
const payScriptViewAccess = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const student_id = req.user.userId;
    const { exam_cycle_id } = req.body;

    if (!exam_cycle_id) {
      return res.status(400).json({ message: "Exam cycle ID is required" });
    }

    const cycle = await ExamCycle.findByPk(exam_cycle_id, { transaction });

    if (!cycle) {
      await transaction.rollback();
      return res.status(404).json({ message: "Exam cycle not found" });
    }

    if (cycle.script_view_fee === 0) {
      await transaction.rollback();
      return res.json({ message: "No fee required for this exam cycle" });
    }

    // Check if already paid
    const existing = await StudentFeeCharge.findOne({
      where: {
        student_id,
        charge_type: "exam_script_view",
        reference_id: exam_cycle_id,
      },
      transaction,
    });

    if (existing) {
      await transaction.rollback();
      return res.status(400).json({
        message: existing.is_paid
          ? "Script view access already purchased"
          : "Payment already initiated",
        charge: existing,
      });
    }

    // Get or create fee category
    let feeCategory = await FeeCategory.findOne({
      where: { name: "Exam Script View" },
      transaction,
    });

    if (!feeCategory) {
      feeCategory = await FeeCategory.create(
        {
          name: "Exam Script View",
          description: "Fee for viewing exam answer scripts",
          type: "academic",
        },
        { transaction },
      );
    }

    const student = await User.findByPk(student_id, {
      attributes: ["current_semester"],
      transaction,
    });

    // Create fee charge
    const feeCharge = await StudentFeeCharge.create(
      {
        student_id,
        category_id: feeCategory.id,
        charge_type: "exam_script_view",
        amount: cycle.script_view_fee,
        description: `Script view access for ${cycle.name}`,
        reference_id: exam_cycle_id,
        reference_type: "exam_cycle",
        semester: student.current_semester || 1,
        is_paid: false,
        created_by: student_id,
      },
      { transaction },
    );

    await transaction.commit();

    res.status(201).json({
      message: "Script view payment initiated",
      feeCharge: {
        id: feeCharge.id,
        amount: feeCharge.amount,
        description: feeCharge.description,
        is_paid: feeCharge.is_paid,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating script view payment:", error);
    res.status(500).json({
      message: "Server error while processing payment",
      error: error.message,
    });
  }
};

module.exports = {
  getMyScripts,
  viewScript,
  payScriptViewAccess,
};
