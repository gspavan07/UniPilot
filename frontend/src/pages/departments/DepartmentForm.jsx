import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700">
          <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl rounded-l-3xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                  {department ? "Edit Department" : "Add Department"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {department
                    ? "Update the details for this department."
                    : "Create a new academic department."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {error && (
                <div className="p-4 rounded-2xl bg-error-50 dark:bg-error-900/30 border border-error-500/30 text-error-700 dark:text-error-300 text-sm flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form
                id="department-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <Building className="w-4 h-4 text-primary-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      General Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Department Name</label>
                      <input
                        {...register("name")}
                        className={`input ${errors.name ? "border-error-500 focus:ring-error-500" : ""}`}
                        placeholder="e.g. Computer Science and Engineering"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Code</label>
                      <input
                        {...register("code")}
                        className={`input ${errors.code ? "border-error-500 focus:ring-error-500" : ""}`}
                        placeholder="e.g. CSE"
                      />
                      {errors.code && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.code.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Established Date</label>
                      <input
                        {...register("established_date")}
                        type="date"
                        className="input"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label">Classification / Type</label>
                      <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <label
                          className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${register("type").value === "academic" ? "bg-white dark:bg-gray-800 text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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
                          className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${register("type").value === "administrative" ? "bg-white dark:bg-gray-800 text-secondary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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
                    </div>
                    <div className="col-span-2">
                      <label className="label">Description</label>
                      <textarea
                        {...register("description")}
                        rows="3"
                        className="input resize-none"
                        placeholder="Brief overview of the department..."
                      />
                    </div>
                  </div>
                </div>

                {/* Organization Section */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <UserIcon className="w-4 h-4 text-secondary-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Leadership & Structure
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label">Head of Department (HOD)</label>
                      <select {...register("hod_id")} className="input">
                        <option value="">Select Faculty...</option>
                        {facultyList.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.first_name} {faculty.last_name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[10px] text-gray-400">
                        Can be assigned later if current faculty is not on
                        system.
                      </p>
                    </div>

                    <div>
                      <label className="label">
                        Parent Department (Optional)
                      </label>
                      <select
                        {...register("parent_department_id")}
                        className="input"
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
                </div>

                {/* Contact Section */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <Mail className="w-4 h-4 text-info-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Contact & Location
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="label">Department Email</label>
                        <input
                          {...register("email")}
                          type="email"
                          className={`input ${errors.email ? "border-error-500 focus:ring-error-500" : ""}`}
                          placeholder="e.g. hod.cse@university.edu"
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-error-600 font-medium">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="label">Office Phone / Ext.</label>
                        <input
                          {...register("phone")}
                          className="input"
                          placeholder="e.g. +1 234-567-8900"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Office Location</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            {...register("office_location")}
                            className="input pl-10"
                            placeholder="e.g. Block A, 3rd Floor, Room 302"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Active Status
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow users to be assigned to this department.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("is_active")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="department-form"
                  disabled={loading}
                  className="flex-1 btn btn-primary flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/30"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{department ? "Update" : "Create"}</span>
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
