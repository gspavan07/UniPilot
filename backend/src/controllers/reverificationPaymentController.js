const {
  ExamReverification,
  StudentFeeCharge,
  FeePayment,
  User,
  ExamSchedule,
  Course,
  sequelize,
} = require("../models");

// @desc    Pay reverification fee
// @route   POST /api/exam/reverification/pay
// @access  Private/Student
const payReverificationFee = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const student_id = req.user.userId;
    const { reverification_id, payment_method } = req.body;

    if (!reverification_id) {
      await transaction.rollback();
      return res.status(400).json({ message: "Reverification ID is required" });
    }

    // Get the reverification request
    const reverification = await ExamReverification.findOne({
      where: {
        id: reverification_id,
        student_id,
      },
      include: [
        {
          model: StudentFeeCharge,
          as: "fee_charge",
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

    if (!reverification.fee_charge) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Fee charge not found for this request",
      });
    }

    // Update fee charge as paid
    await reverification.fee_charge.update(
      {
        is_paid: true,
        paid_at: new Date(),
        payment_method: payment_method || "cash",
      },
      { transaction },
    );

    // Create fee payment record
    await FeePayment.create(
      {
        student_id,
        charge_id: reverification.fee_charge.id,
        amount: reverification.fee_charge.amount,
        payment_method: payment_method || "cash",
        payment_date: new Date(),
        transaction_id: `REV-${Date.now()}`,
        description: `Reverification fee for ${reverification.schedule.course.name}`,
        semester: reverification.semester || reverification.fee_charge.semester,
        fee_structure_id: null, // Charges don't have fee_structure_id
        student_fee_charge_id: reverification.fee_charge.id, // Explicitly link to charge
        created_by: student_id,
      },
      { transaction },
    );

    // Update reverification payment status
    await reverification.update(
      {
        payment_status: "paid",
      },
      { transaction },
    );

    await transaction.commit();

    res.json({
      message: "Payment successful",
      reverification: {
        id: reverification.id,
        payment_status: "paid",
        fee_amount: reverification.fee_charge.amount,
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
