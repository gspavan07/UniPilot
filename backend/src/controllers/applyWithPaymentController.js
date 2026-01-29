const {
  ExamCycle,
  ExamSchedule,
  ExamMark,
  ExamReverification,
  User,
  Course,
  StudentFeeCharge,
  FeeCategory,
  FeePayment,
  Program,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

// @desc    Apply for reverification with immediate payment
// @route   POST /api/exam/reverification/apply-with-payment
// @access  Private/Student
const applyWithPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const student_id = req.user.userId;
    const { exam_schedule_ids, reason, payment_method } = req.body;

    if (!exam_schedule_ids || exam_schedule_ids.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Please select at least one subject for reverification",
      });
    }

    if (!payment_method) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Payment method is required",
      });
    }

    // Verify all schedules belong to the same cycle
    const schedules = await ExamSchedule.findAll({
      where: { id: exam_schedule_ids },
      include: [
        {
          model: ExamCycle,
          as: "cycle",
          attributes: [
            "id",
            "reverification_fee_per_paper",
            "is_reverification_open",
          ],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "name", "code"],
        },
      ],
      transaction,
    });

    if (schedules.length !== exam_schedule_ids.length) {
      await transaction.rollback();
      return res.status(404).json({ message: "Some exam schedules not found" });
    }

    const cycle = schedules[0].cycle;

    // Verify reverification is open
    if (!cycle.is_reverification_open) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Reverification is not open for this exam cycle",
      });
    }

    // Get or create fee category for reverification
    let feeCategory = await FeeCategory.findOne({
      where: { name: "Exam Reverification" },
      transaction,
    });

    if (!feeCategory) {
      feeCategory = await FeeCategory.create(
        {
          name: "Exam Reverification",
          description: "Fee for exam answer script reverification",
          type: "academic",
        },
        { transaction },
      );
    }

    // Calculate total fee
    const totalFee =
      cycle.reverification_fee_per_paper * exam_schedule_ids.length;

    // Get student details
    const student = await User.findByPk(student_id, {
      attributes: ["current_semester"],
      transaction,
    });

    // Create fee charge AND mark as paid immediately
    const feeCharge = await StudentFeeCharge.create(
      {
        student_id,
        category_id: feeCategory.id,
        charge_type: "exam_reverification",
        amount: totalFee,
        description: `Reverification fee for ${exam_schedule_ids.length} subject(s)`,
        semester: student.current_semester || 1,
        is_paid: true,
        paid_at: new Date(),
        payment_method: payment_method,
        created_by: student_id,
      },
      { transaction },
    );

    // Create payment record
    await FeePayment.create(
      {
        student_id,
        charge_id: feeCharge.id,
        amount: totalFee,
        amount_paid: totalFee,
        payment_method: payment_method,
        payment_date: new Date(),
        transaction_id: `REV-${Date.now()}`,
        description: `Reverification fee for ${exam_schedule_ids.length} subject(s)`,
        created_by: student_id,
      },
      { transaction },
    );

    // Create reverification requests with PAID status
    const reverificationRequests = [];

    for (const schedule of schedules) {
      // Get the exam mark
      const examMark = await ExamMark.findOne({
        where: {
          exam_schedule_id: schedule.id,
          student_id,
        },
        transaction,
      });

      if (!examMark) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Marks not found for ${schedule.course.name}`,
        });
      }

      // Check if reverification already exists
      const existing = await ExamReverification.findOne({
        where: {
          exam_mark_id: examMark.id,
          status: { [Op.in]: ["pending", "under_review"] },
        },
        transaction,
      });

      if (existing) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Reverification already requested for ${schedule.course.name}`,
        });
      }

      const reverification = await ExamReverification.create(
        {
          student_id,
          exam_schedule_id: schedule.id,
          exam_mark_id: examMark.id,
          original_marks: examMark.marks_obtained,
          reason: reason || "Request for reverification",
          status: "pending",
          payment_status: "paid", // PAID immediately
          fee_charge_id: feeCharge.id,
        },
        { transaction },
      );

      reverificationRequests.push(reverification);
    }

    await transaction.commit();

    // Reload with associations
    const finalRequests = await ExamReverification.findAll({
      where: { id: reverificationRequests.map((r) => r.id) },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          include: [
            {
              model: Course,
              as: "course",
            },
          ],
        },
        {
          model: StudentFeeCharge,
          as: "fee_charge",
        },
      ],
    });

    res.status(201).json({
      message: "Payment successful and reverification requests submitted",
      reverificationRequests: finalRequests,
      feeCharge: {
        id: feeCharge.id,
        amount: feeCharge.amount,
        is_paid: true,
        paid_at: feeCharge.paid_at,
        payment_method: feeCharge.payment_method,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error applying for reverification with payment:", error);
    res.status(500).json({
      message: "Server error while processing application and payment",
      error: error.message,
    });
  }
};

module.exports = {
  applyWithPayment,
};
