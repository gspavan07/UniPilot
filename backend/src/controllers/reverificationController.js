const {
  ExamCycle,
  ExamSchedule,
  ExamMark,
  ExamReverification,
  ExamScript,
  HallTicket,
  ExamRegistration,
  Attendance,
  User,
  Course,
  Regulation,
  Timetable,
  TimetableSlot,
  SemesterResult,
  Program,
  StudentFeeCharge,
  ExamFeePayment,
  FeeCategory,
  FeePayment,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { createScriptUploadDir } = require("../middleware/scriptUpload");

// @desc    Configure reverification window for an exam cycle
// @route   POST /api/exam/reverification/configure
// @access  Private/Exam Cell
const configureReverification = async (req, res) => {
  try {
    const {
      exam_cycle_id,
      is_reverification_open,
      reverification_start_date,
      reverification_end_date,
      reverification_fee_per_paper,
    } = req.body;

    if (!exam_cycle_id) {
      return res.status(400).json({ message: "Exam cycle ID is required" });
    }

    const examCycle = await ExamCycle.findByPk(exam_cycle_id);

    if (!examCycle) {
      return res.status(404).json({ message: "Exam cycle not found" });
    }

    // Only allow reverification for semester_end exams
    if (examCycle.exam_type !== "semester_end") {
      return res.status(400).json({
        message: "Reverification is only available for end semester exams",
      });
    }

    // Validate dates if reverification is being opened
    if (is_reverification_open) {
      if (!reverification_start_date || !reverification_end_date) {
        return res.status(400).json({
          message:
            "Start and end dates are required when opening reverification",
        });
      }

      if (
        new Date(reverification_start_date) >= new Date(reverification_end_date)
      ) {
        return res.status(400).json({
          message: "End date must be after start date",
        });
      }
    }

    // Update the exam cycle
    await examCycle.update({
      is_reverification_open: is_reverification_open || false,
      reverification_start_date: reverification_start_date || null,
      reverification_end_date: reverification_end_date || null,
      reverification_fee_per_paper:
        reverification_fee_per_paper !== undefined
          ? reverification_fee_per_paper
          : examCycle.reverification_fee_per_paper,
    });

    res.json({
      message: "Reverification configuration updated successfully",
      examCycle,
    });
  } catch (error) {
    console.error("Error configuring reverification:", error);
    res.status(500).json({
      message: "Server error while configuring reverification",
      error: error.message,
    });
  }
};

// @desc    Get reverification requests with filters
// @route   GET /api/exam/reverification/requests
// @access  Private/Exam Cell
const getReverificationRequests = async (req, res) => {
  try {
    const {
      exam_cycle_id,
      status,
      student_id,
      program_id,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (student_id) where.student_id = student_id;

    const include = [
      {
        model: User,
        as: "student",
        attributes: ["id", "first_name", "last_name", "student_id", "email"],
        include: [
          {
            model: Program,
            as: "program",
            attributes: ["id", "name", "code"],
          },
        ],
      },
      {
        model: ExamSchedule,
        as: "schedule",
        attributes: ["id", "exam_date", "exam_cycle_id"],
        include: [
          {
            model: Course,
            as: "course",
            attributes: ["id", "name", "code", "credits"],
          },
          {
            model: ExamCycle,
            as: "cycle",
            attributes: ["id", "name", "exam_type"],
          },
        ],
      },
      {
        model: ExamMark,
        as: "exam_mark",
        attributes: ["id", "marks_obtained", "grade"],
      },
      {
        model: ExamFeePayment,
        as: "exam_fee_payment",
        attributes: ["id", "amount", "status", "payment_date"],
      },
      {
        model: User,
        as: "reviewer",
        attributes: ["id", "first_name", "last_name"],
        required: false,
      },
    ];

    // Filter by exam cycle if provided
    if (exam_cycle_id) {
      include[1].where = { exam_cycle_id };
    }

    // Filter by program if provided
    if (program_id) {
      include[0].where = { program_id };
    }

    const offset = (page - 1) * limit;

    const { count, rows: requests } = await ExamReverification.findAndCountAll({
      where,
      include,
      order: [[sequelize.col("ExamReverification.created_at"), "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      requests,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reverification requests:", error);
    res.status(500).json({
      message: "Server error while fetching reverification requests",
      error: error.message,
    });
  }
};

// @desc    Bulk update pending reverifications to under_review when window closes
// @route   POST /api/exam/reverification/:cycleId/close-window
// @access  Private/Exam Cell
const closeReverificationWindow = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { cycleId } = req.params;

    // Get all pending reverifications for this cycle
    const reverifications = await ExamReverification.findAll({
      where: {
        status: "pending",
        payment_status: "paid",
      },
      include: [
        {
          model: ExamSchedule,
          as: "schedule",
          where: { exam_cycle_id: cycleId },
          required: true,
        },
      ],
      transaction,
    });

    if (reverifications.length === 0) {
      await transaction.commit();
      return res.json({
        message: "No pending reverifications found",
        updated: 0,
      });
    }

    // Update all to under_review
    await ExamReverification.update(
      { status: "under_review" },
      {
        where: {
          id: reverifications.map((r) => r.id),
        },
        transaction,
      },
    );

    // Close the reverification window
    await ExamCycle.update(
      { is_reverification_open: false },
      {
        where: { id: cycleId },
        transaction,
      },
    );

    await transaction.commit();

    res.json({
      message: `Successfully moved ${reverifications.length} reverification(s) to under review`,
      updated: reverifications.length,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error closing reverification window:", error);
    res.status(500).json({
      message: "Server error while closing reverification window",
      error: error.message,
    });
  }
};

// @desc    Review and process reverification request (DEPRECATED - use marks entry instead)
// @route   PUT /api/exam/reverification/:id/review
// @access  Private/Exam Cell
const reviewReverification = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, revised_marks, remarks } = req.body;

    const reverification = await ExamReverification.findByPk(id, {
      include: [
        {
          model: ExamMark,
          as: "exam_mark",
        },
        {
          model: ExamSchedule,
          as: "schedule",
          include: [
            {
              model: Course,
              as: "course",
            },
            {
              model: ExamCycle,
              as: "cycle",
              include: [
                {
                  model: Regulation,
                  as: "regulation",
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "student",
        },
      ],
      transaction,
    });

    if (!reverification) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Reverification request not found" });
    }

    // Check payment status
    if (
      reverification.payment_status === "pending" &&
      status === "under_review"
    ) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Cannot process request with pending payment",
      });
    }

    // Update reverification record
    reverification.status = status;
    reverification.remarks = remarks || reverification.remarks;
    reverification.reviewed_by = req.user.userId;
    reverification.reviewed_at = new Date();

    // If marks are being revised and status is completed
    if (status === "completed" && revised_marks !== undefined) {
      const examMark = reverification.exam_mark;

      // Store history before update
      const historyEntry = {
        date: new Date(),
        old_marks: examMark.marks_obtained,
        new_marks: revised_marks,
        reviewed_by: req.user.userId,
        reverification_id: reverification.id,
        remarks: remarks,
      };

      const currentHistory = examMark.reverification_history || [];

      // Update exam mark
      await examMark.update(
        {
          marks_obtained: revised_marks,
          is_reverified: true,
          reverification_count: examMark.reverification_count + 1,
          reverification_history: [...currentHistory, historyEntry],
          // Recalculate grade based on regulation
          grade: calculateGrade(
            revised_marks,
            reverification.schedule.cycle.regulation,
          ),
        },
        { transaction },
      );

      reverification.revised_marks = revised_marks;

      // TODO: Recalculate SGPA/CGPA if needed
      // This would involve updating the SemesterResult for the student
    }

    await reverification.save({ transaction });
    await transaction.commit();

    // Reload with associations
    const updatedReverification = await ExamReverification.findByPk(id, {
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "email"],
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
        {
          model: ExamMark,
          as: "exam_mark",
        },
      ],
    });

    // TODO: Send notification to student
    // await sendReverificationCompleteNotification(updatedReverification);

    res.json({
      message: "Reverification reviewed successfully",
      reverification: updatedReverification,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error reviewing reverification:", error);
    res.status(500).json({
      message: "Server error while reviewing reverification",
      error: error.message,
    });
  }
};

// Helper function to calculate grade based on regulation
function calculateGrade(marks, regulation) {
  if (!regulation || !regulation.grade_scale) {
    // Default grade scale if not defined
    if (marks >= 90) return "O";
    if (marks >= 80) return "A+";
    if (marks >= 70) return "A";
    if (marks >= 60) return "B+";
    if (marks >= 50) return "B";
    if (marks >= 40) return "C";
    return "F";
  }

  const gradeScale = regulation.grade_scale;
  for (const gradeInfo of gradeScale) {
    if (marks >= gradeInfo.min_marks && marks <= gradeInfo.max_marks) {
      return gradeInfo.grade;
    }
  }

  return "F";
}

// @desc    Waive reverification fee
// @route   POST /api/exam/reverification/:id/waive-fee
// @access  Private/Exam Cell
const waiveReverificationFee = async (req, res) => {
  try {
    const { id } = req.params;

    const reverification = await ExamReverification.findByPk(id, {
      include: [
        {
          model: User,
          as: "student",
        },
        {
          model: ExamFeePayment,
          as: "exam_fee_payment",
        },
      ],
    });

    if (!reverification) {
      return res
        .status(404)
        .json({ message: "Reverification request not found" });
    }

    // Update payment status
    reverification.payment_status = "waived";
    await reverification.save();

    // If there's an associated exam fee payment, mark it as completed/waived
    if (reverification.exam_fee_payment) {
      await reverification.exam_fee_payment.update({
        status: 'completed',
        payment_date: new Date(),
        remarks: `${reverification.exam_fee_payment.remarks || ''} (Fee Waived)`,
      });
    }

    res.json({
      message: "Reverification fee waived successfully",
      reverification,
    });
  } catch (error) {
    console.error("Error waiving reverification fee:", error);
    res.status(500).json({
      message: "Server error while waiving fee",
      error: error.message,
    });
  }
};

module.exports = {
  configureReverification,
  getReverificationRequests,
  closeReverificationWindow,
  reviewReverification,
  waiveReverificationFee,
};
