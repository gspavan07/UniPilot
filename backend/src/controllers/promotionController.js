const {
  PromotionCriteria,
  PromotionEvaluation,
  Graduation,
  User,
  Program,
  sequelize,
} = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

// @desc    Create or update promotion criteria
// @route   POST /api/promotion/criteria
// @access  Private/Admin
exports.upsertCriteria = async (req, res) => {
  try {
    const {
      program_id,
      from_semester,
      to_semester,
      min_attendance,
      min_cgpa,
      max_backlogs,
      fee_required,
    } = req.body;

    const [criteria, created] = await PromotionCriteria.findOrCreate({
      where: { program_id, from_semester, to_semester },
      defaults: {
        min_attendance_percentage: min_attendance,
        min_cgpa,
        max_backlogs_allowed: max_backlogs,
        fee_clearance_required: fee_required,
      },
    });

    if (!created) {
      await criteria.update({
        min_attendance_percentage: min_attendance,
        min_cgpa,
        max_backlogs_allowed: max_backlogs,
        fee_clearance_required: fee_required,
      });
    }

    res.status(200).json({
      success: true,
      data: criteria,
    });
  } catch (error) {
    logger.error("Error upserting criteria:", error);
    res.status(500).json({ success: false, error: "Failed to save criteria" });
  }
};

// @desc    Evaluate students for promotion
// @route   POST /api/promotion/evaluate
// @access  Private/Admin
exports.evaluatePromotion = async (req, res) => {
  try {
    const { program_id, current_semester } = req.body;

    // 1. Get Criteria
    const criteria = await PromotionCriteria.findOne({
      where: {
        program_id,
        from_semester: current_semester,
        is_active: true,
      },
    });

    if (!criteria) {
      return res.status(404).json({
        success: false,
        error: "No active promotion criteria found for this semester",
      });
    }

    // 2. Get Students
    const students = await User.findAll({
      where: {
        program_id,
        current_semester,
        role: "student",
        is_active: true,
      },
    });

    const results = [];

    // 3. Evaluate each student (Simulated logic for now)
    for (const student of students) {
      // In a full implementation, we would query attendance and marks tables here
      // For now, we simulate with some random logic or assume metadata

      const attendance = 80; // Placeholder
      const cgpa = 7.5; // Placeholder
      const backlogs = 0; // Placeholder
      const fee_cleared = true; // Placeholder

      const attendance_met = attendance >= criteria.min_attendance_percentage;
      const cgpa_met = criteria.min_cgpa ? cgpa >= criteria.min_cgpa : true;
      const backlogs_met = backlogs <= criteria.max_backlogs_allowed;
      const fee_met = criteria.fee_clearance_required ? fee_cleared : true;

      const overall_eligible =
        attendance_met && cgpa_met && backlogs_met && fee_met;

      results.push({
        student_id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        student_code: student.student_id,
        attendance,
        attendance_met,
        cgpa,
        cgpa_met,
        backlogs,
        backlogs_met,
        fee_cleared,
        overall_eligible,
        from_semester: current_semester,
        to_semester: criteria.to_semester,
      });
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error("Evaluation error:", error);
    res.status(500).json({ success: false, error: "Evaluation failed" });
  }
};

// @desc    Process bulk promotion
// @route   POST /api/promotion/process
// @access  Private/Admin
exports.processBulkPromotion = async (req, res) => {
  try {
    const { student_ids, to_semester } = req.body;

    if (!student_ids || !Array.isArray(student_ids)) {
      return res.status(400).json({ error: "Invalid student list" });
    }

    await sequelize.transaction(async (t) => {
      // Update each student individually or in bulk
      // For now individual for simplicity and status tracking
      for (const id of student_ids) {
        const student = await User.findByPk(id);
        if (student) {
          const from_sem = student.current_semester;
          await student.update(
            {
              current_semester: to_semester,
              academic_status: "promoted",
            },
            { transaction: t }
          );

          // Record evaluation/history
          await PromotionEvaluation.create(
            {
              student_id: id,
              from_semester: from_sem,
              to_semester: to_semester,
              final_status: "PROMOTED",
              overall_eligible: true,
              processed_by: req.user.userId,
            },
            { transaction: t }
          );
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully promoted ${student_ids.length} students to semester ${to_semester}`,
    });
  } catch (error) {
    logger.error("Promotion processing error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to process promotion" });
  }
};

// @desc    Student applies for graduation
// @route   POST /api/promotion/graduation/apply
// @access  Private (Student)
exports.applyForGraduation = async (req, res) => {
  try {
    const student_id = req.user.userId;

    // Check if already applied
    const existing = await Graduation.findOne({ where: { student_id } });
    if (existing) {
      return res.status(400).json({ error: "Application already submitted" });
    }

    const application = await Graduation.create({
      student_id,
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    logger.error("Graduation apply error:", error);
    res.status(500).json({ error: "Application failed" });
  }
};
