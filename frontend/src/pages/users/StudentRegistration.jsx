import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  User,
  GraduationCap,
  Users as UsersIcon,
  History,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { baseUserSchema, baseDefaultValues } from "./forms/baseSchema";
import api from "../../utils/api";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchRegulations } from "../../store/slices/regulationSlice";
import { fetchRoles } from "../../store/slices/roleSlice";

// --- SCHEMA & CONFIG ---
const studentSchema = yup.object().shape({
  ...baseUserSchema,
  auto_generate: yup.boolean().default(true),
  is_lateral: yup.boolean().default(false),
  role: yup.string().default("student"),
  role_id: yup.string().required(),
  program_id: yup.string().required("Program is required"),
  regulation_id: yup.string().required("Regulation is required"),
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

  // Identity & Demographics
  religion: yup.string().optional(),
  caste: yup.string().optional(),
  aadhaar_number: yup.string().optional().nullable(),
  pan_number: yup.string().optional().nullable(),
  passport_number: yup.string().optional().nullable(),

  // Address Components
  city: yup.string().optional(),
  state: yup.string().optional(),
  zip_code: yup.string().optional(),

  // Parent Details
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
        level: yup.string().required("Education level is required"),
        school: yup.string().required("Institution name is required"),
        board: yup.string().required("Board/University is required"),
        percentage: yup.string().required("Percentage/CGPA is required"),
        year: yup.string().required("Year of passing is required"),
      }),
    )
    .optional(),
});

const steps = [
  { id: 1, title: "Academic", icon: GraduationCap, desc: "Program & Batch" },
  { id: 2, title: "Personal", icon: User, desc: "Basic Details" },
  { id: 3, title: "Family", icon: UsersIcon, desc: "Parent Info" },
  { id: 4, title: "History", icon: History, desc: "Education" },
  { id: 5, title: "Docs", icon: FileText, desc: "Uploads" },
  { id: 6, title: "Review", icon: ShieldCheck, desc: "Confirm" },
];

const StudentRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { departments } = useSelector((state) => state.departments);
  const { programs } = useSelector((state) => state.programs);
  const { regulations } = useSelector((state) => state.regulations);
  const { roles } = useSelector((state) => state.roles);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [error, setError] = useState(null);
  const [admissionConfig, setAdmissionConfig] = useState(null);
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [studentRoleId, setStudentRoleId] = useState(null);
  const [nextIds, setNextIds] = useState({ temp_id: "", admission_number: "" });

  // Initialize
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
    dispatch(fetchRegulations());
    dispatch(fetchRoles()); // Fetch roles to get student role ID
  }, [dispatch]);

  // Find student role from list
  useEffect(() => {
    if (roles && roles.length > 0) {
      const sRole = roles.find((r) => r.slug === "student");
      if (sRole) setStudentRoleId(sRole.id);
    }
  }, [roles]);

  // Fetch Config
  useEffect(() => {
    const fetchConfigAndSeats = async () => {
      try {
        const configRes = await api.get("/admission/configs?is_active=true");
        if (configRes.data.data.length > 0) {
          const activeConfig = configRes.data.data[0];
          setAdmissionConfig(activeConfig);
          const seatRes = await api.get(
            `/admission/seat-matrix?year=${activeConfig.batch_year}`,
          );
          setSeatMatrix(seatRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admission data", error);
      }
    };
    fetchConfigAndSeats();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(studentSchema),
    defaultValues: {
      ...baseDefaultValues,
      role: "student",
      role_id: studentRoleId || "", // Will update when loaded
      program_id: "",
      regulation_id: "",
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
      is_lateral: false,
      nationality: "Indian",
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

  // Watchers
  const autoGenerate = watch("auto_generate");
  const guardianType = watch("guardian_type");
  const programId = watch("program_id");
  const isLateral = watch("is_lateral");
  const batchYear = watch("batch_year");

  // Update role_id when studentRoleId is loaded
  useEffect(() => {
    if (studentRoleId) {
      setValue("role_id", studentRoleId);
      console.log("✅ Set role_id to:", studentRoleId);
    }
  }, [studentRoleId, setValue]);

  // Fetch ID Previews
  useEffect(() => {
    const fetchPreviews = async () => {
      if (batchYear && programId) {
        try {
          const res = await api.get(
            `/admission/id-previews?batch_year=${batchYear}&program_id=${programId}&is_temporary=true`,
          );
          setNextIds(res.data.data);
        } catch (error) {
          console.error("Failed to fetch ID previews", error);
        }
      }
    };
    if (batchYear && programId) fetchPreviews();
  }, [batchYear, programId, autoGenerate]);

  // Validate Step
  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        "department_id",
        "program_id",
        "regulation_id",
        "batch_year",
        "current_semester",
        "admission_type",
      ];
      if (!autoGenerate)
        fieldsToValidate.push("student_id", "admission_number");
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "first_name",
        "last_name",
        "email",
        "gender",
        "date_of_birth",
        "phone",
      ];
    } else if (currentStep === 3) {
      if (guardianType === "Both Parents")
        fieldsToValidate = ["father_name", "mother_name"];
      else if (guardianType === "Single Parent") {
        const subtype = getValues("single_parent_type") || "Father";
        fieldsToValidate = [
          subtype === "Father" ? "father_name" : "mother_name",
        ];
      } else fieldsToValidate = ["guardian_name"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["previous_academics"];
    }

    const isValid =
      fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const onSubmit = async (data) => {
    console.log("✅ Form submitted successfully with data:", data);
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      // Core fields
      Object.keys(data).forEach((key) => {
        if (typeof data[key] !== "object" && key !== "documents") {
          formData.append(key, data[key]);
        }
      });

      // Ensure role_id is set
      if (!data.role_id && studentRoleId)
        formData.set("role_id", studentRoleId);

      // Parent Details
      const parentDetails = {
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
      };
      formData.append("parent_details", JSON.stringify(parentDetails));

      // Previous Academics
      formData.append(
        "previous_academics",
        JSON.stringify(data.previous_academics || []),
      );

      // Documents
      Object.keys(selectedFiles).forEach((key) => {
        formData.append("documents", selectedFiles[key]);
        formData.append("document_types", key);
      });

      // API Call (Reuse createUser from userSlice or direct API?)
      // StudentForm used onSave prop. We should call API directly here.
      // We'll use the generic user creation endpoint but it handles student specifics??
      // Yes, userController keys off role/data.
      await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setRegisteredStudent({ name: `${data.first_name} ${data.last_name}` });
      setShowSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.error || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    if (e.target.files[0]) {
      setSelectedFiles({ ...selectedFiles, [type]: e.target.files[0] });
    }
  };

  // Styles
  const labelClass =
    "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1";
  const inputClass = (name) => `
    w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none
    ${errors[name] ? "border-red-500 focus:border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-primary-500"}
  `;

  return (
    <div className=" bg-gray-50/50 dark:bg-gray-900 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30 shadow-sm backdrop-blur-xl bg-white/80 dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                Student Registration
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                New Student Admission Entry
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Step {currentStep} of {steps.length}
            </p>
            <div className="w-32 h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Stepper */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-700 sticky top-32">
              <div className="space-y-6">
                {steps.map((step) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-4 group ${isActive ? "opacity-100" : "opacity-50"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? "bg-primary-500 text-white shadow-lg scale-110" : isCompleted ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col">
            {showSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8 relative">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  Registration Successful!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-10">
                  Student{" "}
                  <span className="text-emerald-600 font-black uppercase">
                    "{registeredStudent?.name}"
                  </span>{" "}
                  has been enrolled successfully.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                >
                  Register Another
                </button>
              </div>
            ) : (
              <div className="p-8 flex-1">
                <form
                  onSubmit={(e) => {
                    console.log("📤 Form onSubmit event triggered");
                    console.log("� Form errors:", errors);
                    console.log("📝 Form values:", getValues());
                    handleSubmit(onSubmit)(e);
                  }}
                  className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
                >
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                  )}

                  {/* STEP 1: ACADEMIC */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Department</label>
                          <select
                            {...register("department_id")}
                            className={inputClass("department_id")}
                          >
                            <option value="">Select Department...</option>
                            {departments
                              ?.filter((d) => d.type === "academic")
                              .map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Program</label>
                          <select
                            {...register("program_id")}
                            className={inputClass("program_id")}
                          >
                            <option value="">Select Program...</option>
                            {programs?.map((p) => {
                              const seatInfo = seatMatrix.find(
                                (s) => s.id === p.id,
                              );
                              const isFull =
                                seatInfo && seatInfo.available_seats <= 0;
                              return (
                                <option
                                  key={p.id}
                                  value={p.id}
                                  disabled={isFull}
                                >
                                  {p.name} {isFull ? "(FULL)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Regulation</label>
                          <select
                            {...register("regulation_id")}
                            className={inputClass("regulation_id")}
                          >
                            <option value="">Select Regulation...</option>
                            {regulations
                              ?.filter((r) => r.is_active)
                              .map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} ({r.academic_year})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className={labelClass}>Batch Year</label>
                          <input
                            type="number"
                            {...register("batch_year")}
                            className={inputClass("batch_year")}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Semester</label>
                          <input
                            type="number"
                            {...register("current_semester")}
                            className={inputClass("current_semester")}
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              {...register("is_lateral")}
                              className="rounded text-primary-600"
                            />
                            <span className="text-xs font-medium text-gray-500">
                              Lateral Entry
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Admission Type</label>
                          <select
                            {...register("admission_type")}
                            className={inputClass("admission_type")}
                          >
                            <option value="management">Management</option>
                            <option value="convener">Convener</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Identifier Configuration
                          </span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              {...register("auto_generate")}
                              className="rounded text-primary-600"
                            />
                            <span className="text-xs font-medium text-gray-500">
                              Issue Temporary ID (Auto)
                            </span>
                          </label>
                        </div>
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-100 transition-opacity"
                          style={{ opacity: autoGenerate ? 0.5 : 1 }}
                        >
                          <div>
                            <label className={labelClass}>Temporary ID</label>
                            <input
                              {...register("student_id")}
                              disabled={autoGenerate}
                              className={inputClass("student_id")}
                              placeholder={
                                autoGenerate
                                  ? "Auto-generated Temp ID"
                                  : "Manual Temp ID"
                              }
                            />
                            {autoGenerate && nextIds.temp_id && (
                              <p className="text-[10px] text-emerald-600 font-bold mt-1 ml-1">
                                Next: {nextIds.temp_id}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className={labelClass}>Admission No.</label>
                            <input
                              {...register("admission_number")}
                              disabled={autoGenerate}
                              className={inputClass("admission_number")}
                              placeholder={
                                autoGenerate ? "Auto-generated" : "Manual No"
                              }
                            />
                            {autoGenerate && nextIds.admission_number && (
                              <p className="text-[10px] text-blue-600 font-bold mt-1 ml-1">
                                Next: {nextIds.admission_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: PERSONAL */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>First Name</label>
                          <input
                            {...register("first_name")}
                            className={inputClass("first_name")}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Last Name</label>
                          <input
                            {...register("last_name")}
                            className={inputClass("last_name")}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Email</label>
                          <input
                            {...register("email")}
                            className={inputClass("email")}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Mobile</label>
                          <input
                            {...register("phone")}
                            className={inputClass("phone")}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Gender</label>
                          <select
                            {...register("gender")}
                            className={inputClass("gender")}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Date of Birth</label>
                          <input
                            type="date"
                            {...register("date_of_birth")}
                            className={inputClass("date_of_birth")}
                          />
                        </div>
                      </div>

                      {/* Demographics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Religion</label>
                          <select
                            {...register("religion")}
                            className={inputClass("religion")}
                          >
                            <option value="">Select Religion...</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Muslim">Muslim</option>
                            <option value="Christian">Christian</option>
                            <option value="Sikh">Sikh</option>
                            <option value="Jain">Jain</option>
                            <option value="Buddhist">Buddhist</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Caste / Category</label>
                          <select
                            {...register("caste")}
                            className={inputClass("caste")}
                          >
                            <option value="">Select Category...</option>
                            <option value="OC">OC (General)</option>
                            <option value="BC-A">BC-A</option>
                            <option value="BC-B">BC-B</option>
                            <option value="BC-C">BC-C</option>
                            <option value="BC-D">BC-D</option>
                            <option value="BC-E">BC-E</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="EWS">EWS</option>
                          </select>
                        </div>
                      </div>

                      {/* Identity Numbers */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className={labelClass}>Aadhaar Number</label>
                          <input
                            {...register("aadhaar_number")}
                            className={inputClass("aadhaar_number")}
                            placeholder="12-digit number"
                            maxLength="12"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>PAN Number</label>
                          <input
                            {...register("pan_number")}
                            className={`${inputClass("pan_number")} uppercase`}
                            placeholder="ABCDE1234F"
                            maxLength="10"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Passport Number</label>
                          <input
                            {...register("passport_number")}
                            className={`${inputClass("passport_number")} uppercase`}
                            placeholder="L1234567"
                          />
                        </div>
                      </div>

                      {/* Address - Split into components */}
                      <div>
                        <label className={labelClass}>Street Address</label>
                        <textarea
                          {...register("address")}
                          rows={2}
                          className={inputClass("address")}
                          placeholder="House No., Street, Locality"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className={labelClass}>City</label>
                          <input
                            {...register("city")}
                            className={inputClass("city")}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>State</label>
                          <input
                            {...register("state")}
                            className={inputClass("state")}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Pincode</label>
                          <input
                            {...register("zip_code")}
                            className={inputClass("zip_code")}
                            placeholder="6-digit pincode"
                            maxLength="6"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: FAMILY */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <label className={labelClass}>Guardian Type</label>
                        <div className="flex gap-4">
                          {["Both Parents", "Single Parent", "Guardian"].map(
                            (type) => (
                              <label
                                key={type}
                                className={`
                                                        px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border transition-all
                                                        ${watch("guardian_type") === type ? "bg-primary-50 border-primary-500 text-primary-700" : "bg-white border-gray-200 text-gray-600"}
                                                    `}
                              >
                                <input
                                  type="radio"
                                  value={type}
                                  {...register("guardian_type")}
                                  className="hidden"
                                />
                                {type}
                              </label>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Single Parent Type Selection */}
                      {watch("guardian_type") === "Single Parent" && (
                        <div>
                          <label className={labelClass}>
                            Single Parent Type
                          </label>
                          <div className="flex gap-4">
                            {["Father", "Mother"].map((type) => (
                              <label
                                key={type}
                                className={`
                                  px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border transition-all
                                  ${watch("single_parent_type") === type ? "bg-primary-50 border-primary-500 text-primary-700" : "bg-white border-gray-200 text-gray-600"}
                                `}
                              >
                                <input
                                  type="radio"
                                  value={type}
                                  {...register("single_parent_type")}
                                  className="hidden"
                                />
                                {type}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Both Parents Details */}
                      {watch("guardian_type") === "Both Parents" && (
                        <div className="space-y-6">
                          <h4 className="font-semibold text-gray-700">
                            Father's Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className={labelClass}>
                                Father's Name
                              </label>
                              <input
                                {...register("father_name")}
                                className={inputClass("father_name")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Father's Mobile
                              </label>
                              <input
                                {...register("father_mobile")}
                                className={inputClass("father_mobile")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Father's Email
                              </label>
                              <input
                                type="email"
                                {...register("father_email")}
                                className={inputClass("father_email")}
                                placeholder="father@example.com"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Father's Occupation
                              </label>
                              <input
                                {...register("father_job")}
                                className={inputClass("father_job")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Father's Annual Income
                              </label>
                              <input
                                {...register("father_income")}
                                className={inputClass("father_income")}
                                placeholder="₹"
                              />
                            </div>
                          </div>

                          <h4 className="font-semibold text-gray-700 pt-4">
                            Mother's Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className={labelClass}>
                                Mother's Name
                              </label>
                              <input
                                {...register("mother_name")}
                                className={inputClass("mother_name")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Mother's Mobile
                              </label>
                              <input
                                {...register("mother_mobile")}
                                className={inputClass("mother_mobile")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Mother's Email
                              </label>
                              <input
                                type="email"
                                {...register("mother_email")}
                                className={inputClass("mother_email")}
                                placeholder="mother@example.com"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Mother's Occupation
                              </label>
                              <input
                                {...register("mother_job")}
                                className={inputClass("mother_job")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Mother's Annual Income
                              </label>
                              <input
                                {...register("mother_income")}
                                className={inputClass("mother_income")}
                                placeholder="₹"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Single Parent - Father */}
                      {watch("guardian_type") === "Single Parent" &&
                        watch("single_parent_type") === "Father" && (
                          <div className="space-y-6">
                            <h4 className="font-semibold text-gray-700">
                              Father's Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className={labelClass}>
                                  Father's Name
                                </label>
                                <input
                                  {...register("father_name")}
                                  className={inputClass("father_name")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Father's Mobile
                                </label>
                                <input
                                  {...register("father_mobile")}
                                  className={inputClass("father_mobile")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Father's Email
                                </label>
                                <input
                                  type="email"
                                  {...register("father_email")}
                                  className={inputClass("father_email")}
                                  placeholder="father@example.com"
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Father's Occupation
                                </label>
                                <input
                                  {...register("father_job")}
                                  className={inputClass("father_job")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Father's Annual Income
                                </label>
                                <input
                                  {...register("father_income")}
                                  className={inputClass("father_income")}
                                  placeholder="₹"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Single Parent - Mother */}
                      {watch("guardian_type") === "Single Parent" &&
                        watch("single_parent_type") === "Mother" && (
                          <div className="space-y-6">
                            <h4 className="font-semibold text-gray-700">
                              Mother's Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className={labelClass}>
                                  Mother's Name
                                </label>
                                <input
                                  {...register("mother_name")}
                                  className={inputClass("mother_name")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Mother's Mobile
                                </label>
                                <input
                                  {...register("mother_mobile")}
                                  className={inputClass("mother_mobile")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Mother's Email
                                </label>
                                <input
                                  type="email"
                                  {...register("mother_email")}
                                  className={inputClass("mother_email")}
                                  placeholder="mother@example.com"
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Mother's Occupation
                                </label>
                                <input
                                  {...register("mother_job")}
                                  className={inputClass("mother_job")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Mother's Annual Income
                                </label>
                                <input
                                  {...register("mother_income")}
                                  className={inputClass("mother_income")}
                                  placeholder="₹"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Guardian Details */}
                      {watch("guardian_type") === "Guardian" && (
                        <div className="space-y-6">
                          <h4 className="font-semibold text-gray-700">
                            Guardian's Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className={labelClass}>
                                Guardian's Name
                              </label>
                              <input
                                {...register("guardian_name")}
                                className={inputClass("guardian_name")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Guardian's Mobile
                              </label>
                              <input
                                {...register("guardian_mobile")}
                                className={inputClass("guardian_mobile")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Guardian's Email
                              </label>
                              <input
                                type="email"
                                {...register("guardian_email")}
                                className={inputClass("guardian_email")}
                                placeholder="guardian@example.com"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Guardian's Occupation
                              </label>
                              <input
                                {...register("guardian_job")}
                                className={inputClass("guardian_job")}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 4: HISTORY */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold">Prior Education</h3>
                        <button
                          type="button"
                          onClick={() =>
                            appendAcademic({
                              level: "",
                              school: "",
                              board: "",
                              percentage: "",
                              year: "",
                            })
                          }
                          className="text-sm font-bold text-primary-600 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add Record
                        </button>
                      </div>
                      {academicFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className={labelClass}>
                                Education Level
                              </label>
                              <select
                                {...register(
                                  `previous_academics.${index}.level`,
                                )}
                                className={inputClass("")}
                              >
                                <option value="">Select Level...</option>
                                <option value="10th">10th / SSC</option>
                                <option value="12th">
                                  12th / Intermediate
                                </option>
                                <option value="Diploma">Diploma</option>
                                <option value="Graduation">
                                  Graduation / Bachelor's
                                </option>
                                <option value="Post Graduation">
                                  Post Graduation / Master's
                                </option>
                                <option value="Doctorate">
                                  Doctorate / PhD
                                </option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className={labelClass}>
                                Institution Name
                              </label>
                              <input
                                {...register(
                                  `previous_academics.${index}.school`,
                                )}
                                className={inputClass("")}
                                placeholder="School/College/University Name"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Board/University
                              </label>
                              <input
                                {...register(
                                  `previous_academics.${index}.board`,
                                )}
                                className={inputClass("")}
                                placeholder="e.g., CBSE, State Board, University Name"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Percentage/CGPA
                              </label>
                              <input
                                {...register(
                                  `previous_academics.${index}.percentage`,
                                )}
                                className={inputClass("")}
                                placeholder="e.g., 85% or 8.5 CGPA"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Year of Passing
                              </label>
                              <input
                                {...register(
                                  `previous_academics.${index}.year`,
                                )}
                                className={inputClass("")}
                                placeholder="YYYY"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAcademic(index)}
                            className="absolute top-2 right-2 text-red-500 p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 5: DOCS */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          "photo",
                          "aadhar",
                          "marksheet_10",
                          "marksheet_12",
                          "transfer_certificate",
                        ].map((docType) => (
                          <div
                            key={docType}
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary-300 transition-colors bg-gray-50/50"
                          >
                            <Upload className="w-8 h-8 text-gray-300 mb-3" />
                            <p className="text-xs font-bold uppercase text-gray-500 mb-2">
                              {docType.replace("_", " ")}
                            </p>
                            <input
                              type="file"
                              onChange={(e) => handleFileChange(e, docType)}
                              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 6: REVIEW */}
                  {currentStep === 6 && (
                    <div className="text-center py-10">
                      <ShieldCheck className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Ready to Submit?
                      </h3>
                      <p className="text-gray-500 mb-8">
                        Please review the details before creating the student
                        record.
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="px-6 py-3 rounded-xl bg-gray-100 font-bold text-gray-600"
                        >
                          Review Data
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-8 py-3 rounded-xl bg-primary-600 font-bold text-white shadow-xl shadow-primary-200 hover:scale-105 transition-all flex items-center gap-2"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                          Confirm Registration
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Navigation Footer */}
                  {currentStep !== 6 && (
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                      {currentStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentStep((c) => c - 1)}
                          className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                      ) : (
                        <div></div>
                      )}

                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-8 py-3 rounded-xl bg-primary-600 font-bold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 hover:scale-[1.02] transition-all flex items-center gap-2"
                      >
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
