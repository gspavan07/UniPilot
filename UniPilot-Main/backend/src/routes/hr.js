import express from "express";
const router = express.Router();
import { authenticate, checkPermission } from "../middleware/auth.js";
import staffAttendanceController from "../controllers/staffAttendanceController.js";
import payrollController from "../controllers/payrollController.js";
import hrDashboardController from "../controllers/hrDashboardController.js";

// Staff Attendance Routes
router.post(
  "/attendance/mark",
  authenticate,
  checkPermission("hr:attendance:manage"),
  staffAttendanceController.markAttendance,
);
router.get(
  "/attendance/daily-view",
  authenticate,
  checkPermission("hr:attendance:manage"),
  staffAttendanceController.getDailyAttendanceView,
);
router.get(
  "/attendance",
  authenticate,
  checkPermission("hr:attendance:view"),
  staffAttendanceController.getStats,
);
router.get(
  "/my-attendance",
  authenticate,
  staffAttendanceController.getMyAttendance,
);
// Dashboard Stats
router.get(
  "/dashboard/stats",
  authenticate,
  checkPermission("hr:staff:view"),
  hrDashboardController.getDashboardStats,
);
router.get(
  "/hod/dashboard-stats",
  authenticate,
  hrDashboardController.getHodDashboardStats,
);

// Leave Management
router.get(
  "/leave/approvals",
  authenticate,
  checkPermission("hr:leaves:manage"),
  staffAttendanceController.getPendingApprovals,
);
router.get(
  "/leave/my-requests",
  authenticate,
  staffAttendanceController.getMyLeaveRequests,
);
router.get(
  "/leave/requests/:user_id",
  authenticate,
  checkPermission("hr:leaves:manage"),
  staffAttendanceController.getUserLeaveRequests,
);
router.post("/leave/apply", authenticate, staffAttendanceController.applyLeave);
router.put(
  "/leave/:id",
  authenticate,
  checkPermission("hr:leaves:manage"),
  staffAttendanceController.updateLeaveStatus,
);
router.get(
  "/leave/balances",
  authenticate,
  staffAttendanceController.getLeaveBalances,
);

// Payroll Routes
router.get(
  "/payroll/structure/:user_id",
  authenticate,
  payrollController.getSalaryStructure,
);
router.post(
  "/payroll/structure",
  authenticate,
  checkPermission("hr:staff:manage"),
  payrollController.upsertSalaryStructure,
);
router.post(
  "/payroll/generate",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.generatePayslip,
);
router.get(
  "/payroll/preview-bulk",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.getBulkPayrollPreview,
);
router.post(
  "/payroll/bulk-generate",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.bulkGeneratePayslips,
);
// Payslip download
router.get(
  "/payroll/payslip/:id/download",
  authenticate,
  payrollController.downloadPayslipPdf,
);
router.get("/payroll/payslips", authenticate, payrollController.getPayslips); // Staff can view own
router.get(
  "/payroll/stats",
  authenticate,
  checkPermission("hr:payroll:view"),
  payrollController.getPayrollStats,
);
router.get(
  "/payroll/export-bank-file",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.exportBankTransferFile,
);
router.get(
  "/payroll/publish/stats",
  authenticate,
  checkPermission("hr:payroll:publish"),
  payrollController.getPublishStats,
);
router.post(
  "/payroll/publish-payout",
  authenticate,
  checkPermission("hr:payroll:publish"),
  payrollController.publishPayslips,
);
router.post(
  "/payroll/confirm-payout",
  authenticate,
  checkPermission("hr:payroll:publish"),
  payrollController.confirmPayment,
);

// Salary Grades
router.get(
  "/payroll/grades",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.getSalaryGrades,
);
router.post(
  "/payroll/grades",
  authenticate,
  checkPermission("hr:payroll:manage"),
  payrollController.upsertSalaryGrade,
);

export default router;
