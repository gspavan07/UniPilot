const {
  SalaryStructure,
  Payslip,
  User,
  SalaryGrade,
  Department,
  StaffAttendance,
  sequelize,
} = require("../models");
const logger = require("../utils/logger");
const mailService = require("../services/mailService");
const auditService = require("../services/auditService");
const leaveService = require("../services/leaveService");
const { decrypt } = require("../utils/encryption");

// @desc    Get Salary Structure for a Staff
// @route   GET /api/hr/payroll/structure/:user_id
// @access  Private/Admin
exports.getSalaryStructure = async (req, res) => {
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
exports.upsertSalaryStructure = async (req, res) => {
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
      { returning: true }
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
exports.generatePayslip = async (req, res) => {
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
        0
      );

    let totalDeductions = Object.values(structure.deductions || {}).reduce(
      (a, b) => a + getVal(b, structure.basic_salary),
      0
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
        { transaction: t }
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
exports.getBulkPayrollPreview = async (req, res) => {
  try {
    const { department_id, month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and Year are required" });
    }

    const whereUser = {
      role: { [require("sequelize").Op.ne]: "student" },
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
exports.bulkGeneratePayslips = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { department_id, month, year } = req.body;
    const { Op } = require("sequelize");

    // LOP Date Range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    // 1. Find all users with a salary structure
    const whereUser = { role: ["faculty", "staff", "admin", "hr"] };
    if (department_id) whereUser.department_id = department_id;

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
      { transaction: t }
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
          0
        );

      let totalDeductions = Object.values(structure.deductions || {}).reduce(
        (a, b) => a + getVal(b, structure.basic_salary),
        0
      );

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
          { transaction: t }
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
exports.getPayslips = async (req, res) => {
  try {
    const { user_id, year, month, department_id } = req.query;
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
exports.getSalaryGrades = async (req, res) => {
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
exports.upsertSalaryGrade = async (req, res) => {
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
      { returning: true }
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
exports.getPayrollStats = async (req, res) => {
  try {
    // 1. Total Active Staff (Everyone except students)
    const { Op } = require("sequelize");
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
exports.exportBankTransferFile = async (req, res) => {
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

    // Generate CSV Content
    let csv = "Employee Name,Account Number,IFSC Code,Amount,Employee ID\n";
    payslips.forEach((p) => {
      const bank = p.staff.bank_details || {};
      const accNum = decrypt(bank.account_number) || "";
      csv += `"${p.staff.first_name} ${p.staff.last_name}",`;
      csv += `"${accNum}",`;
      csv += `"${bank.ifsc_code || ""}",`;
      csv += `${p.net_salary},`;
      csv += `"${p.staff.employee_id || ""}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Salary_Bank_Transfer_${month}_${year}.csv`
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
exports.confirmPayment = async (req, res) => {
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
      }
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

// @desc    Publish Payslips
// @route   POST /api/hr/payroll/publish
// @access  Private/Admin
exports.publishPayslips = async (req, res) => {
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

    const [updatedCount] = await Payslip.update(
      { status: "published" },
      {
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
          },
        ],
        transaction: t,
      }
    );

    await t.commit();

    // Audit Log
    await auditService.log({
      action: "PAYROLL_PUBLISH",
      actor: req.user,
      details: { count: updatedCount, month, year },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Successfully published ${updatedCount} payslips.`,
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
exports.downloadPayslipPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const PDFDocument = require("pdfkit");

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
      req.user.role
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

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    // --- PDF Design ---

    // Metrics for layout
    const width = 595.28; // A4 Width
    const margin = 50;
    const contentWidth = width - margin * 2;

    // 1. Header
    doc
      .fontSize(24)
      .fillColor("#1a365d")
      .font("Helvetica-Bold")
      .text("UniPilot University", { align: "center" });

    doc.moveDown(0.2);

    doc
      .fontSize(10)
      .fillColor("#718096")
      .font("Helvetica")
      .text("Excellence in Education", { align: "center" });

    doc.moveDown(1.5);

    // Separator
    doc
      .moveTo(margin, doc.y)
      .lineTo(width - margin, doc.y)
      .strokeColor("#e2e8f0")
      .stroke();

    doc.moveDown(1.5);

    // 2. Title Section
    doc
      .fontSize(16)
      .fillColor("#2d3748")
      .font("Helvetica-Bold")
      .text(`Payslip for ${monthName}, ${payslip.year}`, {
        align: "center",
      });

    doc.moveDown(1.5);

    // 3. Employee Details Box
    const startY = doc.y;
    // Background for details
    doc.rect(margin, startY, contentWidth, 85).fillColor("#f7fafc").fill();

    doc.fillColor("#2d3748").font("Helvetica-Bold").fontSize(10);

    // Left Column
    const leftX = margin + 20;
    const rightX = margin + contentWidth / 2 + 20;
    const rowHeight = 20;
    let currentY = startY + 15;

    doc.text("Employee Name:", leftX, currentY);
    doc
      .font("Helvetica")
      .text(
        `${payslip.staff.first_name} ${payslip.staff.last_name}`,
        leftX + 100,
        currentY
      );

    doc.font("Helvetica-Bold").text("Employee ID:", rightX, currentY);
    doc
      .font("Helvetica")
      .text(payslip.staff.employee_id || "N/A", rightX + 80, currentY);

    currentY += rowHeight;

    doc.font("Helvetica-Bold").text("Department:", leftX, currentY);
    doc
      .font("Helvetica")
      .text(payslip.staff.department?.name || "N/A", leftX + 100, currentY);

    doc.font("Helvetica-Bold").text("Designation:", rightX, currentY);
    doc
      .font("Helvetica")
      .text(
        payslip.staff.role
          ? payslip.staff.role.charAt(0).toUpperCase() +
              payslip.staff.role.slice(1)
          : "Staff",
        rightX + 80,
        currentY
      );

    currentY += rowHeight;

    doc.font("Helvetica-Bold").text("Bank:", leftX, currentY);
    doc
      .font("Helvetica")
      .text(
        payslip.staff.bank_details?.bank_name || "-",
        leftX + 100,
        currentY
      );

    doc.font("Helvetica-Bold").text("Account No:", rightX, currentY);
    doc
      .font("Helvetica")
      .text(
        payslip.staff.bank_details?.account_number
          ? `****${String(decrypt(payslip.staff.bank_details.account_number)).slice(-4)}`
          : "-",
        rightX + 80,
        currentY
      );

    doc.moveDown(4);

    // 4. Tables (Earnings & Deductions)

    // Y position for tables
    const tableTop = doc.y;
    const colWidth = contentWidth / 2 - 10;

    // -- Earnings Table --
    doc
      .fillColor("#1a365d")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Earnings", margin, tableTop);

    // Header Line
    doc
      .moveTo(margin, tableTop + 20)
      .lineTo(margin + colWidth, tableTop + 20)
      .strokeColor("#4299e1")
      .lineWidth(2)
      .stroke();

    let earnY = tableTop + 30;

    // Basic
    doc
      .fillColor("#4a5568")
      .font("Helvetica")
      .fontSize(10)
      .text("Basic Salary", margin, earnY);
    doc
      .font("Helvetica-Bold")
      .text(
        `Rs. ${Number(payslip.breakdown?.basic || 0).toLocaleString()}`,
        margin + colWidth - 80,
        earnY,
        { align: "right", width: 80 }
      );
    earnY += 20;

    // Allowances
    if (payslip.breakdown?.allowances) {
      Object.entries(payslip.breakdown.allowances).forEach(([key, val]) => {
        const valObj = typeof val === "object" ? val : { value: val };
        const displayVal = valObj.value; // For now assuming pre-calculated or raw
        // Wait, breakdown stores config. We need calculated values ideally.
        // For simpler MVP, we rely on totalEarnings if breakdown isn't granular with values.
        // Actually, let's assume specific allowances are stored or we just show "Allowances Total" for MVP simplicity
        // OR better: iterate keys.
        doc.font("Helvetica").text(key, margin, earnY);
        // Calculating value roughly if percentage (complex).
        // Strategy: Since valid breakdown with calculated amounts isn't always stored, we list names.
        // BUT wait, a professional payslip needs values.
        // Let's use a workaround: If total earnings > basic, show "Other Allowances" line
      });
      // Correct approach for this MVP data model:
      // Show "Allowances" as a single aggregate or parsed if possible.
      // Let's simplified itemized:
      doc.font("Helvetica").text("Total Allowances", margin, earnY);
      doc
        .font("Helvetica-Bold")
        .text(
          `Rs. ${(Number(payslip.total_earnings) - Number(payslip.breakdown?.basic || 0)).toLocaleString()}`,
          margin + colWidth - 80,
          earnY,
          { align: "right", width: 80 }
        );
      earnY += 20;
    }

    doc
      .moveTo(margin, earnY + 5)
      .lineTo(margin + colWidth, earnY + 5)
      .lineWidth(1)
      .strokeColor("#e2e8f0")
      .stroke();
    earnY += 15;

    doc
      .fillColor("#2d3748")
      .font("Helvetica-Bold")
      .text("Total Earnings", margin, earnY);
    doc.text(
      `Rs. ${Number(payslip.total_earnings).toLocaleString()}`,
      margin + colWidth - 80,
      earnY,
      { align: "right", width: 80 }
    );

    // -- Deductions Table --
    doc
      .fillColor("#1a365d")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Deductions", margin + colWidth + 20, tableTop);
    doc
      .moveTo(margin + colWidth + 20, tableTop + 20)
      .lineTo(margin + colWidth + 20 + colWidth, tableTop + 20)
      .strokeColor("#4299e1")
      .lineWidth(2)
      .stroke();

    let dedY = tableTop + 30;

    // Deductions items
    doc
      .fillColor("#4a5568")
      .font("Helvetica")
      .fontSize(10)
      .text("Total Deductions", margin + colWidth + 20, dedY);
    doc
      .font("Helvetica-Bold")
      .text(
        `Rs. ${Number(payslip.total_deductions).toLocaleString()}`,
        margin + colWidth + 20 + colWidth - 80,
        dedY,
        { align: "right", width: 80 }
      );
    dedY += 20;

    // ... Deductions Itemized logic (similar simplified approach for MVP) ...

    doc
      .moveTo(margin + colWidth + 20, dedY + 25)
      .lineTo(margin + colWidth + 20 + colWidth, dedY + 25)
      .lineWidth(1)
      .strokeColor("#e2e8f0")
      .stroke();
    dedY += 35;

    doc
      .fillColor("#2d3748")
      .font("Helvetica-Bold")
      .text("Total Deductions", margin + colWidth + 20, dedY);
    doc.text(
      `Rs. ${Number(payslip.total_deductions).toLocaleString()}`,
      margin + colWidth + 20 + colWidth - 80,
      dedY,
      { align: "right", width: 80 }
    );

    // 5. Net Pay (Highlighted)
    const maxY = Math.max(earnY, dedY) + 50;

    doc.rect(margin, maxY, contentWidth, 40).fillColor("#edf2f7").fill();
    doc
      .moveTo(margin, maxY)
      .lineTo(margin + contentWidth, maxY)
      .strokeColor("#4299e1")
      .lineWidth(2)
      .stroke();

    doc
      .fillColor("#1a365d")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("NET SALARY PAYABLE", margin + 20, maxY + 13);

    doc
      .fillColor("#2d3748")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(
        `Rs. ${Number(payslip.net_salary).toLocaleString()}`,
        width - margin - 150,
        maxY + 12,
        { align: "right", width: 130 }
      );

    // 6. Footer
    const footerY = maxY + 100;

    doc
      .fontSize(10)
      .fillColor("#718096")
      .font("Helvetica-Oblique")
      .text(
        "This is a system generated payslip and does not require a signature.",
        margin,
        footerY,
        { align: "center" }
      );

    doc
      .fontSize(8)
      .text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        margin,
        footerY + 15,
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "PDF Generation failed" });
    }
  }
};
