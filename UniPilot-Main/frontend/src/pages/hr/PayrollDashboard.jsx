import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  ArrowLeft,
  ChevronDown,
  Filter,
  Search
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
  fetchPublishStats,
} from "../../store/slices/hrSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import api from "../../utils/api";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PayrollDashboard = () => {
  const dispatch = useDispatch();
  const {
    operationStatus,
    operationError,
    payrollStats,
    payrollPreview,
    actionPayslips,
    payslips,
    publishStats
  } = useSelector((state) => state.hr);
  const { users } = useSelector((state) => state.users);
  const { departments } = useSelector((state) => state.departments);
  const { user } = useSelector((state) => state.auth);

  const hasPermission = (perm) => {
    return user?.role === "super_admin" || user?.permissions?.includes(perm);
  };

  const [period, setPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [selectedDept, setSelectedDept] = useState("all");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishPreview, setShowPublishPreview] = useState(false);
  const [showPayoutConfirm, setShowPayoutConfirm] = useState(false);
  const [showPublishStats, setShowPublishStats] = useState(false);
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
    dispatch(resetOperationStatus());
    dispatch(
      fetchPublishStats({
        month: period.month,
        year: period.year,
        department_id: selectedDept === "all" ? null : selectedDept,
      })
    );
    setShowPublishStats(true);
  };

  const handleFinalizePublish = () => {
    dispatch(
      publishPayroll({
        month: period.month,
        year: period.year,
        department_id: selectedDept === "all" ? null : selectedDept,
      })
    ).then(() => {
      setShowPublishStats(false); // Close stats modal
      dispatch(fetchPayrollStats());
      dispatch(
        // Refresh payslips list
        fetchPayslips({
          department_id: selectedDept === "all" ? null : selectedDept,
        })
      );
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

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 space-y-8">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => window.history.back()}
              className="mt-1 flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 shadow-sm active:scale-95 group"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                Payroll Management
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
                  Admin
                </span>
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Process salaries, manage disbursements, and view financial reports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center px-4 py-2 border-r border-slate-100">
              <Calendar className="w-5 h-5 text-slate-400 mr-2" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Period</span>
            </div>
            <select
              className="px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              value={period.month}
              onChange={(e) => setPeriod({ ...period, month: e.target.value })}
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <div className="w-px h-6 bg-slate-200"></div>
            <select
              className="px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              value={period.year}
              onChange={(e) => setPeriod({ ...period, year: e.target.value })}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Notifications */}
        {showSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Operation Successful</p>
              <p className="text-sm opacity-90">Payroll data has been processed successfully.</p>
            </div>
          </div>
        )}

        {operationStatus === "failed" && (
          <div className="bg-red-50 border border-red-100 text-red-800 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Operation Failed</p>
              <p className="text-sm opacity-90">{operationError || "An unexpected error occurred. Please try again."}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Active Employees", value: payrollStats.totalStaff, icon: Users, color: "blue" },
            { label: "Cycle Status", value: "Active", sub: "Processing", icon: CheckCircle, color: "emerald" },
            { label: "Readiness", value: `${payrollStats.readinessPercentage}%`, sub: "Structures Ready", icon: TrendingUp, color: "indigo" },
            { label: "Total Departments", value: payrollStats.totalDepartments, icon: Briefcase, color: "amber" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity bg-${stat.color}-500 rounded-bl-3xl`}>
                <stat.icon className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                {stat.sub && <p className="text-slate-400 text-sm font-medium mt-1">{stat.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Action Area */}
          {hasPermission("hr:payroll:manage") && (
            <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 z-0"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Bulk Payroll Generation</h2>
                    <p className="text-slate-500 text-sm">Calculate and generate draft payslips for staff.</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Target Audience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer hover:border-blue-300 transition-colors"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                    >
                      <option value="all">Entire University Staff</option>
                      <optgroup label="Academic Departments">
                        {departments.filter((d) => d.type === "academic" || !d.type).map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Administrative Units">
                        {departments.filter((d) => d.type === "administrative").map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <button
                  onClick={handleShowPreview}
                  disabled={operationStatus === "loading"}
                  className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-200 hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {operationStatus === "loading" ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>Preview & Generate Run</span>
                      <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400 font-medium mt-4">
                  Drafts will be created for review. No notifications are sent at this stage.
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              Quick Actions
            </h3>

            <div className="flex-1 space-y-3">
              {hasPermission("hr:payroll:publish") && (
                <button onClick={handlePublishAll} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700 group-hover:text-blue-700">Publish Drafts</span>
                    <CheckCircle className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                  </div>
                  <p className="text-xs text-slate-500">Finalize drafts for bank export</p>
                </button>
              )}

              {hasPermission("hr:payroll:manage") && (
                <button onClick={handleBankExport} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700 group-hover:text-emerald-700">Bank Export</span>
                    <Download className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-500">Download CSV for transfer</p>
                </button>
              )}

              {hasPermission("hr:payroll:publish") && (
                <button onClick={handleConfirmPayout} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700 group-hover:text-amber-700">Confirm Payout</span>
                    <DollarSign className="w-5 h-5 text-slate-300 group-hover:text-amber-500" />
                  </div>
                  <p className="text-xs text-slate-500">Mark paid & notify staff</p>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payroll Records</h3>
              <p className="text-sm text-slate-500">Manage status for individual records</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
                <input
                  type="text"
                  placeholder="Find employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                />
              </div>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-4 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="paid">Paid</option>
                <option value="not_generated">Missing</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Net Salary</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Stage</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffUsers.filter(user => {
                  const matchesSearch = searchQuery === "" ||
                    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());

                  const payslip = payslips?.find(p =>
                    (p.user_id === user.id || p.staff_id === user.id) &&
                    p.month === parseInt(period.month) &&
                    p.year === parseInt(period.year)
                  );

                  const matchesStatus = statusFilter === "all" ||
                    (statusFilter === "not_generated" && !payslip) ||
                    (payslip && payslip.status === statusFilter);

                  return matchesSearch && matchesStatus;
                }).map(user => {
                  const payslip = payslips?.find(p =>
                    (p.user_id === user.id || p.staff_id === user.id) &&
                    p.month === parseInt(period.month) &&
                    p.year === parseInt(period.year)
                  );
                  const status = payslip?.status || "not_generated";

                  return (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${status === 'not_generated' ? 'bg-slate-300' : 'bg-blue-600'}`}>
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-slate-500">{user.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600 truncate max-w-[150px] block" title={user.department?.name}>{user.department?.name || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono text-sm font-bold ${payslip ? 'text-slate-900' : 'text-slate-300'}`}>
                          {payslip ? `₹${Number(payslip.net_salary).toLocaleString()}` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {status === "not_generated" && <span className="inline-flex py-1 px-3 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">Missing</span>}
                        {status === "draft" && <span className="inline-flex py-1 px-3 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">Draft</span>}
                        {status === "published" && <span className="inline-flex py-1 px-3 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">Published</span>}
                        {status === "paid" && <span className="inline-flex py-1 px-3 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Paid</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {payslip && (
                          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">View</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {staffUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modals */}
      <PublishStatsModal
        isOpen={showPublishStats}
        onClose={() => setShowPublishStats(false)}
        stats={publishStats?.stats ? publishStats : null}
        onConfirm={handleFinalizePublish}
        loading={operationStatus === "loading"}
      />

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

const ModalBase = ({ isOpen, onClose, title, icon: Icon, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            {Icon && <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Icon className="w-5 h-5" /></div>}
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <div className="sr-only">Close</div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

const PayoutConfirmationModal = ({ isOpen, onClose, data, onConfirm, loading, period, refValue, setRefValue }) => {
  const totalAmount = data?.reduce((sum, ps) => sum + parseFloat(ps.net_salary || 0), 0) || 0;
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Confirm Disbursement" icon={CheckCircle}>
      <div className="space-y-6">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
          <p className="text-slate-500 font-medium mb-1">Total Payout for {period}</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight">₹{totalAmount.toLocaleString()}</p>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider">{data?.length} Records Selected</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction Reference ID</label>
          <input
            type="text"
            placeholder="e.g. TXN-2026-001"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={refValue}
            onChange={(e) => setRefValue(e.target.value)}
          />
          <p className="text-xs text-slate-400">Required for reconciliation.</p>
        </div>

        <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-xl border border-amber-100 flex gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>This action is irreversible. Employees will be notified via email.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading || !refValue}
            className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Confirm Payout"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

const PublishPreviewModal = ({ isOpen, onClose, data, onConfirm, loading, period }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Publish Payroll" icon={FileText}>
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-slate-600 text-lg">You are about to publish <strong className="text-slate-900">{data?.length}</strong> payslips for <strong className="text-slate-900">{period}</strong>.</p>
          <p className="text-slate-400 text-sm mt-1">This will lock the drafts and prepare them for bank export.</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 max-h-[300px] overflow-y-auto border border-blue-100">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-blue-400 uppercase font-bold sticky top-0 bg-blue-50">
              <tr><th className="pb-2">Employee</th><th className="pb-2 text-right">Net Pay</th></tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {data?.map(ps => (
                <tr key={ps.id}>
                  <td className="py-2 text-blue-900 font-medium">{ps.staff?.first_name} {ps.staff?.last_name}</td>
                  <td className="py-2 text-right font-mono text-blue-800">₹{parseFloat(ps.net_salary).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Publish All"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

const PreviewModal = ({ isOpen, onClose, data, onConfirm, loading, period }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Run Preview" icon={DollarSign}>
      <div className="space-y-6">
        <p className="text-slate-600">Review the target audience for the <strong>{period}</strong> payroll run.</p>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">Employee List</span>
            <span className="text-xs font-bold text-slate-500 uppercase">{data?.length} Entries</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto bg-white p-0">
            <table className="w-full text-sm">
              <thead className="bg-white sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="text-left py-2 px-4 text-xs font-bold text-slate-400 uppercase">Staff</th>
                  <th className="text-left py-2 px-4 text-xs font-bold text-slate-400 uppercase">Dept</th>
                  <th className="text-right py-2 px-4 text-xs font-bold text-slate-400 uppercase">Basic</th>
                  <th className="text-center py-2 px-4 text-xs font-bold text-slate-400 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.map(staff => (
                  <tr key={staff.userId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-700">{staff.name}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{staff.department}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">₹{parseFloat(staff.basicSalary).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${staff.hasExisting ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {staff.hasExisting ? 'Update' : 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-[2] py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Confirm Generation"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

const PublishStatsModal = ({ isOpen, onClose, stats, onConfirm, loading }) => {
  if (!stats) return null;
  const { stats: numbers, details } = stats;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Validation Report" icon={CheckCircle}>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
            <span className="block text-2xl font-black text-slate-900">{numbers.total_drafts}</span>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Drafts</span>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
            <span className="block text-2xl font-black text-emerald-600">{numbers.ready_count}</span>
            <span className="text-xs font-bold text-emerald-600/70 uppercase">Ready</span>
          </div>
          <div className="bg-rose-50 p-4 rounded-xl text-center border border-rose-100">
            <span className="block text-2xl font-black text-rose-600">{numbers.not_ready_count}</span>
            <span className="text-xs font-bold text-rose-600/70 uppercase">Issues</span>
          </div>
        </div>

        {numbers.not_ready_count > 0 ? (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
            <h4 className="font-bold text-rose-800 text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Invalid Records ({numbers.not_ready_count})
            </h4>
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
              {details.map(item => (
                <div key={item.id} className="bg-white p-2 rounded border border-rose-100 shadow-sm text-xs flex justify-between items-center">
                  <span className="font-bold text-slate-700">{item.name}</span>
                  <span className="text-rose-500 font-medium">Missing: {item.missing_fields.join(", ")}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-600/70 mt-3 font-medium px-1">* Invalid records will be skipped during publishing.</p>
          </div>
        ) : (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-2 border border-emerald-100">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium text-sm">All checks passed. Ready to publish.</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={numbers.ready_count === 0 || loading}
            className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : `Publish ${numbers.ready_count} Records`}
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

export default PayrollDashboard;
