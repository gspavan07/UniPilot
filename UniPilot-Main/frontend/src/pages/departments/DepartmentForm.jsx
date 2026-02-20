import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Calendar,
  MapPin,
  User as UserIcon,
  Building2,
  DoorOpen,
} from "lucide-react";
import {
  fetchBlocks,
  fetchBlockDetails,
} from "../../store/slices/infrastructureSlice";

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
  block_id: yup
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  room_id: yup
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
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
  const {
    blocks,
    currentBlock,
    status: infraStatus,
  } = useSelector((state) => state.infrastructure);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch blocks on mount
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchBlocks());
    }
  }, [isOpen, dispatch]);

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
      block_id: "",
      room_id: "",
    },
  });

  // Watch block_id changes to fetch rooms
  const selectedBlockId = watch("block_id");
  useEffect(() => {
    if (selectedBlockId) {
      dispatch(fetchBlockDetails(selectedBlockId));
    }
  }, [selectedBlockId, dispatch]);

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
        block_id: department.block_id || "",
        room_id: department.room_id || "",
      });
      // Fetch details for the existing block to populate rooms
      if (department.block_id) {
        dispatch(fetchBlockDetails(department.block_id));
      }
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
        block_id: "",
        room_id: "",
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700">
          <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black text-black dark:text-white tracking-tight">
                  {department ? "Edit Department" : "New Department"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                  {department
                    ? "Update the configuration and details for this department."
                    : "Establish a new department by filling in the details below."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 -mr-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-all"
              >
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
              <form
                id="department-form"
                onSubmit={handleSubmit(onSubmit)}
                className="p-8 space-y-6"
              >
                {/* Error Banner */}
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-start shadow-sm">
                    <AlertCircle
                      className="w-5 h-5 mr-3 mt-0.5 shrink-0"
                      strokeWidth={2.5}
                    />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                {/* Section 1: Department Identity */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border-2 border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                      <Building
                        className="w-5 h-5 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className="text-lg font-black text-black dark:text-white">
                      Department Identity
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Department Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        {...register("name")}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.name
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-800 focus:border-blue-500"
                          }`}
                        placeholder="e.g. Computer Science and Engineering"
                      />
                      {errors.name && (
                        <p className="mt-2 text-xs text-red-600 font-bold flex items-center">
                          <AlertCircle
                            className="w-3.5 h-3.5 mr-1.5"
                            strokeWidth={2.5}
                          />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Code <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Hash className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <input
                          {...register("code")}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-900 text-black dark:text-white uppercase font-mono text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.code
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 dark:border-gray-800 focus:border-blue-500"
                            }`}
                          placeholder="CSE"
                        />
                      </div>
                      {errors.code && (
                        <p className="mt-2 text-xs text-red-600 font-bold">
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Established Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Calendar className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <input
                          {...register("established_date")}
                          type="date"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {canViewAdministrative && (
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Department Type
                        </label>
                        <div className="grid grid-cols-2 gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                          <label
                            className={`flex items-center justify-center py-3 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200 ${watch("type") === "academic"
                              ? "bg-white dark:bg-gray-900 text-blue-600 shadow-md"
                              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
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
                            className={`flex items-center justify-center py-3 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200 ${watch("type") === "administrative"
                              ? "bg-white dark:bg-gray-900 text-blue-600 shadow-md"
                              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
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
                        <p className="mt-2 text-xs text-gray-500 font-medium">
                          Academic departments conduct courses and exams.
                          Administrative departments handle operations.
                        </p>
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        {...register("description")}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                        placeholder="Brief overview of the department's mission and scope..."
                      />
                    </div>
                  </div>
                </section>

                {/* Section 2: Contact & Location */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border-2 border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                      <MapPin
                        className="w-5 h-5 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className="text-lg font-black text-black dark:text-white">
                      Location & Contact
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Official Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <input
                          {...register("email")}
                          type="email"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.email
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 dark:border-gray-800 focus:border-blue-500"
                            }`}
                          placeholder="head.cse@university.edu"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-xs text-red-600 font-bold">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Office Phone
                      </label>
                      <input
                        {...register("phone")}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="+91 40 ..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Location / Block
                      </label>
                      <input
                        {...register("office_location")}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="Block A, 3rd Floor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Block
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Building2 className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <select
                          {...register("block_id")}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        >
                          <option value="">Select Block...</option>
                          {blocks.map((block) => (
                            <option key={block.id} value={block.id}>
                              {block.name} ({block.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Room
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <DoorOpen className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <select
                          {...register("room_id")}
                          disabled={!watch("block_id")}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Room...</option>
                          {currentBlock?.rooms?.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.room_number} - {room.name || room.type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3: Leadership */}
                {watch("type") === "academic" && (
                  <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border-2 border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                        <UserIcon
                          className="w-5 h-5 text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                      <h3 className="text-lg font-black text-black dark:text-white">
                        Hierarchy & Leadership
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Head of Department (HOD)
                        </label>
                        <select
                          {...register("hod_id")}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        >
                          <option value="">Select Faculty Member...</option>
                          {facultyList.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                              {faculty.first_name} {faculty.last_name} (
                              {faculty.employee_id || "N/A"})
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-gray-500 font-medium">
                          The assigned HOD will have administrative privileges
                          for this department.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Parent Department
                        </label>
                        <select
                          {...register("parent_department_id")}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
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
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-sm font-black text-black dark:text-white">
                      Active Status
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
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
                    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:ring-4 focus:ring-gray-200/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="department-form"
                  disabled={loading}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <>
                      <Save className="w-5 h-5" strokeWidth={2.5} />
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
