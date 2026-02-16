import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  Save,
  AlertCircle,
  Loader2,
  User as UserIcon,
  Mail,
  Briefcase,
  Building,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  History,
  Landmark,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { baseUserSchema, baseDefaultValues } from "./baseSchema";
import useFieldConfig from "../../../hooks/useFieldConfig";

const employeeSchema = yup.object().shape({
  ...baseUserSchema,
  role_id: yup.string().required("Role is required"),
  employee_id: yup.string().required("Employee ID is required"),

  designation: yup.string().when("role", {
    is: (role) => role === "faculty" || role === "staff",
    then: () => yup.string().required("Designation/Job Title is required"),
    otherwise: () => yup.string().optional(),
  }),

  staff_category: yup.string().when("role", {
    is: "staff",
    then: () => yup.string().required("Staff Category is required"),
    otherwise: () => yup.string().optional(),
  }),

  joining_date: yup.string().optional(),
  previous_academics: yup
    .array()
    .of(
      yup.object().shape({
        school: yup.string().required("Institution name is required"),
        board: yup.string().required("Board/Degree is required"),
        year: yup.string().required("Year is required"),
        percentage: yup.string().optional(),
      })
    )
    .optional(),
});

const EmployeeForm = ({
  isOpen,
  onClose,
  onSave,
  user,
  departmentList,
  roleId,
  roleList = [],
}) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isVisible, applyConfig } = useFieldConfig("staff");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      ...baseDefaultValues,
      role: "staff",
      role_id: roleId,
      employee_id: "",
      designation: "",
      staff_category: "General",
      joining_date: "",
      previous_academics: [],
    },
  });

  const selectedRoleId = watch("role_id");
  const selectedRoleObj = roleList.find((r) => r.id == selectedRoleId);
  const selectedRoleSlug = selectedRoleObj?.slug || "staff";
  const isFaculty = selectedRoleSlug === "faculty";
  const isStaff =
    selectedRoleSlug === "staff" ||
    (selectedRoleSlug.includes("staff") && !selectedRoleSlug.includes("admin"));
  const isAdmin = selectedRoleSlug.includes("admin");

  const getFormTitle = () => {
    if (user) return `Edit ${selectedRoleObj?.name || "Employee"} Profile`;
    return `Register New ${selectedRoleObj?.name || "Employee"}`;
  };

  const previousAcademics = watch("previous_academics") || [];

  useEffect(() => {
    if (user && isOpen) {
      reset({
        ...user,
        role_id: roleId || user?.role_id,
        designation: user.designation || user.custom_fields?.designation || "",
        staff_category: user.custom_fields?.staff_category || "General",
        bank_details: user.bank_details || baseDefaultValues.bank_details,
        previous_academics: user.previous_academics || [],
      });
    } else if (isOpen && roleId) {
      setValue("role_id", roleId);
    }
  }, [user, isOpen, reset, roleId, setValue]);

  useEffect(() => {
    setValue("role", selectedRoleSlug);

    // Auto-Department Logic
    // If role is specialized staff (e.g. finance_staff), try to find matching department
    if (
      selectedRoleSlug &&
      selectedRoleSlug.includes("_staff") &&
      !selectedRoleSlug.includes("admin")
    ) {
      const moduleName = selectedRoleSlug.split("_")[0]; // e.g. 'finance'
      const targetDept = departmentList?.find(
        (d) =>
          d.name.toLowerCase().includes(moduleName) ||
          d.code?.toLowerCase() === moduleName
      );

      if (targetDept) {
        setValue("department_id", targetDept.id);
      }
    }
  }, [selectedRoleSlug, setValue, departmentList]);

  const onSubmit = async (data) => {
    setLoading(true);
    const formatted = {
      ...data,
      custom_fields: {
        ...(data.custom_fields || {}),
        staff_category: data.staff_category,
        designation: data.designation,
      },
      role: selectedRoleSlug,
    };
    try {
      await onSave(formatted);
      onClose();
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addAcademicRow = () => {
    const current = watch("previous_academics") || [];
    reset({
      ...watch(),
      previous_academics: [
        ...current,
        { school: "", board: "", percentage: "", year: "" },
      ],
    });
  };

  const getInputClass = (name) => {
    const hasError = name.includes(".")
      ? name.split(".").reduce((obj, key) => obj && obj[key], errors)
      : errors[name];

    return `input transition-all duration-200 ${hasError
        ? "border-error-500 focus:border-error-500 focus:ring-error-500/20 bg-error-50/10"
        : "focus:border-primary-500 focus:ring-primary-500/20"
      }`;
  };

  const RequiredLabel = ({ children }) => (
    <label className="label">
      {children} <span className="text-error-500 ml-0.5">*</span>
    </label>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-screen max-w-2xl transform transition ease-in-out duration-500 bg-white dark:bg-gray-800 shadow-2xl rounded-l-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">
              {getFormTitle()}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user
                ? "Update employee details."
                : "Create a new employee record."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-4 border-b border-gray-100 dark:border-gray-700 space-x-2 bg-gray-50 dark:bg-gray-800/50 overflow-x-auto no-scrollbar">
          {["personal", "employment", "academic", "finance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                  ? "border-b-2 border-primary-500 text-primary-600"
                  : "text-gray-400"
                }`}
            >
              {tab === "personal"
                ? "Identity"
                : tab === "employment"
                  ? "Job & Role"
                  : tab === "academic"
                    ? "History"
                    : "Payroll"}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {error && (
            <div className="p-4 rounded-2xl bg-error-50 dark:bg-error-900/30 border border-error-500/30 text-error-700 dark:text-error-300 text-sm flex items-start animate-shake">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "personal" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <UserIcon className="w-4 h-4 text-primary-500" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                    Identity & Contact
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <RequiredLabel>First Name</RequiredLabel>
                    <input
                      {...register("first_name")}
                      className={getInputClass("first_name")}
                    />
                    {errors.first_name && (
                      <p className="text-xs text-error-500 mt-1">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input
                      {...register("last_name")}
                      className={getInputClass("last_name")}
                    />
                  </div>
                  <div className="col-span-2">
                    <RequiredLabel>Email Address</RequiredLabel>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register("email")}
                        className={`${getInputClass("email")} pl-10`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-error-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">Mobile</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register("phone")}
                        className={`${getInputClass("phone")} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Date of Birth</label>
                    <input
                      {...register("date_of_birth")}
                      type="date"
                      className={getInputClass("date_of_birth")}
                    />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select
                      {...register("gender")}
                      className={getInputClass("gender")}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <MapPin className="w-4 h-4 text-error-500" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                    Address
                  </h3>
                </div>
                <textarea
                  {...register("address")}
                  className={`${getInputClass("address")} min-h-[80px]`}
                  placeholder="Full Residential Address"
                ></textarea>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input
                      {...register("city")}
                      className={getInputClass("city")}
                    />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input
                      {...register("state")}
                      className={getInputClass("state")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <CreditCard className="w-4 h-4 text-warning-500" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                    Verification
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {isVisible("aadhaar_number") && (
                    <div>
                      <label className="label">
                        {applyConfig("aadhaar_number", "Aadhaar ID").label}
                      </label>
                      <input
                        {...register("aadhaar_number")}
                        className={getInputClass("aadhaar_number")}
                      />
                    </div>
                  )}
                  {isVisible("passport_number") && (
                    <div>
                      <label className="label">
                        {
                          applyConfig("passport_number", "Passport Number")
                            .label
                        }
                      </label>
                      <input
                        {...register("passport_number")}
                        className={getInputClass("passport_number")}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "employment" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <Briefcase className="w-4 h-4 text-info-500" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                  Job Hierarchy
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <RequiredLabel>Role Assignment</RequiredLabel>
                  <select
                    {...register("role_id")}
                    className={`${getInputClass("role_id")} bg-primary-50/50`}
                  >
                    <option value="">Select Role...</option>
                    {roleList
                      .filter(
                        (r) => r.slug !== "student" && r.slug !== "super_admin"
                      )
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                  {errors.role_id && (
                    <p className="text-xs text-error-500 mt-1">
                      {errors.role_id.message}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="label">Department</label>
                  {/* Auto-selected/Hidden for module staff, Visible for Faculty/Generic/Admin */}
                  <div
                    className={`${!isAdmin && isStaff && selectedRoleSlug.includes("_") ? "hidden" : "block"}`}
                  >
                    <select
                      {...register("department_id")}
                      className={getInputClass("department_id")}
                    >
                      <option value="">Select Department...</option>
                      {departmentList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!isAdmin && isStaff && selectedRoleSlug.includes("_") && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 text-xs text-gray-500 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      Auto-assigned to{" "}
                      <strong className="ml-1 text-gray-700 dark:text-gray-300">
                        {departmentList.find(
                          (d) => d.id == watch("department_id")
                        )?.name || "Department"}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Staff Only: Category */}
                {isStaff && !isAdmin && (
                  <div className="col-span-2">
                    <RequiredLabel>Staff Category</RequiredLabel>
                    <div className="relative group">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        {...register("staff_category")}
                        className={`${getInputClass("staff_category")} pl-10`}
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
                    {errors.staff_category && (
                      <p className="text-xs text-error-500 mt-1">
                        {errors.staff_category.message}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <RequiredLabel>Employee ID</RequiredLabel>
                  <input
                    {...register("employee_id")}
                    className={getInputClass("employee_id")}
                    placeholder={
                      isAdmin ? "ADM-XXX" : isFaculty ? "FAC-XXX" : "STF-XXX"
                    }
                  />
                  {errors.employee_id && (
                    <p className="text-xs text-error-500 mt-1">
                      {errors.employee_id.message}
                    </p>
                  )}
                </div>

                {/* Designation: Required for Faculty/Staff, Optional for Admin */}
                <div>
                  <label className="label">
                    Job Title / Designation
                    {(isFaculty || isStaff) && (
                      <span className="text-error-500 ml-0.5">*</span>
                    )}
                  </label>
                  <input
                    {...register("designation")}
                    className={getInputClass("designation")}
                    placeholder={isFaculty ? "e.g. Professor" : "e.g. Manager"}
                  />
                  {errors.designation && (
                    <p className="text-xs text-error-500 mt-1">
                      {errors.designation.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Joining Date</label>
                  <input
                    {...register("joining_date")}
                    type="date"
                    className={getInputClass("joining_date")}
                  />
                </div>
                <div>
                  <label className="label">Account Status</label>
                  <select
                    {...register("is_active")}
                    className={getInputClass("is_active")}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <History className="w-4 h-4 text-secondary-500" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                  Professional Background
                </h3>
              </div>
              <button
                type="button"
                onClick={addAcademicRow}
                className="btn btn-secondary w-full border-dashed border-2 py-3 flex items-center justify-center text-[10px] font-black uppercase tracking-widest"
              >
                <PlusIcon className="w-4 h-4 mr-2" /> Add Previous Experience /
                Degree
              </button>
              <div className="space-y-4">
                {previousAcademics.map((row, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-3xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 space-y-4 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const newRows = [...previousAcademics];
                        newRows.splice(i, 1);
                        reset({ ...watch(), previous_academics: newRows });
                      }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-error-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <RequiredLabel>Organization / University</RequiredLabel>
                        <input
                          {...register(`previous_academics.${i}.school`)}
                          className={getInputClass(
                            `previous_academics.${i}.school`
                          )}
                        />
                        {errors.previous_academics?.[i]?.school && (
                          <p className="text-[10px] text-error-500">
                            {errors.previous_academics[i].school.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <RequiredLabel>Role / Degree</RequiredLabel>
                        <input
                          {...register(`previous_academics.${i}.board`)}
                          className={getInputClass(
                            `previous_academics.${i}.board`
                          )}
                        />
                        {errors.previous_academics?.[i]?.board && (
                          <p className="text-[10px] text-error-500">
                            {errors.previous_academics[i].board.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <RequiredLabel>Year</RequiredLabel>
                        <input
                          {...register(`previous_academics.${i}.year`)}
                          className={getInputClass(
                            `previous_academics.${i}.year`
                          )}
                        />
                        {errors.previous_academics?.[i]?.year && (
                          <p className="text-[10px] text-error-500">
                            {errors.previous_academics[i].year.message}
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="label text-[9px]">
                          Grade / Metadata (Optional)
                        </label>
                        <input
                          {...register(`previous_academics.${i}.percentage`)}
                          className={getInputClass(
                            `previous_academics.${i}.percentage`
                          )}
                          placeholder="e.g. CGPA, Key Achievement"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "finance" && isVisible("bank_details") && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <Landmark className="w-4 h-4 text-success-500" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                  Payroll Account
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Bank Name</label>
                  <input
                    {...register("bank_details.bank_name")}
                    className={getInputClass("bank_details.bank_name")}
                  />
                </div>
                <div className="col-span-2">
                  <label className="label">Account Number</label>
                  <input
                    {...register("bank_details.account_number")}
                    className={getInputClass("bank_details.account_number")}
                  />
                </div>
                <div>
                  <label className="label">IFSC Code</label>
                  <input
                    {...register("bank_details.ifsc_code")}
                    className={getInputClass("bank_details.ifsc_code")}
                  />
                </div>
                <div>
                  <label className="label">Branch</label>
                  <input
                    {...register("bank_details.branch_name")}
                    className={getInputClass("bank_details.branch_name")}
                  />
                </div>
                <div className="col-span-2">
                  <label className="label">Holder Name</label>
                  <input
                    {...register("bank_details.holder_name")}
                    className={getInputClass("bank_details.holder_name")}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex gap-4 bg-gray-50/50 p-6 -mx-6 -mb-6 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
