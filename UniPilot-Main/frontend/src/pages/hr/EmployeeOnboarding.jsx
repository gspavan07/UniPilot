import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  User,
  Briefcase,
  Shield,
  GraduationCap,
  Wallet,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Save,
  AlertCircle,
  Building,
  Upload,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Tag,
  BookOpen,
} from "lucide-react";
import { createUser } from "../../store/slices/userSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchRoles } from "../../store/slices/roleSlice";
import { fetchSalaryGrades } from "../../store/slices/hrSlice";

// --- VALIDATION SCHEMAS ---
const schema = yup.object().shape({
  // Step 1: Identity
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
    .required("Mobile is required"),
  gender: yup.string().required("Gender is required"),
  date_of_birth: yup.string().required("Date of birth is required"),

  // Step 2: Role & Job
  role_id: yup.string().required("Role is required"),
  department_id: yup.string().nullable(), // Optional for some admins
  designation: yup.string().required("Job Title/Designation is required"),
  employee_id: yup.string().required("Employee ID is required"),
  joining_date: yup.string().required("Joining date is required"),

  aadhaar_number: yup
    .string()
    .matches(/^\d{12}$/, "Must be 12 digits")
    .optional(),
  pan_number: yup
    .string()
    // .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
    .optional(),
  passport_number: yup.string().optional(),
  religion: yup.string().optional(),
  caste: yup.string().optional(),
  uan_number: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zip_code: yup.string().optional(),

  // Step 4: Academic (Array)
  previous_academics: yup.array().of(
    yup.object().shape({
      school: yup.string().required("Institution required"),
      board: yup.string().required("Degree/Board required"),
      year: yup.string().required("Year required"),
    }),
  ),

  // Step 5: Payroll (Now Mandatory)
  salary_grade_id: yup.string().optional(),
  bank_details: yup.object().shape({
    bank_name: yup.string().required("Bank Name is required"),
    account_number: yup.string().required("Account Number is required"),
    ifsc_code: yup
      .string()
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC")
      .required("IFSC Code is required"),
    holder_name: yup.string().required("Account Holder Name is required"),
  }),
});

const steps = [
  { id: 1, title: "Identity", icon: User, desc: "Personal Details" },
  { id: 2, title: "Role & Job", icon: Briefcase, desc: "Position & Dept" },
  { id: 3, title: "Statutory", icon: Shield, desc: "Legal & Compliance" },
  { id: 4, title: "History", icon: GraduationCap, desc: "Qualifications" },
  { id: 5, title: "Payroll", icon: Wallet, desc: "Bank Accounts" },
  { id: 6, title: "Docs", icon: Upload, desc: "Uploads" },
  { id: 7, title: "Review", icon: CheckCircle2, desc: "Final Check" },
];

const EmployeeOnboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { departments } = useSelector((state) => state.departments);
  const { roles } = useSelector((state) => state.roles);
  const { salaryGrades } = useSelector((state) => state.hr);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [hasReachedReview, setHasReachedReview] = useState(false);

  // Filter roles to exclude students for this wizard
  const staffRoles = roles.filter((r) => r.slug !== "student");

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchRoles());
    dispatch(fetchSalaryGrades());
  }, [dispatch]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      gender: "Male",
      previous_academics: [],
      bank_details: {},
      is_active: true,
      password: "Welcome@123", // Default initial password
    },
  });

  // Auto-generate Employee ID
  useEffect(() => {
    if (currentStep === 2) {
      const currentId = watch("employee_id");
      if (!currentId) {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        setValue("employee_id", `EMP-${year}-${randomNum}`);
      }
    }
  }, [currentStep, setValue, watch]);

  const {
    fields: academicFields,
    append: appendAcademic,
    remove: removeAcademic,
  } = useFieldArray({
    control,
    name: "previous_academics",
  });

  const selectedRoleId = watch("role_id");
  const selectedRoleObj = roles.find((r) => r.id === selectedRoleId);
  const isFaculty =
    selectedRoleObj?.slug === "faculty" || selectedRoleObj?.slug === "hod";

  // Auto-generate Employee ID preview (Optional enhancement)
  // const deptId = watch("department_id");

  const validateStep = async (step) => {
    let fieldsToValidate = [];
    if (step === 1)
      fieldsToValidate = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "gender",
        "date_of_birth",
      ];
    if (step === 2)
      fieldsToValidate = [
        "role_id",
        "designation",
        "employee_id",
        "joining_date",
      ];
    // Step 3, 4, 5 often have optional fields but we trigger validation to show errors if any constraints exist

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step === 6) setHasReachedReview(true);
      setCurrentStep(step + 1);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setSubmitError(null);
    try {
      // Use FormData for file uploads
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "bank_details" || key === "previous_academics") {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      formData.append("role", selectedRoleObj?.slug || "staff");
      formData.append(
        "custom_fields",
        JSON.stringify({
          pan_number: data.pan_number,
          uan_number: data.uan_number,
          research_areas: data.research_areas,
        }),
      );

      // Append files
      Object.keys(selectedFiles).forEach((type) => {
        formData.append("documents", selectedFiles[type]);
        formData.append("document_types", type);
      });

      await dispatch(createUser(formData)).unwrap();
      navigate("/employees"); // Redirect to directory on success
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.message || "Failed to onboard employee. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper for input styles
  const inputClass = (name) => `
    w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none
    ${errors[name]
      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-red-900 dark:text-red-100"
      : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600"
    }
  `;

  const labelClass =
    "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1";

  const handleFileChange = (e, type) => {
    if (e.target.files?.[0]) {
      setSelectedFiles((prev) => ({
        ...prev,
        [type]: e.target.files[0],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-20 animate-fade-in">
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
                Onboard New Employee
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                Add talent to your organization
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Step {currentStep} of {steps.length}
            </p>
            <div className="w-32 h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Stepper Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-700 sticky top-32">
              <div className="space-y-6">
                {steps.map((step, idx) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  return (
                    <div
                      key={step.id}
                      onClick={() => {
                        if (step.id < currentStep || hasReachedReview) {
                          setCurrentStep(step.id);
                        }
                      }}
                      className={`flex items-center gap-4 group ${step.id < currentStep || hasReachedReview ? "cursor-pointer" : "cursor-not-allowed"} ${isActive ? "opacity-100" : "opacity-50"}`}
                    >
                      <div
                        className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                                        ${isActive
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110"
                            : isCompleted
                              ? "bg-emerald-500 text-white shadow-md"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                          }
                                    `}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold transition-colors ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
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

          {/* Main Form Area */}
          <div className="flex-1 w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-8 flex-1">
              <form
                id="onboard-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
              >
                {/* STEP 1: IDENTITY */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>
                          First Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("first_name")}
                          className={inputClass("first_name")}
                          placeholder="e.g. Rajesh"
                        />
                        {errors.first_name && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Last Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("last_name")}
                          className={inputClass("last_name")}
                          placeholder="e.g. Kumar"
                        />
                        {errors.last_name && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>
                          Email Address<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                          <input
                            {...register("email")}
                            className={`${inputClass("email")} pl-11`}
                            placeholder="official@university.edu"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Mobile Number<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                          <input
                            {...register("phone")}
                            className={`${inputClass("phone")} pl-11`}
                            placeholder="9876543210"
                            maxLength={10}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>
                          Date of Birth<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          {...register("date_of_birth")}
                          className={inputClass("date_of_birth")}
                        />
                        {errors.date_of_birth && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.date_of_birth.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Gender<span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4 mt-2">
                          {["Male", "Female", "Other"].map((g) => (
                            <label
                              key={g}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${watch("gender") === g ? "border-indigo-500" : "border-gray-300 group-hover:border-indigo-300"}`}
                              >
                                {watch("gender") === g && (
                                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {g}
                              </span>
                              <input
                                type="radio"
                                value={g}
                                {...register("gender")}
                                className="hidden"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>
                          Religion<span className="text-red-500">*</span>
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
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>
                          Caste / Category
                          <span className="text-red-500">*</span>
                        </label>
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

                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <label className={labelClass}>
                        Communication Address
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <textarea
                            {...register("address")}
                            rows={2}
                            className={inputClass("address")}
                            placeholder="Street Address, House No."
                          />
                        </div>
                        <div>
                          <input
                            {...register("city")}
                            className={inputClass("city")}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <input
                            {...register("state")}
                            className={inputClass("state")}
                            placeholder="State"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            {...register("zip_code")}
                            className={inputClass("zip_code")}
                            placeholder="Pincode / Zip Code"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: ROLE & JOB */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>
                        Organizational Role
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {staffRoles.map((role) => (
                          <label
                            key={role.id}
                            className={`
                                                    relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02]
                                                    ${watch("role_id") ===
                                role.id
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 shadow-lg ring-1 ring-indigo-500"
                                : "border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 hover:border-indigo-200"
                              }
                                                `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${watch("role_id") === role.id ? "bg-indigo-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}
                              >
                                {role.slug === "faculty" ? (
                                  <BookOpen className="w-5 h-5" />
                                ) : (
                                  <Briefcase className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white capitalize">
                                  {role.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  Level {role.level || 1}
                                </p>
                              </div>
                            </div>
                            <input
                              type="radio"
                              value={role.id}
                              {...register("role_id")}
                              className="hidden"
                            />
                            {watch("role_id") === role.id && (
                              <div className="absolute top-3 right-3 text-indigo-500">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                      {errors.role_id && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.role_id.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Department</label>
                        <select
                          {...register("department_id")}
                          className={inputClass("department_id")}
                        >
                          <option value="">Select Department...</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>
                          Job Title / Designation
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("designation")}
                          className={inputClass("designation")}
                          placeholder={
                            isFaculty
                              ? "e.g. Assistant Professor"
                              : "e.g. Sr. Operations Manager"
                          }
                        />
                        {errors.designation && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.designation.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>
                          Employee ID<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register("employee_id")}
                            className={`${inputClass("employee_id")} bg-gray-100 cursor-not-allowed`}
                            readOnly
                            placeholder="Auto-generated ID"
                          />
                          <div className="absolute right-3 top-3 text-xs text-gray-500 font-mono">
                            Auto-generated
                          </div>
                        </div>
                        {errors.employee_id && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.employee_id.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Date of Joining<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          {...register("joining_date")}
                          className={inputClass("joining_date")}
                        />
                        {errors.joining_date && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.joining_date.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: STATUTORY */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl flex gap-3 items-start">
                      <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                          Compliance Required
                        </h4>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Please ensure Aadhaar and PAN numbers are verified
                          against original documents. These are mandatory for
                          payroll processing.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Aadhaar Number</label>
                        <div className="relative">
                          <div className="absolute left-4 top-3.5 w-6 h-4 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-gray-500 border border-gray-300">
                            IND
                          </div>
                          <input
                            {...register("aadhaar_number")}
                            className={`${inputClass("aadhaar_number")} pl-12`}
                            placeholder="XXXX XXXX XXXX"
                            maxLength={12}
                          />
                        </div>
                        {errors.aadhaar_number && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.aadhaar_number.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          PAN Number<span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("pan_number")}
                          className={`${inputClass("pan_number")} uppercase tracking-widest`}
                          placeholder="ABCDE1234F"
                          maxLength={10}
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
                      <label className={labelClass}>UAN (PF Account)</label>
                      <input
                        {...register("uan_number")}
                        className={inputClass("uan_number")}
                        placeholder="Universal Account Number (if applicable)"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 ml-1">
                        Leave blank if this is their first employment.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4: ACADEMIC */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          Educational Qualifications
                        </h3>
                        <p className="text-xs text-gray-500">
                          Add all relevant degrees and certifications
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          appendAcademic({ school: "", board: "", year: "" })
                        }
                        className="btn btn-sm btn-secondary flex items-center"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Qualification
                      </button>
                    </div>

                    <div className="space-y-4">
                      {academicFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 relative animate-in slide-in-from-bottom-2"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                              <label className={labelClass}>Institution</label>
                              <input
                                {...register(
                                  `previous_academics.${index}.school`,
                                )}
                                className={inputClass("")}
                                placeholder="University/College Name"
                              />
                            </div>
                            <div className="md:col-span-1">
                              <label className={labelClass}>Degree/Board</label>
                              <input
                                {...register(
                                  `previous_academics.${index}.board`,
                                )}
                                className={inputClass("")}
                                placeholder="e.g. B.Tech, PhD"
                              />
                            </div>
                            <div className="md:col-span-1">
                              <label className={labelClass}>Passing Year</label>
                              <input
                                {...register(
                                  `previous_academics.${index}.year`,
                                )}
                                className={inputClass("")}
                                placeholder="e.g. 2022"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAcademic(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <span className="text-xl leading-none mb-1">
                              &times;
                            </span>
                          </button>
                        </div>
                      ))}

                      {academicFields.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                          <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-400 font-medium">
                            No qualifications added yet.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              appendAcademic({
                                school: "",
                                board: "",
                                year: "",
                              })
                            }
                            className="text-indigo-500 text-xs font-bold uppercase tracking-widest mt-2 hover:underline"
                          >
                            Add First Entry
                          </button>
                        </div>
                      )}
                    </div>

                    {isFaculty && (
                      <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          Faculty Specifics
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className={labelClass}>Research Areas</label>
                            <textarea
                              {...register("research_areas")}
                              className={inputClass("research_areas")}
                              placeholder="Comma separated list (e.g. Machine Learning, NLP, Data Mining)"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 5: PAYROLL */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl text-center mb-6">
                      <Wallet className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
                        Compensation Setup
                      </h3>
                      <p className="text-sm text-indigo-600 dark:text-indigo-300 max-w-md mx-auto mt-1">
                        Select the salary grade and provide mandatory bank
                        details for salary disbursement.
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>Salary Grade</label>
                      <select
                        {...register("salary_grade_id")}
                        className={inputClass("salary_grade_id")}
                      >
                        <option value="">Select Salary Grade...</option>
                        {salaryGrades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name} - ₹
                            {parseFloat(grade.basic_salary).toLocaleString()}
                          </option>
                        ))}
                      </select>
                      {errors.salary_grade_id && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.salary_grade_id.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className={labelClass}>
                          Account Holder Name
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("bank_details.holder_name")}
                          className={inputClass("bank_details.holder_name")}
                          placeholder="Usually same as employee name"
                        />
                        {errors.bank_details?.holder_name && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.bank_details.holder_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Bank Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("bank_details.bank_name")}
                          className={inputClass("bank_details.bank_name")}
                          placeholder="e.g. HDFC Bank"
                        />
                        {errors.bank_details?.bank_name && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.bank_details.bank_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Account Number<span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("bank_details.account_number")}
                          className={inputClass("bank_details.account_number")}
                          placeholder="XXXX XXXX XXXX"
                        />
                        {errors.bank_details?.account_number && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.bank_details.account_number.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          IFSC Code<span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("bank_details.ifsc_code")}
                          className={`${inputClass("bank_details.ifsc_code")} uppercase`}
                          placeholder="HDFC0001234"
                          maxLength={11}
                        />
                        {errors.bank_details?.ifsc_code && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.bank_details.ifsc_code.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Branch Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("bank_details.branch_name")}
                          className={inputClass("bank_details.branch_name")}
                          placeholder="e.g. Kakinada Main"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: DOCS */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex gap-3 items-start mb-6">
                      <Upload className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200">
                          Document Upload
                        </h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Upload digital copies of employee credentials. Max
                          file size: 5MB per file.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { id: "photo", label: "Profile Photo" },
                        { id: "aadhaar_card", label: "Aadhaar Card" },
                        { id: "pan_card", label: "PAN Card" },
                        { id: "experience_letter", label: "Experience Letter" },
                        { id: "degree_certificate", label: "Highest Degree" },
                        { id: "payslip_previous", label: "Last Month Payslip" },
                      ].map((doc) => (
                        <div
                          key={doc.id}
                          className={`
                                            p-6 rounded-2xl border-2 border-dashed transition-all
                                            ${selectedFiles[doc.id] ? "border-emerald-500 bg-emerald-50/30" : "border-gray-200 dark:border-gray-700 bg-gray-50/30 hover:border-indigo-300"}
                                        `}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${selectedFiles[doc.id] ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                            >
                              {selectedFiles[doc.id] ? (
                                <CheckCircle2 className="w-6 h-6" />
                              ) : (
                                <Upload className="w-6 h-6" />
                              )}
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                              {doc.label}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 mb-4">
                              {selectedFiles[doc.id]
                                ? (selectedFiles[doc.id].size / 1024).toFixed(
                                  1,
                                ) + " KB"
                                : "No file selected"}
                            </p>
                            <label className="cursor-pointer">
                              <span className="btn btn-sm btn-secondary text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-lg">
                                {selectedFiles[doc.id]
                                  ? "Change File"
                                  : "Choose File"}
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, doc.id)}
                                accept="image/*,.pdf"
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3 animate-shake">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {submitError}
                  </div>
                )}
              </form>
            </div>

            {/* Footer Controls */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1 || loading}
                className={`btn btn-secondary flex items-center ${currentStep === 1 ? "opacity-0 pointer-events-none" : ""}`}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => validateStep(currentStep)}
                  className="btn btn-primary flex items-center shadow-lg shadow-indigo-500/20"
                >
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="btn btn-primary bg-emerald-500 hover:bg-emerald-600 border-emerald-500 flex items-center shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Complete Onboarding
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOnboarding;
