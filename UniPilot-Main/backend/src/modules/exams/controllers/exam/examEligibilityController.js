import { sequelize } from "../../../../config/database.js";
import { Attendance, Program, Regulation } from "../../../academics/models/index.js";
import { User } from "../../../core/models/index.js";
import { ExamCycle, ExamStudentEligibility } from "../../models/associations.js";
import feeStatusService from "../../../fees/services/feeStatusService.js";
import logger from "../../../../utils/logger.js";
import { Op } from "sequelize";

/**
 * Calculate eligibility for a student in a specific exam cycle
 * Returns flags-based eligibility (fee_clear_permission, hod_permission, has_condonation)
 * Status is calculated dynamically from these flags
 */
export async function calculateEligibility(studentId, cycleId) {
  try {
    const cycle = await ExamCycle.findByPk(cycleId);
    if (!cycle) throw new Error("Exam cycle not found");

    const student = await User.findByPk(studentId);
    if (!student) throw new Error("Student not found");

    // Fetch existing record to preserve manual overrides
    const existingEligibility = await ExamStudentEligibility.findOne({
      where: { student_id: studentId, exam_cycle_id: cycleId },
    });

    // Initialize with defaults
    const eligibilityData = {
      attendance_percentage: null,
      fee_balance: 0,
      fee_clear_permission: true,
      hod_permission: true,
      has_condonation: false,
    };

    // 1. Attendance Check (Semester-Specific)
    if (cycle.check_attendance) {
      // Get semester course IDs from Regulation
      let targetCourseIds = [];
      if (student.regulation_id && student.program_id) {
        const regulation = await Regulation.findByPk(student.regulation_id);
        if (regulation && regulation.courses_list) {
          const coursesList = regulation.courses_list;
          const progId = student.program_id;
          const semKey = String(cycle.semester);

          if (coursesList[progId] && coursesList[progId][semKey]) {
            targetCourseIds = coursesList[progId][semKey];
          }
        }
      }

      const attendanceWhere = { student_id: studentId };
      if (targetCourseIds.length > 0) {
        attendanceWhere.course_id = { [Op.in]: targetCourseIds };
      }

      const attendanceSummary = await Attendance.findAll({
        where: attendanceWhere,
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
          [
            sequelize.literal("COUNT(CASE WHEN status = 'present' THEN 1 END)"),
            "present",
          ],
        ],
        raw: true,
      });

      const total = parseInt(attendanceSummary[0]?.total || 0);
      const present = parseInt(attendanceSummary[0]?.present || 0);
      const percentage = total > 0 ? (present / total) * 100 : 100;

      eligibilityData.attendance_percentage = percentage;
    }

    // 2. Fee Clearance Check (Cumulative <= current sem)
    if (cycle.check_fee_clearance) {
      const feeStatus = await feeStatusService.calculateFeeStatus(studentId);

      // Calculate total due as of current semester
      let totalDue = 0;
      const currentSem = student.current_semester || 1;

      for (let sem = 1; sem <= currentSem; sem++) {
        if (feeStatus.semesterWise[sem]) {
          totalDue += parseFloat(feeStatus.semesterWise[sem].totals.due);
        }
      }

      eligibilityData.fee_balance = totalDue;
      eligibilityData.fee_clear_permission = totalDue <= 0;
    }

    // 3. Apply Simple Rules
    const thresholdEligible = parseFloat(
      cycle.attendance_threshold_eligible || 75,
    );
    const thresholdCondonation = parseFloat(
      cycle.attendance_threshold_condonation || 65,
    );

    if (
      cycle.check_attendance &&
      eligibilityData.attendance_percentage !== null
    ) {
      // Rule 1: Attendance < eligible threshold → needs condonation fee
      if (eligibilityData.attendance_percentage < thresholdEligible) {
        eligibilityData.has_condonation = true;
      }

      // Rule 2: Attendance < condonation threshold → needs HOD permission
      if (eligibilityData.attendance_percentage < thresholdCondonation) {
        eligibilityData.hod_permission = false;
      }
    }

    // 4. Preserve Manual Overrides
    if (existingEligibility) {
      // If HOD manually granted permission, keep it
      if (existingEligibility.hod_permission === true) {
        eligibilityData.hod_permission = true;
      }
      // If fee manually cleared, keep it
      if (existingEligibility.fee_clear_permission === true) {
        eligibilityData.fee_clear_permission = true;
      }
      // Preserve bypass
      if (existingEligibility.bypassed_by) {
        eligibilityData.bypassed_by = existingEligibility.bypassed_by;
      }
    }

    // 5. Upsert Eligibility Record
    const [eligibility, created] = await ExamStudentEligibility.findOrCreate({
      where: { student_id: studentId, exam_cycle_id: cycleId },
      defaults: eligibilityData,
    });

    if (!created) {
      // Update existing record
      if (eligibility.bypassed_by) {
        // If bypassed, only update metrics, don't touch permissions
        await eligibility.update({
          attendance_percentage: eligibilityData.attendance_percentage,
          fee_balance: eligibilityData.fee_balance,
        });
      } else {
        // Full update
        await eligibility.update(eligibilityData);
      }
    }

    return eligibility.toJSON();
  } catch (error) {
    logger.error("Calculate eligibility error:", error);
    throw error;
  }
}

/**
 * Controller: Get student eligibility for a cycle
 */
export async function getStudentEligibility(req, res) {
  try {
    const studentId = req.user.userId;
    const { cycle_id } = req.query;

    if (!cycle_id)
      return res.status(400).json({ error: "Cycle ID is required" });

    const eligibility = await calculateEligibility(studentId, cycle_id);
    res.json({ success: true, data: eligibility });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Exam Cell Update Bypass / Permissions
 */
export async function updateBypass(req, res) {
  try {
    const {
      student_id,
      cycle_id,
      bypass, // Simple boolean for bypass
      hod_permission,
      fee_clear_permission, // Renamed from is_fee_cleared
    } = req.body;

    let eligibility = await ExamStudentEligibility.findOne({
      where: { student_id, exam_cycle_id: cycle_id },
    });

    if (!eligibility) {
      // If no record exists, run calculation first to create it
      eligibility = await calculateEligibility(student_id, cycle_id);
      // Reload to get the created record
      eligibility = await ExamStudentEligibility.findOne({
        where: { student_id, exam_cycle_id: cycle_id },
      });
    }

    const updateData = {};

    // Handle bypass
    if (bypass === true) {
      updateData.bypassed_by = req.user.userId;
    } else if (bypass === false) {
      updateData.bypassed_by = null;
    }

    // Handle permission flags
    if (hod_permission !== undefined) {
      updateData.hod_permission = hod_permission;
    }
    if (fee_clear_permission !== undefined) {
      updateData.fee_clear_permission = fee_clear_permission;
    }

    await eligibility.update(updateData);

    // Re-fetch to get updated data
    const updated = await ExamStudentEligibility.findOne({
      where: { student_id, exam_cycle_id: cycle_id },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Get all student eligibilities for a cycle (Exam Cell)
 */
export async function getCycleEligibilities(req, res) {
  try {
    const { cycle_id } = req.params;
    const { department_id, batch, program_id } = req.query;

    const cycle = await ExamCycle.findByPk(cycle_id);
    if (!cycle) return res.status(404).json({ error: "Cycle not found" });

    // Build filter for users (students)
    const userWhere = {
      role: "student",
      current_semester: cycle.semester,
      batch_year: cycle.batch, // cycle.batch is assigned to user.batch_year
    };
    if (department_id) userWhere.department_id = department_id;
    if (program_id) userWhere.program_id = program_id;

    const students = await User.findAll({
      where: userWhere,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "student_id",
        "email",
        "program_id",
        "section",
      ], // Added program_id and section for filtering
      include: [
        {
          model: ExamStudentEligibility,
          as: "student_eligibilities",
          where: { exam_cycle_id: cycle_id },
          required: false,
        },
        {
          // Assuming Program association exists on User
          model: Program,
          as: "program",
          attributes: ["name", "code"],
          required: false,
        },
      ],
      order: [["student_id", "ASC"]], // Default sort
    });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Bulk recalculate all eligibilities for a cycle
 */
export async function recalculateAllEligibilities(req, res) {
  try {
    const { cycle_id } = req.params;

    const cycle = await ExamCycle.findByPk(cycle_id);
    if (!cycle) return res.status(404).json({ error: "Cycle not found" });

    // Build filter for users (students)
    const userWhere = {
      role: "student",
      current_semester: cycle.semester,
      batch_year: cycle.batch,
    };

    const students = await User.findAll({
      where: userWhere,
      attributes: ["id"],
    });

    if (students.length === 0) {
      return res.json({
        success: true,
        message: "No students found for this cycle",
        count: 0,
      });
    }

    // Run calculations in parallel (with Promise.all)
    const results = await Promise.all(
      students.map((student) =>
        calculateEligibility(student.id, cycle_id).catch((err) => {
          logger.error(
            `Eligibility sync failed for student ${student.id}:`,
            err,
          );
          return null;
        }),
      ),
    );

    // After successful calculation, we mark the eligibility as published
    await cycle.update({ publish_eligibility: true });

    res.json({
      success: true,
      message: `Successfully recalculated eligibility for ${results.filter((r) => r !== null).length} students`,
      count: results.length,
    });
  } catch (error) {
    logger.error("Bulk eligibility recalculation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export default {
  calculateEligibility,
  getStudentEligibility,
  updateBypass,
  getCycleEligibilities,
  recalculateAllEligibilities,
};
