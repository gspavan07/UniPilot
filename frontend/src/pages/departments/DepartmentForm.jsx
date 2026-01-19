import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  Save,
  AlertCircle,
  Loader2,
  Building,
  Hash,
  Mail,
  MapPin,
  Calendar,
  User as UserIcon,
} from "lucide-react";

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .required("Department name is required"),
  code: yup
    .string()
    .uppercase()
    .matches(/^[A-Z0-9-]+$/, "Code must be alphanumeric and uppercase")
    .required("Department code is required"),
  description: yup.string().optional(),
  hod_id: yup
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  parent_department_id: yup
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  email: yup
    .string()
    .email("Invalid email address")
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  phone: yup.string().optional(),
  office_location: yup.string().optional(),
  established_date: yup.string().optional(),
  type: yup.string().oneOf(["academic", "administrative"]).default("academic"),
  is_active: yup.boolean().default(true),
});

const DepartmentForm = ({
  isOpen,
  onClose,
  onSave,
  department = null,
  facultyList = [],
  departmentList = [],
}) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Permission Logic
  const canViewAdministrative = user?.permissions?.includes(
    "departments:view_administrative",
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      hod_id: "",
      parent_department_id: "",
      email: "",
      phone: "",
      office_location: "",
      established_date: "",
      type: "academic",
      is_active: true,
    },
  });

  useEffect(() => {
    if (department && isOpen) {
      reset({
        name: department.name || "",
        code: department.code || "",
        description: department.description || "",
        hod_id: department.hod_id || "",
        parent_department_id: department.parent_department_id || "",
        email: department.email || "",
        phone: department.phone || "",
        office_location: department.office_location || "",
        established_date: department.established_date || "",
        type: department.type || "academic",
        is_active: department.is_active ?? true,
      });
    } else if (isOpen) {
      reset({
        name: "",
        code: "",
        description: "",
        hod_id: "",
        parent_department_id: "",
        email: "",
        phone: "",
        office_location: "",
        established_date: "",
        type: "academic",
        is_active: true,
      });
    }
    setError(null);
  }, [department, isOpen, reset]);

  // Force type to Academic if restricted
  useEffect(() => {
    if (isOpen && !canViewAdministrative && !department) {
      reset((formValues) => ({
        ...formValues,
        type: "academic",
      }));
    }
  }, [isOpen, canViewAdministrative, department, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err || "Failed to save department");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700">
          <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                  {department ? "Edit Department" : "New Department"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  {department
                    ? "Update the configuration and details for this department."
                    : "Establish a new department by filling in the details below."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
              <form
                id="department-form"
                onSubmit={handleSubmit(onSubmit)}
                className="p-8 space-y-8"
              >
                {/* Error Banner */}
                {error && (
                  <div className="p-4 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-100 dark:border-error-800 text-error-600 dark:text-error-400 text-sm flex items-start shadow-sm">
                    <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Section 1: Department Identity */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Department Identity
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Department Name{" "}
                        <span className="text-error-500">*</span>
                      </label>
                      <input
                        {...register("name")}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all ${
                          errors.name
                            ? "border-error-300 focus:border-error-500"
                            : "border-gray-200 dark:border-gray-700 focus:border-primary-500"
                        }`}
                        placeholder="e.g. Computer Science and Engineering"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-error-500 font-medium flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Code <span className="text-error-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-xs tracking-wider">
                          <Hash className="w-4 h-4" />
                        </div>
                        <input
                          {...register("code")}
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase font-mono text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all ${
                            errors.code
                              ? "border-error-300 focus:border-error-500"
                              : "border-gray-200 dark:border-gray-700 focus:border-primary-500"
                          }`}
                          placeholder="CSE"
                        />
                      </div>
                      {errors.code && (
                        <p className="mt-1.5 text-xs text-error-500 font-medium">
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Established Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          {...register("established_date")}
                          type="date"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {canViewAdministrative && (
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Department Type
                        </label>
                        <div className="grid grid-cols-2 gap-4 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                          <label
                            className={`flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                              watch("type") === "academic"
                                ? "bg-white dark:bg-gray-800 text-primary-600 shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200/50"
                            }`}
                          >
                            <input
                              type="radio"
                              value="academic"
                              {...register("type")}
                              className="sr-only"
                            />
                            Academic
                          </label>
                          <label
                            className={`flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                              watch("type") === "administrative"
                                ? "bg-white dark:bg-gray-800 text-secondary-600 shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200/50"
                            }`}
                          >
                            <input
                              type="radio"
                              value="administrative"
                              {...register("type")}
                              className="sr-only"
                            />
                            Administrative
                          </label>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Academic departments conduct courses and exams.
                          Administrative departments handle operations.
                        </p>
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Description
                      </label>
                      <textarea
                        {...register("description")}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                        placeholder="Brief overview of the department's mission and scope..."
                      />
                    </div>
                  </div>
                </section>

                {/* Section 2: Contact & Location */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-info-50 dark:bg-info-900/20 text-info-600 dark:text-info-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Location & Contact
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Official Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          {...register("email")}
                          type="email"
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all ${
                            errors.email
                              ? "border-error-300 focus:border-error-500"
                              : "border-gray-200 dark:border-gray-700 focus:border-info-500"
                          }`}
                          placeholder="head.cse@university.edu"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-error-500 font-medium">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Office Phone
                      </label>
                      <input
                        {...register("phone")}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-info-500 focus:ring-2 focus:ring-info-500/20 outline-none transition-all"
                        placeholder="+91 40 ..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Location / Block
                      </label>
                      <input
                        {...register("office_location")}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-info-500 focus:ring-2 focus:ring-info-500/20 outline-none transition-all"
                        placeholder="Block A, 3rd Floor"
                      />
                    </div>
                  </div>
                </section>

                {/* Section 3: Leadership */}
                {watch("type") === "academic" && (
                  <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Hierarchy & Leadership
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Head of Department (HOD)
                        </label>
                        <select
                          {...register("hod_id")}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 outline-none transition-all"
                        >
                          <option value="">Select Faculty Member...</option>
                          {facultyList.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                              {faculty.first_name} {faculty.last_name} (
                              {faculty.employee_id || "N/A"})
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-gray-500">
                          The assigned HOD will have administrative privileges
                          for this department.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Parent Department
                        </label>
                        <select
                          {...register("parent_department_id")}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 outline-none transition-all"
                        >
                          <option value="">None (Top Level)</option>
                          {departmentList
                            .filter((d) => d.id !== department?.id)
                            .map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name} ({dept.code})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </section>
                )}

                {/* Status Section */}
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Active Status
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Disable to archive this department and prevent new
                      assignments.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("is_active")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-success-500/20 dark:peer-focus:ring-success-800/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-success-500"></div>
                  </label>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="department-form"
                  disabled={loading}
                  className="flex-1 btn btn-primary flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>
                        {department ? "Save Changes" : "Create Department"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;
