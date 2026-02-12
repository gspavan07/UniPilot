const {
  ExamCycle,
  ExamSchedule,
  ExamMark,
  ExamReverification,
  User,
  Course,
  ExamFeePayment,
  FeePayment,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const isLive =
  process.env.RAZORPAY_MODE === "live" || process.env.NODE_ENV === "production";

const razorpay = new Razorpay({
  key_id: isLive
    ? process.env.RAZORPAY_KEY_ID_LIVE
    : process.env.RAZORPAY_KEY_ID,
  key_secret: isLive
    ? process.env.RAZORPAY_KEY_SECRET_LIVE
    : process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Apply for reverification with immediate payment
// @route   POST /api/exam/reverification/apply-with-payment
// @access  Private/Student
const applyWithPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const student_id = req.user.userId;
    const { exam_schedule_ids, reason, payment_method, payment } = req.body;

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

    // Razorpay Verification
    if (payment_method === "razorpay") {
      if (!payment || !payment.razorpay_payment_id || !payment.razorpay_signature) {
        await transaction.rollback();
        return res.status(400).json({ message: "Missing Razorpay payment details" });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payment;
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac(
          "sha256",
          isLive
            ? process.env.RAZORPAY_KEY_SECRET_LIVE
            : process.env.RAZORPAY_KEY_SECRET
        )
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        await transaction.rollback();
        return res.status(400).json({ message: "Invalid payment signature" });
      }
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

    // Calculate total fee
    const totalFee =
      cycle.reverification_fee_per_paper * exam_schedule_ids.length;

    // Get student details
    const student = await User.findByPk(student_id, {
      attributes: ["current_semester"],
      transaction,
    });

    // Create Global Fee Payment Record
    const feePayment = await FeePayment.create(
      {
        student_id,
        amount_paid: totalFee,
        payment_date: new Date(),
        transaction_id: payment?.razorpay_payment_id || `REV-${Date.now()}`,
        payment_method: payment_method || "online",
        status: "completed",
        remarks: `Reverification Application: ${exam_schedule_ids.length} subject(s)`,
      },
      { transaction }
    );

    // Create Exam Fee Payment record immediately as PAID
    const examFeePayment = await ExamFeePayment.create(
      {
        student_id,
        exam_cycle_id: cycle.id,
        category: "reverification",
        amount: totalFee,
        transaction_id: payment?.razorpay_payment_id || `REV-${Date.now()}`,
        payment_method: payment_method,
        status: "completed",
        payment_date: new Date(),
        remarks: `Reverification fee for ${exam_schedule_ids.length} subject(s)`,
        fee_payment_id: feePayment.id,
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
          exam_fee_payment_id: examFeePayment.id,
          semester: student.current_semester || 1,
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
          model: ExamFeePayment,
          as: "exam_fee_payment",
        },
      ],
    });

    res.status(201).json({
      message: "Payment successful and reverification requests submitted",
      reverificationRequests: finalRequests,
      paymentDetails: {
        id: examFeePayment.id,
        amount: examFeePayment.amount,
        status: examFeePayment.status,
        payment_date: examFeePayment.payment_date,
        payment_method: examFeePayment.payment_method,
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

// @desc    Create Razorpay Order for Reverification
// @route   POST /api/exam/reverification/create-order
// @access  Private/Student
const createReverificationOrder = async (req, res) => {
  try {
    const student_id = req.user.userId;
    const { exam_schedule_ids } = req.body;

    if (!exam_schedule_ids || exam_schedule_ids.length === 0) {
      return res.status(400).json({ message: "No subjects selected" });
    }

    // Fetch fee details
    // Optimization: Just fetch one schedule to get the cycle fee
    const schedule = await ExamSchedule.findOne({
      where: { id: exam_schedule_ids[0] },
      include: [{ model: ExamCycle, as: 'cycle' }]
    });

    if (!schedule || !schedule.cycle) {
      return res.status(404).json({ message: "Exam cycle not found" });
    }

    const feePerPaper = parseFloat(schedule.cycle.reverification_fee_per_paper || 0);
    const totalAmount = feePerPaper * exam_schedule_ids.length;

    if (totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid fee amount" });
    }

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      notes: {
        student_id,
        type: "reverification",
        count: exam_schedule_ids.length
      }
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
      key_id: razorpay.key_id,
      amount: totalAmount
    });

  } catch (error) {
    console.error("Error creating reverification order:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

module.exports = {
  applyWithPayment,
  createReverificationOrder,
};
