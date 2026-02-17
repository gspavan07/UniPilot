import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
  ArrowLeft,
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
import { toast } from "react-hot-toast";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchRegulations } from "../../store/slices/regulationSlice";
import { fetchRoles } from "../../store/slices/roleSlice";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
  gender: yup.string().required("Gender is required"),
  date_of_birth: yup.date().required("Date of birth is required"),
  phone: yup.string().required("Phone number is required"),
  guardian_type: yup.string().default("Both Parents"),
  single_parent_type: yup.string().optional(),
  religion: yup.string().required("Religion is required"),
  caste: yup.string().optional(),
  aadhaar_number: yup.string().optional().nullable(),
  pan_number: yup.string().optional().nullable(),
  passport_number: yup.string().optional().nullable(),
  nationality: yup.string().required("Nationality is required"),
  father_name: yup.string().optional(),
  father_job: yup.string().optional(),
  father_income: yup.string().when(["guardian_type", "single_parent_type"], {
    is: (gt, spt) =>
      gt === "Both Parents" || (gt === "Single Parent" && spt === "Father"),
    then: (schema) =>
      schema
        .required("Father Income is required")
        .matches(/^\d+$/, "Income must be a number"),
    otherwise: (schema) => schema.optional(),
  }),
  father_email: yup
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  father_mobile: yup.string().optional(),
  mother_name: yup.string().optional(),
  mother_job: yup.string().optional(),
  mother_income: yup.string().when(["guardian_type", "single_parent_type"], {
    is: (gt, spt) =>
      gt === "Both Parents" || (gt === "Single Parent" && spt === "Mother"),
    then: (schema) =>
      schema
        .required("Mother Income is required")
        .matches(/^\d+$/, "Income must be a number"),
    otherwise: (schema) => schema.optional(),
  }),
  mother_email: yup
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
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
  const [currentStep, setCurrentStep] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [error, setError] = useState(null);
  const [admissionConfig, setAdmissionConfig] = useState(null);
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [studentRoleId, setStudentRoleId] = useState(null);
  const [nextIds, setNextIds] = useState({ admission_number: "" });
  const [hasReachedReview, setHasReachedReview] = useState(false);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
    dispatch(fetchRegulations());
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    if (roles && roles.length > 0) {
      const sRole = roles.find((r) => r.slug === "student");
      if (sRole) setStudentRoleId(sRole.id);
    }
  }, [roles]);

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
      role_id: studentRoleId || "",
      program_id: "",
      regulation_id: "",
      student_id: "",
      admission_number: "",
      current_semester: 1,
      batch_year: "",
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

  const autoGenerate = watch("auto_generate");
  const guardianType = watch("guardian_type");
  const programId = watch("program_id");
  const isLateral = watch("is_lateral");
  const batchYear = watch("batch_year");

  useEffect(() => {
    if (studentRoleId) {
      setValue("role_id", studentRoleId);
      console.log("✅ Set role_id to:", studentRoleId);
    }
  }, [studentRoleId, setValue]);

  useEffect(() => {
    if (admissionConfig) setValue("batch_year", admissionConfig.batch_year);
  }, [admissionConfig, setValue]);

  useEffect(() => {
    if (admissionConfig) {
      if (isLateral) {
        setValue("batch_year", admissionConfig.batch_year - 1);
        setValue("current_semester", 3);
      } else {
        setValue("batch_year", admissionConfig.batch_year);
        setValue("current_semester", 1);
      }
    }
  }, [isLateral, admissionConfig, setValue]);

  useEffect(() => {
    const fetchPreviews = async () => {
      if (batchYear && programId) {
        try {
          const res = await api.get(
            `/admission/id-previews?batch_year=${batchYear}&program_id=${programId}&is_temporary=false`,
          );
          setNextIds(res.data.data);
        } catch (error) {
          console.error("Failed to fetch ID previews", error);
        }
      }
    };
    if (batchYear && programId) fetchPreviews();
  }, [batchYear, programId, autoGenerate]);

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
        "religion",
        "nationality",
      ];
    } else if (currentStep === 3) {
      if (guardianType === "Both Parents") {
        fieldsToValidate = [
          "father_name",
          "father_mobile",
          "father_email",
          "father_income",
          "mother_name",
          "mother_mobile",
          "mother_email",
          "mother_income",
        ];
      } else if (guardianType === "Single Parent") {
        const subtype = getValues("single_parent_type") || "Father";
        if (subtype === "Father") {
          fieldsToValidate = [
            "father_name",
            "father_mobile",
            "father_email",
            "father_income",
          ];
        } else {
          fieldsToValidate = [
            "mother_name",
            "mother_mobile",
            "mother_email",
            "mother_income",
          ];
        }
      } else {
        fieldsToValidate = [
          "guardian_name",
          "guardian_mobile",
          "guardian_email",
        ];
      }
    } else if (currentStep === 4) {
      fieldsToValidate = ["previous_academics"];
    }
    const isValid =
      fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    if (isValid) {
      setCurrentStep((prev) => {
        const nextStep = Math.min(prev + 1, steps.length);
        if (nextStep === steps.length) {
          setHasReachedReview(true);
        }
        return nextStep;
      });
    }
  };

  const onSubmit = async (data) => {
    console.log("✅ Form submitted successfully with data:", data);
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (typeof data[key] !== "object" && key !== "documents")
          formData.append(key, data[key]);
      });
      if (!data.role_id && studentRoleId)
        formData.set("role_id", studentRoleId);
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
      formData.append(
        "previous_academics",
        JSON.stringify(data.previous_academics || []),
      );
      Object.keys(selectedFiles).forEach((key) => {
        formData.append("documents", selectedFiles[key]);
        formData.append("document_types", key);
      });
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
    if (e.target.files[0])
      setSelectedFiles({ ...selectedFiles, [type]: e.target.files[0] });
  };

  const labelClass = "block text-sm font-medium text-black mb-2";
  const inputClass = (name) =>
    `w-full bg-white border rounded-lg px-4 py-2.5 text-sm text-black transition-all outline-none ${errors[name] ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className=" mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to Admission Management"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div>
              <h1 className="text-2xl font-semibold text-black tracking-tight">
                Student Registration
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Complete all steps to enroll a new student
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {steps.length}
            </span>
            <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-14 py-5">
        <div className="flex gap-12 items-start">
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 space-y-2">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      // Allow navigation if previously visited, moving forward sequentially, or if reached review before
                      if (
                        step.id < currentStep ||
                        hasReachedReview ||
                        currentStep === steps.length
                      ) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${step.id < currentStep || hasReachedReview || currentStep === steps.length ? "cursor-pointer hover:bg-gray-50" : ""} ${isActive ? "bg-blue-50 border-l-4 border-blue-600" : isCompleted ? "bg-white" : "bg-white opacity-50"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-blue-600 text-white" : isCompleted ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${isActive ? "text-black" : "text-gray-600"}`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 w-full bg-white border border-gray-200 rounded-xl overflow-hidden min-h-[600px] flex flex-col">
            {showSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-semibold text-black mb-3">
                  Registration Successful
                </h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Student{" "}
                  <span className="text-black font-semibold">
                    {registeredStudent?.name}
                  </span>{" "}
                  has been enrolled successfully.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Register Another Student
                </button>
              </div>
            ) : (
              <div className="p-6 flex-1">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-8"
                >
                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-1">
                          Academic Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Select program, regulation, and admission details
                        </p>
                      </div>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                  {r.name}{" "}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Batch Year</label>
                          <input
                            type="number"
                            {...register("batch_year")}
                            className={inputClass("batch_year")}
                            readOnly
                          />
                          {admissionConfig && (
                            <p className="text-xs text-gray-500 mt-2">
                              From active config: {admissionConfig.batch_year}-
                              {(admissionConfig.batch_year + 1)
                                .toString()
                                .slice(-2)}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={labelClass}>Semester</label>
                          <input
                            type="number"
                            {...register("current_semester")}
                            className={inputClass("current_semester")}
                            readOnly
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              {...register("is_lateral")}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-gray-600">
                              Lateral Entry{" "}
                              {isLateral && (
                                <span className="text-blue-600 font-semibold">
                                  (Batch: {admissionConfig?.batch_year - 1},
                                  Sem: 3)
                                </span>
                              )}
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
                      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-semibold text-black">
                            Admission ID Configuration
                          </span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              {...register("auto_generate")}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Auto-generate
                            </span>
                          </label>
                        </div>
                        <div
                          className="grid grid-cols-1 gap-6 transition-opacity"
                          style={{ opacity: autoGenerate ? 0.5 : 1 }}
                        >
                          <div>
                            <label className={labelClass}>Admission No.</label>
                            <input
                              {...register("admission_number")}
                              disabled={autoGenerate}
                              className={inputClass("admission_number")}
                              placeholder={
                                autoGenerate
                                  ? "Auto-generated"
                                  : "Enter Admission Number"
                              }
                            />
                            {autoGenerate && nextIds.admission_number && (
                              <p className="text-xs text-blue-600 font-medium mt-2">
                                Next ID: {nextIds.admission_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-1">
                          Personal Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Basic details and contact information
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>
                            First Name<span className="text-error-500">*</span>
                          </label>
                          <input
                            {...register("first_name")}
                            placeholder="Enter First Name"
                            className={inputClass("first_name")}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Last Name<span className="text-error-500">*</span>
                          </label>
                          <input
                            {...register("last_name")}
                            placeholder="Enter Last Name"
                            className={inputClass("last_name")}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>
                            Email<span className="text-error-500">*</span>
                          </label>
                          <input
                            {...register("email")}
                            placeholder="Enter Email"
                            className={inputClass("email")}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Mobile<span className="text-error-500">*</span>
                          </label>
                          <Controller
                            name="phone"
                            control={control}
                            rules={{
                              required: "Mobile number is required",
                              validate: (value) =>
                                value?.length > 10 || "Invalid phone number",
                            }}
                            render={({ field: { onChange, value } }) => (
                              <PhoneInput
                                country={"in"}
                                value={value}
                                onChange={onChange}
                                placeholder="Enter Mobile"
                                inputClass={inputClass("phone")}
                                containerStyle={{ width: "100%" }}
                                inputStyle={{ width: "100%", height: "42px" }}
                                enableSearch={true}
                                disableSearchIcon={true}
                              />
                            )}
                          />
                          {errors.phone && (
                            <p className="text-error-500 text-sm mt-1">
                              {errors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>
                            Gender<span className="text-error-500">*</span>
                          </label>
                          <select
                            {...register("gender")}
                            className={inputClass("gender")}
                          >
                            <option value="">Select Gender...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>
                            Date of Birth
                            <span className="text-error-500">*</span>
                          </label>
                          <input
                            type="date"
                            {...register("date_of_birth")}
                            className={inputClass("date_of_birth")}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>
                            Religion<span className="text-error-500">*</span>
                          </label>
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
                      <div>
                        <label className={labelClass}>
                          Street Address
                          <span className="text-error-500">*</span>
                        </label>
                        <textarea
                          {...register("address")}
                          rows={2}
                          className={inputClass("address")}
                          placeholder="House No., Street, Locality"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <label className={labelClass}>
                            City<span className="text-error-500">*</span>
                          </label>
                          <input
                            {...register("city")}
                            className={inputClass("city")}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            State<span className="text-error-500">*</span>
                          </label>
                          <input
                            {...register("state")}
                            className={inputClass("state")}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Pincode<span className="text-error-500">*</span>
                          </label>
                          <input
                            {...register("zip_code")}
                            className={inputClass("zip_code")}
                            placeholder="6-digit pincode"
                            maxLength="6"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Nationality<span className="text-error-500">*</span>
                          </label>
                          <input
                            {...register("nationality")}
                            className={inputClass("nationality")}
                            placeholder="Nationality"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-black mb-1">
                            Family Information
                          </h3>
                          <p className="text-sm text-gray-600">
                            Parent and guardian details
                          </p>
                        </div>
                        <div>
                          <div className="flex gap-3">
                            {["Both Parents", "Single Parent", "Guardian"].map(
                              (type) => (
                                <label
                                  key={type}
                                  className={`px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer border transition-all ${watch("guardian_type") === type ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-700 hover:border-blue-500"}`}
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
                      </div>

                      {watch("guardian_type") === "Single Parent" && (
                        <div>
                          <label className={labelClass}>
                            Single Parent Type
                          </label>
                          <div className="flex gap-3">
                            {["Father", "Mother"].map((type) => (
                              <label
                                key={type}
                                className={`px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer border transition-all ${watch("single_parent_type") === type ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-700 hover:border-blue-500"}`}
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

                      {watch("guardian_type") === "Both Parents" && (
                        <div className="space-y-6">
                          <h4 className="font-semibold text-black text-base mt-4">
                            Father Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className={labelClass}>Father Name</label>
                              <input
                                placeholder="Enter Father Name"
                                {...register("father_name")}
                                className={inputClass("father_name")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Father Mobile
                              </label>
                              <Controller
                                name="father_mobile"
                                control={control}
                                rules={{
                                  validate: (value) =>
                                    !value ||
                                    value.length > 8 ||
                                    "Invalid phone number",
                                }}
                                render={({ field: { onChange, value } }) => (
                                  <PhoneInput
                                    country={"in"}
                                    value={value}
                                    onChange={onChange}
                                    placeholder="Enter Father Mobile"
                                    inputClass={inputClass("father_mobile")}
                                    containerStyle={{ width: "100%" }}
                                    inputStyle={{
                                      width: "100%",
                                      height: "42px",
                                    }}
                                    enableSearch={true}
                                    disableSearchIcon={true}
                                  />
                                )}
                              />
                              {errors.father_mobile && (
                                <p className="text-error-500 text-sm mt-1">
                                  {errors.father_mobile.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className={labelClass}>Father Email</label>
                              <input
                                type="email"
                                placeholder="Enter Father Email"
                                {...register("father_email")}
                                className={inputClass("father_email")}
                              />
                              {errors.father_email && (
                                <p className="text-error-500 text-sm mt-1">
                                  {errors.father_email.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className={labelClass}>
                                Father Occupation
                              </label>
                              <input
                                placeholder="Enter Father Occupation"
                                {...register("father_job")}
                                className={inputClass("father_job")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Father Annual Income
                              </label>
                              <input
                                placeholder="Enter Father Annual Income"
                                {...register("father_income")}
                                className={inputClass("father_income")}
                              />
                              {errors.father_income && (
                                <p className="text-error-500 text-sm mt-1">
                                  {errors.father_income.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <h4 className="font-semibold text-black text-base mt-8">
                            Mother Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className={labelClass}>Mother Name</label>
                              <input
                                placeholder="Enter Mother Name"
                                {...register("mother_name")}
                                className={inputClass("mother_name")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Mother Mobile
                              </label>
                              <Controller
                                name="mother_mobile"
                                control={control}
                                rules={{
                                  validate: (value) =>
                                    !value ||
                                    value.length > 8 ||
                                    "Invalid phone number",
                                }}
                                render={({ field: { onChange, value } }) => (
                                  <PhoneInput
                                    country={"in"}
                                    value={value}
                                    onChange={onChange}
                                    placeholder="Enter Mother Mobile"
                                    inputClass={inputClass("mother_mobile")}
                                    containerStyle={{ width: "100%" }}
                                    inputStyle={{
                                      width: "100%",
                                      height: "42px",
                                    }}
                                    enableSearch={true}
                                    disableSearchIcon={true}
                                  />
                                )}
                              />
                              {errors.mother_mobile && (
                                <p className="text-error-500 text-sm mt-1">
                                  {errors.mother_mobile.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className={labelClass}>Mother Email</label>
                              <input
                                type="email"
                                placeholder="Enter Mother Email"
                                {...register("mother_email")}
                                className={inputClass("mother_email")}
                              />
                              {errors.mother_email && (
                                <p className="text-error-500 text-sm mt-1">
                                  {errors.mother_email.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className={labelClass}>
                                Mother Occupation
                              </label>
                              <input
                                placeholder="Enter Mother Occupation"
                                {...register("mother_job")}
                                className={inputClass("mother_job")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Mother Annual Income
                              </label>
                              <input
                                placeholder="Enter Mother Annual Income"
                                {...register("mother_income")}
                                className={inputClass("mother_income")}
                              />
                              {errors.mother_income && (
                                <p className="text-error-500 text-sm mt-1">
                                  {errors.mother_income.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {watch("guardian_type") === "Single Parent" &&
                        watch("single_parent_type") === "Father" && (
                          <div className="space-y-6">
                            <h4 className="font-semibold text-black text-base">
                              Father Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className={labelClass}>
                                  Father Name
                                </label>
                                <input
                                  {...register("father_name")}
                                  className={inputClass("father_name")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Father Mobile
                                </label>
                                <Controller
                                  name="father_mobile"
                                  control={control}
                                  rules={{
                                    validate: (value) =>
                                      !value ||
                                      value.length > 8 ||
                                      "Invalid phone number",
                                  }}
                                  render={({ field: { onChange, value } }) => (
                                    <PhoneInput
                                      country={"in"}
                                      value={value}
                                      onChange={onChange}
                                      placeholder="Enter Father Mobile"
                                      inputClass={inputClass("father_mobile")}
                                      containerStyle={{ width: "100%" }}
                                      inputStyle={{
                                        width: "100%",
                                        height: "42px",
                                      }}
                                      enableSearch={true}
                                      disableSearchIcon={true}
                                    />
                                  )}
                                />
                                {errors.father_mobile && (
                                  <p className="text-error-500 text-sm mt-1">
                                    {errors.father_mobile.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Father Email
                                </label>
                                <input
                                  type="email"
                                  {...register("father_email")}
                                  className={inputClass("father_email")}
                                  placeholder="father@example.com"
                                />
                                {errors.father_email && (
                                  <p className="text-error-500 text-sm mt-1">
                                    {errors.father_email.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Father Occupation
                                </label>
                                <input
                                  {...register("father_job")}
                                  className={inputClass("father_job")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Father Annual Income
                                </label>
                                <input
                                  {...register("father_income")}
                                  className={inputClass("father_income")}
                                />
                                {errors.father_income && (
                                  <p className="text-error-500 text-sm mt-1">
                                    {errors.father_income.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {watch("guardian_type") === "Single Parent" &&
                        watch("single_parent_type") === "Mother" && (
                          <div className="space-y-6">
                            <h4 className="font-semibold text-black text-base">
                              Mother Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className={labelClass}>
                                  Mother Name
                                </label>
                                <input
                                  {...register("mother_name")}
                                  className={inputClass("mother_name")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Mother Mobile
                                </label>
                                <Controller
                                  name="mother_mobile"
                                  control={control}
                                  rules={{
                                    validate: (value) =>
                                      !value ||
                                      value.length > 8 ||
                                      "Invalid phone number",
                                  }}
                                  render={({ field: { onChange, value } }) => (
                                    <PhoneInput
                                      country={"in"}
                                      value={value}
                                      onChange={onChange}
                                      placeholder="Enter Mother Mobile"
                                      inputClass={inputClass("mother_mobile")}
                                      containerStyle={{ width: "100%" }}
                                      inputStyle={{
                                        width: "100%",
                                        height: "42px",
                                      }}
                                      enableSearch={true}
                                      disableSearchIcon={true}
                                    />
                                  )}
                                />
                                {errors.mother_mobile && (
                                  <p className="text-error-500 text-sm mt-1">
                                    {errors.mother_mobile.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Mother Email
                                </label>
                                <input
                                  type="email"
                                  {...register("mother_email")}
                                  className={inputClass("mother_email")}
                                  placeholder="mother@example.com"
                                />
                                {errors.mother_email && (
                                  <p className="text-error-500 text-sm mt-1">
                                    {errors.mother_email.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Mother Occupation
                                </label>
                                <input
                                  {...register("mother_job")}
                                  className={inputClass("mother_job")}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>
                                  Mother Annual Income
                                </label>
                                <input
                                  {...register("mother_income")}
                                  className={inputClass("mother_income")}
                                />
                                {errors.mother_income && (
                                  <p className="text-error-500 text-sm mt-1">
                                    {errors.mother_income.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {watch("guardian_type") === "Guardian" && (
                        <div className="space-y-6">
                          <h4 className="font-semibold text-black text-base">
                            Guardian Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className={labelClass}>
                                Guardian Name
                              </label>
                              <input
                                {...register("guardian_name")}
                                className={inputClass("guardian_name")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Guardian Mobile
                              </label>
                              <input
                                {...register("guardian_mobile")}
                                className={inputClass("guardian_mobile")}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Guardian Email
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
                                Guardian Occupation
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

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-black">
                            Prior Education
                          </h3>
                          <p className="text-sm text-gray-600">
                            Add previous academic records
                          </p>
                        </div>
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
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add Record
                        </button>
                      </div>
                      {academicFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="p-6 bg-gray-50 rounded-lg border border-gray-200 relative"
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
                                <option value="Graduation">Graduation</option>
                                <option value="Post Graduation">
                                  Post Graduation
                                </option>
                                <option value="Doctorate">Doctorate</option>
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
                                placeholder="e.g., CBSE, State Board"
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
                            className="absolute top-4 right-4 text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-1">
                          Document Uploads
                        </h3>
                        <p className="text-sm text-gray-600">
                          Upload required documents
                        </p>
                      </div>

                      {admissionConfig?.required_documents &&
                        admissionConfig.required_documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {admissionConfig.required_documents.map((docType) => {
                            const docKey = docType
                              .toLowerCase()
                              .replace(/\s+/g, "_");

                            const uploadedFile = selectedFiles?.[docKey]; // uses existing stored file if available

                            return (
                              <label
                                key={docKey}
                                className={`group relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer
              ${uploadedFile
                                    ? "border-green-400 bg-green-50"
                                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                                  }`}
                              >
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const allowedTypes = [
                                        "application/pdf",
                                        "image/jpeg",
                                        "image/png",
                                      ];
                                      const allowedExts = [
                                        ".pdf",
                                        ".jpg",
                                        ".jpeg",
                                        ".png",
                                      ];
                                      const fileExt = file.name
                                        .substring(file.name.lastIndexOf("."))
                                        .toLowerCase();

                                      if (
                                        !allowedTypes.includes(file.type) &&
                                        !allowedExts.includes(fileExt)
                                      ) {
                                        toast.error(
                                          "Invalid file type. Only PDF, JPG, JPEG, PNG files are allowed."
                                        );
                                        e.target.value = "";
                                        return;
                                      }

                                      handleFileChange(e, docKey);
                                    }
                                  }}
                                  className="hidden"
                                />

                                {/* Icon */}
                                <div
                                  className={`mb-3 p-3 rounded-full transition-all
                ${uploadedFile
                                      ? "bg-green-100 text-green-600"
                                      : "bg-white text-gray-400 group-hover:text-blue-500"
                                    }`}
                                >
                                  <Upload className="w-7 h-7" />
                                </div>

                                {/* Title */}
                                <p className="text-sm font-semibold text-black mb-1">
                                  {docType}
                                </p>

                                {/* Upload State */}
                                {uploadedFile ? (
                                  <div className="mt-2 text-xs">
                                    <p className="text-green-700 font-medium truncate max-w-[200px]">
                                      {uploadedFile?.name || "File uploaded"}
                                    </p>
                                    <p className="text-gray-500 mt-1">
                                      Click to replace file
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Click anywhere to upload (PDF, JPG, PNG)
                                  </p>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-600">
                            No required documents configured for this batch.
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Configure documents in Admission Settings.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 6 &&
                    (() => {
                      const vals = getValues();
                      const selectedProgram = programs?.find(
                        (p) => p.id === vals.program_id,
                      );
                      const selectedDept = departments?.find(
                        (d) => d.id === vals.department_id,
                      );
                      const selectedReg = regulations?.find(
                        (r) => r.id === vals.regulation_id,
                      );
                      const gt = vals.guardian_type;
                      const spt = vals.single_parent_type || "Father";

                      const ReviewField = ({ label, value }) => (
                        <div className="py-2">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                            {label}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {value || (
                              <span className="text-gray-300 italic">—</span>
                            )}
                          </p>
                        </div>
                      );

                      return (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 pb-1">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-black">
                                Review & Confirm
                              </h3>
                              <p className="text-xs text-gray-500">
                                Verify all details before submitting
                              </p>
                            </div>
                          </div>

                          {/* Academic Info */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-blue-600" />
                              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Academic Information
                              </h4>
                            </div>
                            <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                              <ReviewField
                                label="Department"
                                value={selectedDept?.name}
                              />
                              <ReviewField
                                label="Program"
                                value={selectedProgram?.name}
                              />
                              <ReviewField
                                label="Regulation"
                                value={selectedReg?.name}
                              />
                              <ReviewField
                                label="Batch Year"
                                value={vals.batch_year}
                              />
                              <ReviewField
                                label="Semester"
                                value={vals.current_semester}
                              />
                              <ReviewField
                                label="Admission Type"
                                value={
                                  vals.admission_type?.charAt(0).toUpperCase() +
                                  vals.admission_type?.slice(1)
                                }
                              />
                              <ReviewField
                                label="Lateral Entry"
                                value={vals.is_lateral ? "Yes" : "No"}
                              />
                              {autoGenerate && nextIds.admission_number && (
                                <ReviewField
                                  label="Admission No. (Auto)"
                                  value={nextIds.admission_number}
                                />
                              )}
                              {!autoGenerate && (
                                <>
                                  <ReviewField
                                    label="Admission No."
                                    value={vals.admission_number}
                                  />
                                  <ReviewField
                                    label="Student ID"
                                    value={vals.student_id}
                                  />
                                </>
                              )}
                            </div>
                          </div>

                          {/* Personal Info */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                              <User className="w-4 h-4 text-emerald-600" />
                              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Personal Information
                              </h4>
                            </div>
                            <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                              <ReviewField
                                label="Full Name"
                                value={`${vals.first_name || ""} ${vals.last_name || ""}`.trim()}
                              />
                              <ReviewField label="Email" value={vals.email} />
                              <ReviewField label="Mobile" value={vals.phone} />
                              <ReviewField label="Gender" value={vals.gender} />
                              <ReviewField
                                label="Date of Birth"
                                value={
                                  vals.date_of_birth
                                    ? new Date(
                                      vals.date_of_birth,
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                    : ""
                                }
                              />
                              <ReviewField
                                label="Religion"
                                value={vals.religion}
                              />
                              <ReviewField
                                label="Caste / Category"
                                value={vals.caste}
                              />
                              <ReviewField
                                label="Nationality"
                                value={vals.nationality}
                              />
                              <ReviewField
                                label="Aadhaar"
                                value={vals.aadhaar_number}
                              />
                              <ReviewField
                                label="PAN"
                                value={vals.pan_number}
                              />
                              <ReviewField
                                label="Passport"
                                value={vals.passport_number}
                              />
                              <div className="col-span-2 md:col-span-3">
                                <ReviewField
                                  label="Address"
                                  value={[
                                    vals.address,
                                    vals.city,
                                    vals.state,
                                    vals.zip_code,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Family Info */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                              <UsersIcon className="w-4 h-4 text-amber-600" />
                              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Family / Guardian — {gt}
                              </h4>
                            </div>
                            <div className="px-5 py-3">
                              {(gt === "Both Parents" ||
                                (gt === "Single Parent" &&
                                  spt === "Father")) && (
                                  <div className="mb-3">
                                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                                      Father
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                                      <ReviewField
                                        label="Name"
                                        value={vals.father_name}
                                      />
                                      <ReviewField
                                        label="Mobile"
                                        value={vals.father_mobile}
                                      />
                                      <ReviewField
                                        label="Email"
                                        value={vals.father_email}
                                      />
                                      <ReviewField
                                        label="Occupation"
                                        value={vals.father_job}
                                      />
                                      <ReviewField
                                        label="Annual Income"
                                        value={vals.father_income}
                                      />
                                    </div>
                                  </div>
                                )}
                              {(gt === "Both Parents" ||
                                (gt === "Single Parent" &&
                                  spt === "Mother")) && (
                                  <div className="mb-3">
                                    <p className="text-[11px] font-bold text-pink-600 uppercase tracking-wider mb-1">
                                      Mother
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                                      <ReviewField
                                        label="Name"
                                        value={vals.mother_name}
                                      />
                                      <ReviewField
                                        label="Mobile"
                                        value={vals.mother_mobile}
                                      />
                                      <ReviewField
                                        label="Email"
                                        value={vals.mother_email}
                                      />
                                      <ReviewField
                                        label="Occupation"
                                        value={vals.mother_job}
                                      />
                                      <ReviewField
                                        label="Annual Income"
                                        value={vals.mother_income}
                                      />
                                    </div>
                                  </div>
                                )}
                              {gt === "Guardian" && (
                                <div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                                    <ReviewField
                                      label="Name"
                                      value={vals.guardian_name}
                                    />
                                    <ReviewField
                                      label="Mobile"
                                      value={vals.guardian_mobile}
                                    />
                                    <ReviewField
                                      label="Email"
                                      value={vals.guardian_email}
                                    />
                                    <ReviewField
                                      label="Occupation"
                                      value={vals.guardian_job}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Education History */}
                          {vals.previous_academics &&
                            vals.previous_academics.length > 0 && (
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                  <History className="w-4 h-4 text-violet-600" />
                                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Education History
                                  </h4>
                                </div>
                                <div className="divide-y divide-gray-100">
                                  {vals.previous_academics.map((rec, i) => (
                                    <div
                                      key={i}
                                      className="px-5 py-3 grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-1"
                                    >
                                      <ReviewField
                                        label="Level"
                                        value={rec.level}
                                      />
                                      <ReviewField
                                        label="Institution"
                                        value={rec.school}
                                      />
                                      <ReviewField
                                        label="Board"
                                        value={rec.board}
                                      />
                                      <ReviewField
                                        label="Marks / CGPA"
                                        value={rec.percentage}
                                      />
                                      <ReviewField
                                        label="Year"
                                        value={rec.year}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Uploaded Documents */}
                          {Object.keys(selectedFiles).length > 0 && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-cyan-600" />
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Uploaded Documents
                                </h4>
                              </div>
                              <div className="px-5 py-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(selectedFiles).map(
                                  ([key, file]) => (
                                    <div
                                      key={key}
                                      className="flex items-center gap-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 capitalize">
                                          {key.replace(/_/g, " ")}
                                        </p>
                                        <p className="text-[10px] text-gray-500 truncate">
                                          {file.name}
                                        </p>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((c) => c - 1)}
                        className="px-6 py-2.5 rounded-lg bg-gray-100 font-medium text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    ) : (
                      <div></div>
                    )}
                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-8 py-2.5 rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                        className="px-8 py-3 rounded-lg bg-emerald-600 font-medium text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-200"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                        Confirm Registration
                      </button>
                    )}
                  </div>
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
