import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form"; // Added useFieldArray
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../store/slices/userSlice";
import { fetchRegulations } from "../../store/slices/regulationSlice";
import {
  X,
  Save,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  GraduationCap,
  Book,
  Users,
  History,
  Trash2,
  Plus,
  Camera,
  CheckCircle2,
  Briefcase,
  Building,
} from "lucide-react";

// Student Schema
const schema = yup.object().shape({
  // Identity
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().optional(),
  gender: yup.string().optional(),
  date_of_birth: yup.string().optional(),
  aadhaar_number: yup.string().optional(),
  pan_number: yup.string().optional(),
  passport_number: yup.string().optional(),
  religion: yup.string().optional(),
  caste: yup.string().optional(),
  nationality: yup.string().optional(),

  // Address
  address: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zip_code: yup.string().optional(),

  // Academic
  student_id: yup.string().required("Student ID is required"),
  admission_number: yup.string().required("Admission Number is required"),
  program_id: yup.string().required("Program is required"),
  department_id: yup.string().optional(), // Often linked to program
  regulation_id: yup.string().required("Regulation is required"),
  batch_year: yup
    .number()
    .typeError("Batch Year must be a number")
    .required("Batch Year is required"),
  current_semester: yup
    .number()
    .min(1)
    .max(12)
    .required("Semester is required"),
  section: yup.string().optional(),

  // Family (Parent Details)
  parent_details: yup
    .object()
    .shape({
      father_name: yup.string().optional(),
      father_mobile: yup.string().optional(),
      father_email: yup.string().email("Invalid email").optional().nullable(),
      father_job: yup.string().optional(),
      mother_name: yup.string().optional(),
      mother_mobile: yup.string().optional(),
      mother_email: yup.string().email("Invalid email").optional().nullable(),
      mother_job: yup.string().optional(),
      guardian_name: yup.string().optional(),
      guardian_mobile: yup.string().optional(),
      guardian_email: yup.string().email("Invalid email").optional().nullable(),
      guardian_job: yup.string().optional(),
    })
    .optional(),

  // History
  previous_academics: yup
    .array()
    .of(
      yup.object().shape({
        qualification: yup.string().required("Qualification is required"),
        school: yup.string().required("Institution is required"),
        board: yup.string().optional(),
        percentage: yup.string().optional(),
        year: yup.string().optional(),
      }),
    )
    .optional(),
});

const EditStudentDrawer = ({
  isOpen,
  onClose,
  user,
  departmentList = [],
  programList = [],
}) => {
  const dispatch = useDispatch();
  const { regulations } = useSelector((state) => state.regulations);
  const [activeTab, setActiveTab] = useState("academic"); // Default to academic for students
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      previous_academics: [],
      parent_details: {},
    },
  });

  const {
    fields: academicFields,
    append: appendAcademic,
    remove: removeAcademic,
  } = useFieldArray({
    control,
    name: "previous_academics",
  });

  useEffect(() => {
    if (user && isOpen) {
      if (!regulations.length) dispatch(fetchRegulations());

      const parseJSON = (data, fallback) => {
        try {
          if (!data) return fallback;
          if (typeof data === "object") return data;
          const parsed = JSON.parse(data);
          // Handle double-stringification
          if (typeof parsed === "string") return JSON.parse(parsed);
          return parsed;
        } catch (e) {
          console.error("JSON Parse Error:", e);
          return fallback;
        }
      };

      const parsedParent = parseJSON(user.parent_details, {});
      const parsedAcademics = parseJSON(user.previous_academics, []);

      reset({
        ...user,
        department_id: user.department_id || "",
        program_id: user.program?.id || user.program_id || "",
        regulation_id: user.regulation_id || "",
        parent_details: parsedParent,
        previous_academics: parsedAcademics,
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : "",
      });
      setError(null);
    }
  }, [user, isOpen, reset, regulations, dispatch]);

  const getInputClass = (fieldName) => {
    const hasError = fieldName
      .split(".")
      .reduce((obj, key) => obj?.[key], errors);
    const baseClass =
      "form-input w-full rounded-xl transition-all dark:text-white";
    const normalClass =
      "bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 dark:bg-gray-800 dark:border-gray-700";
    const errorClass =
      "bg-error-50 border-error-500 focus:bg-white focus:border-error-500 focus:ring-4 focus:ring-error-500/10 dark:bg-error-900/10 dark:border-error-500";

    return `${baseClass} ${hasError ? errorClass : normalClass}`;
  };

  const onError = (errors) => {
    console.error("Validation Errors:", errors);
    const errorCount = Object.keys(errors).length;
    setError(`Please fix the ${errorCount} error(s) highlighted in red.`);

    // Auto-switch to tab with error
    const academicFields = ["program_id", "regulation_id", "student_id", "admission_number", "batch_year", "current_semester", "department_id", "section"];
    const personalFields = ["first_name", "last_name", "email", "phone", "date_of_birth", "aadhaar_number", "pan_number", "passport_number", "nationality", "religion", "caste", "address", "city", "state", "zip_code"];

    // Helper to check if any field in the list has an error
    const hasErrorIn = (fields) => fields.some(field => field.split('.').reduce((obj, key) => obj?.[key], errors));

    if (hasErrorIn(academicFields) && activeTab !== "academic") {
      setActiveTab("academic");
    } else if (hasErrorIn(personalFields) && activeTab !== "personal") {
      setActiveTab("personal");
    } else if (errors.parent_details && activeTab !== "family") {
      setActiveTab("family");
    } else if (errors.previous_academics && activeTab !== "history") {
      setActiveTab("history");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    // Prepare payload
    // Ensure parent_details and previous_academics are stringified if backend expects them that way,
    // OR just send object if backend handles JSON body directly.
    // Based on `StudentForm.jsx`, it appends them as JSON strings to FormData?
    // `updateUser` thunk handles both JSON and FormData. If we send a plain object, `updateUser` sends JSON.
    // Let's check `userController.js`. It does `req.body`.
    // Safe to send as object if we aren't uploading files here.
    // If we want to be safe and match the strict `StudentForm` FormData approach:
    // But `StaffList` `updateUser` call sends raw object usually.
    // Let's send raw object, backend usually handles it.

    // Correction: `StudentForm` uses `FormData` because of file uploads.
    // Here we are edit-only, likely no file upload directly in this drawer yet?
    // If we send JSON, `user.update(req.body)` works for JSON columns in Sequelize if defined as JSON/JSONB.

    const payload = {
      ...data,
      // Ensure complex objects are updated correctly
      parent_details: data.parent_details,
      previous_academics: data.previous_academics,
    };

    try {
      await dispatch(updateUser({ id: user.id, data: payload })).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update student:", err);
      setError(err?.message || "Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "academic",
      label: "Academic Info",
      icon: GraduationCap,
      hasError: !!(
        errors.program_id ||
        errors.regulation_id ||
        errors.student_id ||
        errors.admission_number ||
        errors.batch_year ||
        errors.current_semester ||
        errors.department_id ||
        errors.section
      ),
    },
    {
      id: "personal",
      label: "Personal Details",
      icon: User,
      hasError: !!(
        errors.first_name ||
        errors.last_name ||
        errors.email ||
        errors.phone ||
        errors.date_of_birth ||
        errors.aadhaar_number ||
        errors.pan_number ||
        errors.passport_number ||
        errors.nationality ||
        errors.religion ||
        errors.caste ||
        errors.address ||
        errors.city ||
        errors.state ||
        errors.zip_code
      ),
    },
    {
      id: "family",
      label: "Family / Guardian",
      icon: Users,
      hasError: !!errors.parent_details,
    },
    {
      id: "history",
      label: "History",
      icon: History,
      hasError: !!errors.previous_academics,
    },
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
        {/* Header */}
        <div className="flex-none px-8 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative group cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-50 dark:from-secondary-900/30 dark:to-secondary-800/30 flex items-center justify-center text-2xl font-bold text-secondary-600 dark:text-secondary-400 shadow-inner">
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
                    {user?.student_id || "No ID"}
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

          {/* Tabs */}
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
                    ${isActive
                      ? "text-secondary-600 bg-secondary-50 dark:bg-secondary-900/20 dark:text-secondary-400 ring-1 ring-secondary-500/10"
                      : tab.hasError
                        ? "text-error-600 bg-error-50 dark:bg-error-900/10 dark:text-error-400 ring-1 ring-error-500/10"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400"
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "stroke-2" : "stroke-[1.5px]"}`}
                  />
                  {tab.label}
                  {tab.hasError && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                  )}
                  {isActive && !tab.hasError && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary-500 translate-y-2 opacity-0 group-hover:translate-y-1 group-hover:opacity-100 transition-all" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <form
            id="edit-student-form"
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-8 max-w-3xl mx-auto"
          >
            {error && (
              <div className="p-4 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Academic Info */}
            {activeTab === "academic" && (
              <div className="space-y-8 animate-fade-in-up">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Book className="w-4 h-4 text-secondary-500" />
                    Course & Enrollment
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Program / Branch
                      </label>
                      <select
                        {...register("program_id")}
                        className={`form-select ${getInputClass("program_id")}`}
                      >
                        <option value="">Select Program...</option>
                        {programList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                      {errors.program_id && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.program_id.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Regulation
                      </label>
                      <select
                        {...register("regulation_id")}
                        className={`form-select ${getInputClass("regulation_id")}`}
                      >
                        <option value="">Select Regulation...</option>
                        {regulations?.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.academic_year})
                          </option>
                        ))}
                      </select>
                      {errors.regulation_id && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.regulation_id.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Department
                      </label>
                      <select
                        {...register("department_id")}
                        className={`form-select ${getInputClass("department_id")}`}
                      >
                        <option value="">Select Department...</option>
                        {departmentList.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Batch Year
                      </label>
                      <input
                        type="number"
                        {...register("batch_year")}
                        className={getInputClass("batch_year")}
                      />
                      {errors.batch_year && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.batch_year.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary-500" />
                    Class Details
                  </h3>
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Student ID
                      </label>
                      <input
                        {...register("student_id")}
                        className={`${getInputClass("student_id")} font-mono`}
                      />
                      {errors.student_id && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.student_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Admission No
                      </label>
                      <input
                        {...register("admission_number")}
                        className={`${getInputClass("admission_number")} font-mono`}
                      />
                      {errors.admission_number && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.admission_number.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Section
                      </label>
                      <input
                        {...register("section")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Current Sem
                      </label>
                      <input
                        type="number"
                        {...register("current_semester")}
                        className={getInputClass("current_semester")}
                      />
                      {errors.current_semester && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.current_semester.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "personal" && (
              <div className="space-y-8 animate-fade-in-up">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        First Name
                      </label>
                      <input
                        {...register("first_name")}
                        className={getInputClass("first_name")}
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
                        className={getInputClass("last_name")}
                      />
                      {errors.last_name && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.last_name.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register("email")}
                          className={`${getInputClass("email")} pl-10`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register("phone")}
                          className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 pl-10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-warning-500" />
                    Identity & Verification
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Aadhaar Number
                      </label>
                      <input
                        {...register("aadhaar_number")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="12-digit number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        PAN Number
                      </label>
                      <input
                        {...register("pan_number")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Passport Number
                      </label>
                      <input
                        {...register("passport_number")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Nationality
                      </label>
                      <input
                        {...register("nationality")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Religion
                      </label>
                      <input
                        {...register("religion")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Caste / Category
                      </label>
                      <input
                        {...register("caste")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-error-500" />
                    Address
                  </h3>
                  <div className="space-y-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Street Address
                      </label>
                      <textarea
                        {...register("address")}
                        rows={2}
                        className="form-textarea w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                          City
                        </label>
                        <input
                          {...register("city")}
                          className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                          State
                        </label>
                        <input
                          {...register("state")}
                          className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                          Zip Code
                        </label>
                        <input
                          {...register("zip_code")}
                          className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "family" && (
              <div className="space-y-8 animate-fade-in-up">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-info-500" />
                    Parents Details
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Father's Name
                      </label>
                      <input
                        {...register("parent_details.father_name")}
                        className={getInputClass("parent_details.father_name")}
                      />
                      {errors.parent_details?.father_name && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.parent_details.father_name.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Father's Mobile
                      </label>
                      <input
                        {...register("parent_details.father_mobile")}
                        className={getInputClass(
                          "parent_details.father_mobile",
                        )}
                      />
                      {errors.parent_details?.father_mobile && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.parent_details.father_mobile.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Father's Occupation
                      </label>
                      <input
                        {...register("parent_details.father_job")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Father's Email
                      </label>
                      <input
                        {...register("parent_details.father_email")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="col-span-2 h-px bg-gray-100 dark:bg-gray-800 my-2" />

                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Mother's Name
                      </label>
                      <input
                        {...register("parent_details.mother_name")}
                        className={getInputClass("parent_details.mother_name")}
                      />
                      {errors.parent_details?.mother_name && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.parent_details.mother_name.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Mother's Mobile
                      </label>
                      <input
                        {...register("parent_details.mother_mobile")}
                        className={getInputClass(
                          "parent_details.mother_mobile",
                        )}
                      />
                      {errors.parent_details?.mother_mobile && (
                        <p className="text-xs text-error-500 mt-1 ml-1">
                          {errors.parent_details.mother_mobile.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Mother's Occupation
                      </label>
                      <input
                        {...register("parent_details.mother_job")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Mother's Email
                      </label>
                      <input
                        {...register("parent_details.mother_email")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="col-span-2 h-px bg-gray-100 dark:bg-gray-800 my-2" />

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Guardian Details (Optional)
                      </label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <input
                            {...register("parent_details.guardian_name")}
                            className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="Guardian Name"
                          />
                        </div>
                        <div>
                          <input
                            {...register("parent_details.guardian_mobile")}
                            className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="Guardian Mobile"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-8 animate-fade-in-up">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-warning-500" />
                      Previous Academics
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        appendAcademic({
                          school: "",
                          board: "",
                          percentage: "",
                        })
                      }
                      className="btn btn-xs bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Record
                    </button>
                  </div>

                  {academicFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeAcademic(index)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-error-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                            Qualification
                          </label>
                          <select
                            {...register(
                              `previous_academics.${index}.qualification`,
                            )}
                            className={`form-select ${getInputClass(`previous_academics.${index}.qualification`)}`}
                          >
                            <option value="">Select Qualification</option>
                            <option value="10th">10th Class / SSC</option>
                            <option value="12th">
                              12th Class / Inter / PUC
                            </option>
                            <option value="Diploma">Diploma</option>
                            <option value="Graduation">Graduation (UG)</option>
                            <option value="Post Graduation">
                              Post Graduation (PG)
                            </option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.previous_academics?.[index]
                            ?.qualification && (
                              <p className="text-[10px] text-error-500 mt-1 ml-1">
                                {
                                  errors.previous_academics[index].qualification
                                    .message
                                }
                              </p>
                            )}
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                            Institute / School Name
                          </label>
                          <input
                            {...register(`previous_academics.${index}.school`)}
                            className={getInputClass(
                              `previous_academics.${index}.school`,
                            )}
                          />
                          {errors.previous_academics?.[index]?.school && (
                            <p className="text-[10px] text-error-500 mt-1 ml-1">
                              {errors.previous_academics[index].school.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                            Board / Degree
                          </label>
                          <input
                            {...register(`previous_academics.${index}.board`)}
                            className="form-input w-full rounded-xl bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                            Percentage / CGPA
                          </label>
                          <input
                            {...register(
                              `previous_academics.${index}.percentage`,
                            )}
                            className="form-input w-full rounded-xl bg-white focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {academicFields.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-400">
                        No academic history added
                      </p>
                    </div>
                  )}
                </section>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
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
              form="edit-student-form"
              type="submit"
              disabled={loading || !isDirty}
              className="btn bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-secondary-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStudentDrawer;
