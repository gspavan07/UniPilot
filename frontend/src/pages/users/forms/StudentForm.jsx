import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  Save,
  AlertCircle,
  Loader2,
  ExternalLink,
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  Users as UsersIcon,
  Plus as PlusIcon,
  Trash2,
  Plus,
  PlusCircle,
  History,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  CreditCard,
  Globe,
  Briefcase,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { baseUserSchema, baseDefaultValues } from "./baseSchema";
import useFieldConfig from "../../../hooks/useFieldConfig";
import { fetchDepartments } from "../../../store/slices/departmentSlice";
import { fetchPrograms } from "../../../store/slices/programSlice";
import api from "../../../utils/api";

const studentSchema = yup.object().shape({
  ...baseUserSchema,
  auto_generate: yup.boolean().default(true),
  role: yup.string().default("student"),
  role_id: yup.string().required(),
  program_id: yup.string().required("Program is required"),
  student_id: yup.string().when("auto_generate", {
    is: true,
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.required("Student ID is required"),
  }),
  admission_number: yup.string().when("auto_generate", {
    is: true,
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.required("Admission Number is required"),
  }),
  current_semester: yup
    .number()
    .min(1)
    .max(12)
    .required("Semester is required"),
  batch_year: yup.number().required("Batch year is required"),
  admission_type: yup
    .string()
    .oneOf(["management", "convener"], "Invalid admission type")
    .required("Admission Type is required"),
  academic_status: yup.string().default("active"),
  guardian_type: yup.string().default("Both Parents"),
  single_parent_type: yup.string().optional(),
  custom_fields: yup.object().optional(),
  father_name: yup.string().optional(),
  father_job: yup.string().optional(),
  father_income: yup.string().optional(),
  father_email: yup.string().email("Invalid email").optional().nullable(),
  father_mobile: yup.string().optional(),
  mother_name: yup.string().optional(),
  mother_job: yup.string().optional(),
  mother_income: yup.string().optional(),
  mother_email: yup.string().email("Invalid email").optional().nullable(),
  mother_mobile: yup.string().optional(),
  guardian_name: yup.string().optional(),
  guardian_job: yup.string().optional(),
  guardian_email: yup.string().email("Invalid email").optional().nullable(),
  guardian_mobile: yup.string().optional(),
  previous_academics: yup
    .array()
    .of(
      yup.object().shape({
        school: yup.string().required("School name is required"),
        board: yup.string().required("Board is required"),
        percentage: yup.string().required("Percentage is required"),
        year: yup.string().required("Year is required"),
      })
    )
    .optional(),
});

const StudentForm = ({
  isOpen,
  onClose,
  onSave,
  user,
  departmentList,
  programList,
  roleId,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [error, setError] = useState(null);

  const [previewId, setPreviewId] = useState("---");
  const [admissionConfig, setAdmissionConfig] = useState(null);
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [existingDocuments, setExistingDocuments] = useState([]);
  const { isVisible, applyConfig } = useFieldConfig("student");
  const dispatch = useDispatch(); // Initialize useDispatch

  const steps = [
    { id: 1, title: "Academic", icon: GraduationCap },
    { id: 2, title: "Personal", icon: UserIcon },
    { id: 3, title: "Family", icon: UsersIcon },
    { id: 4, title: "History", icon: History },
    { id: 5, title: "Docs", icon: FileText },
    { id: 6, title: "Review", icon: ShieldCheck },
  ];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(studentSchema),
    defaultValues: {
      ...baseDefaultValues,
      role: "student",
      role_id: roleId,
      program_id: "",
      student_id: "",
      admission_number: "",
      current_semester: 1,
      batch_year: new Date().getFullYear(),
      admission_type: "management",
      academic_status: "active",
      guardian_type: "Both Parents",
      single_parent_type: "Father",
      previous_academics: [],
      auto_generate: true,
      nationality: "Indian",
      custom_fields: {},
    },
  });

  const autoGenerate = watch("auto_generate");
  const guardianType = watch("guardian_type");
  const singleParentType = watch("single_parent_type");
  const admissionType = watch("admission_type");
  const previousAcademics = watch("previous_academics") || [];
  const programId = watch("program_id");
  const batchYear = watch("batch_year");
  const isTemporary = watch("is_temporary_id");

  // Generate ID Preview
  useEffect(() => {
    if (currentStep === 6 && autoGenerate && admissionConfig && programId) {
      const program = programList.find((p) => p.id === programId);
      if (program) {
        const format = isTemporary
          ? admissionConfig.temp_id_format || "TM-{YY}-{BRANCH}-{SEQ}"
          : admissionConfig.id_format || "ST-{YY}-{BRANCH}-{SEQ}";

        const yearShort = (batchYear || new Date().getFullYear())
          .toString()
          .slice(-2);
        const sequence = (admissionConfig.current_sequence || 1)
          .toString()
          .padStart(3, "0");
        const univCode = admissionConfig.university_code || "UPU";

        let branchCode = program.code?.split("-")[1] || program.code || "XX";
        if (isTemporary) branchCode += "TM";

        const generated = format
          .replace("{YY}", yearShort)
          .replace("{UNIV}", univCode)
          .replace("{BRANCH}", branchCode)
          .replace("{SEQ}", sequence);

        setPreviewId(generated);
      }
    }
  }, [
    currentStep,
    autoGenerate,
    admissionConfig,
    programId,
    batchYear,
    isTemporary,
    programList,
  ]);

  useEffect(() => {
    if (isOpen) {
      const fetchConfigAndSeats = async () => {
        try {
          // Fetch Config
          const configRes = await api.get("/admission/configs?is_active=true");
          if (configRes.data.data.length > 0) {
            const activeConfig = configRes.data.data[0];
            setAdmissionConfig(activeConfig);

            // Fetch Seat Matrix for this batch
            const seatRes = await api.get(
              `/admission/seat-matrix?year=${activeConfig.batch_year}`
            );
            setSeatMatrix(seatRes.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch admission data", error);
        }
      };

      dispatch(fetchDepartments());
      dispatch(fetchPrograms());
      fetchConfigAndSeats();
    }

    if (roleId) {
      setValue("role_id", roleId);
    }

    if (user && isOpen) {
      let parsedCustomFields = user.custom_fields || {};
      if (typeof parsedCustomFields === "string") {
        try {
          parsedCustomFields = JSON.parse(parsedCustomFields);
        } catch (e) {
          parsedCustomFields = {};
        }
      }

      let parsedPreviousAcademics = user.previous_academics || [];
      if (typeof parsedPreviousAcademics === "string") {
        try {
          parsedPreviousAcademics = JSON.parse(parsedPreviousAcademics);
        } catch (e) {
          parsedPreviousAcademics = [];
        }
      }

      // Fetch existing documents for the user
      api
        .get(`/admission/documents/${user.id}`)
        .then((res) => setExistingDocuments(res.data.data))
        .catch((err) => console.error("Failed to fetch documents", err));

      reset({
        ...user,
        custom_fields: parsedCustomFields,
        role_id: roleId,
        auto_generate: false, // Force manual/existing ID mode for edits
        gender: user.gender
          ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
          : "Other",
        guardian_type: user.parent_details?.guardian_type || "Both Parents",
        father_name: user.parent_details?.father_name || "",
        father_job: user.parent_details?.father_job || "",
        father_income: user.parent_details?.father_income || "",
        father_email: user.parent_details?.father_email || "",
        father_mobile: user.parent_details?.father_mobile || "",
        mother_name: user.parent_details?.mother_name || "",
        mother_job: user.parent_details?.mother_job || "",
        mother_income: user.parent_details?.mother_income || "",
        mother_email: user.parent_details?.mother_email || "",
        mother_mobile: user.parent_details?.mother_mobile || "",
        guardian_name: user.parent_details?.guardian_name || "",
        guardian_job: user.parent_details?.guardian_job || "",
        guardian_email: user.parent_details?.guardian_email || "",
        guardian_mobile: user.parent_details?.guardian_mobile || "",
        previous_academics: parsedPreviousAcademics,
      });
    }
  }, [dispatch, isOpen, user, reset, roleId]);

  const onSubmit = async (data) => {
    // Prevent submission if not on the final step
    if (currentStep < steps.length) {
      handleNext();
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuccess(false);

    const formData = new FormData();
    // 1. Core Fields
    Object.keys(data).forEach((key) => {
      if (typeof data[key] !== "object" && key !== "documents") {
        formData.append(key, data[key]);
      }
    });

    // Explicitly handle date/files if needed, but the loop covers most strings

    // 3. Parent Details - Validate and Merge
    const existingParentDetails = user ? user.parent_details || {} : {};
    formData.append(
      "parent_details",
      JSON.stringify({
        ...existingParentDetails, // Merge existing fields to prevent data loss
        guardian_type: data.guardian_type,
        single_parent_type: data.single_parent_type,
        father_name: data.father_name,
        father_job: data.father_job,
        father_income: data.father_income,
        father_email: data.father_email,
        father_mobile: data.father_mobile,
        mother_name: data.mother_name,
        mother_job: data.mother_job,
        mother_income: data.mother_income,
        mother_email: data.mother_email,
        mother_mobile: data.mother_mobile,
        guardian_name: data.guardian_name,
        guardian_job: data.guardian_job,
        guardian_email: data.guardian_email,
        guardian_mobile: data.guardian_mobile,
      })
    );

    // 4. Previous Academics
    formData.append(
      "previous_academics",
      JSON.stringify(data.previous_academics || [])
    );

    // 5. Custom Fields
    let customFields = {};
    if (user && user.custom_fields) {
      // Parse existing custom fields if string
      let oldCustom = user.custom_fields;
      if (typeof oldCustom === "string") {
        try {
          oldCustom = JSON.parse(oldCustom);
        } catch (e) {
          oldCustom = {};
        }
      }
      customFields = { ...oldCustom };
    }

    if (admissionConfig?.field_config?.custom) {
      Object.keys(admissionConfig.field_config.custom).forEach((key) => {
        if (data[key]) customFields[key] = data[key];
      });
    }
    formData.append("custom_fields", JSON.stringify(customFields));

    // 6. Documents
    Object.keys(selectedFiles).forEach((key) => {
      formData.append("documents", selectedFiles[key]);
      formData.append("document_types", key);
    });

    try {
      await onSave(formData);
      setRegisteredStudent({
        name: `${data.first_name} ${data.last_name}`,
        id: data.student_id,
        email: data.email,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        "department_id",
        "program_id",
        "batch_year",
        "current_semester",
        "admission_type",
      ];
      if (!autoGenerate) {
        fieldsToValidate.push("student_id", "admission_number");
      }
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "first_name",
        "last_name",
        "email",
        "gender",
        "date_of_birth",
        "phone",
        "address",
        "city",
        "state",
        "zip_code",
      ];
    } else if (currentStep === 3) {
      if (guardianType === "Both Parents") {
        fieldsToValidate = ["father_name", "mother_name"];
      } else if (guardianType === "Single Parent") {
        const subtype = getValues("single_parent_type") || "Father";
        fieldsToValidate = [
          subtype === "Father" ? "father_name" : "mother_name",
        ];
      } else {
        fieldsToValidate = ["guardian_name"];
      }
    } else if (currentStep === 4) {
      fieldsToValidate = ["previous_academics"];
    }

    const isValid =
      fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const getStepStatus = (id) =>
    currentStep > id ? "complete" : currentStep === id ? "current" : "upcoming";

  // Actually, I need to pull 'trigger' from useForm

  const addAcademicRow = () => {
    reset({
      ...watch(),
      previous_academics: [
        ...previousAcademics,
        { school: "", board: "", percentage: "", year: "" },
      ],
    });
  };

  const getInputClass = (name) => {
    const hasError = name.includes(".")
      ? name.split(".").reduce((obj, key) => obj && obj[key], errors)
      : errors[name];

    return `input transition-all duration-200 ${
      hasError
        ? "border-error-500 focus:border-error-500 focus:ring-error-500/20 bg-error-50/10"
        : "focus:border-primary-500 focus:ring-primary-500/20"
    }`;
  };

  const isFieldVisible = (section, field) => {
    if (!admissionConfig?.field_config?.[section]) return true;
    return admissionConfig.field_config[section][field]?.visible !== false;
  };

  const isFieldRequired = (section, field) => {
    if (!admissionConfig?.field_config?.[section]) return false;
    return admissionConfig.field_config[section][field]?.required === true;
  };

  const renderFieldLabel = (section, field, label, required = false) => {
    const configRequired = isFieldRequired(section, field);
    const finalRequired = required || configRequired;
    return (
      <label className="label">
        {label}{" "}
        {finalRequired && <span className="text-error-500 ml-0.5">*</span>}
      </label>
    );
  };

  if (!isOpen) return null;

  const onInvalid = (errors) => {
    console.error("Form Validation Errors:", errors);
  };

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
              {user ? "Edit Student Profile" : "Register New Student"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enroll a student with full academic and personal records.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const status = getStepStatus(step.id);
              return (
                <div
                  key={step.id}
                  className="flex items-center flex-1 last:flex-initial"
                >
                  <div
                    className="flex flex-col items-center group cursor-pointer"
                    onClick={() =>
                      (status === "complete" || step.id < currentStep) &&
                      setCurrentStep(step.id)
                    }
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${status === "complete" ? "bg-emerald-500 text-white" : status === "current" ? "bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                    >
                      {status === "complete" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`text-[9px] mt-1 font-black uppercase tracking-widest ${status === "current" ? "text-primary-600" : "text-gray-400"}`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                      <div
                        className={`absolute inset-0 bg-primary-500 transition-all duration-500 ${status === "complete" ? "w-full" : "w-0"}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8 relative">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              {user ? "Update Successful!" : "Registration Successful!"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-10">
              Student{" "}
              <span className="text-emerald-600 font-black tracking-tight uppercase">
                "{registeredStudent?.name}"
              </span>{" "}
              has been {user ? "updated" : "registered"} and is now awaiting
              verification.
            </p>

            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentStep(1);
                }}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-black text-sm shadow-xl shadow-primary-200 dark:shadow-none flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Register Another Student</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-bold text-sm"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Hidden Fields for Validation */}
            <input type="hidden" {...register("role")} />
            <input type="hidden" {...register("role_id")} />

            {error && (
              <div className="p-4 rounded-2xl bg-error-50 dark:bg-error-900/30 border border-error-500/30 text-error-700 dark:text-error-300 text-sm flex items-start animate-shake">
                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <GraduationCap className="w-4 h-4 text-primary-500" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                      College Affiliation
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {isFieldVisible("academic", "department_id") && (
                      <div className="col-span-2">
                        {renderFieldLabel(
                          "academic",
                          "department_id",
                          "Department",
                          true
                        )}
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
                        {errors.department_id && (
                          <p className="text-error-500 text-[10px] mt-1">
                            {errors.department_id.message}
                          </p>
                        )}
                      </div>
                    )}
                    {isFieldVisible("academic", "program_id") && (
                      <div className="col-span-2">
                        {renderFieldLabel(
                          "academic",
                          "program_id",
                          "Program",
                          true
                        )}
                        <select
                          {...register("program_id")}
                          className={getInputClass("program_id")}
                        >
                          <option value="">Select Program</option>
                          {programList.map((prog) => {
                            const seatInfo = seatMatrix.find(
                              (s) => s.id === prog.id
                            );
                            const isFull =
                              seatInfo && seatInfo.available_seats <= 0;

                            return (
                              <option
                                key={prog.id}
                                value={prog.id}
                                disabled={isFull}
                              >
                                {prog.name} {prog.code ? `(${prog.code})` : ""}
                                {seatInfo
                                  ? ` - ${seatInfo.available_seats}/${seatInfo.max_intake} seats available`
                                  : ""}
                                {isFull ? " (FULL)" : ""}
                              </option>
                            );
                          })}
                        </select>
                        {errors.program_id && (
                          <p className="text-error-500 text-[10px] mt-1">
                            {errors.program_id.message}
                          </p>
                        )}
                      </div>
                    )}
                    {!user && (
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            {...register("auto_generate")}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                            Auto-generate Roll Number & Admission No.
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            {...register("is_temporary_id")}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                            Issue Temporary ID
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      {renderFieldLabel(
                        "personal",
                        "student_id",
                        "Student ID",
                        true
                      )}
                      <input
                        {...register("student_id")}
                        disabled={autoGenerate}
                        className={`${getInputClass("student_id")} ${autoGenerate ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50" : ""}`}
                        placeholder={
                          autoGenerate ? "Auto-generating..." : "ST100"
                        }
                      />
                      {errors.student_id && (
                        <p className="text-[10px] text-error-500 mt-1">
                          {errors.student_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      {renderFieldLabel(
                        "personal",
                        "admission_number",
                        "Admission No.",
                        true
                      )}
                      <input
                        {...register("admission_number")}
                        disabled={autoGenerate}
                        className={`${getInputClass("admission_number")} ${autoGenerate ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50" : ""}`}
                        placeholder={
                          autoGenerate ? "Auto-generating..." : "ADM/01"
                        }
                      />
                      {errors.admission_number && (
                        <p className="text-[10px] text-error-500 mt-1">
                          {errors.admission_number.message}
                        </p>
                      )}
                    </div>
                    <div>
                      {renderFieldLabel(
                        "academic",
                        "batch_year",
                        "Batch Year",
                        true
                      )}
                      <input
                        {...register("batch_year")}
                        type="number"
                        className={getInputClass("batch_year")}
                        placeholder="2024"
                      />
                      {errors.batch_year && (
                        <p className="text-[10px] text-error-500 mt-1">
                          {errors.batch_year.message}
                        </p>
                      )}
                    </div>
                    <div>
                      {renderFieldLabel(
                        "academic",
                        "current_semester",
                        "Semester",
                        true
                      )}
                      <input
                        {...register("current_semester")}
                        type="number"
                        className={getInputClass("current_semester")}
                      />
                      {errors.current_semester && (
                        <p className="text-[10px] text-error-500 mt-1">
                          {errors.current_semester.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      {renderFieldLabel(
                        "academic",
                        "admission_type",
                        "Seat Type",
                        true
                      )}
                      <select
                        {...register("admission_type")}
                        className={getInputClass("admission_type")}
                      >
                        <option value="management">Management Seat</option>
                        <option value="convener">Convener (Entrance)</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="label">Academic Status</label>
                      <select
                        {...register("academic_status")}
                        className={getInputClass("academic_status")}
                      >
                        <option value="active">Active</option>
                        <option value="promoted">Promoted</option>
                        <option value="detained">Detained</option>
                        <option value="semester_back">Semester Back</option>
                        <option value="graduated">Graduated</option>
                        <option value="dropout">Dropout</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-fade-in">
                {/* Identity Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <UserIcon className="w-4 h-4 text-secondary-500" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                      Identity & Contact
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {isFieldVisible("personal", "first_name") && (
                      <div className="flex-1">
                        {renderFieldLabel(
                          "personal",
                          "first_name",
                          "First Name",
                          true
                        )}
                        <input
                          {...register("first_name")}
                          className={getInputClass("first_name")}
                          placeholder="First Name"
                        />
                        {errors.first_name && (
                          <p className="text-[10px] text-error-500 mt-1">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>
                    )}
                    {isFieldVisible("personal", "last_name") && (
                      <div className="flex-1">
                        {renderFieldLabel(
                          "personal",
                          "last_name",
                          "Last Name",
                          true
                        )}
                        <input
                          {...register("last_name")}
                          className={getInputClass("last_name")}
                          placeholder="Last Name"
                        />
                        {errors.last_name && (
                          <p className="text-[10px] text-error-500 mt-1">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {isFieldVisible("personal", "email") && (
                      <div className="col-span-2">
                        {renderFieldLabel(
                          "personal",
                          "email",
                          "Email Address",
                          true
                        )}
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            {...register("email")}
                            className={`${getInputClass("email")} pl-10`}
                            placeholder="email@university.edu"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-[10px] text-error-500 mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    )}
                    {isFieldVisible("personal", "phone") && (
                      <div>
                        {renderFieldLabel(
                          "personal",
                          "phone",
                          "Personal Mobile"
                        )}
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            {...register("phone")}
                            className={`${getInputClass("phone")} pl-10`}
                            placeholder="+91"
                          />
                        </div>
                      </div>
                    )}
                    {isFieldVisible("personal", "date_of_birth") && (
                      <div>
                        {renderFieldLabel(
                          "personal",
                          "date_of_birth",
                          "Date of Birth"
                        )}
                        <div className="relative group">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            {...register("date_of_birth")}
                            type="date"
                            className={`${getInputClass("date_of_birth")} pl-10`}
                          />
                        </div>
                      </div>
                    )}
                    {isFieldVisible("personal", "gender") && (
                      <div>
                        {renderFieldLabel("personal", "gender", "Gender")}
                        <select
                          {...register("gender")}
                          className={getInputClass("gender")}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    )}
                    {isFieldVisible("personal", "nationality") && (
                      <div>
                        {renderFieldLabel(
                          "personal",
                          "nationality",
                          "Nationality"
                        )}
                        <div className="relative group">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            {...register("nationality")}
                            className={`${getInputClass("nationality")} pl-10`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Residential Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <MapPin className="w-4 h-4 text-error-500" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                      Current Residence
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Address Line</label>
                      <textarea
                        {...register("address")}
                        className={`${getInputClass("address")} min-h-[80px] py-3`}
                        placeholder="Street, Apartment, Locality..."
                      ></textarea>
                    </div>
                    <div>
                      <label className="label">City</label>
                      <input
                        {...register("city")}
                        className={getInputClass("city")}
                      />
                    </div>
                    <div>
                      <label className="label">State / Province</label>
                      <input
                        {...register("state")}
                        className={getInputClass("state")}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label">ZIP / Postal Code</label>
                      <input
                        {...register("zip_code")}
                        className={getInputClass("zip_code")}
                      />
                    </div>
                  </div>
                </div>

                {/* Documentation Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <CreditCard className="w-4 h-4 text-warning-500" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                      Identity Verification
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {isFieldVisible("personal", "aadhaar_number") && (
                      <div>
                        {renderFieldLabel(
                          "personal",
                          "aadhaar_number",
                          "Aadhaar Number"
                        )}
                        <input
                          {...register("aadhaar_number")}
                          className={getInputClass("aadhaar_number")}
                          placeholder="12-digit number"
                        />
                        {errors.aadhaar_number && (
                          <p className="error-text">
                            {errors.aadhaar_number.message}
                          </p>
                        )}
                      </div>
                    )}
                    {isFieldVisible("personal", "passport_number") && (
                      <div>
                        {renderFieldLabel(
                          "personal",
                          "passport_number",
                          "Passport Number"
                        )}
                        <input
                          {...register("passport_number")}
                          className={getInputClass("passport_number")}
                          placeholder="Passport ID"
                        />
                        {errors.passport_number && (
                          <p className="error-text">
                            {errors.passport_number.message}
                          </p>
                        )}
                      </div>
                    )}
                    {isFieldVisible("personal", "religion") && (
                      <div>
                        {renderFieldLabel("personal", "religion", "Religion")}
                        <input
                          {...register("religion")}
                          className={getInputClass("religion")}
                        />
                      </div>
                    )}
                    {isFieldVisible("personal", "caste") && (
                      <div>
                        {renderFieldLabel(
                          "personal",
                          "caste",
                          "Caste / Category"
                        )}
                        <input
                          {...register("caste")}
                          className={getInputClass("caste")}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Fields Section */}
                {admissionConfig?.field_config?.custom &&
                  Object.keys(admissionConfig.field_config.custom).length >
                    0 && (
                    <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2 pb-2">
                        <PlusCircle className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                          Additional Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(
                          admissionConfig.field_config.custom
                        ).map(
                          ([key, config]) =>
                            config.visible !== false && (
                              <div
                                key={key}
                                className={
                                  config.type === "textarea" ? "col-span-2" : ""
                                }
                              >
                                {renderFieldLabel(
                                  "custom",
                                  key,
                                  config.label,
                                  config.required
                                )}
                                {config.type === "textarea" ? (
                                  <textarea
                                    {...register(key)}
                                    className={getInputClass(key)}
                                    placeholder={`Enter ${config.label.toLowerCase()}...`}
                                  />
                                ) : (
                                  <input
                                    type={config.type || "text"}
                                    {...register(key)}
                                    className={getInputClass(key)}
                                    placeholder={`Enter ${config.label.toLowerCase()}...`}
                                  />
                                )}
                                {errors[key] && (
                                  <p className="text-[10px] text-error-500 mt-1">
                                    {errors[key].message}
                                  </p>
                                )}
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <UsersIcon className="w-4 h-4 text-warning-500" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                    Guardian Structure
                  </h3>
                </div>
                <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
                  {["Both Parents", "Single Parent", "Guardian"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => reset({ ...watch(), guardian_type: t })}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        guardianType === t
                          ? "bg-white dark:bg-gray-700 shadow-sm text-primary-600"
                          : "text-gray-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {(guardianType === "Both Parents" ||
                  guardianType === "Single Parent") && (
                  <div className="space-y-4">
                    {guardianType === "Single Parent" && (
                      <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg w-max mb-4">
                        {["Father", "Mother"].map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() =>
                              reset({ ...watch(), single_parent_type: type })
                            }
                            className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                              (singleParentType || "Father") === type
                                ? "bg-white text-primary-600 shadow-sm"
                                : "text-gray-500"
                            }`}
                          >
                            {type} Only
                          </button>
                        ))}
                      </div>
                    )}

                    {(guardianType === "Both Parents" ||
                      (guardianType === "Single Parent" &&
                        (singleParentType || "Father") === "Father")) && (
                      <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <label className="label text-[10px] text-primary-500 font-black uppercase mb-4 block">
                          Father's Details
                        </label>
                        <div className="space-y-3">
                          <input
                            {...register("father_name")}
                            className={getInputClass("father_name")}
                            placeholder="Father's Full Name"
                          />
                          {errors.father_name && (
                            <p className="text-[10px] text-error-500 mt-1">
                              {errors.father_name.message}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              {...register("father_job")}
                              className={`${getInputClass("father_job")} text-xs`}
                              placeholder="Occupation"
                            />
                            <input
                              {...register("father_income")}
                              className={`${getInputClass("father_income")} text-xs`}
                              placeholder="Annual Income"
                            />
                            <input
                              {...register("father_email")}
                              className={`${getInputClass("father_email")} text-xs col-span-2`}
                              placeholder="Email Address"
                            />
                            <input
                              {...register("father_mobile")}
                              className={`${getInputClass("father_mobile")} text-xs col-span-2`}
                              placeholder="Mobile Number"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {(guardianType === "Both Parents" ||
                      (guardianType === "Single Parent" &&
                        (singleParentType || "Father") === "Mother")) && (
                      <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <label className="label text-[10px] text-secondary-500 font-black uppercase mb-4 block">
                          Mother's Details
                        </label>
                        <div className="space-y-3">
                          <input
                            {...register("mother_name")}
                            className={getInputClass("mother_name")}
                            placeholder="Mother's Full Name"
                          />
                          {errors.mother_name && (
                            <p className="text-[10px] text-error-500 mt-1">
                              {errors.mother_name.message}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              {...register("mother_job")}
                              className={`${getInputClass("mother_job")} text-xs`}
                              placeholder="Occupation"
                            />
                            <input
                              {...register("mother_income")}
                              className={`${getInputClass("mother_income")} text-xs`}
                              placeholder="Annual Income"
                            />
                            <input
                              {...register("mother_email")}
                              className={`${getInputClass("mother_email")} text-xs col-span-2`}
                              placeholder="Email Address"
                            />
                            <input
                              {...register("mother_mobile")}
                              className={`${getInputClass("mother_mobile")} text-xs col-span-2`}
                              placeholder="Mobile Number"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {guardianType === "Guardian" && (
                  <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <label className="label text-[10px] text-warning-500 font-black uppercase mb-4 block">
                      Legal Guardian's Details
                    </label>
                    <div className="space-y-3">
                      <input
                        {...register("guardian_name")}
                        className={getInputClass("guardian_name")}
                        placeholder="Guardian's Full Name"
                      />
                      {errors.guardian_name && (
                        <p className="text-[10px] text-error-500 mt-1">
                          {errors.guardian_name.message}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          {...register("guardian_mobile")}
                          className={`${getInputClass("guardian_mobile")} text-xs`}
                          placeholder="Mobile Number"
                        />
                        <input
                          {...register("guardian_email")}
                          className={`${getInputClass("guardian_email")} text-xs`}
                          placeholder="Email Address"
                        />
                        <input
                          {...register("guardian_job")}
                          className={`${getInputClass("guardian_job")} text-xs col-span-2`}
                          placeholder="Occupation / Relation"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <History className="w-4 h-4 text-info-500" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                    Academic Journey
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addAcademicRow}
                  className="btn btn-secondary w-full py-2.5 border-dashed border-2 flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:border-primary-500 hover:text-primary-500 transition-all"
                >
                  <PlusIcon className="w-4 h-4 mr-2" /> Add Qualification
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
                        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          {renderFieldLabel(
                            "history",
                            "school",
                            "Institution Name",
                            true
                          )}
                          <input
                            {...register(`previous_academics.${i}.school`)}
                            className={`${getInputClass(`previous_academics.${i}.school`)} text-xs`}
                            placeholder="School or College"
                          />
                          {errors.previous_academics?.[i]?.school && (
                            <p className="text-[10px] text-error-500">
                              {errors.previous_academics[i].school.message}
                            </p>
                          )}
                        </div>
                        <div>
                          {renderFieldLabel(
                            "history",
                            "board",
                            "Board / University",
                            true
                          )}
                          <input
                            {...register(`previous_academics.${i}.board`)}
                            className={`${getInputClass(`previous_academics.${i}.board`)} text-xs`}
                          />
                          {errors.previous_academics?.[i]?.board && (
                            <p className="text-[10px] text-error-500">
                              {errors.previous_academics[i].board.message}
                            </p>
                          )}
                        </div>
                        <div>
                          {renderFieldLabel(
                            "history",
                            "year",
                            "Passing Year",
                            true
                          )}
                          <input
                            {...register(`previous_academics.${i}.year`)}
                            className={`${getInputClass(`previous_academics.${i}.year`)} text-xs`}
                          />
                          {errors.previous_academics?.[i]?.year && (
                            <p className="text-[10px] text-error-500">
                              {errors.previous_academics[i].year.message}
                            </p>
                          )}
                        </div>
                        <div className="col-span-2">
                          {renderFieldLabel(
                            "history",
                            "percentage",
                            "Marks / CGPA",
                            true
                          )}
                          <input
                            {...register(`previous_academics.${i}.percentage`)}
                            className={`${getInputClass(`previous_academics.${i}.percentage`)} text-xs`}
                          />
                          {errors.previous_academics?.[i]?.percentage && (
                            <p className="text-[10px] text-error-500">
                              {errors.previous_academics[i].percentage.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <FileText className="w-4 h-4 text-primary-500" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                    Required Documents
                  </h3>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-800 flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                      Process Verification
                    </h4>
                    <p className="text-[10px] text-primary-700 dark:text-primary-300 mt-1">
                      Upload mandatory documents for {admissionType} seat
                      registration. Documents will be verified by the admission
                      staff after student creation.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(
                    admissionConfig?.required_documents ||
                    (watch("admission_type") === "management"
                      ? [
                          "Photo ID",
                          "10th Marksheet",
                          "12th Marksheet",
                          "Seat Purchase Receipt",
                        ]
                      : [
                          "Photo ID",
                          "10th Marksheet",
                          "12th Marksheet",
                          "Entrance Rank Card",
                          "Allotment Order",
                        ])
                  ).map((doc) => {
                    const existingDoc = existingDocuments.find(
                      (d) => d.type === doc
                    );
                    const isNewUploaded = !!selectedFiles[doc];

                    return (
                      <div
                        key={doc}
                        className="p-4 rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 flex items-center justify-between shadow-sm group hover:border-primary-300 transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              isNewUploaded
                                ? "bg-emerald-100 text-emerald-600"
                                : existingDoc
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-50 dark:bg-gray-700 text-gray-400"
                            }`}
                          >
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                              {doc}
                            </p>
                            <div className="flex flex-col">
                              {isNewUploaded ? (
                                <p className="text-[10px] text-emerald-600 font-medium">
                                  {selectedFiles[doc].name} (New)
                                </p>
                              ) : existingDoc ? (
                                <div className="flex items-center space-x-2">
                                  <a
                                    href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000"}${existingDoc.file_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-600 font-medium hover:underline flex items-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View Existing
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                                      existingDoc.status === "approved"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {existingDoc.status}
                                  </span>
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400">
                                  Click to upload file
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setSelectedFiles({
                                  ...selectedFiles,
                                  [doc]: file,
                                });
                              }
                            }}
                          />
                          <div className="btn btn-secondary py-1.5 px-3 text-[10px] group-hover:bg-primary-500 group-hover:text-white transition-all">
                            {isNewUploaded
                              ? "Change"
                              : existingDoc
                                ? "Replace"
                                : "Upload"}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                    Review & Confirm
                  </h3>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Full Name
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {getValues("first_name")} {getValues("last_name")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Program
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {programList.find((p) => p.id === getValues("program_id"))
                        ?.name || "---"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Student ID
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {autoGenerate ? (
                        <span className="text-primary-600 flex items-center gap-1">
                          {previewId}
                          <span className="px-1.5 py-0.5 roundedElement bg-primary-100 text-[9px] uppercase tracking-wider">
                            Auto
                          </span>
                        </span>
                      ) : (
                        getValues("student_id")
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Email
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {getValues("email")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Mobile
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {getValues("phone")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Gender
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {getValues("gender")}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Address
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {getValues("address")
                        ? `${getValues("address")}, ${getValues("city")}, ${getValues("state")} - ${getValues("zip_code")}`
                        : "---"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Guardian ({guardianType})
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {guardianType === "Both Parents" ? (
                        <>
                          F: {getValues("father_name")} <br />
                          M: {getValues("mother_name")}
                        </>
                      ) : guardianType === "Single Parent" ? (
                        `${getValues("single_parent_type")}: ${getValues(getValues("single_parent_type") === "Father" ? "father_name" : "mother_name")}`
                      ) : (
                        getValues("guardian_name")
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === 1 ? "text-gray-300" : "text-gray-500 hover:bg-white shadow-sm"}`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              {currentStep < steps.length ? (
                <button
                  type="button"
                  key="continue-btn"
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-8 py-3 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  key="submit-btn"
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{user ? "Update Student" : "Confirm & Register"}</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentForm;
