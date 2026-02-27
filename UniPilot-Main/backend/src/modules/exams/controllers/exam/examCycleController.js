import FeesService from "../../../fees/services/index.js";
import CoreService from "../../../core/services/index.js";
import AcademicService from "../../../academics/services/index.js";
import {
  ExamCycle,
  ExamTimetable,
  ExamFeeConfiguration,
  LateFeeSlab,
  ExamFeePayment,
  ExamStudentEligibility,
} from "../../models/associations.js";
import { sequelize } from "../../../../config/database.js";
import logger from "../../../../utils/logger.js";
import { Op } from "sequelize";
import { calculateEligibility } from "./examEligibilityController.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
// Prioritize RAZORPAY_MODE env var, otherwise fallback to NODE_ENV
const isLive =
  process.env.RAZORPAY_MODE === "live" || process.env.NODE_ENV === "production";

const razorpayKeyId = isLive
  ? process.env.RAZORPAY_KEY_ID_LIVE
  : process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = isLive
  ? process.env.RAZORPAY_KEY_SECRET_LIVE
  : process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
if (razorpayKeyId && razorpayKeySecret) {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} else {
  logger.warn(
    "Razorpay keys missing in examCycleController. Payment functionality will be disabled.",
  );
}

/**
 * Helper function to convert number to Roman numerals
 */
function toRoman(num) {
  const romanNumerals = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
  };
  return romanNumerals[num] || String(num);
}

/**
 * Get all exam cycles with optional filters
 * GET /api/exam/cycles
 */
async function getAllCycles(req, res) {
  try {
    const { degree, regulation_id, status, batch, semester } = req.query;

    const where = {};
    if (degree) where.degree = degree;
    if (regulation_id) where.regulation_id = regulation_id;
    if (status) where.status = status;
    if (batch) where.batch = batch;
    if (semester) where.semester = parseInt(semester);

    const cycles = await ExamCycle.findAll({
      where,
      include: [
        {
          model: ExamTimetable,
          as: "timetables",
          where: { is_deleted: false },
          required: false,
        },
        {
          model: ExamFeeConfiguration,
          as: "fee_configuration",
          include: [
            {
              model: LateFeeSlab,
              as: "slabs",
            },
          ],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, data: cycles });
  } catch (error) {
    logger.error("Get all cycles error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get single exam cycle by ID
 * GET /api/exam/cycles/:id
 */
async function getCycleById(req, res) {
  try {
    const { id } = req.params;

    const cycle = await ExamCycle.findByPk(id, {
      include: [
        {
          model: ExamTimetable,
          as: "timetables",
          where: { is_deleted: false },
          required: false,
        },
        {
          model: ExamFeeConfiguration,
          as: "fee_configuration",
          include: [
            {
              model: LateFeeSlab,
              as: "slabs",
            },
          ],
          required: false,
        },
      ],
    });

    if (!cycle) {
      return res.status(404).json({ success: false, error: "Cycle not found" });
    }

    res.json({ success: true, data: cycle });
  } catch (error) {
    logger.error("Get cycle by ID error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Create new exam cycle with auto-generated name
 * POST /api/exam/cycles
 */
async function createCycle(req, res) {
  try {
    const {
      degree,
      regulation_id,
      regulation_code,
      exam_month,
      course_type,
      cycle_type,
      batch,
      semester,
      needs_fee,
    } = req.body;

    // Convert semester to Roman numeral
    const romanSemester = toRoman(semester);

    // Get current year
    const year = new Date().getFullYear();

    // Map DB degree codes to display names
    const DEGREE_DISPLAY = {
      btech: "B.Tech",
      mtech: "M.Tech",
      bba: "BBA",
      mba: "MBA",
      bsc: "B.Sc",
      msc: "M.Sc",
      bca: "BCA",
      mca: "MCA",
      bcom: "B.Com",
      mcom: "M.Com",
      ba: "BA",
      ma: "MA",
      phd: "Ph.D",
    };
    const degreeDisplay = DEGREE_DISPLAY[degree] || degree;

    // Generate cycle name
    const cycle_name = `${degreeDisplay}_${regulation_code}_${romanSemester}_${cycle_type}_Examination_${exam_month}-${year}`;

    // Check if cycle with same name already exists
    const existingCycle = await ExamCycle.findOne({ where: { cycle_name } });
    if (existingCycle) {
      return res.status(400).json({
        success: false,
        error: "Cycle with this name already exists",
      });
    }

    const cycle = await ExamCycle.create({
      cycle_name,
      degree,
      regulation_id,
      exam_month,
      course_type,
      cycle_type,
      batch,
      semester,
      exam_year: year,
      needs_fee: needs_fee || false,
      created_by: req.user.userId,
      status: "scheduling",
    });

    logger.info(`Exam cycle created: ${cycle_name} by user ${req.user.userId}`);

    res.status(201).json({ success: true, data: cycle });
  } catch (error) {
    logger.error("Create cycle error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Update exam cycle
 * PUT /api/exam/cycles/:id
 */
async function updateCycle(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const cycle = await ExamCycle.findByPk(id);
    if (!cycle) {
      return res.status(404).json({ success: false, error: "Cycle not found" });
    }

    // Prevent updating certain fields
    delete updates.id;
    delete updates.created_by;
    delete updates.created_at;

    await cycle.update(updates);

    logger.info(
      `Exam cycle updated: ${cycle.cycle_name} by user ${req.user.userId}`,
    );

    res.json({ success: true, data: cycle });
  } catch (error) {
    logger.error("Update cycle error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Delete exam cycle
 * DELETE /api/exam/cycles/:id
 */
async function deleteCycle(req, res) {
  try {
    const { id } = req.params;

    const cycle = await ExamCycle.findByPk(id);
    if (!cycle) {
      return res.status(404).json({ success: false, error: "Cycle not found" });
    }

    // Check if there are any timetables
    const timetableCount = await ExamTimetable.count({
      where: { exam_cycle_id: id, is_deleted: false },
    });

    if (timetableCount > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete cycle with existing timetables. Delete timetables first.",
      });
    }

    await cycle.destroy();

    logger.info(
      `Exam cycle deleted: ${cycle.cycle_name} by user ${req.user.userId}`,
    );

    res.json({ success: true, message: "Cycle deleted successfully" });
  } catch (error) {
    logger.error("Delete cycle error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get student's specific exam cycles and timetables
 * GET /api/exam/cycles/student/my-exams
 */
/**
 * Get student's specific exam cycles and timetables
 */
async function getMyExams(req, res) {
  try {
    const userId = req.user.userId;

    const student = await CoreService.findByPk(userId, {
      attributes: [
        "id",
        "program_id",
        "regulation_id",
        "current_semester",
        "batch_year",
      ],
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, error: "Student record not found" });
    }

    const cyclesList = await ExamCycle.findAll({
      where: {
        regulation_id: student.regulation_id,
        semester: student.current_semester,
        status: { [Op.ne]: "draft" },
      },
      attributes: ["id"],
    });

    // Sync eligibility for all found cycles in parallel
    if (cyclesList.length > 0) {
      await Promise.all(
        cyclesList.map((c) =>
          calculateEligibility(userId, c.id).catch((err) =>
            logger.error(
              `Eligibility sync failed in getMyExams for cycle ${c.id}:`,
              err,
            ),
          ),
        ),
      );
    }

    const cycles = await ExamCycle.findAll({
      where: {
        regulation_id: student.regulation_id,
        semester: student.current_semester,
        status: { [Op.ne]: "draft" },
      },
      include: [
        {
          model: ExamTimetable,
          as: "timetables",
          where: {
            is_deleted: false,
            program_id: { [Op.contains]: [student.program_id] },
          },
          required: false,
        },
        {
          model: ExamFeeConfiguration,
          as: "fee_configuration",
          include: [{ model: LateFeeSlab, as: "slabs" }],
          required: false,
        },
        {
          model: ExamFeePayment,
          as: "student_payments",
          where: { student_id: userId },
          required: false,
        },
        {
          model: ExamStudentEligibility,
          as: "student_eligibilities",
          where: { student_id: userId },
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const timetableCourseIds = new Set();
    cycles.forEach((cycle) => {
      cycle.timetables?.forEach((timetable) => {
        if (timetable.course_id) timetableCourseIds.add(timetable.course_id);
      });
    });

    const courses = await AcademicService.getCoursesByIds(
      [...timetableCourseIds],
      { attributes: ["id", "name", "code"], raw: true },
    );
    const courseMap = new Map(courses.map((course) => [course.id, course]));

    const cyclesWithCourses = cycles.map((cycle) => {
      const cycleJson = cycle.toJSON();
      if (cycleJson.timetables) {
        cycleJson.timetables = cycleJson.timetables.map((timetable) => ({
          ...timetable,
          course: timetable.course_id
            ? courseMap.get(timetable.course_id) || null
            : null,
        }));
      }
      return cycleJson;
    });

    res.json({ success: true, data: cyclesWithCourses });
  } catch (error) {
    logger.error("Get student exams error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get student's exam payment history
 */
async function getExamPaymentHistory(req, res) {
  try {
    const userId = req.user.userId;

    const payments = await ExamFeePayment.findAll({
      where: { student_id: userId },
      include: [
        {
          model: ExamCycle,
          as: "exam_cycle",
          attributes: ["cycle_name", "exam_month", "exam_year", "semester"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const feePaymentIds = payments
      .map((payment) => payment.fee_payment_id)
      .filter(Boolean);

    const feePaymentMap = await FeesService.getPaymentMapByIds(feePaymentIds, {
      attributes: [
        "id",
        "payment_date",
        "payment_method",
        "transaction_id",
        "status",
      ],
    });

    // Flatten data for frontend expectations
    const flattenedPayments = payments.map((p) => {
      const paymentData = p.toJSON();
      const transaction = feePaymentMap.get(paymentData.fee_payment_id);
      return {
        ...paymentData,
        payment_date: transaction?.payment_date || p.created_at,
        payment_status:
          transaction?.status === "completed"
            ? "success"
            : transaction?.status || "pending",
        transaction,
      };
    });

    res.json({ success: true, data: flattenedPayments });
  } catch (error) {
    logger.error("Get payment history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Process exam fee payment - Create Razorpay Order
 */
async function payExamFee(req, res) {
  try {
    const userId = req.user.userId;
    const exam_cycle_id = req.params.id;

    // 1. Validate cycle and fee config
    const cycle = await ExamCycle.findByPk(exam_cycle_id, {
      include: [
        {
          model: ExamFeeConfiguration,
          as: "fee_configuration",
          include: [{ model: LateFeeSlab, as: "slabs" }],
        },
      ],
    });

    if (!cycle || !cycle.fee_configuration) {
      return res.status(404).json({
        success: false,
        error: "Fee configuration not found for this cycle",
      });
    }

    // 2. Check if already paid
    const existingPayment = await ExamFeePayment.findOne({
      where: { student_id: userId, exam_cycle_id, status: "completed" },
    });

    if (existingPayment) {
      return res
        .status(400)
        .json({ success: false, error: "Fee already paid for this cycle" });
    }

    // 2.5 Check Eligibility via Direct DB Query (Permissions only)
    const eligibility = await ExamStudentEligibility.findOne({
      where: { student_id: userId, exam_cycle_id },
    });

    if (!eligibility) {
      return res.status(403).json({
        success: false,
        error:
          "Eligibility record not found. Please visit the Examination Hub to sync your status.",
      });
    }

    if (!eligibility.fee_clear_permission || !eligibility.hod_permission) {
      let errorMsg = "Ineligible for exam payment: ";
      if (!eligibility.fee_clear_permission)
        errorMsg += "Fee balance detected. ";
      if (!eligibility.hod_permission)
        errorMsg += "Attendance below threshold (HOD permission required).";

      return res.status(403).json({
        success: false,
        error: errorMsg.trim(),
        eligibility: eligibility,
      });
    }

    // 3. Calculate total amount (base + late fine + condonation)
    const baseFee = parseFloat(cycle.fee_configuration.base_fee);
    let totalAmount = baseFee;
    let lateFine = 0;
    const today = new Date().toISOString().split("T")[0];

    if (today > cycle.fee_configuration.regular_end_date) {
      const slabs = cycle.fee_configuration.slabs.sort(
        (a, b) => new Date(b.end_date) - new Date(a.end_date),
      );
      const applicableSlab = slabs.find(
        (s) => today >= s.start_date && today <= s.end_date,
      );
      // console.log("Applicable slab:", applicableSlab);
      if (applicableSlab) {
        lateFine += parseFloat(applicableSlab.fine_amount);
        totalAmount += lateFine;
      } else if (today > cycle.fee_configuration.final_registration_date) {
        return res
          .status(400)
          .json({ success: false, error: "Registration period has ended" });
      }
    }

    let condonation = 0;
    if (eligibility.has_condonation && cycle.condonation_fee_amount) {
      condonation += parseFloat(cycle.condonation_fee_amount);
      totalAmount += condonation;
    }

    // 4. Create Razorpay Order
    const options = {
      amount: Math.round(totalAmount * 100), // amount in paise
      currency: "INR",
      receipt: `exm_${Date.now()}`,
    };

    // console.log("Creating Razorpay order with options:", options);

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        razorpay_order: order,
        cycle_name: cycle.cycle_name,
        amount: {
          base_fee: baseFee,
          late_fine: lateFine,
          condonation: condonation,
          total: totalAmount,
        },
      },
    });
  } catch (error) {
    logger.error("Pay exam fee error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to initiate payment process",
      details: error.description || null,
    });
  }
}

/**
 * Verify Razorpay Payment and finalize records
 */
async function verifyPayment(req, res) {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const exam_cycle_id = req.params.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const isLive =
      process.env.RAZORPAY_MODE === "live" ||
      process.env.NODE_ENV === "production";

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        isLive
          ? process.env.RAZORPAY_KEY_SECRET_LIVE
          : process.env.RAZORPAY_KEY_SECRET,
      )
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid payment signature" });
    }

    // 2. Fetch order to get amount
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const paidAmount = order.amount / 100;

    // 3. Create master FeePayment
    const mainPayment = await FeesService.createPayment(
      {
        student_id: userId,
        amount_paid: paidAmount,
        payment_method: "razorpay",

        transaction_id: razorpay_payment_id,
        status: "completed",
        remarks: `Exam fee payment via Razorpay. Order: ${razorpay_order_id}`,
        payment_date: new Date(),
      },
      { transaction: t },
    );

    // 4. Create ExamFeePayment link
    const examPayment = await ExamFeePayment.create(
      {
        student_id: userId,
        exam_cycle_id,
        fee_payment_id: mainPayment.id,
        fee_type: "Exam Fee",
        amount_paid: paidAmount,
        amount_breakup: amount,
        status: "completed",
      },
      { transaction: t },
    );

    await t.commit();
    res.json({
      success: true,
      data: examPayment,
      message: "Payment verified and recorded successfully",
    });
  } catch (error) {
    await t.rollback();
    logger.error("Verify exam payment error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get students for a specific cycle (Robust Discovery)
 * GET /api/exam/cycles/:id/students
 */
async function getCycleStudents(req, res) {
  try {
    const { id } = req.params;
    const cycle = await ExamCycle.findByPk(id);

    if (!cycle) {
      return res.status(404).json({ success: false, error: "Cycle not found" });
    }

    // 1. Get target programs from Timetable
    const timetables = await ExamTimetable.findAll({
      where: { exam_cycle_id: id, is_deleted: false },
    });

    const timetableCourseIds = [
      ...new Set(timetables.map((timetable) => timetable.course_id).filter(Boolean)),
    ];

    const timetableCourses = await AcademicService.getCoursesByIds(
      timetableCourseIds,
      { attributes: ["id", "name", "code"], raw: true },
    );
    const timetableCourseMap = new Map(
      timetableCourses.map((course) => [course.id, course]),
    );

    const programIds = [
      ...new Set(timetables.flatMap((t) => t.program_id || [])),
    ];

    if (programIds.length === 0) {
      return res.json({
        success: true,
        data: {
          students: [],
          timetables: [],
          filters: { programs: [], sections: [] },
          cycle_info: {
            needs_fee: cycle.needs_fee,
            cycle_name: cycle.cycle_name,
          },
          message: "No programs mapped to this cycle's timetable yet.",
        },
      });
    }

    // 2. Fetch Base Students
    const baseStudents = await CoreService.findAll({
      where: {
        program_id: { [Op.in]: programIds },
        current_semester: cycle.semester,
        role: { [Op.in]: ["student"] },
        is_active: true,
      },
      attributes: [
        "id",
        "student_id",
        "first_name",
        "last_name",
        "section",
        "program_id",
      ],
      order: [["student_id", "ASC"]],
    });

    const programDetails = await AcademicService.getProgramsByIds(programIds, {
      attributes: ["id", "name"],
      raw: true,
    });
    const programMap = new Map(
      programDetails.map((program) => [program.id, program]),
    );

    // 3. Layer in Payment Data if needed
    let paymentsMap = new Map();
    if (cycle.needs_fee) {
      const payments = await ExamFeePayment.findAll({
        where: { exam_cycle_id: id, status: "completed" },
      });
      payments.forEach((p) => paymentsMap.set(p.student_id, p));
    }

    // 4. Layer in Eligibility Data if enabled
    let eligibilityMap = new Map();
    if (cycle.publish_eligibility) {
      const eligibilities = await ExamStudentEligibility.findAll({
        where: { exam_cycle_id: id },
      });
      eligibilities.forEach((e) => eligibilityMap.set(e.student_id, e));
    }

    // 5. Standardize Student List
    const students = baseStudents.map((s) => {
      const payment = paymentsMap.get(s.id);
      const eligibility = eligibilityMap.get(s.id);

      return {
        id: s.id,
        roll_no: s.student_id,
        first_name: s.first_name,
        last_name: s.last_name,
        section: s.section,
        program_id: s.program_id,
        program_name: s.program_id
          ? programMap.get(s.program_id)?.name
          : null,
        payment_status: payment ? "paid" : "pending",
        amount_paid: payment?.amount || 0,
        payment_date: payment?.created_at,
        eligibility_status: eligibility?.status || "pending_sync",
        is_published: cycle.publish_eligibility,
      };
    });

    // 6. Generate Filters from discovered data
    const programsRaw = baseStudents
      .map((s) => ({
        id: s.program_id,
        name: s.program_id ? programMap.get(s.program_id)?.name : null,
      }))
      .filter((p) => p.id);

    const programsMap = new Map();
    programsRaw.forEach((p) => programsMap.set(p.id, p));
    const programs = Array.from(programsMap.values());

    const sections = [...new Set(baseStudents.map((s) => s.section))]
      .filter(Boolean)
      .sort();

    res.json({
      success: true,
      data: {
        students,
        timetables: timetables.map((timetable) => ({
          ...timetable.toJSON(),
          course: timetable.course_id
            ? timetableCourseMap.get(timetable.course_id) || null
            : null,
        })),
        filters: {
          programs,
          sections,
        },
        cycle_info: {
          needs_fee: cycle.needs_fee,
          publish_eligibility: cycle.publish_eligibility,
          cycle_name: cycle.cycle_name,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching cycle students:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export default {
  getAllCycles,
  getCycleById,
  createCycle,
  updateCycle,
  deleteCycle,
  getMyExams,
  getExamPaymentHistory,
  payExamFee,
  verifyPayment,
  getCycleStudents,
};
