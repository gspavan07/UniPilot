import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
import {
  DollarSign,
  Users,
  User,
  Calendar,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  TrendingUp,
  Briefcase,
  Download,
} from "lucide-react";
import {
  bulkGeneratePayslips,
  fetchPayslips,
  fetchPayrollStats,
  fetchBulkPayrollPreview,
  fetchActionPayslips,
  publishPayroll,
  confirmPayout,
  resetOperationStatus,
} from "../../store/slices/hrSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import api from "../../utils/api";

const PayrollDashboard = () => {
  const dispatch = useDispatch();
  const {
    operationStatus,
    operationError,
    payrollStats,
    payrollPreview,
    actionPayslips,
    payslips,
  } = useSelector((state) => state.hr);
  const { users } = useSelector((state) => state.users);
  const { departments } = useSelector((state) => state.departments);

  const [period, setPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [selectedDept, setSelectedDept] = useState("all");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishPreview, setShowPublishPreview] = useState(false);
  const [showPayoutConfirm, setShowPayoutConfirm] = useState(false);
  const [selectedPayslips, setSelectedPayslips] = useState([]);
  const [transactionRef, setTransactionRef] = useState("");

  // Table filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter staff roles - exclude students to show all staff
  const staffUsers = users.filter((u) => u?.role?.toLowerCase() !== "student");

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
    dispatch(fetchPayrollStats());
    dispatch(resetOperationStatus());
  }, [dispatch]);

  // Fetch all payslips (not filtered by period) to show complete status
  useEffect(() => {
    dispatch(
      fetchPayslips({
        department_id: selectedDept === "all" ? null : selectedDept,
      })
    );
  }, [dispatch, selectedDept]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  const handleBulkGenerate = () => {
    dispatch(
      bulkGeneratePayslips({
        department_id: selectedDept === "all" ? null : selectedDept,
        month: Number(period.month),
        year: Number(period.year),
      })
    );
    setShowPreview(false);
  };

  const handleShowPreview = () => {
    dispatch(resetOperationStatus()); // Reset before showing preview
    dispatch(
      fetchBulkPayrollPreview({
        department_id: selectedDept === "all" ? null : selectedDept,
        month: Number(period.month),
        year: Number(period.year),
      })
    );
    setShowPreview(true);
  };

  const handleBankExport = async () => {
    try {
      const response = await api.get("/hr/payroll/export-bank-file", {
        params: {
          month: period.month,
          year: period.year,
          department_id: selectedDept === "all" ? null : selectedDept,
        },
        responseType: "blob",
      });

      // Create a link to download the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Salary_Bank_Transfer_${period.month}_${period.year}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Failed to export bank file:", err);
      // Optional: show a toast/alert
    }
  };

  const handleConfirmPayout = () => {
    dispatch(resetOperationStatus()); // Reset before showing modal
    dispatch(
      fetchActionPayslips({
        month: period.month,
        year: period.year,
        department_id: selectedDept === "all" ? null : selectedDept,
        status: "published",
      })
    );
    setShowPayoutConfirm(true);
  };

  const handlePublishAll = () => {
    dispatch(resetOperationStatus()); // Reset before showing modal
    dispatch(
      fetchActionPayslips({
        month: period.month,
        year: period.year,
        department_id: selectedDept === "all" ? null : selectedDept,
        status: "draft",
      })
    );
    setShowPublishPreview(true);
  };

  const handleFinalizePublish = () => {
    dispatch(
      publishPayroll({
        month: period.month,
        year: period.year,
        department_id: selectedDept === "all" ? null : selectedDept,
      })
    ).then(() => {
      setShowPublishPreview(false);
      dispatch(fetchPayrollStats());
    });
  };

  const handleFinalizePayout = () => {
    if (!transactionRef) return alert("Please enter Transaction Reference");

    // We'll need a way to get the payslip IDs.
    // Usually these are fetched based on the month/year/dept.
    // For now, let's just trigger the confirm for all matching ones via the hook
    dispatch(
      confirmPayout({
        month: period.month,
        year: period.year,
        department_id: selectedDept === "all" ? null : selectedDept,
        transaction_ref: transactionRef,
      })
    ).then(() => {
      setShowPayoutConfirm(false);
    });
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
      {/* Professional Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  Payroll Management
                </h1>
                <p className="text-primary-100 text-sm mt-1">
                  Streamline salary processing & disbursements
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl">
              <Calendar className="w-5 h-5 text-white" />
              <select
                className="select select-sm border-none bg-white/20 text-white font-semibold focus:ring-0 rounded-xl"
                value={period.month}
                onChange={(e) =>
                  setPeriod({ ...period, month: e.target.value })
                }
              >
                {months.map((m, i) => (
                  <option key={m} value={i + 1} className="bg-gray-800">
                    {m}
                  </option>
                ))}
              </select>
              <select
                className="select select-sm border-none bg-white/20 text-white font-semibold focus:ring-0 rounded-xl"
                value={period.year}
                onChange={(e) => setPeriod({ ...period, year: e.target.value })}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="bg-gray-800">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-gradient-to-r from-success-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-in">
          <CheckCircle className="w-8 h-8 flex-shrink-0" />
          <div>
            <p className="font-bold text-lg">Success!</p>
            <p className="text-sm text-white/90">
              Payroll generated successfully for the selected period
            </p>
          </div>
        </div>
      )}

      {operationStatus === "failed" && (
        <div className="bg-gradient-to-r from-error-500 to-red-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-shake">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <div>
            <p className="font-bold text-lg">Error</p>
            <p className="text-sm text-white/90">
              {operationError || "Bulk generation failed. Please try again."}
            </p>
          </div>
        </div>
      )}

      {/* Modern Stats Cards with Glass-morphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                TOTAL
              </span>
            </div>
            <h3 className="text-5xl font-black text-white mb-2">
              {payrollStats.totalStaff}
            </h3>
            <p className="text-indigo-100 font-medium">Active Employees</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
              <span className="px-3 py-1 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400 rounded-full text-xs font-bold">
                STATUS
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Active
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Payroll Cycle Open
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-xs font-bold">
                READY
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              {payrollStats.readinessPercentage}%
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Salary Structures
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <Briefcase className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold">
                UNITS
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              {payrollStats.totalDepartments}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Departments
            </p>
          </div>
        </div>
      </div>

      {/* Main Operations & Quick Actions - Professional Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bulk Payroll Generation - Modern Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/10 dark:to-indigo-900/10 rounded-full blur-3xl -mr-48 -mt-48 opacity-60"></div>

          <div className="relative z-10 p-8 space-y-8">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  Bulk Payroll Generation
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Calculate salaries, allowances, and deductions for all
                  configured staff members. Draft payslips will be created for
                  review before publishing.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Select Department
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="all">🏢 All Personnel</option>
                  <optgroup label="📚 Academic Departments">
                    {departments
                      .filter((d) => d.type === "academic" || !d.type)
                      .map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="⚙️ Administration Teams">
                    {departments
                      .filter((d) => d.type === "administrative")
                      .map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <button
                onClick={handleShowPreview}
                disabled={operationStatus === "loading"}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {operationStatus === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Checking Eligibility...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>Review & Run Payroll</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-800 dark:text-primary-200">
                <strong>Tip:</strong> You can review all draft payslips before
                publishing them for bank transfer. This allows you to verify
                calculations and make adjustments if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar - Modern Design */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-3xl shadow-2xl border border-gray-700">
          {/* Decorative Gradient Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500"></div>

          <div className="relative z-10 p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-2">
                Quick Actions
              </h3>
              <p className="text-gray-400 text-sm">
                Streamline your payroll workflow
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePublishAll}
                className="w-full group relative overflow-hidden bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-indigo-500/50 transition-shadow">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-white text-sm mb-0.5">
                      Publish All Drafts
                    </p>
                    <p className="text-xs text-gray-300">
                      Make ready for bank transfer
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={handleBankExport}
                className="w-full group relative overflow-hidden bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-emerald-500/50 transition-shadow">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-white text-sm mb-0.5">
                      Export Bank File
                    </p>
                    <p className="text-xs text-gray-300">
                      Download CSV for transfer
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={handleConfirmPayout}
                className="w-full group relative overflow-hidden bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-amber-500/50 transition-shadow">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-white text-sm mb-0.5">
                      Confirm Payout
                    </p>
                    <p className="text-xs text-gray-300">
                      Mark as paid & notify
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Status Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Payroll Status Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track payroll generation, publishing, and payment status for all
                employees
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all w-64"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft Only</option>
                <option value="published">Published Only</option>
                <option value="paid">Paid Only</option>
                <option value="not_generated">Not Generated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payroll Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Publish Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {staffUsers
                .filter((user) => {
                  // Search filter
                  const matchesSearch =
                    searchQuery === "" ||
                    user.first_name
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    user.last_name
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    user.employee_id
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase());

                  // Find payslip for this user for the SELECTED period
                  const payslip = payslips?.find(
                    (p) =>
                      (p.user_id === user.id || p.staff_id === user.id) &&
                      p.month === parseInt(period.month) &&
                      p.year === parseInt(period.year)
                  );

                  // Status filter
                  const matchesStatus =
                    statusFilter === "all" ||
                    (statusFilter === "not_generated" && !payslip) ||
                    (payslip && payslip.status === statusFilter);

                  return matchesSearch && matchesStatus;
                })
                .map((user) => {
                  const payslip = payslips?.find(
                    (p) =>
                      (p.user_id === user.id || p.staff_id === user.id) &&
                      p.month === parseInt(period.month) &&
                      p.year === parseInt(period.year)
                  );
                  const status = payslip?.status || "not_generated";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {/* Employee Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                            {user.first_name?.[0]}
                            {user.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {user.employee_id || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {user.department?.name || "N/A"}
                        </p>
                      </td>

                      {/* Period */}
                      <td className="px-6 py-4 text-center">
                        {payslip ? (
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {months[payslip.month - 1]} {payslip.year}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </td>

                      {/* Net Salary */}
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                          {payslip
                            ? `₹${Number(payslip.net_salary).toLocaleString()}`
                            : "-"}
                        </p>
                      </td>

                      {/* Payroll Status */}
                      <td className="px-6 py-4 text-center">
                        {status === "not_generated" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            Not Generated
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400">
                            ✓ Generated
                          </span>
                        )}
                      </td>

                      {/* Publish Status */}
                      <td className="px-6 py-4 text-center">
                        {status === "not_generated" || status === "draft" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                            ✓ Published
                          </span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-4 text-center">
                        {status === "paid" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {/* Empty State */}
          {staffUsers.filter((user) => {
            const matchesSearch =
              searchQuery === "" ||
              user.first_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              user.last_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              user.employee_id
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
            const payslip = payslips.find((p) => p.user_id === user.id);
            const matchesStatus =
              statusFilter === "all" ||
              (statusFilter === "not_generated" && !payslip) ||
              (payslip && payslip.status === statusFilter);
            return matchesSearch && matchesStatus;
          }).length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No employees found matching your filters
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        data={payrollPreview}
        onConfirm={handleBulkGenerate}
        loading={operationStatus === "loading"}
        period={`${months[period.month - 1]} ${period.year}`}
      />

      <PublishPreviewModal
        isOpen={showPublishPreview}
        onClose={() => setShowPublishPreview(false)}
        data={actionPayslips}
        onConfirm={handleFinalizePublish}
        loading={operationStatus === "loading"}
        period={`${months[period.month - 1]} ${period.year}`}
      />

      <PayoutConfirmationModal
        isOpen={showPayoutConfirm}
        onClose={() => setShowPayoutConfirm(false)}
        data={actionPayslips}
        onConfirm={handleFinalizePayout}
        loading={operationStatus === "loading"}
        period={`${months[period.month - 1]} ${period.year}`}
        refValue={transactionRef}
        setRefValue={setTransactionRef}
      />
    </div>
  );
};

const PayoutConfirmationModal = ({
  isOpen,
  onClose,
  data,
  onConfirm,
  loading,
  period,
  refValue,
  setRefValue,
}) => {
  if (!isOpen) return null;

  const totalAmount = data.reduce(
    (sum, ps) => sum + parseFloat(ps.net_salary || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal modal-open bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="modal-box max-w-4xl bg-white dark:bg-gray-800 p-0 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white relative">
          <div className="relative z-10 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <h3 className="text-2xl font-bold">Confirm Disbursement</h3>
            <p className="opacity-80 text-sm">
              Reviewing {data.length} published records for {period}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8 space-y-6">
          <StaffListTable payslips={data} loading={loading} />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Total Payout
              </p>
              <p className="text-2xl font-mono font-bold text-emerald-600">
                ₹{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Staff Count
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.length} Members
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Bank Transaction ID / Reference
            </label>
            <input
              type="text"
              placeholder="e.g. TXN9876543210"
              className="input input-bordered w-full rounded-xl"
              value={refValue}
              onChange={(e) => setRefValue(e.target.value)}
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              This will mark records as <b>Paid</b> and trigger automated email
              notifications to all staff. Verify the Reference ID matches your
              bank portal.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-ghost flex-1 rounded-2xl"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !refValue || data.length === 0}
              className="btn btn-emerald flex-[2] rounded-2xl text-white shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Finalize Payout & Send Emails"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PublishPreviewModal = ({
  isOpen,
  onClose,
  data,
  onConfirm,
  loading,
  period,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal modal-open bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="modal-box max-w-4xl bg-white dark:bg-gray-800 p-0 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 text-white relative text-center">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-80" />
          <h3 className="text-2xl font-bold">Publish Payroll</h3>
          <p className="opacity-80 text-sm">
            Reviewing {data.length} draft payslips for {period}
          </p>
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8 space-y-6">
          <StaffListTable payslips={data} loading={loading} />

          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
            <p className="text-xs text-primary-800 dark:text-primary-200">
              Publishing will finalize these drafts and make them available for{" "}
              <b>Bank Export</b>. You can still review individual records before
              Payout.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-ghost flex-1 rounded-2xl"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || data.length === 0}
              className="btn btn-primary flex-[2] rounded-2xl shadow-lg shadow-primary-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Confirm & Publish All"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffListTable = ({ payslips, loading }) => {
  // Show loading state only when actively loading
  if (loading) {
    return (
      <div className="p-10 text-center bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500 mb-2" />
        <p className="text-gray-400 font-medium">Loading records...</p>
      </div>
    );
  }

  // Show empty state when no data after loading
  if (!payslips || payslips.length === 0) {
    return (
      <div className="p-10 text-center bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
        <AlertCircle className="w-8 h-8 mx-auto text-gray-300 mb-2" />
        <p className="text-gray-400 font-medium">
          No payslips found for this period
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Try generating payroll first or select a different period
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[300px] overflow-y-auto mb-4 modern-scrollbar border border-gray-100 dark:border-gray-700/50 rounded-2xl">
      <table className="table w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              Staff Details
            </th>
            <th className="bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider text-right">
              Net Salary
            </th>
            <th className="bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 text-[10px] uppercase font-bold tracking-wider text-center">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {payslips.map((ps) => (
            <tr
              key={ps.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {ps.staff?.first_name} {ps.staff?.last_name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {ps.staff?.employee_id || "N/A"}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-mono text-sm text-gray-900 dark:text-white font-bold">
                ₹{parseFloat(ps.net_salary).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`badge badge-xs border-none px-2 uppercase text-[8px] font-bold ${
                    ps.status === "published"
                      ? "bg-indigo-100 text-indigo-600"
                      : ps.status === "paid"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ps.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PreviewModal = ({
  isOpen,
  onClose,
  data,
  onConfirm,
  loading,
  period,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal modal-open bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="modal-box max-w-4xl bg-white dark:bg-gray-800 p-0 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-8 text-white relative">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              Payroll Run Preview
            </h3>
            <p className="opacity-80 mt-1">
              Review staff generation for {period}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8">
          <div className="max-h-[400px] overflow-y-auto mb-6 modern-scrollbar">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="bg-transparent text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                    Staff Details
                  </th>
                  <th className="bg-transparent text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                    Department
                  </th>
                  <th className="bg-transparent text-gray-400 text-[10px] uppercase font-bold tracking-wider text-right">
                    Basic Pay
                  </th>
                  <th className="bg-transparent text-gray-400 text-[10px] uppercase font-bold tracking-wider text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {data.map((staff) => (
                  <tr
                    key={staff.userId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {staff.name}
                        </span>
                        <span className="text-xs text-secondary-500">
                          {staff.employeeId}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-500">
                      {staff.department}
                    </td>
                    <td className="py-4 text-right font-mono text-gray-900 dark:text-white">
                      ₹{parseFloat(staff.basicSalary).toLocaleString()}
                    </td>
                    <td className="py-4 text-center">
                      {staff.hasExisting ? (
                        <span className="badge badge-warning text-[10px] border-none px-2">
                          Updating Old
                        </span>
                      ) : (
                        <span className="badge badge-success text-[10px] border-none px-2">
                          New Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl flex items-start gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
            <p className="text-sm text-primary-800 dark:text-primary-200">
              Confirming this will process all <strong>{data.length}</strong>{" "}
              staff members listed above. Generating/Updating draft payslips may
              take a few seconds.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="btn btn-ghost flex-1 rounded-2xl"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="btn btn-primary flex-[2] rounded-2xl shadow-lg shadow-primary-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm and Run Payroll
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PayrollDashboard;
