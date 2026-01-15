const express = require("express");
const router = express.Router();
const { authenticate, checkPermission } = require("../middleware/auth");
const staffAttendanceController = require("../controllers/staffAttendanceController");
const payrollController = require("../controllers/payrollController");
const hrDashboardController = require("../controllers/hrDashboardController");

// Staff Attendance Routes
router.post(
  "/attendance/mark",
  authenticate,
  checkPermission("hr:attendance:manage"),
  staffAttendanceController.markAttendance
);
router.get(
  "/attendance/daily-view",
  authenticate,
  checkPermission("hr:attendance:manage"),
  staffAttendanceController.getDailyAttendanceView
);
router.get(
  "/attendance",
  authenticate,
  checkPermission("hr:attendance:manage"),
  staffAttendanceController.getStats
);
router.get(
  "/my-attendance",
  authenticate,
  staffAttendanceController.getMyAttendance
);
// Dashboard Stats
router.get(
  "/dashboard/stats",
  authenticate,
  checkPermission("hr:staff:manage"),
  hrDashboardController.getDashboardStats
);

// Leave Management
router.get(
  "/leave/approvals",
  authenticate,
  staffAttendanceController.getPendingApprovals
);
router.get(
  "/leave/my-requests",
  authenticate,
  staffAttendanceController.getMyLeaveRequests
);
router.get(
  "/leave/requests/:user_id",
  authenticate,
  checkPermission("hr:leaves:manage"),
  staffAttendanceController.getUserLeaveRequests
);
router.post("/leave/apply", authenticate, staffAttendanceController.applyLeave);
router.put(
  "/leave/:id",
  authenticate,
  checkPermission("hr:leaves:manage"),
  staffAttendanceController.updateLeaveStatus
);
router.get(
  "/leave/balances",
  authenticate,
  staffAttendanceController.getLeaveBalances
);

// Payroll Routes
router.get(
  "/payroll/structure/:user_id",
  authenticate,
  payrollController.getSalaryStructure
);
router.post(
  "/payroll/structure",
  authenticate,
  checkPermission("hr:staff:manage"),
  payrollController.upsertSalaryStructure
);
router.post(
  "/payroll/generate",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.generatePayslip
);
router.get(
  "/payroll/preview-bulk",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.getBulkPayrollPreview
);
router.post(
  "/payroll/bulk-generate",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.bulkGeneratePayslips
);
// Payslip download
router.get(
  "/payroll/payslip/:id/download",
  authenticate,
  payrollController.downloadPayslipPdf
);
router.get("/payroll/payslips", authenticate, payrollController.getPayslips); // Staff can view own
router.get(
  "/payroll/stats",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.getPayrollStats
);
router.get(
  "/payroll/export-bank-file",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.exportBankTransferFile
);
router.post(
  "/payroll/publish-payout",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.publishPayslips
);
router.post(
  "/payroll/confirm-payout",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.confirmPayment
);

// Salary Grades
router.get(
  "/payroll/grades",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.getSalaryGrades
);
router.post(
  "/payroll/grades",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.upsertSalaryGrade
);

module.exports = router;
