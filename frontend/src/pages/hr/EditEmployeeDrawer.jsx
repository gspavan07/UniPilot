import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../store/slices/userSlice";
import {
  X,
  Save,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building,
  CreditCard,
  Landmark,
  History,
  Trash2,
  Plus,
  Camera,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

// Reuse base schema logic but keep it independent for cleaner customization
const schema = yup.object().shape({
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().optional(),
  gender: yup.string().optional(),
  date_of_birth: yup.string().optional(),
  address: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),

  // Employment
  employee_id: yup.string().required("Employee ID is required"),
  designation: yup.string().required("Designation is required"),
  department_id: yup.string().optional(),
  joining_date: yup.string().optional(),

  // Staff Specific
  staff_category: yup.string().optional(),

  // Bank
  bank_details: yup
    .object()
    .shape({
      bank_name: yup.string().optional(),
      account_number: yup.string().optional(),
      ifsc_code: yup.string().optional(),
      branch_name: yup.string().optional(),
      holder_name: yup.string().optional(),
    })
    .optional(),

  previous_academics: yup.array().optional(),
});

const EditEmployeeDrawer = ({ isOpen, onClose, user, departmentList = [] }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user && isOpen) {
      reset({
        ...user,
        department_id: user.department_id || "",
        designation: user.designation || user.custom_fields?.designation || "",
        staff_category: user.custom_fields?.staff_category || "",
        bank_details: user.bank_details || {},
        previous_academics: user.previous_academics || [],
      });
      setError(null);
    }
  }, [user, isOpen, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    // Prepare payload
    const payload = {
      ...data,
      custom_fields: {
        ...(user?.custom_fields || {}),
        designation: data.designation,
        staff_category: data.staff_category,
      },
    };

    try {
      await dispatch(updateUser({ id: user.id, data: payload })).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update employee:", err);
      setError(err?.message || "Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "employment", label: "Employment & Role", icon: Briefcase },
    { id: "finance", label: "Payroll & Bank", icon: Landmark },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden isolate">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl transform transition-transform duration-300 ease-out bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full border-l border-gray-100 dark:border-gray-800">
        {/* Professional Header */}
        <div className="flex-none px-8 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar Placeholder */}
              <div className="relative group cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-primary-400 shadow-inner">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
                  {user?.first_name} {user?.last_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded textxs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {user?.employee_id || "No ID"}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modern Tabs */}
          <div className="flex items-center gap-1 mt-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400 ring-1 ring-primary-500/10"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400"
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "stroke-2" : "stroke-[1.5px]"}`}
                  />
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500 translate-y-2 opacity-0 group-hover:translate-y-1 group-hover:opacity-100 transition-all" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <form
            id="edit-employee-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl mx-auto"
          >
            {error && (
              <div className="p-4 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Content Sections */}
            {activeTab === "personal" && (
              <div className="space-y-8 animate-fade-in-up">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-500" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        First Name
                      </label>
                      <input
                        {...register("first_name")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                      {errors.first_name && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.first_name.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Last Name
                      </label>
                      <input
                        {...register("last_name")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register("email")}
                          className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 pl-10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register("phone")}
                          className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 pl-10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        {...register("date_of_birth")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-error-500" />
                    Address Details
                  </h3>
                  <div className="space-y-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Street Address
                      </label>
                      <textarea
                        {...register("address")}
                        rows={3}
                        className="form-textarea w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                        placeholder="Apartment, Studio, or Floor"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                          City
                        </label>
                        <input
                          {...register("city")}
                          className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                          State / Province
                        </label>
                        <input
                          {...register("state")}
                          className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "employment" && (
              <div className="space-y-8 animate-fade-in-up">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-info-500" />
                    Role & Position
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Employee ID
                      </label>
                      <input
                        {...register("employee_id")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Date Joined
                      </label>
                      <input
                        type="date"
                        {...register("joining_date")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Designation / Job Title
                      </label>
                      <input
                        {...register("designation")}
                        placeholder="e.g. Senior Lecturer, Lab Technician"
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Department
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          {...register("department_id")}
                          className="form-select w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 pl-10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none"
                        >
                          <option value="">Select Department...</option>
                          {departmentList.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                    Staff Classification
                  </h3>
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Category
                      </label>
                      <select
                        {...register("staff_category")}
                        className="form-select w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        <option value="General">General Administration</option>
                        <option value="Lab Faculty / Technical">
                          Lab Faculty / Technical
                        </option>
                        <option value="Department Operator">
                          Department Operator
                        </option>
                        <option value="Admission Staff">Admission Staff</option>
                        <option value="Finance Operations">
                          Finance Operations
                        </option>
                        <option value="Exam Cell">Exam Cell</option>
                        <option value="Library Staff">Library Staff</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "finance" && (
              <div className="space-y-8 animate-fade-in-up">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary-500" />
                    Direct Deposit
                  </h3>
                  <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-primary-600">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        Primary Bank Account
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Salary and reimbursements will be credited to this
                        account. Ensure IFSC code matches your branch correctly.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Bank Name
                      </label>
                      <input
                        {...register("bank_details.bank_name")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Account Number
                      </label>
                      <input
                        {...register("bank_details.account_number")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        IFSC Code
                      </label>
                      <input
                        {...register("bank_details.ifsc_code")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Branch
                      </label>
                      <input
                        {...register("bank_details.branch_name")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Account Holder Name
                      </label>
                      <input
                        {...register("bank_details.holder_name")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="flex-none p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between">
          <div className="text-xs text-gray-400 font-medium">
            {isDirty ? (
              <span className="flex items-center text-warning-600 gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Unsaved Changes
              </span>
            ) : (
              <span>No changes made</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 px-5 py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              form="edit-employee-form"
              type="submit"
              disabled={loading || !isDirty}
              className="btn bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-black/5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeDrawer;
