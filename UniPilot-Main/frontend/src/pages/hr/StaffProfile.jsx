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
  AlertCircle,
  Minus,
  Plus,
  Trash2,
  Info,
  Download,
  ChevronDown,
  CheckCircle,
  Building2,
  MoreHorizontal,
  ArrowLeft,
  Edit3,
  ChevronLeft,
} from "lucide-react";
import api from "../../utils/api";
import AttendanceCalendar from "../../components/hr/AttendanceCalendar";
import { toast } from "react-hot-toast";

// --- Styled Components / Utilities ---
const SectionTitle = ({ icon: Icon, title, action }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    </div>
    {action}
  </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label}
    </span>
    <span className="text-sm font-semibold text-gray-900 text-right">
      {value}
    </span>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-medium transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 focus:ring-blue-500",
    secondary:
      "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, error, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide">
        {label}
      </label>
    )}
    <input
      className={`w-full px-4 py-3 bg-gray-50 border ${error ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100"} rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 transition-all placeholder:text-gray-400`}
      {...props}
    />
    {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
  </div>
);

// --- TAB COMPONENTS ---

const OverviewTab = ({ user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <Card className="p-8">
      <SectionTitle icon={User} title="Personal Details" />
      <div className="space-y-1">
        <DetailRow
          label="Full Name"
          value={`${user.first_name} ${user.last_name}`}
        />
        <DetailRow label="Email Address" value={user.email} icon={Mail} />
        <DetailRow
          label="Phone Number"
          value={user.phone || "N/A"}
          icon={Phone}
        />
        <DetailRow
          label="Gender"
          value={<span className="capitalize">{user.gender}</span>}
        />
      </div>
    </Card>

    <Card className="p-8">
      <SectionTitle icon={Briefcase} title="Employment Information" />
      <div className="space-y-1">
        <DetailRow
          label="Employee ID"
          value={
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
              {user.employee_id}
            </span>
          }
        />
        <DetailRow
          label="Department"
          value={user.department?.name || "N/A"}
          icon={Building2}
        />
        <DetailRow
          label="Designation"
          value={<span className="capitalize">{user.role}</span>}
        />
        <DetailRow
          label="Joining Date"
          value={user.joining_date || "N/A"}
          icon={Calendar}
        />
      </div>
    </Card>
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
    const masked = "•".repeat(accountNumber.length - 4);
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
        toast.success("Bank details updated successfully!");
      } else {
        toast.error(data.error || "Failed to update bank details");
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error("Failed to update bank details");
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
    <Card className="p-8 max-w-4xl mx-auto">
      <SectionTitle
        icon={DollarSign}
        title="Bank Account Details"
        action={
          canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Details
                </Button>
              )}
            </div>
          )
        }
      />

      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Account Holder
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formData.holder_name || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Bank Name
              </p>
              <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" />
                {formData.bank_name || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Account Number
              </p>
              <p className="text-lg font-mono font-medium text-gray-900 tracking-wide">
                {formData.account_number
                  ? maskAccountNumber(formData.account_number)
                  : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                IFSC Code
              </p>
              <p className="text-lg font-mono font-medium text-gray-900 bg-white inline-block px-2 py-0.5 rounded border border-gray-200">
                {formData.ifsc_code || "N/A"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Branch
              </p>
              <p className="text-base font-medium text-gray-700">
                {formData.branch_name || "Not specified"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-2">
              <Input
                label="Account Holder Name"
                value={formData.holder_name}
                onChange={(e) =>
                  setFormData({ ...formData, holder_name: e.target.value })
                }
                placeholder="Full Name as per Bank Records"
              />
            </div>
            <Input
              label="Bank Name"
              value={formData.bank_name}
              onChange={(e) =>
                setFormData({ ...formData, bank_name: e.target.value })
              }
              placeholder="e.g. HDFC Bank"
            />
            <Input
              label="Branch Location"
              value={formData.branch_name}
              onChange={(e) =>
                setFormData({ ...formData, branch_name: e.target.value })
              }
              placeholder="e.g. Koramangala Branch"
            />
            <Input
              label="Account Number"
              value={formData.account_number}
              onChange={(e) =>
                setFormData({ ...formData, account_number: e.target.value })
              }
              error={errors.account_number}
              placeholder="9-18 digits"
            />
            <Input
              label="IFSC Code"
              value={formData.ifsc_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ifsc_code: e.target.value.toUpperCase(),
                })
              }
              error={errors.ifsc_code}
              placeholder="e.g. HDFC0001234"
              maxLength={11}
            />
          </div>
        )}
      </div>

      {!isEditing &&
        (!formData.bank_name ||
          !formData.account_number ||
          !formData.ifsc_code) && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Action Required</p>
              <p className="text-sm opacity-90 mt-1">
                Please complete your bank details to ensure timely salary
                disbursement. Contact HR if you need assistance.
              </p>
            </div>
          </div>
        )}
    </Card>
  );
};

// --- PAYROLL COMPONENTS ---

const PayslipBreakdownModal = ({ isOpen, onClose, slip }) => {
  if (!isOpen || !slip) return null;
  const breakdown = slip.breakdown || {};
  const allowances = Object.entries(breakdown.allowances || {});
  const deductions = Object.entries(breakdown.deductions || {});

  const resolve = (raw, basic) => {
    const isPct = typeof raw === "object" && raw?.type === "percentage";
    const val = isPct
      ? (Number(basic) * Number(raw.value)) / 100
      : Number(typeof raw === "object" ? raw.value : raw || 0);
    return { val, label: isPct ? `(${raw.value}%)` : "" };
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Salary Breakdown
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {new Date(0, slip.month - 1).toLocaleString("default", {
                month: "long",
              })}{" "}
              {slip.year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          {/* Earnings */}
          <section>
            <h4 className="text-xs font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </span>
              Earnings & Allowances
            </h4>

            {breakdown.prorata && (
              <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Pro-Rata Adjustment
                </p>
                <div className="flex justify-between text-xs text-blue-700 mt-2">
                  <span>
                    Paid Days:{" "}
                    <strong>{breakdown.prorata.effective_days}</strong> /{" "}
                    {breakdown.prorata.month_days}
                  </span>
                  <span>
                    Joined:{" "}
                    {new Date(
                      breakdown.prorata.joining_date,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
              <div className="flex justify-between p-3.5 hover:bg-gray-50/50">
                <div>
                  <span className="text-sm font-medium text-gray-700 block">
                    Basic Pay
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">
                    Fixed
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  ₹{Number(breakdown.basic || 0).toLocaleString()}
                </span>
              </div>
              {allowances.map(([name, raw]) => {
                const { val, label } = resolve(raw, breakdown.basic);
                return (
                  <div
                    key={name}
                    className="flex justify-between p-3.5 hover:bg-gray-50/50"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">
                        {name}
                      </span>
                      {label && (
                        <span className="text-[10px] text-gray-400">
                          {label}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{val.toLocaleString()}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between p-3.5 bg-green-50/50 text-green-700">
                <span className="text-sm font-bold">Total Earnings</span>
                <span className="text-sm font-bold">
                  ₹{Number(slip.total_earnings).toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* Deductions */}
          <section>
            <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <Minus className="w-3.5 h-3.5" />
              </span>
              Deductions
            </h4>
            <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
              {deductions.map(([name, raw]) => {
                const { val, label } = resolve(raw, breakdown.basic);
                const isLOP = name === "loss_of_pay" && typeof raw === "object";
                return (
                  <div
                    key={name}
                    className="flex justify-between p-3.5 hover:bg-gray-50/50"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">
                        {isLOP ? "Loss of Pay" : name}
                      </span>
                      {isLOP ? (
                        <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded leading-none">
                          {raw.days} Day(s) leave
                        </span>
                      ) : (
                        label && (
                          <span className="text-[10px] text-gray-400">
                            {label}
                          </span>
                        )
                      )}
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      -₹{val.toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {deductions.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400 italic">
                  No deductions applied for this period
                </div>
              )}
              <div className="flex justify-between p-3.5 bg-red-50/50 text-red-700">
                <span className="text-sm font-bold">Total Deductions</span>
                <span className="text-sm font-bold">
                  -₹{Number(slip.total_deductions).toLocaleString()}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 bg-gray-900 text-white mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400 font-medium">
              Net Take-Home
            </span>
            <span className="text-3xl font-black tracking-tight">
              ₹{Number(slip.net_salary).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
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
  const [formData, setFormData] = useState({
    basic_salary: 0,
    allowances: [],
    deductions: [],
    grade_id: "",
  });

  // Filtering
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

  const yearOptions = useMemo(() => {
    const years = new Set(payslips.map((p) => p.year));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [payslips]);

  const creationYearOptions = useMemo(
    () => [
      new Date().getFullYear() - 1,
      new Date().getFullYear(),
      new Date().getFullYear() + 1,
    ],
    [],
  );

  const currentUser = useSelector((state) => state.auth.user);
  const { salaryGrades } = useSelector((state) => state.hr);
  const isHR = ["super_admin", "hr", "hr_admin"].includes(
    currentUser?.role?.toLowerCase(),
  );

  console.log("salaryGrades", isHR);

  useEffect(() => {
    if (isHR) dispatch(fetchSalaryGrades());
  }, [dispatch, isHR]);

  const resetForm = () => {
    if (salaryStructure) {
      setFormData({
        basic_salary: salaryStructure.basic_salary || 0,
        grade_id: salaryStructure.grade_id || "",
        allowances: Object.entries(salaryStructure.allowances || {}).map(
          ([name, val]) => ({
            name,
            value: typeof val === "object" ? val.value : val,
            type: typeof val === "object" ? val.type : "fixed",
          }),
        ),
        deductions: Object.entries(salaryStructure.deductions || {}).map(
          ([name, val]) => ({
            name,
            value: typeof val === "object" ? val.value : val,
            type: typeof val === "object" ? val.type : "fixed",
          }),
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

  // Form Handlers
  const addComponent = (type) =>
    setFormData((p) => ({
      ...p,
      [type]: [...p[type], { name: "", value: 0, type: "fixed" }],
    }));
  const removeComponent = (type, idx) =>
    setFormData((p) => ({ ...p, [type]: p[type].filter((_, i) => i !== idx) }));
  const updateComponent = (type, idx, f, v) => {
    const n = [...formData[type]];
    n[idx][f] = v;
    setFormData({ ...formData, [type]: n });
  };
  const calculateActualValue = (comp) =>
    comp.type === "percentage"
      ? (Number(formData.basic_salary) * Number(comp.value)) / 100
      : Number(comp.value);

  const handleSave = () => {
    if (!user?.id) return;
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
      }),
    );
    setEditMode(false);
  };

  const netSalary =
    Number(formData.basic_salary) +
    formData.allowances.reduce((s, a) => s + calculateActualValue(a), 0) -
    formData.deductions.reduce((s, d) => s + calculateActualValue(d), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-8 border-l-4 border-l-green-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
          <DollarSign className="w-32 h-32" />
        </div>
        <SectionTitle
          title="Salary Configuration"
          action={
            isHR && (
              <div className="flex gap-2">
                {editMode ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        resetForm();
                        setEditMode(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    className="z-10"
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Structure
                  </Button>
                )}
              </div>
            )
          }
        />

        <div className="space-y-8 relative z-10">
          {/* Basic & Grade */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 grid md:grid-cols-2 gap-8">
            {isHR && editMode && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Assign Grade Template
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.grade_id}
                  onChange={(e) => {
                    const grade = salaryGrades.find(
                      (g) => g.id === e.target.value,
                    );
                    if (grade) {
                      setFormData({
                        ...formData,
                        grade_id: grade.id,
                        basic_salary: grade.basic_salary,
                        allowances: Object.entries(grade.allowances || {}).map(
                          ([n, v]) => ({
                            name: n,
                            value: typeof v === "object" ? v.value : v,
                            type: typeof v === "object" ? v.type : "fixed",
                          }),
                        ),
                        deductions: Object.entries(grade.deductions || {}).map(
                          ([n, v]) => ({
                            name: n,
                            value: typeof v === "object" ? v.value : v,
                            type: typeof v === "object" ? v.type : "fixed",
                          }),
                        ),
                      });
                    } else setFormData({ ...formData, grade_id: "" });
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

            <div className="flex flex-col justify-center">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Basic Salary (Monthly)
              </label>
              {editMode ? (
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    className="text-2xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-blue-500 w-full focus:outline-none py-1"
                    value={formData.basic_salary}
                    onChange={(e) =>
                      setFormData({ ...formData, basic_salary: e.target.value })
                    }
                  />
                </div>
              ) : (
                <p className="text-3xl font-black text-gray-900">
                  ₹{Number(formData.basic_salary).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex flex-col justify-center items-end text-right">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Estimated Net Pay
              </span>
              <span className="text-3xl font-black text-green-600">
                ₹{netSalary.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Components */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Allowances */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-green-500" /> Allowances
                </h4>
                {editMode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addComponent("allowances")}
                    className="text-blue-600 h-8 px-2 py-0 text-xs uppercase font-bold"
                  >
                    + Add
                  </Button>
                )}
              </div>
              <div className="p-5 space-y-3">
                {formData.allowances.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    {editMode ? (
                      <>
                        <input
                          className="flex-1 bg-gray-50 border-0 rounded-lg px-2 py-1.5 text-sm font-medium focus:ring-1 focus:ring-blue-500"
                          placeholder="Name"
                          value={a.name}
                          onChange={(e) =>
                            updateComponent(
                              "allowances",
                              i,
                              "name",
                              e.target.value,
                            )
                          }
                        />
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 w-32">
                          <input
                            type="number"
                            className="w-full bg-transparent border-0 px-2 py-1.5 text-sm font-bold text-right focus:ring-0"
                            value={a.value}
                            onChange={(e) =>
                              updateComponent(
                                "allowances",
                                i,
                                "value",
                                e.target.value,
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              updateComponent(
                                "allowances",
                                i,
                                "type",
                                a.type === "fixed" ? "percentage" : "fixed",
                              )
                            }
                            className="px-2 text-xs font-bold text-gray-500 hover:text-blue-600 border-l border-gray-200 h-full"
                          >
                            {a.type === "fixed" ? "₹" : "%"}
                          </button>
                        </div>
                        <button
                          onClick={() => removeComponent("allowances", i)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex justify-between w-full text-sm">
                        <span className="text-gray-600">
                          {a.name}{" "}
                          {a.type === "percentage" && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded ml-1">
                              {a.value}%
                            </span>
                          )}
                        </span>
                        <span className="font-bold text-gray-900">
                          ₹{calculateActualValue(a).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {formData.allowances.length === 0 && (
                  <p className="text-xs text-gray-400 italic text-center py-2">
                    No allowances configured
                  </p>
                )}
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                  <Minus className="w-4 h-4 text-red-500" /> Deductions
                </h4>
                {editMode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addComponent("deductions")}
                    className="text-blue-600 h-8 px-2 py-0 text-xs uppercase font-bold"
                  >
                    + Add
                  </Button>
                )}
              </div>
              <div className="p-5 space-y-3">
                {formData.deductions.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {editMode ? (
                      <>
                        <input
                          className="flex-1 bg-gray-50 border-0 rounded-lg px-2 py-1.5 text-sm font-medium focus:ring-1 focus:ring-blue-500"
                          placeholder="Name"
                          value={d.name}
                          onChange={(e) =>
                            updateComponent(
                              "deductions",
                              i,
                              "name",
                              e.target.value,
                            )
                          }
                        />
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 w-32">
                          <input
                            type="number"
                            className="w-full bg-transparent border-0 px-2 py-1.5 text-sm font-bold text-right focus:ring-0"
                            value={d.value}
                            onChange={(e) =>
                              updateComponent(
                                "deductions",
                                i,
                                "value",
                                e.target.value,
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              updateComponent(
                                "deductions",
                                i,
                                "type",
                                d.type === "fixed" ? "percentage" : "fixed",
                              )
                            }
                            className="px-2 text-xs font-bold text-gray-500 hover:text-blue-600 border-l border-gray-200 h-full"
                          >
                            {d.type === "fixed" ? "₹" : "%"}
                          </button>
                        </div>
                        <button
                          onClick={() => removeComponent("deductions", i)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex justify-between w-full text-sm">
                        <span className="text-gray-600">
                          {d.name}{" "}
                          {d.type === "percentage" && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded ml-1">
                              {d.value}%
                            </span>
                          )}
                        </span>
                        <span className="font-bold text-red-500">
                          - ₹{calculateActualValue(d).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {formData.deductions.length === 0 && (
                  <p className="text-xs text-gray-400 italic text-center py-2">
                    No deductions configured
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* History */}
      <Card className="p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Payslip History</h3>
            <p className="text-sm text-gray-500 mt-1">
              View and download past salary slips
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-200">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent text-sm font-medium border-none focus:ring-0 text-gray-600 cursor-pointer"
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
              <div className="w-px h-4 bg-gray-300 mx-2"></div>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-transparent text-sm font-medium border-none focus:ring-0 text-gray-600 cursor-pointer"
              >
                <option value="all">All Years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {isHR && (
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200 ml-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Generate:
                </span>
                <select
                  value={genPeriod.month}
                  onChange={(e) =>
                    setGenPeriod({ ...genPeriod, month: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200 text-sm rounded-lg py-1.5 focus:ring-blue-500"
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
                  value={genPeriod.year}
                  onChange={(e) =>
                    setGenPeriod({ ...genPeriod, year: e.target.value })
                  }
                  className="bg-gray-50 border-gray-200 text-sm rounded-lg py-1.5 focus:ring-blue-500"
                >
                  {creationYearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={() =>
                    dispatch(
                      generatePayslip({
                        user_id: user.id,
                        month: Number(genPeriod.month),
                        year: Number(genPeriod.year),
                      }),
                    )
                  }
                >
                  Go
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredPayslips.map((slip) => {
            const date = new Date(0, slip.month - 1);
            return (
              <div
                key={slip.id}
                className="group bg-white border border-gray-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
              >
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center border border-blue-100">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {date.toLocaleString("default", { month: "short" })}
                    </span>
                    <span className="text-xl font-black">{slip.year}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">
                      {date.toLocaleString("default", { month: "long" })}{" "}
                      {slip.year}
                    </h4>
                    <div className="flex gap-2 mt-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${slip.status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {slip.status}
                      </span>
                      <span className="text-xs text-gray-400 font-medium font-mono">
                        ID: {slip.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Net Pay
                    </p>
                    <p className="text-2xl font-black text-gray-900">
                      ₹{Number(slip.net_salary).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedSlip(slip);
                        setIsBreakdownOpen(true);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(slip.id)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredPayslips.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                No Payslips Found
              </h3>
              <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                Payslips generated for this staff member will appear here.
              </p>
            </div>
          )}
        </div>
      </Card>

      <PayslipBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        slip={selectedSlip}
      />
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

const StaffProfile = ({ isSelf }) => {
  const { id: paramId } = useParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const id = isSelf ? currentUser?.id || currentUser?.userId : paramId;
  const [localUser, setLocalUser] = useState(null);
  const { salaryStructure, leaveBalances, payslips } = useSelector(
    (state) => state.hr,
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [myLeaves, setMyLeaves] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({ leave_type: "", start_date: "", end_date: "", reason: "", is_half_day: false });
  const user = useSelector((state) => state.auth.user);
  
  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post("/hr/leave/apply", formData);
      toast.success("Leave application submitted!");
      setShowApplyModal(false);
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
        if (action.payload) setLocalUser(action.payload);
      });
      dispatch(fetchSalaryStructure(id));
      dispatch(fetchLeaveBalances({ user_id: id }));
      dispatch(fetchPayslips({ user_id: id }));
    }
  }, [dispatch, id]);

  if (!localUser)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium font-sans">
          Loading Profile...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Profile Card */}

        <div className="relative bg-white rounded-3xl p-8 mb-8 border border-slate-200/60 shadow-sm overflow-hidden">
          {/* Modernized Back Button - Relocated to top-right for a cleaner profile flow */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/80 backdrop-blur-md border border-slate-200 text-slate-500 rounded-lg hover:bg-white hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all active:scale-95 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Back
              </span>
            </button>
          </div>

          {/* Soft ambient background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/50 to-transparent -mr-20 -mt-20 rounded-full blur-3xl" />

          {/* Main Container */}
          <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-10">
            {/* Avatar Section with Ring Effect */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
              <div className="relative">
                <img
                  src={
                    localUser.profile_picture ||
                    `https://ui-avatars.com/api/?name=${localUser.first_name}+${localUser.last_name}&background=6366f1&color=fff`
                  }
                  alt="Profile"
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-inner"
                />
                <div
                  className={`absolute bottom-2 right-2 w-7 h-7 rounded-full border-4 border-white shadow-sm ${localUser.is_active ? "bg-emerald-500" : "bg-slate-300"}`}
                ></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6 pt-4 lg:pt-0">
              <div className="text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-2">
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {localUser.first_name} {localUser.last_name}
                  </h1>
                  <span className="w-fit mx-auto lg:mx-0 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
                    {localUser.role}
                  </span>
                </div>
                <p className="text-lg text-slate-500 font-medium">
                  {localUser.department?.name || "Unassigned Department"}
                </p>
              </div>

              {/* Modern Tag Cloud for Metadata */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {[
                  {
                    icon: Mail,
                    text: localUser.email,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    icon: Briefcase,
                    text: localUser.employee_id,
                    color: "text-indigo-600",
                    bg: "bg-indigo-50",
                  },
                  {
                    icon: Phone,
                    text: localUser.phone,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                    hide: !localUser.phone,
                  },
                ].map(
                  (item, i) =>
                    !item.hide && (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl ${item.bg} border border-white shadow-sm hover:shadow-md transition-shadow`}
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm font-semibold text-slate-700">
                          {item.text}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>

            {/* Action Buttons - Pushed down slightly on desktop to align with profile content */}
            {/* <div className="flex flex-col gap-3 self-center lg:self-start lg:mt-14 shrink-0">
              <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div> */}
          </div>
        </div> */}
<div className="relative bg-white rounded-3xl p-8 mb-8 border border-slate-200/60 shadow-sm overflow-hidden">
  {user.role !== "hod" && (
    <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/80 backdrop-blur-md border border-slate-200 text-slate-500 rounded-lg hover:bg-white hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all active:scale-95 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-wider">Back</span>
      </button>
    </div>
)}
  {/* Soft ambient background accent */}
  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/50 to-transparent -mr-20 -mt-20 rounded-full blur-3xl" />

  {/* Main Container */}
  <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-10">
    
    {/* Avatar Section with Ring Effect */}
    <div className="relative group shrink-0">
      <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
      <div className="relative">
        <img 
          src={localUser.profile_picture || `https://ui-avatars.com/api/?name=${localUser.first_name}+${localUser.last_name}&background=6366f1&color=fff`} 
          alt="Profile" 
          className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-inner" 
        />
        <div className={`absolute bottom-2 right-2 w-7 h-7 rounded-full border-4 border-white shadow-sm ${localUser.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 space-y-6 pt-4 lg:pt-0">
      <div className="text-center lg:text-left">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {localUser.first_name} {localUser.last_name}
          </h1>
          <span className="w-fit mx-auto lg:mx-0 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
            {localUser.role}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 border-b border-gray-100 gap-8 hide-scrollbar">
          {["overview", "bank-details", "leaves", "attendance", "payroll"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold capitalize transition-all whitespace-nowrap relative ${
                  activeTab === tab
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.replace("-", " ")}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
                )}
              </button>
            ),
          )}
        </div>

        {/* Dynamic Content */}
        <div className="min-h-[400px]">
          {activeTab === "overview" && <OverviewTab user={localUser} />}
          {activeTab === "bank-details" && (
            <BankDetailsTab
              user={localUser}
              onUpdate={(d) => setLocalUser({ ...localUser, bank_details: d })}
              canEdit={
                ["admin", "super_admin", "hr", "hr_admin"].includes(
                  currentUser?.role?.toLowerCase(),
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {leaveBalances.map((bal, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <FileText className="w-16 h-16" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      {bal.leave_type}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900">
                        {bal.balance}
                      </span>
                      <span className="text-sm font-bold text-gray-400">
                        / {bal.total_credits}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${(bal.balance / bal.total_credits) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="p-8">
                <SectionTitle
                  title="Application History"
                  action={
                    isSelf && (
                      <Button onClick={() => setShowApplyModal(true)}>
                        Apply Leave
                      </Button>
                    )
                  }
                />
                <div className="space-y-4">
                  {myLeaves.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        No leave requests found
                      </p>
                    </div>
                  ) : (
                    myLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="p-5 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all flex justify-between items-center group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900">
                              {leave.leave_type}
                            </span>
                            {leave.is_half_day && (
                              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wide">
                                Half Day
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${leave.status === "approved" ? "bg-green-50 text-green-600" : leave.status === "rejected" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}
                            >
                              {leave.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {leave.start_date}{" "}
                            <span className="text-gray-300 mx-1">→</span>{" "}
                            {leave.end_date}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-400">
                            {new Date(leave.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "attendance" && (
            <Card className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionTitle title="Attendance Calendar" />
              <div className="mt-6">
                <AttendanceCalendar
                  attendance={myAttendance}
                  leaves={myLeaves}
                  target={localUser?.role === "student" ? "student" : "staff"}
                />
              </div>
            </Card>
          )}
        </div>
      </div>

      {showApplyModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Apply for Leave
                  </h2>
                  <p className="text-sm text-gray-500">
                    Submit request for approval
                  </p>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleApply} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Leave Type
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={formData.leave_type}
                      onChange={(e) =>
                        setFormData({ ...formData, leave_type: e.target.value })
                      }
                      required
                    >
                      <option value="" disabled>
                        Select type...
                      </option>
                      {leaveBalances.map((b) => (
                        <option key={b.leave_type} value={b.leave_type}>
                          {b.leave_type} (Bal: {b.balance})
                        </option>
                      ))}
                      <option value="Loss of Pay">Loss of Pay (Unpaid)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Start Date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="date"
                      label="End Date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={formData.is_half_day || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_half_day: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-bold text-gray-700">
                      Request as Half Day (0.5)
                    </span>
                  </div>

                  {formData.is_half_day &&
                    formData.start_date !== formData.end_date && (
                      <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg font-medium border border-amber-100 flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Half-day requests are typically for single dates. Check
                        your dates.
                      </div>
                    )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Reason
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24"
                      placeholder="Brief explanation..."
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-[2] shadow-xl shadow-blue-500/20"
                  >
                    Submit Request
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default StaffProfile;
