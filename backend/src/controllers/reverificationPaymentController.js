const {
  ExamReverification,
  StudentFeeCharge,
  FeePayment,
  User,
  ExamSchedule,
  Course,
  ExamFeePayment,
  sequelize,
} = require("../models");

// @desc    Pay reverification fee
// @route   POST /api/exam/reverification/pay
// @access  Private/Student
const payReverificationFee = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const student_id = req.user.userId;
    const student = await User.findByPk(student_id, { transaction });
    const { reverification_id, payment_method } = req.body;

    if (!reverification_id) {
      await transaction.rollback();
      return res.status(400).json({ message: "Reverification ID is required" });
    }

    const { ExamFeePayment } = require("../models");

    // Get the reverification request
    const reverification = await ExamReverification.findOne({
      where: {
        id: reverification_id,
        student_id,
      },
      include: [
        {
          model: ExamFeePayment,
          as: "exam_fee_payment",
        },
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
      ],
      transaction,
    });

    if (!reverification) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Reverification request not found",
      });
    }

    if (reverification.payment_status === "paid") {
      await transaction.rollback();
      return res.status(400).json({
        message: "Payment already completed for this request",
      });
    }

    const feePayment = reverification.exam_fee_payment;
    if (!feePayment) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Exam fee payment record not found for this request",
      });
    }

    // Update centralized ExamFeePayment as completed
    await feePayment.update(
      {
        status: "completed",
        payment_date: new Date(),
        payment_method: payment_method || "online",
        transaction_id: `REV-TXN-${Date.now()}`,
      },
      { transaction },
    );

    // Create main FeePayment record for Insights (Financial Audit Only)
    await FeePayment.create(
      {
        student_id,
        fee_charge_id: null,
        amount_paid: feePayment.amount,
        payment_method: payment_method || "online",
        payment_date: new Date(),
        transaction_id: feePayment.transaction_id,
        remarks: `Reverification fee for ${reverification.schedule.course.name}`,
        semester: reverification.semester || student.current_semester || 0,
        status: "completed",
      },
      { transaction },
    );

    // Update reverification status
    await reverification.update(
      {
        payment_status: "paid",
        status: "under_review", // Move to under_review automatically after payment
      },
      { transaction },
    );

    await transaction.commit();

    res.json({
      message: "Payment successful",
      reverification: {
        id: reverification.id,
        payment_status: "paid",
        status: "under_review",
        fee_amount: feePayment.amount,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error processing reverification payment:", error);
    res.status(500).json({
      message: "Server error while processing payment",
      error: error.message,
    });
  }
};

module.exports = {
  payReverificationFee,
};
