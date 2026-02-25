import logger from "../../../utils/logger.js";
import mailService from "../services/mailService.js";
import auditService from "../../settings/services/auditService.js";
import leaveService from "../services/leaveService.js";
import { Op } from "sequelize";
import { sequelize } from "../../../config/database.js";
import { Department } from "../../academics/models/index.js";
import { User } from "../../core/models/index.js";
import { Payslip, SalaryGrade, SalaryStructure, StaffAttendance } from "../models/index.js";

// Template imports
import generatePayslipPdf from "../../../templates/hr/payslipPdf.js";
import generateBankTransferCsv from "../../../templates/hr/bankTransferCsv.js";

// @desc    Get Salary Structure for a Staff
// @route   GET /api/hr/payroll/structure/:user_id
// @access  Private/Admin
export const getSalaryStructure = async (req, res) => {
  try {
    const { user_id } = req.params;
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    // Allow if self OR if it's an admin/hr
    const isSelf = String(user_id) === String(requesterId);
    const isPrivileged = [
      "admin",
      "super_admin",
      "hr",
      "hr_admin",
      "administrator",
    ].includes(requesterRole);

    if (!isSelf && !isPrivileged) {
      return res.status(403).json({ success: false, error: "Access Denied" });
    }

    const structure = await SalaryStructure.findOne({ where: { user_id } });

    if (!structure) {
      return res
        .status(404)
        .json({ success: false, message: "Salary structure not defined" });
    }

    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    logger.error("Error getting salary structure:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    Create/Update Salary Structure
// @route   POST /api/hr/payroll/structure
// @access  Private/Admin
export const upsertSalaryStructure = async (req, res) => {
  try {
    const { user_id, basic_salary, grade_id, allowances, deductions } =
      req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, error: "user_id is required" });
    }

    logger.info(`Upserting salary structure for user: ${user_id}`);

    // Ensure numeric types for DB
    const basic = parseFloat(basic_salary || 0);

    // Using upsert (supported in Sequelize 6+ and Postgres)
    // Postgres upsert requires the unique column in the 'where' logic or via conflict
    // Sequelize upsert handles this if unique index exists
    const [structure, created] = await SalaryStructure.upsert(
      {
        user_id,
        basic_salary: basic,
        grade_id: grade_id || null,
        allowances: allowances || {},
        deductions: deductions || {},
      },
      { returning: true },
    );

    logger.info(`Upsert successful. Created: ${created}`);

    // Auto-assign leave balances if grade is linked
    if (grade_id) {
      await leaveService.syncBalances(user_id, grade_id);
    }

    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    logger.error("Error saving salary structure:", error);
    res.status(500).json({ error: error.message || "Save failed" });
  }
};

// @desc    Generate Payslip
// @route   POST /api/hr/payroll/generate
// @access  Private/Admin
export const generatePayslip = async (req, res) => {
  // Transactional generation
  const t = await sequelize.transaction();
  try {
    const { user_id, month, year } = req.body;

    // 1. Fetch Salary Structure
    const structure = await SalaryStructure.findOne({ where: { user_id } });
    if (!structure) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Salary structure not defined for user" });
    }

    // 2. Fetch User (for name etc)
    const user = await User.findByPk(user_id);

    // Helper to calculate actual value from component (Fixed or Percentage)
    const getVal = (comp, basic) => {
      if (typeof comp === "object" && comp?.type === "percentage") {
        return (parseFloat(basic || 0) * parseFloat(comp.value || 0)) / 100;
      }
      return parseFloat(typeof comp === "object" ? comp.value : comp || 0);
    };

    // 3. Logic: Attendance based deduction?
    // For MVP, simplistic generation based on structure.
    let totalEarnings =
      parseFloat(structure.basic_salary) +
      Object.values(structure.allowances || {}).reduce(
        (a, b) => a + getVal(b, structure.basic_salary),
        0,
      );

    let totalDeductions = Object.values(structure.deductions || {}).reduce(
      (a, b) => a + getVal(b, structure.basic_salary),
      0,
    );

    // TODO: Calc LOP (Loss of Pay) from Attendance if needed

    const netSalary = totalEarnings - totalDeductions;

    const breakdown = {
      basic: structure.basic_salary,
      allowances: structure.allowances,
      deductions: structure.deductions,
    };

    const [payslip, created] = await Payslip.findOrCreate({
      where: { user_id, month, year },
      defaults: {
        total_earnings: totalEarnings,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        breakdown,
        status: "draft",
        generated_date: new Date(),
      },
      transaction: t,
    });

    if (!created) {
      await payslip.update(
        {
          total_earnings: totalEarnings,
          total_deductions: totalDeductions,
          net_salary: netSalary,
          breakdown,
          generated_date: new Date(),
        },
        { transaction: t },
      );
    }

    res.status(200).json({ success: true, data: payslip });
  } catch (error) {
    if (t) await t.rollback();
    logger.error("Error generating payslip:", error);
    res.status(500).json({ error: "Generation failed" });
  }
};

// @desc    Get Bulk Payroll Preview
// @route   GET /api/hr/payroll/preview-bulk
// @access  Private/Admin
export const getBulkPayrollPreview = async (req, res) => {
  try {
    const { department_id, month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and Year are required" });
    }

    const whereUser = {
      role: { [Op.ne]: "student" },
      is_active: true,
    };
    if (department_id && department_id !== "all") {
      whereUser.department_id = department_id;
    }

    const structures = await SalaryStructure.findAll({
      include: [
        {
          model: User,
          as: "staff",
          where: whereUser,
          attributes: ["id", "first_name", "last_name", "employee_id", "role"],
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    // Check existing payslips for these users in this period
    const userIds = structures.map((s) => s.user_id);
    const existingPayslips = await Payslip.findAll({
      where: {
        user_id: userIds,
        month: parseInt(month),
        year: parseInt(year),
      },
      attributes: ["user_id", "status"],
    });

    const payslipMap = existingPayslips.reduce((acc, p) => {
      acc[p.user_id] = p.status;
      return acc;
    }, {});

    const previewData = structures.map((s) => ({
      userId: s.user_id,
      name: `${s.staff.first_name} ${s.staff.last_name}`,
      employeeId: s.staff.employee_id,
      role: s.staff.role,
      department: s.staff.department?.name || "N/A",
      basicSalary: s.basic_salary,
      hasExisting: !!payslipMap[s.user_id],
      status: payslipMap[s.user_id] || "pending",
    }));

    res.status(200).json({
      success: true,
      data: previewData,
    });
  } catch (error) {
    logger.error("Error fetching payroll preview:", error);
    res.status(500).json({ error: "Preview failed" });
  }
};

// @desc    Bulk Generate Payslips
// @route   POST /api/hr/payroll/bulk-generate
// @access  Private/Admin
export const bulkGeneratePayslips = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { department_id } = req.body; // Remove month/year destructuring here to parse them
    let { month, year } = req.body;

    month = parseInt(month);
    year = parseInt(year);

    if (isNaN(month) || isNaN(year)) {
      if (t) await t.rollback();
      return res
        .status(400)
        .json({ error: "Valid Month and Year are required" });
    }


    // LOP Date Range (Format as YYYY-MM-DD for DATEONLY consistency)
    // Javascript months are 0-indexed for Date constructor

    // Start Date: 1st of the month
    const startObj = new Date(year, month - 1, 1);
    // End Date: 0th day of next month = Last day of current month
    const endObj = new Date(year, month, 0);

    // Formatting helper
    const formatDate = (d) => d.toISOString().split("T")[0];

    // Handle timezone offset helper if needed, but for DATEONLY, ISO string part is usually safe if constructed with local year/month
    // Better safeguard:
    const sYear = startObj.getFullYear();
    const sMonth = String(startObj.getMonth() + 1).padStart(2, "0");
    const sDay = String(startObj.getDate()).padStart(2, "0");
    const startDate = `${sYear}-${sMonth}-${sDay}`;

    const eYear = endObj.getFullYear();
    const eMonth = String(endObj.getMonth() + 1).padStart(2, "0");
    const eDay = String(endObj.getDate()).padStart(2, "0");
    const endDate = `${eYear}-${eMonth}-${eDay}`;

    // 1. Find all users with a salary structure
    const whereUser = {
      role: { [Op.ne]: "student" },
      is_active: true,
    };
    if (department_id && department_id !== "all")
      whereUser.department_id = department_id;

    const structures = await SalaryStructure.findAll(
      {
        include: [
          {
            model: User,
            as: "staff",
            where: whereUser,

            required: true,
          },
          {
            model: SalaryGrade,
            as: "grade",
          },
        ],
      },
      { transaction: t },
    );

    if (!structures.length) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        error:
          "No staff with salary structures found for the selected criteria",
      });
    }

    const results = [];
    const getVal = (comp, basic) => {
      if (typeof comp === "object" && comp?.type === "percentage") {
        return (parseFloat(basic || 0) * parseFloat(comp.value || 0)) / 100;
      }
      return parseFloat(typeof comp === "object" ? comp.value : comp || 0);
    };

    for (const structure of structures) {
      let totalEarnings =
        parseFloat(structure.basic_salary) +
        Object.values(structure.allowances || {}).reduce(
          (a, b) => a + getVal(b, structure.basic_salary),
          0,
        );

      let totalDeductions = Object.values(structure.deductions || {}).reduce(
        (a, b) => a + getVal(b, structure.basic_salary),
        0,
      );

      // --- Pro-rata Calculation (For New Joinees) ---
      let prorataFactor = 1.0;
      let isProrata = false;
      let effectiveDays = 0;
      let monthDays = endObj.getDate(); // e.g. 28, 30, 31

      if (structure.staff.joining_date) {
        const joinDate = new Date(structure.staff.joining_date);
        // Reset time to ensure strict date comparison
        joinDate.setHours(0, 0, 0, 0);

        // If joined AFTER start of this month AND BEFORE/ON end of this month
        if (joinDate > startObj && joinDate <= endObj) {
          isProrata = true;
          // Calculate days active in this month
          // joinDate to endObj inclusive
          const diffTime = Math.abs(endObj - joinDate);
          const activeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          effectiveDays = activeDays;
          prorataFactor = activeDays / monthDays;

          // Apply Factor to Earnings (Basic + Fixed Allowances)
          totalEarnings = Math.round(totalEarnings * prorataFactor);
          // Deductions usually also prorated? Yes, for monthly fixed deductions.
          // However, keeping deductions full might be safer for things like insurance?
          // Standard practice: Prorate everything fixed.
          totalDeductions = Math.round(totalDeductions * prorataFactor);
        }
      }
      // ----------------------------------------------

      // --- LOP Calculation ---
      let lopDays = 0;
      let lopAmount = 0;
      const attendance = await StaffAttendance.findAll({
        where: {
          user_id: structure.user_id,
          date: { [Op.between]: [startDate, endDate] },
          status: { [Op.in]: ["absent", "half-day"] },
        },
        attributes: ["status"],
        transaction: t,
      });

      attendance.forEach((att) => {
        if (att.status === "absent") lopDays += 1;
        if (att.status === "half-day") lopDays += 0.5;
      });

      if (lopDays > 0) {
        // Use Grade LOP Config or Default
        const config = structure.grade?.lop_config || {
          basis: "basic",
          deduction_factor: 1.0,
        };
        const basisAmount =
          config.basis === "gross"
            ? totalEarnings
            : parseFloat(structure.basic_salary);

        const factor = parseFloat(config.deduction_factor || 1.0);
        const dailyRate = (basisAmount / 30) * factor;

        lopAmount = Math.round(lopDays * dailyRate);
        totalDeductions += lopAmount;
      }
      // -----------------------

      const netSalary = totalEarnings - totalDeductions;
      const breakdown = {
        basic: structure.basic_salary,
        allowances: structure.allowances,
        deductions: { ...structure.deductions },
      };

      if (isProrata) {
        breakdown.prorata = {
          is_active: true,
          joining_date: structure.staff.joining_date,
          factor: prorataFactor.toFixed(2),
          effective_days: effectiveDays,
          month_days: monthDays,
        };
        // Note: basic in breakdown is usually the Reference Basic.
        // Real paid basic is hidden in totalEarnings, but let's clarify nicely?
        // For now, simple breakdown is fine.
      }

      if (lopAmount > 0) {
        breakdown.deductions["loss_of_pay"] = {
          name: "Loss of Pay",
          value: lopAmount,
          days: lopDays,
          type: "deduction",
        };
      }

      const [payslip, created] = await Payslip.findOrCreate({
        where: { user_id: structure.user_id, month, year },
        defaults: {
          total_earnings: totalEarnings,
          total_deductions: totalDeductions,
          net_salary: netSalary,
          breakdown,
          status: "draft",
          generated_date: new Date(),
        },
        transaction: t,
      });

      if (!created) {
        await payslip.update(
          {
            total_earnings: totalEarnings,
            total_deductions: totalDeductions,
            net_salary: netSalary,
            breakdown,
            generated_date: new Date(),
          },
          { transaction: t },
        );
      }
      results.push(payslip.id);
    }

    await t.commit();

    // Audit Log
    await auditService.log({
      action: "PAYROLL_BULK_GENERATE",
      actor: req.user,
      details: { count: results.length, month, year, department_id },
      req,
    });

    res.status(200).json({
      success: true,
      count: results.length,
      message: `Successfully generated ${results.length} payslips.`,
    });
  } catch (error) {
    if (t) await t.rollback();
    logger.error("Error in bulk generation:", error);
    res.status(500).json({ error: error.message || "Bulk generation failed" });
  }
};

// @desc    Get Payslips (My Payslips or Admin View)
// @route   GET /api/hr/payroll/payslips
// @access  Private
// @desc    Get Payslips (My Payslips or Admin View)
// @route   GET /api/hr/payroll/payslips
// @access  Private
export const getPayslips = async (req, res) => {
  try {
    const { user_id, year, month, department_id, status } = req.query;
    const requesterRole = req.user.role;
    const privilegedRoles = ["admin", "super_admin", "hr", "hr_admin"];
    const isPrivileged = privilegedRoles.includes(requesterRole);

    const where = {};
    const userWhere = {};

    // 1. User Scope Logic
    if (user_id) {
      // Specific user requested
      if (!isPrivileged && String(user_id) !== String(req.user.userId)) {
        return res.status(403).json({ success: false, error: "Access Denied" });
      }
      where.user_id = user_id;
    } else if (!isPrivileged) {
      // Non-privileged user defaults to seeing only their own
      where.user_id = req.user.userId;
    }
    // If isPrivileged AND no user_id, we fetch for ALL users (Admin Dashboard View)

    // 2. Apply Filters
    if (year) where.year = year;
    if (month) where.month = month;
    if (status) where.status = status;

    if (department_id && department_id !== "all") {
      userWhere.department_id = department_id;
    }

    // 3. Execute Query
    const payslips = await Payslip.findAll({
      where,
      include: [
        {
          model: User,
          as: "staff",
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined, // Only apply if filters exist
          attributes: [
            "id",
            "first_name",
            "last_name",
            "employee_id",
            "department_id",
          ],
        },
      ],
      order: [
        ["year", "DESC"],
        ["month", "DESC"],
        ["generated_date", "DESC"],
      ],
    });

    res.status(200).json({ success: true, data: payslips });
  } catch (error) {
    logger.error("Error fetching payslips:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
};

// --- Salary Grades ---

// @desc    Get all salary grades
// @route   GET /api/hr/payroll/grades
// @access  Private/Admin
export const getSalaryGrades = async (req, res) => {
  try {
    const grades = await SalaryGrade.findAll();
    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    logger.error("Error fetching salary grades:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
};

// @desc    Create/Update salary grade
// @route   POST /api/hr/payroll/grades
// @access  Private/Admin
export const upsertSalaryGrade = async (req, res) => {
  try {
    const {
      id,
      name,
      basic_salary,
      allowances,
      deductions,
      description,
      leave_policy,
      lop_config,
    } = req.body;

    const [grade, created] = await SalaryGrade.upsert(
      {
        id: id || undefined,
        name,
        basic_salary,
        allowances: allowances || {},
        deductions: deductions || {},
        description,
        leave_policy: leave_policy || [],
        lop_config: lop_config || { basis: "basic", deduction_factor: 1.0 },
      },
      { returning: true },
    );

    // Propagate leave policy changes to all assigned users
    if (grade && grade.id) {
      await leaveService.syncAllUsersForGrade(grade.id);
    }

    res.status(200).json({ success: true, data: grade });
  } catch (error) {
    logger.error("Error upserting salary grade:", error);
    res.status(500).json({ error: error.message || "Save failed" });
  }
};

// @desc    Get Payroll Statistics
// @route   GET /api/hr/payroll/stats
// @access  Private/Admin
export const getPayrollStats = async (req, res) => {
  try {
    // 1. Total Active Staff (Everyone except students)
    const staffCount = await User.count({
      where: {
        role: { [Op.ne]: "student" },
        is_active: true,
      },
    });

    // 2. Configured Salary Structures
    const configuredCount = await SalaryStructure.count();

    // 3. Department Count
    const deptCount = await Department.count();

    // 4. Percentage Ready
    const readiness =
      staffCount > 0 ? Math.round((configuredCount / staffCount) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStaff: staffCount,
        configuredStaff: configuredCount,
        totalDepartments: deptCount,
        readinessPercentage: readiness,
      },
    });
  } catch (error) {
    logger.error("Error fetching payroll stats:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
};
// @desc    Export Bank Transfer File (CSV)
// @route   GET /api/hr/payroll/export-bank-file
// @access  Private/Admin
export const exportBankTransferFile = async (req, res) => {
  try {
    const { department_id, month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and Year are required" });
    }

    const whereUser = { is_active: true };
    if (department_id && department_id !== "all") {
      whereUser.department_id = department_id;
    }

    const payslips = await Payslip.findAll({
      where: {
        month: parseInt(month),
        year: parseInt(year),
        status: "published", // Only export published slips
      },
      include: [
        {
          model: User,
          as: "staff",
          where: whereUser,
          attributes: [
            "first_name",
            "last_name",
            "bank_details",
            "employee_id",
          ],
        },
      ],
    });

    if (!payslips.length) {
      return res.status(404).json({
        success: false,
        message: "No published payslips found for this period",
      });
    }

    // Use template module to generate CSV
    const csv = generateBankTransferCsv(payslips);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Salary_Bank_Transfer_${month}_${year}.csv`,
    );
    res.status(200).send(csv);
  } catch (error) {
    logger.error("Error exporting bank file:", error);
    res.status(500).json({ error: "Export failed" });
  }
};

// @desc    Confirm Batch Payout
// @route   POST /api/hr/payroll/confirm-payout
// @access  Private/Admin
export const confirmPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      payslip_ids,
      transaction_ref,
      payment_date,
      month,
      year,
      department_id,
    } = req.body;

    let targetIds = payslip_ids;

    // If no explicit IDs, find all published slips for the period/dept
    if (!targetIds || !targetIds.length) {
      if (!month || !year) {
        await t.rollback();
        return res.status(400).json({
          error: "Either payslip_ids or period (month/year) must be provided",
        });
      }

      const whereUser = {};
      if (department_id && department_id !== "all") {
        whereUser.department_id = department_id;
      }

      const slips = await Payslip.findAll({
        where: {
          month: parseInt(month),
          year: parseInt(year),
          status: "published",
        },
        include: [
          { model: User, as: "staff", where: whereUser, attributes: ["id"] },
        ],
        transaction: t,
      });
      targetIds = slips.map((s) => s.id);
    }

    if (!targetIds || !targetIds.length) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "No published payslips found to confirm" });
    }

    const [updatedCount] = await Payslip.update(
      {
        status: "paid",
        transaction_ref,
        payment_date: payment_date || new Date(),
      },
      {
        where: { id: targetIds },
        transaction: t,
      },
    );

    // Trigger Email Notifications
    const payslipDetails = await Payslip.findAll({
      where: { id: targetIds },
      include: [
        {
          model: User,
          as: "staff",
          attributes: ["first_name", "last_name", "email"],
        },
      ],
      transaction: t,
    });

    for (const ps of payslipDetails) {
      if (ps.staff && ps.staff.email) {
        mailService.sendPayslipNotification(ps.staff, ps).catch((err) => {
          logger.error(`Failed to send email to ${ps.staff.email}:`, err);
        });
      }
    }

    await t.commit();

    // Audit Log
    await auditService.log({
      action: "PAYROLL_PAYOUT",
      actor: req.user,
      details: { count: updatedCount, month, year, department_id },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Successfully confirmed payment for ${updatedCount} staff members.`,
    });
  } catch (error) {
    if (t) await t.rollback();
    logger.error("Error confirming payment:", error);
    res.status(500).json({ error: "Payment confirmation failed" });
  }
};

// @desc    Get Publish Stats (Preview)
// @route   GET /api/hr/payroll/publish/stats
// @access  Private/Admin
export const getPublishStats = async (req, res) => {
  try {
    const { month, year, department_id } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and Year are required" });
    }

    const whereUser = {};
    if (department_id && department_id !== "all") {
      whereUser.department_id = department_id;
    }

    // 1. Fetch eligible drafts
    const drafts = await Payslip.findAll({
      where: {
        month: parseInt(month),
        year: parseInt(year),
        status: "draft",
      },
      include: [
        {
          model: User,
          as: "staff",
          where: whereUser,
          attributes: [
            "id",
            "first_name",
            "last_name",
            "bank_details",
            "employee_id",
          ],
          include: [
            { model: Department, as: "department", attributes: ["name"] },
          ],
        },
      ],
    });

    const total = drafts.length;
    let readyCount = 0;
    const notReadyList = [];

    // 2. Validate
    for (const slip of drafts) {
      const bank = slip.staff?.bank_details || {};
      const missing = [];

      const accNum = String(bank.account_number || "").trim();

      if (!bank.account_number || accNum.length < 5)
        missing.push("Account Number");
      if (!bank.ifsc_code) missing.push("IFSC Code");
      if (!bank.bank_name) missing.push("Bank Name");
      if (!bank.holder_name) missing.push("Account Holder Name");

      if (missing.length === 0) {
        readyCount++;
      } else {
        notReadyList.push({
          id: slip.staff.id,
          employee_id: slip.staff.employee_id,
          name: `${slip.staff.first_name} ${slip.staff.last_name}`,
          department: slip.staff.department?.name || "N/A",
          missing_fields: missing,
        });
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        total_drafts: total,
        ready_count: readyCount, // Valid
        not_ready_count: notReadyList.length, // Invalid
      },
      details: notReadyList,
    });
  } catch (error) {
    logger.error("Error fetching publish stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// @desc    Publish Payslips
// @route   POST /api/hr/payroll/publish
// @access  Private/Admin
export const publishPayslips = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { month, year, department_id } = req.body;

    if (!month || !year) {
      if (t) await t.rollback();
      return res.status(400).json({ error: "Month and Year are required" });
    }

    const whereUser = {};
    if (department_id && department_id !== "all") {
      whereUser.department_id = department_id;
    }

    // 1. Fetch eligible drafts with user bank details
    const drafts = await Payslip.findAll({
      where: {
        month: parseInt(month),
        year: parseInt(year),
        status: "draft",
      },
      include: [
        {
          model: User,
          as: "staff",
          where: whereUser,
          attributes: ["id", "first_name", "last_name", "bank_details"],
        },
      ],
      transaction: t,
    });

    if (drafts.length === 0) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "No draft payslips found to publish." });
    }

    const validIds = [];
    const failedUsers = [];

    // 2. Validate Bank Details
    for (const slip of drafts) {
      const bank = slip.staff?.bank_details || {};
      const isValid =
        bank.account_number &&
        bank.ifsc_code &&
        bank.bank_name &&
        String(bank.account_number).trim().length > 5;

      if (isValid) {
        validIds.push(slip.id);
      } else {
        failedUsers.push({
          id: slip.staff.id,
          name: `${slip.staff.first_name} ${slip.staff.last_name}`,
          reason: "Incomplete Bank Details",
        });
      }
    }

    if (validIds.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: "No users have valid bank details. Cannot publish any payslips.",
        failed_users: failedUsers,
      });
    }

    // 3. Update Status for Valid IDs
    const [updatedCount] = await Payslip.update(
      { status: "published" },
      {
        where: { id: validIds },
        transaction: t,
      },
    );

    await t.commit();

    // Audit Log
    await auditService.log({
      action: "PAYROLL_PUBLISH",
      actor: req.user,
      details: {
        count: updatedCount,
        month,
        year,
        skipped: failedUsers.length,
      },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Published ${updatedCount} payslips. ${failedUsers.length} skipped due to missing bank details.`,
      data: {
        published: updatedCount,
        skipped: failedUsers.length,
        skipped_details: failedUsers,
      },
    });
  } catch (error) {
    if (t) await t.rollback();
    logger.error("Error publishing payslips:", error);
    res.status(500).json({ error: "Publish failed" });
  }
};

// @desc    Download Payslip PDF
// @route   GET /api/hr/payroll/payslip/:id/download
// @access  Private
export const downloadPayslipPdf = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch Payslip with details
    const payslip = await Payslip.findByPk(id, {
      include: [
        {
          model: User,
          as: "staff",
          include: [{ model: Department, as: "department" }],
        },
      ],
    });

    if (!payslip) {
      return res.status(404).json({ error: "Payslip not found" });
    }

    // Authorization: Own payslip or HR/Admin
    const isSelf = req.user.userId === payslip.user_id;
    const isPrivileged = ["admin", "super_admin", "hr", "hr_admin"].includes(
      req.user.role,
    );

    if (!isSelf && !isPrivileged) {
      return res.status(403).json({ error: "Access Denied" });
    }

    // 2. Setup PDF Stream
    const monthName = new Date(0, payslip.month - 1).toLocaleString("default", {
      month: "long",
    });
    const filename = `Payslip_${payslip.staff.employee_id}_${monthName}_${payslip.year}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Use template module to generate PDF
    await generatePayslipPdf(payslip, payslip.staff, res);
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "PDF Generation failed" });
    }
  }
};

export default {
  getSalaryStructure,
  upsertSalaryStructure,
  generatePayslip,
  getBulkPayrollPreview,
  bulkGeneratePayslips,
  getPayslips,
  getSalaryGrades,
  upsertSalaryGrade,
  getPayrollStats,
  exportBankTransferFile,
  confirmPayment,
  getPublishStats,
  publishPayslips,
  downloadPayslipPdf,
};
