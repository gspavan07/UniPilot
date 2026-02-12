import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../store/slices/userSlice";
import {
  fetchSalaryStructure,
  fetchLeaveBalances,
  fetchPayslips,
  fetchStaffAttendance,
  upsertSalaryStructure,
  generatePayslip,
  fetchSalaryGrades,
} from "../../store/slices/hrSlice";

import {
  User,
  Calendar,
  Briefcase,
  DollarSign,
  FileText,
  Mail,
  Phone,
  MapPin,
  Award,
  Clock,
  X,
  XCircle,
  AlertCircle,
  Minus,
  Plus,
  Trash2,
  Info,
  Download,
} from "lucide-react";
import api from "../../utils/api";
import AttendanceCalendar from "../../components/hr/AttendanceCalendar";
import { toast } from "react-hot-toast";

// Sub-components would ideally be in separate files, combining here for brevity
const OverviewTab = ({ user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
    <div className="card p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <User className="w-5 h-5 mr-2 text-primary-500" /> Personal Details
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <span className="text-gray-500">Full Name</span>
          <span className="font-medium">
            {user.first_name} {user.last_name}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <span className="text-gray-500">Email</span>
          <span className="font-medium flex items-center">
            <Mail className="w-3 h-3 mr-1" /> {user.email}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <span className="text-gray-500">Phone</span>
          <span className="font-medium flex items-center">
            <Phone className="w-3 h-3 mr-1" /> {user.phone || "N/A"}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <span className="text-gray-500">Gender</span>
          <span className="font-medium capitalize">{user.gender}</span>
        </div>
      </div>
    </div>

    <div className="card p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Briefcase className="w-5 h-5 mr-2 text-secondary-500" /> Employment
        Details
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <span className="text-gray-500">Employee ID</span>
          <span className="font-medium font-mono">{user.employee_id}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <span className="text-gray-500">Department</span>
          <span className="font-medium">{user.department?.name || "N/A"}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <span className="text-gray-500">Role</span>
          <span className="font-medium capitalize">{user.role}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <span className="text-gray-500">Joining Date</span>
          <span className="font-medium">{user.joining_date || "N/A"}</span>
        </div>
      </div>
    </div>
  </div>
);

const BankDetailsTab = ({ user, onUpdate, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
    holder_name: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.bank_details) {
      setFormData({
        bank_name: user.bank_details.bank_name || "",
        account_number: user.bank_details.account_number || "",
        ifsc_code: user.bank_details.ifsc_code || "",
        branch_name: user.bank_details.branch_name || "",
        holder_name: user.bank_details.holder_name || "",
      });
    }
  }, [user]);

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    const masked = "X".repeat(accountNumber.length - 4);
    return masked + lastFour;
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      formData.ifsc_code &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)
    ) {
      newErrors.ifsc_code = "Invalid IFSC code format (e.g., SBIN0001234)";
    }

    if (
      formData.account_number &&
      !/^\d{9,18}$/.test(formData.account_number)
    ) {
      newErrors.account_number = "Account number should be 9-18 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/bank-details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsEditing(false);
        if (onUpdate) onUpdate(data.data.bank_details);
        alert("Bank details updated successfully!");
      } else {
        alert(data.error || "Failed to update bank details");
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      alert("Failed to update bank details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user?.bank_details) {
      setFormData({
        bank_name: user.bank_details.bank_name || "",
        account_number: user.bank_details.account_number || "",
        ifsc_code: user.bank_details.ifsc_code || "",
        branch_name: user.bank_details.branch_name || "",
        holder_name: user.bank_details.holder_name || "",
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-success-500" /> Bank
            Account Details
          </h3>
          <div className="flex gap-2">
            {canEdit && isEditing && (
              <button
                className="btn btn-sm btn-ghost text-gray-500"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            {canEdit && (
              <button
                className={`btn btn-sm ${isEditing ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Edit Details"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl space-y-4">
          {/* Account Holder Name */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
              Account Holder Name
            </label>
            {isEditing ? (
              <input
                type="text"
                className="input input-bordered w-full bg-white dark:bg-gray-900"
                value={formData.holder_name}
                onChange={(e) =>
                  setFormData({ ...formData, holder_name: e.target.value })
                }
                placeholder="Enter account holder name"
              />
            ) : (
              <p className="text-lg font-medium">
                {formData.holder_name || "Not specified"}
              </p>
            )}
          </div>

          {/* Bank Name */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
              Bank Name
            </label>
            {isEditing ? (
              <input
                type="text"
                className="input input-bordered w-full bg-white dark:bg-gray-900"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
                placeholder="Enter bank name"
              />
            ) : (
              <p className="text-lg font-medium">
                {formData.bank_name || "Not specified"}
              </p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
              Account Number
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  className={`input input-bordered w-full bg-white dark:bg-gray-900 ${
                    errors.account_number ? "border-error-500" : ""
                  }`}
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  placeholder="Enter account number (9-18 digits)"
                />
                {errors.account_number && (
                  <p className="text-error-500 text-xs mt-1">
                    {errors.account_number}
                  </p>
                )}
              </>
            ) : (
              <p className="text-lg font-medium font-mono">
                {formData.account_number
                  ? maskAccountNumber(formData.account_number)
                  : "Not specified"}
              </p>
            )}
          </div>

          {/* IFSC Code */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
              IFSC Code
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  className={`input input-bordered w-full bg-white dark:bg-gray-900 uppercase ${
                    errors.ifsc_code ? "border-error-500" : ""
                  }`}
                  value={formData.ifsc_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ifsc_code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., SBIN0001234"
                  maxLength={11}
                />
                {errors.ifsc_code && (
                  <p className="text-error-500 text-xs mt-1">
                    {errors.ifsc_code}
                  </p>
                )}
              </>
            ) : (
              <p className="text-lg font-medium font-mono">
                {formData.ifsc_code || "Not specified"}
              </p>
            )}
          </div>

          {/* Branch Name */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
              Branch Name
            </label>
            {isEditing ? (
              <input
                type="text"
                className="input input-bordered w-full bg-white dark:bg-gray-900"
                value={formData.branch_name}
                onChange={(e) =>
                  setFormData({ ...formData, branch_name: e.target.value })
                }
                placeholder="Enter branch name"
              />
            ) : (
              <p className="text-lg font-medium">
                {formData.branch_name || "Not specified"}
              </p>
            )}
          </div>
        </div>

        {!isEditing &&
          (!formData.bank_name ||
            !formData.account_number ||
            !formData.ifsc_code) && (
            <div className="mt-4 p-4 bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-900/20 rounded-xl flex items-start">
              <Info className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-warning-700 dark:text-warning-400">
                <p className="font-bold mb-1">Incomplete Bank Details</p>
                <p>
                  Please complete the bank details for salary disbursement and
                  other financial transactions.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

const PayslipBreakdownModal = ({ isOpen, onClose, slip }) => {
  if (!isOpen || !slip) return null;

  const breakdown = slip.breakdown || {};
  const allowances = Object.entries(breakdown.allowances || {});
  const deductions = Object.entries(breakdown.deductions || {});

  // Helper to get raw and calculated values
  const resolve = (raw, basic) => {
    const isPct = typeof raw === "object" && raw?.type === "percentage";
    const val = isPct
      ? (Number(basic) * Number(raw.value)) / 100
      : Number(typeof raw === "object" ? raw.value : raw || 0);
    return { val, label: isPct ? `(${raw.value}%)` : "" };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Salary Breakdown
            </h2>
            <p className="text-sm text-gray-500">
              Period: {slip.month}/{slip.year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Earnings */}
          <section>
            <h4 className="text-xs font-bold text-success-600 uppercase tracking-widest mb-3 flex items-center">
              <Plus className="w-3 h-3 mr-1" /> Earnings & Allowances
            </h4>

            {/* Pro-rata Info Banner */}
            {breakdown.prorata && (
              <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-xs">
                <p className="font-bold text-blue-800 dark:text-blue-300 mb-1">
                  ℹ️ Pro-Rata Adjustment
                </p>
                <div className="grid grid-cols-2 gap-2 text-blue-700 dark:text-blue-400">
                  <span>
                    Joined:{" "}
                    {new Date(
                      breakdown.prorata.joining_date
                    ).toLocaleDateString()}
                  </span>
                  <span>
                    Paid Days: {breakdown.prorata.effective_days} /{" "}
                    {breakdown.prorata.month_days}
                  </span>
                </div>
                <p className="mt-1 opacity-80">
                  Salary calculated for {breakdown.prorata.effective_days}{" "}
                  active days only.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                <div>
                  <span className="text-gray-600 dark:text-gray-400 block">
                    Basic Pay
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Fixed Monthly Pay
                  </span>
                </div>
                <span className="font-bold">
                  ₹{Number(breakdown.basic || 0).toLocaleString()}
                </span>
              </div>
              {allowances.map(([name, raw]) => {
                const { val, label } = resolve(raw, breakdown.basic);
                return (
                  <div
                    key={name}
                    className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {name}{" "}
                      <span className="text-[10px] opacity-60 ml-1">
                        {label}
                      </span>
                    </span>
                    <span className="font-bold">₹{val.toLocaleString()}</span>
                  </div>
                );
              })}
              <div className="flex justify-between py-3 text-success-600 font-bold bg-success-50 dark:bg-success-900/10 px-3 rounded-lg mt-2">
                <span>Total Earnings</span>
                <span>₹{Number(slip.total_earnings).toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Deductions */}
          <section>
            <h4 className="text-xs font-bold text-error-600 uppercase tracking-widest mb-3 flex items-center">
              <Minus className="w-3 h-3 mr-1" /> Statutory Deductions
            </h4>
            <div className="space-y-2">
              {deductions.map(([name, raw]) => {
                const { val, label } = resolve(raw, breakdown.basic);
                // Special handling for LOP display
                const isLOP = name === "loss_of_pay" && typeof raw === "object";

                return (
                  <div
                    key={name}
                    className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700"
                  >
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {isLOP ? "Loss of Pay (Absence)" : name}
                      </span>
                      {isLOP && (
                        <span className="block text-[10px] text-error-400">
                          Deducted for {raw.days} day(s)
                        </span>
                      )}
                      {!isLOP && label && (
                        <span className="text-[10px] opacity-60 ml-1">
                          {label}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-error-500">
                      ₹{val.toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {deductions.length === 0 && (
                <p className="text-xs text-center text-gray-400 py-2">
                  No deductions applied
                </p>
              )}
              <div className="flex justify-between py-3 text-error-600 font-bold border-t border-error-100 dark:border-error-900/20 mt-2">
                <span>Total Deductions</span>
                <span>₹{Number(slip.total_deductions).toLocaleString()}</span>
              </div>
            </div>
          </section>
          {/* Net Salary Summary */}
          <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-900/20">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-primary-700 dark:text-primary-400">
                Net Take-Home Salary
              </span>
              <span className="text-2xl font-black text-primary-700 dark:text-primary-400 font-mono">
                ₹{Number(slip.net_salary).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 text-center">
          <button onClick={onClose} className="btn btn-secondary w-full">
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

const PayrollTab = ({
  user,
  salaryStructure,
  payslips,
  dispatch,
  handleDownload,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const filteredPayslips = payslips.filter((p) => {
    if (filterYear !== "all" && p.year !== parseInt(filterYear)) return false;
    if (filterMonth !== "all" && p.month !== parseInt(filterMonth))
      return false;
    return true;
  });
  const [genPeriod, setGenPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // Calculate unique years from payslips for Filter
  const yearOptions = useMemo(() => {
    const years = new Set(payslips.map((p) => p.year));
    // Add current year if not present (so user can filter for current year even if no slips yet)
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [payslips]);

  // Options for Generating/Creating (Current - 1 to Current + 1)
  const creationYearOptions = useMemo(() => {
    const curr = new Date().getFullYear();
    return [curr - 1, curr, curr + 1];
  }, []);

  const currentUser = useSelector((state) => state.auth.user);
  const { salaryGrades } = useSelector((state) => state.hr);
  const isHR = ["admin", "super_admin", "hr", "hr_admin"].includes(
    currentUser?.role?.toLowerCase()
  );

  const [formData, setFormData] = useState({
    basic_salary: 0,
    allowances: [],
    deductions: [],
    grade_id: "",
  });

  useEffect(() => {
    if (isHR) {
      dispatch(fetchSalaryGrades());
    }
  }, [dispatch, isHR]);

  const resetForm = () => {
    if (salaryStructure) {
      setFormData({
        basic_salary: salaryStructure.basic_salary || 0,
        grade_id: salaryStructure.grade_id || "",
        allowances: Object.entries(salaryStructure.allowances || {}).map(
          ([name, val]) => {
            if (typeof val === "object")
              return { name, value: val.value, type: val.type };
            return { name, value: val, type: "fixed" };
          }
        ),
        deductions: Object.entries(salaryStructure.deductions || {}).map(
          ([name, val]) => {
            if (typeof val === "object")
              return { name, value: val.value, type: val.type };
            return { name, value: val, type: "fixed" };
          }
        ),
      });
    } else {
      setFormData({
        basic_salary: 0,
        allowances: [],
        deductions: [],
        grade_id: "",
      });
    }
  };

  useEffect(() => {
    resetForm();
  }, [salaryStructure]);

  const handleCancel = () => {
    resetForm();
    setEditMode(false);
  };

  const addComponent = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], { name: "", value: 0, type: "fixed" }],
    }));
  };

  const removeComponent = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updateComponent = (type, index, field, val) => {
    const newList = [...formData[type]];
    newList[index][field] = val;
    setFormData({ ...formData, [type]: newList });
  };

  const calculateActualValue = (comp) => {
    if (comp.type === "percentage") {
      return (Number(formData.basic_salary) * Number(comp.value)) / 100;
    }
    return Number(comp.value);
  };

  const handleSave = () => {
    if (!user?.id) {
      console.error("No user ID found for saving salary structure");
      return;
    }

    const allowancesObj = {};
    formData.allowances.forEach((a) => {
      if (a.name)
        allowancesObj[a.name] = { value: Number(a.value), type: a.type };
    });

    const deductionsObj = {};
    formData.deductions.forEach((d) => {
      if (d.name)
        deductionsObj[d.name] = { value: Number(d.value), type: d.type };
    });

    dispatch(
      upsertSalaryStructure({
        user_id: user.id,
        basic_salary: Number(formData.basic_salary),
        grade_id: formData.grade_id || null,
        allowances: allowancesObj,
        deductions: deductionsObj,
      })
    );
    setEditMode(false);
  };

  const handleGenerate = () => {
    dispatch(
      generatePayslip({
        user_id: user.id,
        month: Number(genPeriod.month),
        year: Number(genPeriod.year),
      })
    );
  };

  const totalEarnings =
    Number(formData.basic_salary) +
    formData.allowances.reduce((sum, a) => sum + calculateActualValue(a), 0);
  const totalDeductions = formData.deductions.reduce(
    (sum, d) => sum + calculateActualValue(d),
    0
  );
  const netSalary = totalEarnings - totalDeductions;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Configuration Card */}
      <div className="card p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-success-500" /> Salary
            Configuration
          </h3>
          <div className="flex gap-2">
            {isHR && editMode && (
              <button
                className="btn btn-sm btn-ghost text-gray-500"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
            {isHR && (
              <button
                className={`btn btn-sm ${editMode ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => (editMode ? handleSave() : setEditMode(true))}
              >
                {editMode ? "Save Changes" : "Edit Structure"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Pay & Grade */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isHR && editMode && (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
                    Assign Salary Grade (Template)
                  </label>
                  <select
                    className="select select-bordered w-full bg-white dark:bg-gray-900"
                    value={formData.grade_id}
                    onChange={(e) => {
                      const grade = salaryGrades.find(
                        (g) => g.id === e.target.value
                      );
                      if (grade) {
                        setFormData({
                          ...formData,
                          grade_id: grade.id,
                          basic_salary: grade.basic_salary,
                          allowances: Object.entries(
                            grade.allowances || {}
                          ).map(([name, val]) => ({
                            name,
                            value: typeof val === "object" ? val.value : val,
                            type: typeof val === "object" ? val.type : "fixed",
                          })),
                          deductions: Object.entries(
                            grade.deductions || {}
                          ).map(([name, val]) => ({
                            name,
                            value: typeof val === "object" ? val.value : val,
                            type: typeof val === "object" ? val.type : "fixed",
                          })),
                        });
                      } else {
                        setFormData({ ...formData, grade_id: "" });
                      }
                    }}
                  >
                    <option value="">Custom (No Template)</option>
                    {salaryGrades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} (₹{Number(g.basic_salary).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
                  Basic Salary (Monthly)
                </label>
                {editMode ? (
                  <input
                    type="number"
                    className="input input-bordered w-full bg-white dark:bg-gray-900"
                    value={formData.basic_salary}
                    onChange={(e) =>
                      setFormData({ ...formData, basic_salary: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-2xl font-mono font-bold">
                    ₹{Number(formData.basic_salary).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allowances */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-gray-500 uppercase flex items-center">
                  Allowances <Plus className="w-3 h-3 ml-2 text-success-500" />
                </h4>
                {editMode && (
                  <button
                    onClick={() => addComponent("allowances")}
                    className="btn btn-xs btn-ghost text-primary-500"
                  >
                    Add
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {formData.allowances.map((a, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    {editMode ? (
                      <>
                        <input
                          placeholder="Name"
                          className="input input-sm flex-1 bg-white dark:bg-gray-900"
                          value={a.name}
                          onChange={(e) =>
                            updateComponent(
                              "allowances",
                              i,
                              "name",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="number"
                          className="input input-sm w-20 bg-white dark:bg-gray-900"
                          value={a.value}
                          onChange={(e) =>
                            updateComponent(
                              "allowances",
                              i,
                              "value",
                              e.target.value
                            )
                          }
                        />
                        <button
                          onClick={() =>
                            updateComponent(
                              "allowances",
                              i,
                              "type",
                              a.type === "fixed" ? "percentage" : "fixed"
                            )
                          }
                          className="btn btn-xs btn-square"
                        >
                          {a.type === "fixed" ? "₹" : "%"}
                        </button>
                        <button
                          onClick={() => removeComponent("allowances", i)}
                          className="btn btn-xs btn-ghost text-error-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex justify-between w-full text-sm">
                        <span>
                          {a.name} {a.type === "percentage" && `(${a.value}%)`}
                        </span>
                        <span className="font-bold">
                          ₹{calculateActualValue(a).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-gray-500 uppercase flex items-center">
                  Deductions <Minus className="w-3 h-3 ml-2 text-error-500" />
                </h4>
                {editMode && (
                  <button
                    onClick={() => addComponent("deductions")}
                    className="btn btn-xs btn-ghost text-primary-500"
                  >
                    Add
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {formData.deductions.map((d, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    {editMode ? (
                      <>
                        <input
                          placeholder="Name"
                          className="input input-sm flex-1 bg-white dark:bg-gray-900"
                          value={d.name}
                          onChange={(e) =>
                            updateComponent(
                              "deductions",
                              i,
                              "name",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="number"
                          className="input input-sm w-20 bg-white dark:bg-gray-900"
                          value={d.value}
                          onChange={(e) =>
                            updateComponent(
                              "deductions",
                              i,
                              "value",
                              e.target.value
                            )
                          }
                        />
                        <button
                          onClick={() =>
                            updateComponent(
                              "deductions",
                              i,
                              "type",
                              d.type === "fixed" ? "percentage" : "fixed"
                            )
                          }
                          className="btn btn-xs btn-square"
                        >
                          {d.type === "fixed" ? "₹" : "%"}
                        </button>
                        <button
                          onClick={() => removeComponent("deductions", i)}
                          className="btn btn-xs btn-ghost text-error-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex justify-between w-full text-sm">
                        <span>
                          {d.name} {d.type === "percentage" && `(${d.value}%)`}
                        </span>
                        <span className="font-bold text-error-500">
                          ₹{calculateActualValue(d).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Row */}
          <div className="border-t pt-6 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">
                Net Salary
              </p>
              <p className="text-3xl font-black text-primary-600">
                ₹{netSalary.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History Card */}
      <div className="card p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
            <h3 className="text-lg font-bold whitespace-nowrap">
              My Payslips & Receipts
            </h3>

            {/* Search Filters - Available to everyone */}
            <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-100 dark:border-gray-700 w-full sm:w-auto">
              <select
                className="select select-sm select-ghost w-full sm:w-auto focus:bg-transparent"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="all">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "short",
                    })}
                  </option>
                ))}
              </select>
              <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
              <select
                className="select select-sm select-ghost w-full sm:w-auto focus:bg-transparent"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="all">All Years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isHR && (
            <div className="flex flex-wrap gap-2 items-center bg-primary-50 dark:bg-primary-900/20 p-2 rounded-xl border border-primary-100 dark:border-primary-800/30 w-full xl:w-auto">
              <span className="text-xs font-bold text-primary-700 dark:text-primary-300 px-2 uppercase tracking-wide">
                New Entry:
              </span>
              <select
                className="select select-sm select-ghost text-primary-700 dark:text-primary-300"
                value={genPeriod.month}
                onChange={(e) =>
                  setGenPeriod({ ...genPeriod, month: e.target.value })
                }
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "short",
                    })}
                  </option>
                ))}
              </select>
              <select
                className="select select-sm select-ghost text-primary-700 dark:text-primary-300"
                value={genPeriod.year}
                onChange={(e) =>
                  setGenPeriod({ ...genPeriod, year: e.target.value })
                }
              >
                {creationYearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                className="btn btn-sm btn-primary shadow-lg shadow-primary-500/20"
              >
                Generate
              </button>
            </div>
          )}
        </div>
        <div className="space-y-4 mt-4">
          {filteredPayslips.map((slip) => {
            const date = new Date(0, slip.month - 1);
            const monthShort = date.toLocaleString("default", {
              month: "short",
            });
            const monthLong = date.toLocaleString("default", {
              month: "long",
            });

            return (
              <div
                key={slip.id}
                className="group flex flex-col md:flex-row items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Left: Icon & Period */}
                <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center border border-primary-100 dark:border-gray-600 shadow-inner">
                    <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
                      {monthShort}
                    </span>
                    <span className="text-lg font-black text-gray-900 dark:text-white leading-none mt-0.5">
                      {slip.year}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                      {monthLong} {slip.year}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {slip.status === "paid" && (
                        <div className="badge badge-success badge-sm gap-1 pl-1.5 pr-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          Paid
                        </div>
                      )}
                      {slip.status === "published" && (
                        <div className="badge badge-info badge-sm gap-1 pl-1.5 pr-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          Published
                        </div>
                      )}
                      {slip.status === "draft" && (
                        <div className="badge badge-warning badge-sm gap-1 pl-1.5 pr-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          Processing
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">
                      Net Pay
                    </p>
                    <p className="text-xl font-black text-gray-900 dark:text-white font-mono">
                      ₹{Number(slip.net_salary).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Download Button - Enhanced Visibility */}
                    <button
                      onClick={() => handleDownload(slip.id)}
                      className="btn btn-sm btn-outline btn-primary rounded-lg flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSlip(slip);
                        setIsBreakdownOpen(true);
                      }}
                      className="btn btn-sm bg-gray-900 text-white hover:bg-black border-none shadow-lg shadow-gray-200 dark:shadow-none rounded-lg px-4 flex items-center gap-2 transition-transform active:scale-95"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPayslips.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No Payslips Found
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-xs mt-1">
                Payslips will appear here once they are generated and published
                by HR.
              </p>
            </div>
          )}
        </div>
      </div>

      <PayslipBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        slip={selectedSlip}
      />
    </div>
  );
};

const StaffProfile = ({ isSelf }) => {
  const { id: paramId } = useParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);

  // Use param ID if viewing another staff, or current user ID if self-view
  // Backend User model uses 'id', but some parts might use 'userId' in token.
  const id = isSelf ? currentUser?.id || currentUser?.userId : paramId;

  const { selectedUser: user, status: userStatus } = useSelector(
    (state) => state.users
  ); // Assuming userSlice stores fetched user in selectedUser?
  // userSlice getUser sets `selectedUser`? No, let's allow getUser to return data or check userSlice.

  // Actually userSlice getUser updates `users` list or `selectedUser`?
  // Let's assume we need to fetch user if not present.
  // userSlice typically might not expose selectedUser directly if not designed that way.
  // But let's check what getUser does.
  // It calls `/api/users/:id`.

  // I can use local state for user if Redux isn't perfectly set up for it, OR use the `user` from useSelector if `getUser` puts it in `users` array?
  // Let's use local state for simplicity to ensure data is fresh.
  const [localUser, setLocalUser] = useState(null);

  const { salaryStructure, leaveBalances, payslips } = useSelector(
    (state) => state.hr
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [myLeaves, setMyLeaves] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    is_half_day: false,
  });

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post("/hr/leave/apply", formData);
      toast.success("Leave application submitted!");
      setShowApplyModal(false);
      // Refresh Lists logic
      if (activeTab === "leaves" && id) {
        api
          .get("/hr/leave/my-requests")
          .then((res) => setMyLeaves(res.data.data))
          .catch(console.error);
        dispatch(fetchLeaveBalances({ user_id: id }));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Application failed");
    }
  };

  useEffect(() => {
    if (activeTab === "leaves" && id) {
      const endpoint = isSelf
        ? "/hr/leave/my-requests"
        : `/hr/leave/requests/${id}`;

      api
        .get(endpoint)
        .then((res) => setMyLeaves(res.data.data))
        .catch(console.error);
    }
    if (activeTab === "attendance" && id) {
      // Fetch full year for calendar
      const params = isSelf
        ? `start_date=2026-01-01&end_date=2026-12-31`
        : `user_id=${id}&start_date=2026-01-01&end_date=2026-12-31`;

      const endpoint = isSelf ? "/hr/my-attendance" : "/hr/attendance";

      api
        .get(`${endpoint}?${params}`)
        .then((res) => setMyAttendance(res.data.data))
        .catch(console.error);
    }
  }, [activeTab, id, isSelf]);

  const handleDownload = async (slipId) => {
    try {
      const response = await api.get(`/hr/payroll/payslip/${slipId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payslip.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getUser(id)).then((action) => {
        if (action.payload) {
          setLocalUser(action.payload);
        }
      });
      // Fetch HR data
      dispatch(fetchSalaryStructure(id));
      dispatch(fetchLeaveBalances({ user_id: id }));
      dispatch(fetchPayslips({ user_id: id }));
    }
  }, [dispatch, id]);

  if (!localUser)
    return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Header Profile Card */}
      <div className="card p-6 border-l-4 border-l-primary-500 flex flex-col md:flex-row gap-6 items-start">
        <img
          src={
            localUser.profile_picture ||
            `https://ui-avatars.com/api/?name=${localUser.first_name}+${localUser.last_name}&background=random`
          }
          alt="Profile"
          className="w-24 h-24 rounded-2xl object-cover shadow-lg"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {localUser.first_name} {localUser.last_name}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Briefcase className="w-4 h-4 mr-1" /> {localUser.role}
            </span>
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />{" "}
              {localUser.department?.name || "No Dept"}
            </span>
            <span className="flex items-center">
              <Mail className="w-4 h-4 mr-1" /> {localUser.email}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline-secondary">Edit Profile</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {["overview", "bank-details", "leaves", "attendance", "payroll"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          )
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && <OverviewTab user={localUser} />}
        {activeTab === "bank-details" && (
          <BankDetailsTab
            user={localUser}
            onUpdate={(updatedBankDetails) => {
              setLocalUser({
                ...localUser,
                bank_details: updatedBankDetails,
              });
            }}
            canEdit={
              ["admin", "super_admin", "hr", "hr_admin"].includes(
                currentUser?.role?.toLowerCase()
              ) || isSelf
            }
          />
        )}
        {activeTab === "payroll" && (
          <PayrollTab
            user={localUser}
            salaryStructure={salaryStructure}
            payslips={payslips}
            dispatch={dispatch}
            handleDownload={handleDownload}
          />
        )}
        {activeTab === "leaves" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaveBalances.map((bal) => (
                <div
                  key={bal.leave_type}
                  className="card p-4 border border-gray-100 dark:border-gray-700 bg-white shadow-sm"
                >
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    {bal.leave_type} Balance
                  </p>
                  <p className="text-2xl font-bold text-primary-600">
                    {bal.balance} / {bal.total_credits}
                  </p>
                </div>
              ))}
            </div>

            <div className="card p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Application History</h3>
                {isSelf && (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn btn-sm btn-primary"
                  >
                    Apply Leave
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {myLeaves.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No recent leave requests found</p>
                  </div>
                ) : (
                  myLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              {leave.leave_type}
                            </span>
                            {leave.is_half_day && (
                              <span className="badge badge-xs badge-info">
                                Half Day
                              </span>
                            )}
                            <span
                              className={`badge badge-sm ${
                                leave.status === "approved"
                                  ? "badge-success text-white"
                                  : leave.status === "rejected"
                                    ? "badge-error text-white"
                                    : "badge-ghost"
                              }`}
                            >
                              {leave.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {leave.start_date}{" "}
                            {leave.start_date !== leave.end_date &&
                              `to ${leave.end_date}`}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          <span>
                            {new Date(leave.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "attendance" && (
          <div className="card p-6 border border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Attendance Calendar</h3>
            </div>
            <AttendanceCalendar
              attendance={myAttendance}
              leaves={myLeaves}
              target={localUser?.role === "student" ? "student" : "staff"}
            />
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden transform transition-all scale-100">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6" /> Apply for Leave
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Submit your leave request for approval.
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                <form onSubmit={handleApply} className="space-y-6">
                  {/* Leave Type */}
                  <div className="form-control">
                    <label className="label-text font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-500" /> Leave
                      Type
                    </label>
                    <select
                      className="select select-bordered w-full bg-gray-50 dark:bg-gray-900 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all rounded-xl"
                      value={formData.leave_type}
                      onChange={(e) =>
                        setFormData({ ...formData, leave_type: e.target.value })
                      }
                      required
                    >
                      <option value="" disabled>
                        Select specific leave type...
                      </option>
                      {leaveBalances.map((b) => (
                        <option key={b.leave_type} value={b.leave_type}>
                          {b.leave_type} (Available: {b.balance})
                        </option>
                      ))}
                      <option value="Loss of Pay">Loss of Pay (Unpaid)</option>
                    </select>
                  </div>

                  {/* Date Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label-text font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" /> Start
                        Date
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full bg-gray-50 dark:bg-gray-900 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all rounded-xl"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            start_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label-text font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" /> End Date
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full bg-gray-50 dark:bg-gray-900 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all rounded-xl"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Half Day & Validation */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <label className="label cursor-pointer justify-start gap-3 p-0">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary rounded-lg"
                        checked={formData.is_half_day || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_half_day: e.target.checked,
                          })
                        }
                      />
                      <span className="label-text font-bold text-gray-700 dark:text-gray-300">
                        Request as Half Day (0.5 Days)
                      </span>
                    </label>
                    {formData.is_half_day &&
                      formData.start_date !== formData.end_date && (
                        <div className="mt-3 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>
                            Warning: Half-day requests generally apply to single
                            dates. Ensure your Start and End dates are the same.
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Reason */}
                  <div className="form-control">
                    <label className="label-text font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Leave
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-32 w-full bg-gray-50 dark:bg-gray-900 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all rounded-xl resize-none"
                      placeholder="Please provide a brief explanation for your request..."
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
                    >
                      Submit Application
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="btn btn-ghost btn-sm w-full mt-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default StaffProfile;
