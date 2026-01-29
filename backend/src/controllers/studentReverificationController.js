const {
  ExamCycle,
  ExamSchedule,
  ExamMark,
  ExamReverification,
  ExamScript,
  User,
  Course,
  StudentFeeCharge,
  FeeCategory,
  Program,
  Regulation,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

// @desc    Get student's reverification eligibility
// @route   GET /api/exam/my-reverification-eligibility
// @access  Private/Student
const getMyReverificationEligibility = async (req, res) => {
  try {
    const student_id = req.user.userId;

    // Find all exam cycles with open reverification
    const eligibleCycles = await ExamCycle.findAll({
      where: {
        is_reverification_open: true,
        exam_type: "semester_end",
        reverification_start_date: {
          [Op.lte]: new Date(),
        },
        reverification_end_date: {
          [Op.gte]: new Date(),
        },
      },
      include: [
        {
          model: Regulation,
          as: "regulation",
          attributes: ["id", "name"],
        },
      ],
    });

    if (eligibleCycles.length === 0) {
      return res.json({
        message: "No reverification windows are currently open",
        eligibleExams: [],
      });
    }

    // For each cycle, get the student's exam marks
    const eligibleExams = await Promise.all(
      eligibleCycles.map(async (cycle) => {
        // Get all exam schedules for this cycle
        const schedules = await ExamSchedule.findAll({
          where: { exam_cycle_id: cycle.id },
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "name", "code", "credits"],
            },
            {
              model: ExamMark,
              as: "marks",
              where: { student_id },
              required: true,
              include: [
                {
                  model: ExamReverification,
                  as: "reverification",
                  required: false,
                },
              ],
            },
          ],
        });

        // Filter out subjects that already have pending/completed reverification
        const availableSubjects = schedules
          .filter((schedule) => {
            const mark = schedule.marks[0];
            return (
              !mark.reverification || mark.reverification.status === "rejected"
            );
          })
          .map((schedule) => ({
            schedule_id: schedule.id,
            course_id: schedule.course.id,
            course_name: schedule.course.name,
            course_code: schedule.course.code,
            exam_date: schedule.exam_date,
            marks_obtained: schedule.marks[0].marks_obtained,
            grade: schedule.marks[0].grade,
            exam_mark_id: schedule.marks[0].id,
          }));

        return {
          cycle_id: cycle.id,
          cycle_name: cycle.name,
          reverification_end_date: cycle.reverification_end_date,
          fee_per_paper: cycle.reverification_fee_per_paper,
          available_subjects: availableSubjects,
        };
      }),
    );

    // Filter out cycles with no available subjects
    const filtered = eligibleExams.filter(
      (exam) => exam.available_subjects.length > 0,
    );

    res.json({
      eligibleExams: filtered,
    });
  } catch (error) {
    console.error("Error fetching reverification eligibility:", error);
    res.status(500).json({
      message: "Server error while fetching eligibility",
      error: error.message,
    });
  }
};

// @desc    Apply for reverification
// @route   POST /api/exam/reverification/apply
// @access  Private/Student
const applyForReverification = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const student_id = req.user.userId;
    const { exam_schedule_ids, reason } = req.body;

    if (!exam_schedule_ids || exam_schedule_ids.length === 0) {
      return res.status(400).json({
        message: "Please select at least one subject for reverification",
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

    // Create reverification requests
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

      reverificationRequests.push({
        student_id,
        exam_schedule_id: schedule.id,
        exam_mark_id: examMark.id,
        original_marks: examMark.marks_obtained,
        original_grade: examMark.grade,
        semester: student.current_semester || 1,
        reason: reason || "Request for reverification",
        status: "pending",
        payment_status: "pending",
      });
    }

    // Create fee charge
    const student = await User.findByPk(student_id, {
      attributes: ["current_semester"],
      transaction,
    });

    const feeCharge = await StudentFeeCharge.create(
      {
        student_id,
        category_id: feeCategory.id,
        charge_type: "exam_reverification",
        amount: totalFee,
        description: `Reverification fee for ${exam_schedule_ids.length} subject(s)`,
        semester: student.current_semester || 1,
        is_paid: false,
        created_by: student_id,
      },
      { transaction },
    );

    // Link fee charge to reverification requests
    const createdRequests = await Promise.all(
      reverificationRequests.map((req) =>
        ExamReverification.create(
          {
            ...req,
            fee_charge_id: feeCharge.id,
          },
          { transaction },
        ),
      ),
    );

    await transaction.commit();

    // Reload with associations
    const finalRequests = await ExamReverification.findAll({
      where: { id: createdRequests.map((r) => r.id) },
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
      message: "Reverification applications submitted successfully",
      reverificationRequests: finalRequests,
      feeCharge: {
        id: feeCharge.id,
        amount: feeCharge.amount,
        is_paid: feeCharge.is_paid,
      },
      payment_required: true,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error applying for reverification:", error);
    res.status(500).json({
      message: "Server error while applying for reverification",
      error: error.message,
    });
  }
};

// @desc    Get student's reverification requests
// @route   GET /api/exam/my-reverification-requests
// @access  Private/Student
const getMyReverificationRequests = async (req, res) => {
  try {
    const student_id = req.user.userId;

    const requests = await ExamReverification.findAll({
      where: { student_id },
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
          model: StudentFeeCharge,
          as: "fee_charge",
          attributes: ["id", "amount", "is_paid", "paid_at"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "first_name", "last_name"],
          required: false,
        },
      ],
      order: [[sequelize.col("ExamReverification.created_at"), "DESC"]],
    });

    res.json({
      requests,
    });
  } catch (error) {
    console.error("Error fetching reverification requests:", error);
    res.status(500).json({
      message: "Server error while fetching requests",
      error: error.message,
    });
  }
};

module.exports = {
  getMyReverificationEligibility,
  applyForReverification,
  getMyReverificationRequests,
};
