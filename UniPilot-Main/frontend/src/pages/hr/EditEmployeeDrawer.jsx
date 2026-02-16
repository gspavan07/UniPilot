import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  Upload,
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
  religion: yup.string().optional(),
  caste: yup.string().optional(),
  aadhaar_number: yup.string().optional(),
  pan_number: yup.string().optional().nullable(),
  passport_number: yup.string().optional().nullable(),
  uan_number: yup.string().optional(),
  zip_code: yup.string().optional(),

  // Employment
  employee_id: yup.string().required("Employee ID is required"),
  designation: yup.string().required("Designation is required"),
  department_id: yup.string().optional(),
  joining_date: yup.string().optional(),

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

  previous_academics: yup
    .array()
    .of(
      yup.object().shape({
        school: yup.string().required("Institution required"),
        board: yup.string().required("Degree/Board required"),
        year: yup.string().required("Year required"),
      }),
    )
    .optional(),
});

const EditEmployeeDrawer = ({ isOpen, onClose, user, departmentList = [] }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});

  const handleFileChange = (e, docId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }
      setSelectedFiles((prev) => ({ ...prev, [docId]: file }));
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
    control,
  } = useForm({
    resolver: yupResolver(schema),
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
      reset({
        ...user,
        department_id: user.department_id || "",
        designation: user.designation || user.custom_fields?.designation || "",
        bank_details: user.bank_details || {},
        previous_academics: user.previous_academics || [],
      });
      setError(null);
    }
  }, [user, isOpen, reset]);

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    setLoading(true);
    setError(null);

    // Prepare payload via FormData
    const formData = new FormData();

    // Fields that should go in custom_fields, not top-level
    const customFieldKeys = ["uan_number"];

    Object.keys(data).forEach((key) => {
      // Skip fields that go into custom_fields
      if (customFieldKeys.includes(key)) return;

      if (key === "bank_details" || key === "previous_academics") {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    // Handle nested custom_fields correctly (excluding designation which is now top-level)
    formData.append(
      "custom_fields",
      JSON.stringify({
        ...(user?.custom_fields || {}),
        uan_number: data.uan_number,
      }),
    );

    // Append files (matching backend expectation: key "documents" + array "document_types")
    Object.keys(selectedFiles).forEach((type) => {
      formData.append("documents", selectedFiles[type]);
      formData.append("document_types", type);
    });

    try {
      await dispatch(updateUser({ id: user.id, data: formData })).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update employee:", err);
      setError(err?.message || "Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors) => {
    console.log("Form validation errors:", errors);
    setError("Please fix the validation errors before saving.");
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "employment", label: "Employment & Role", icon: Briefcase },
    { id: "academic", label: "Qualifications", icon: History },
    { id: "finance", label: "Payroll & Bank", icon: Landmark },
    { id: "documents", label: "Documents", icon: Upload },
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
      <div className="absolute inset-y-0 right-0 w-full max-w-4xl transform transition-transform duration-300 ease-out bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full border-l border-gray-100 dark:border-gray-800">
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
          <div className="flex items-center gap-1 mt-6  no-scrollbar">
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
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-8 max-w-3xl mx-auto"
          >
            {error && (
              <div className="p-4 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
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
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Gender
                      </label>
                      <select
                        {...register("gender")}
                        className="form-select w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        <option value="">Select Gender...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Religion
                      </label>
                      <select
                        {...register("religion")}
                        className="form-select w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Caste / Category
                      </label>
                      <select
                        {...register("caste")}
                        className="form-select w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                          Pincode / Zip Code
                        </label>
                        <input
                          {...register("zip_code")}
                          className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </section>
                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-500" />
                    Statutory Details
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Aadhaar Number
                      </label>
                      <input
                        {...register("aadhaar_number")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="12-digit number"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        PAN Number
                      </label>
                      <input
                        {...register("pan_number")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white uppercase"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                        Passport Number
                      </label>
                      <input
                        {...register("passport_number")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white uppercase"
                        placeholder="L1234567"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "academic" && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Educational Qualifications
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      appendAcademic({ school: "", board: "", year: "" })
                    }
                    className="btn btn-sm btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Qualification
                  </button>
                </div>

                <div className="space-y-4">
                  {academicFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 relative group"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">
                            Institution / School
                          </label>
                          <input
                            {...register(`previous_academics.${index}.school`)}
                            className="form-input w-full rounded-xl text-sm"
                            placeholder="University/College Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">
                            Degree / Board
                          </label>
                          <input
                            {...register(`previous_academics.${index}.board`)}
                            className="form-input w-full rounded-xl text-sm"
                            placeholder="B.Tech / CBSE"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">
                            Year of Passing
                          </label>
                          <input
                            {...register(`previous_academics.${index}.year`)}
                            className="form-input w-full rounded-xl text-sm"
                            placeholder="2020"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAcademic(index)}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center text-error-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                        {errors.employee_id && (
                          <span className="text-error-500 ml-2 normal-case text-xs">
                            *Required
                          </span>
                        )}
                      </label>
                      <input
                        {...register("employee_id")}
                        className={`form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono ${errors.employee_id
                            ? "border-error-500 focus:border-error-500 focus:ring-error-500/10"
                            : ""
                          }`}
                      />
                      {errors.employee_id && (
                        <p className="mt-1 text-xs text-error-500">
                          {errors.employee_id.message}
                        </p>
                      )}
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
                        {errors.designation && (
                          <span className="text-error-500 ml-2 normal-case text-xs">
                            *Required
                          </span>
                        )}
                      </label>
                      <input
                        {...register("designation")}
                        placeholder="e.g. Senior Lecturer, Lab Technician"
                        className={`form-input w-full rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.designation
                            ? "border-error-500 focus:border-error-500 focus:ring-error-500/10"
                            : ""
                          }`}
                      />
                      {errors.designation && (
                        <p className="mt-1 text-xs text-error-500">
                          {errors.designation.message}
                        </p>
                      )}
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

            {activeTab === "documents" && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex gap-3 text-blue-700 dark:text-blue-300">
                  <Upload className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">Document Management</h4>
                    <p className="text-xs mt-1">
                      Upload digital copies of employee credentials. Max file
                      size: 5MB per file.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "photo", label: "Profile Photo" },
                    { id: "aadhaar_card", label: "Aadhaar Card" },
                    { id: "pan_card", label: "PAN Card" },
                    { id: "experience_letter", label: "Experience Letter" },
                    { id: "degree_certificate", label: "Highest Degree" },
                  ].map((doc) => (
                    <div
                      key={doc.id}
                      className={`
                          p-4 rounded-2xl border-2 border-dashed transition-all
                          ${selectedFiles[doc.id] ? "border-emerald-500 bg-emerald-50/10" : "border-gray-200 dark:border-gray-700 bg-gray-50/30 hover:border-indigo-300"}
                      `}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${selectedFiles[doc.id] ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                        >
                          {selectedFiles[doc.id] ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {doc.label}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 mb-3">
                          {selectedFiles[doc.id]
                            ? (selectedFiles[doc.id].size / 1024).toFixed(1) +
                            " KB"
                            : "No file selected"}
                        </p>
                        <label className="cursor-pointer">
                          <span className="btn btn-xs btn-secondary text-[10px] uppercase py-1 px-3 rounded-lg">
                            {selectedFiles[doc.id] ? "Update" : "Choose"}
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
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="flex-none p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between">
          <div className="text-xs text-gray-400 font-medium">
            {isDirty || Object.keys(selectedFiles).length > 0 ? (
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
              onClick={(e) => {
                console.log("Save button clicked", e);
              }}
              disabled={
                loading || (!isDirty && Object.keys(selectedFiles).length === 0)
              }
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
