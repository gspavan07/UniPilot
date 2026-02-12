import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDriveById,
  applyToDrive,
  fetchSystemFields,
  uploadResume,
} from "../../store/slices/placementSlice";
import {
  ChevronLeft,
  CheckCircle2,
  FileText,
  Info,
  MapPin,
  Banknote,
  Users,
  Calendar,
  Clock,
  Briefcase,
  Building,
  File,
  Upload,
  X,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const ApplyDrive = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentDrive, systemFields, loading } = useSelector(
    (state) => state.placement,
  );
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(0); // Start at Step 0: Details View
  const [formData, setFormData] = useState({});

  useEffect(() => {
    dispatch(fetchDriveById(id));
    dispatch(fetchSystemFields());
  }, [id, dispatch]);

  // Handle pre-filling system fields when drive/system data is ready
  useEffect(() => {
    if (currentDrive?.registration_form_fields && systemFields) {
      const prefilledData = { ...formData };
      let updated = false;

      currentDrive.registration_form_fields.forEach((field) => {
        if (
          field.type === "system" &&
          field.systemField &&
          systemFields[field.systemField]
        ) {
          // Only pre-fill if not already filled (to avoid overwriting user edits on contact fields if they go back/forward)
          if (!prefilledData[field.id]) {
            prefilledData[field.id] = systemFields[field.systemField];
            updated = true;
          }
        }
      });

      if (updated) {
        setFormData(prefilledData);
      }
    }
  }, [currentDrive, systemFields]);

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleResumeUpload = async (fieldId, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("resume", file);

    const promise = dispatch(uploadResume(uploadData)).unwrap();

    toast.promise(promise, {
      loading: "Uploading resume...",
      success: (data) => {
        handleInputChange(fieldId, data.resume_url);
        return "Resume uploaded and set as master!";
      },
      error: (err) => err.error || "Failed to upload resume",
    });
  };

  const validateForm = () => {
    const fields = currentDrive?.registration_form_fields || [];
    for (const field of fields) {
      if (field.required && !formData[field.id]) {
        toast.error(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Final submission happens in Step 3
    if (step === 3) {
      try {
        await dispatch(
          applyToDrive({
            driveId: id,
            registrationFormData: formData,
          }),
        ).unwrap();
        setStep(4); // Success step
      } catch (error) {
        toast.error(error.error || "Failed to submit application");
      }
    }
  };

  if (!currentDrive && loading)
    return <div className="p-20 text-center">Loading drive details...</div>;
  if (!currentDrive)
    return <div className="p-20 text-center text-red-500">Drive not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PlacementBreadcrumbs
        items={[
          { label: "Dashboard", href: "/placement/student/dashboard" },
          { label: "Drives", href: "/placement/eligible" },
          { label: "Apply" },
        ]}
      />

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-indigo-100/20 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header - Shown on all steps */}
        <div className="p-8 bg-indigo-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 flex gap-6 items-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/20">
              {currentDrive.job_posting?.company?.logo_url ? (
                <img
                  src={currentDrive.job_posting.company.logo_url}
                  alt=""
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                currentDrive.job_posting?.company?.name?.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{currentDrive.drive_name}</h1>
              <p className="text-indigo-100 text-lg mt-1 font-medium">
                {currentDrive.job_posting?.company?.name} •{" "}
                {currentDrive.job_posting?.role_title}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {step > 0 && step < 4 && (
          <div className="flex h-1.5 w-full bg-gray-100 dark:bg-gray-700">
            <div
              className={`h-full bg-indigo-500 transition-all duration-500 ${
                step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
              }`}
            ></div>
          </div>
        )}

        <div className="p-8 md:p-10">
          {/* STEP 0: DETAILS VIEW */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Job Info */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                      Job Description
                    </h3>
                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                      {currentDrive.job_posting?.job_description ||
                        "No description provided."}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentDrive.job_posting?.required_skills?.map(
                        (skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold"
                          >
                            {skill}
                          </span>
                        ),
                      ) || "None specified"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      Selection Process
                    </h3>
                    <div className="space-y-4">
                      {currentDrive.rounds?.length > 0 ? (
                        [...currentDrive.rounds]
                          .sort((a, b) => a.round_number - b.round_number)
                          .map((round) => (
                            <div
                              key={round.id}
                              className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700"
                            >
                              <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg font-bold text-indigo-600 text-sm shadow-sm">
                                {round.round_number}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                  {round.round_name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 flex gap-3">
                                  <span className="uppercase font-bold">
                                    {round.round_type}
                                  </span>
                                  <span>
                                    •{" "}
                                    {new Date(
                                      round.round_date,
                                    ).toLocaleDateString()}
                                  </span>
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-500 italic">
                          No rounds info available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Col: Meta Info & Action */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        CTC / Package
                      </p>
                      <div className="flex items-center text-emerald-600 text-2xl font-bold">
                        <Banknote className="w-6 h-6 mr-2" />₹
                        {currentDrive.job_posting?.ctc_lpa} LPA
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Location
                      </p>
                      <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                        <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                        {currentDrive.job_posting?.work_location ||
                          "Not specified"}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Openings
                      </p>
                      <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                        <Users className="w-5 h-5 mr-2 text-gray-400" />
                        {currentDrive.job_posting?.number_of_positions ||
                          "Open"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                      Eligibility
                    </p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-indigo-900 dark:text-indigo-200">
                        Min CGPA
                      </span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {currentDrive.eligibility?.min_cgpa || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-indigo-900 dark:text-indigo-200">
                        Min 10th %
                      </span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {currentDrive.eligibility?.min_10th_percent || "0"}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-indigo-900 dark:text-indigo-200">
                        Min Inter %
                      </span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {currentDrive.eligibility?.min_inter_percent || "0"}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-900 dark:text-indigo-200">
                        Max Backlogs
                      </span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {currentDrive.eligibility?.max_active_backlogs ?? "N/A"}
                      </span>
                    </div>
                  </div>

                  {!currentDrive.isEligible && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl">
                      <div className="flex gap-3">
                        <X className="w-5 h-5 text-red-500 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-red-700 dark:text-red-400">
                            You are not eligible
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400/80 mt-1">
                            {currentDrive.ineligible_reason ||
                              "Requirements not met"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setStep(1)}
                    disabled={!currentDrive.isEligible}
                    className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg transform hover:-translate-y-1 ${
                      currentDrive.isEligible
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed transform-none hover:translate-y-0"
                    }`}
                  >
                    {currentDrive.isEligible
                      ? "Apply Now"
                      : "Currently Ineligible"}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    Application closes on{" "}
                    {new Date(
                      currentDrive.registration_end,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: ELIGIBILITY CHECK */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Info className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Review Eligibility
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                    You must meet these criteria:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
                      Minimum CGPA:{" "}
                      <span className="font-bold ml-1">
                        {currentDrive.eligibility?.min_cgpa}
                      </span>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
                      Min 10th %:{" "}
                      <span className="font-bold ml-1">
                        {currentDrive.eligibility?.min_10th_percent}%
                      </span>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
                      Min Inter %:{" "}
                      <span className="font-bold ml-1">
                        {currentDrive.eligibility?.min_inter_percent}%
                      </span>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
                      Max Active Backlogs:{" "}
                      <span className="font-bold ml-1">
                        {currentDrive.eligibility?.max_active_backlogs}
                      </span>
                    </li>
                  </ul>
                  {!currentDrive.isEligible && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl">
                      <p className="text-sm font-bold text-red-700 dark:text-red-400">
                        Ineligibility Reason:
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {currentDrive.ineligible_reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-xl">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    By proceeding, you confirm that the information in your
                    placement profile is accurate and up-to-date.
                  </p>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    Confirm & Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REGISTRATION FORM */}
          {step === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (validateForm()) setStep(3);
              }}
              className="animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Additional Information
                </h2>
              </div>

              <div className="space-y-6">
                {currentDrive.registration_form_fields?.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-2xl text-center">
                    <p className="text-gray-500 italic">
                      No additional information required for this drive.
                    </p>
                  </div>
                ) : (
                  currentDrive.registration_form_fields.map((field) => {
                    const isSystemField = field.type === "system";
                    const isReadOnly =
                      isSystemField &&
                      ["cgpa", "ten_percent", "inter_percent"].includes(
                        field.systemField,
                      );
                    const isResumeField =
                      isSystemField && field.systemField === "resume";

                    return (
                      <div key={field.id} className="relative group">
                        <label className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          <span>
                            {field.label}{" "}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </span>
                          {isSystemField && (
                            <span className="flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800 animate-in fade-in zoom-in duration-500">
                              <CheckCircle2 className="w-3 h-3" />
                              {isReadOnly
                                ? "Verified"
                                : isResumeField
                                  ? "Auto-synced"
                                  : "Auto-filled"}
                            </span>
                          )}
                        </label>
                        {isResumeField ? (
                          <div className="space-y-3">
                            {formData[field.id] ? (
                              <div className="flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <File className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                      Your Active Resume
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      This will be shared with the company
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={formData[field.id]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                                    title="View Resume"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleInputChange(field.id, "")
                                    }
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Remove and Upload New"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none">
                                <span className="flex items-center space-x-2">
                                  <Upload className="w-6 h-6 text-gray-400" />
                                  <span className="font-medium text-gray-600 dark:text-gray-400">
                                    Click to upload a new resume
                                  </span>
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleResumeUpload(
                                      field.id,
                                      e.target.files[0],
                                    )
                                  }
                                />
                                <p className="mt-2 text-xs text-gray-400">
                                  PDF only (Max 10MB). Uploading here updates
                                  your master profile.
                                </p>
                              </label>
                            )}
                          </div>
                        ) : field.type === "dropdown" ? (
                          <select
                            required={field.required}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData[field.id] || ""}
                            onChange={(e) =>
                              handleInputChange(field.id, e.target.value)
                            }
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              type={isSystemField ? "text" : field.type}
                              required={field.required}
                              readOnly={isReadOnly}
                              className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                                isReadOnly
                                  ? "bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                              }`}
                              value={formData[field.id] || ""}
                              onChange={(e) =>
                                handleInputChange(field.id, e.target.value)
                              }
                            />
                            {isReadOnly && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Info className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        )}
                        {isReadOnly && (
                          <p className="mt-1.5 text-[11px] text-gray-400 italic">
                            This field is verified from your records. To update
                            it, please contact the placement office.
                          </p>
                        )}
                      </div>
                    );
                  })
                )}

                <div className="pt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    Review Application
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Review & Confirm
                </h2>
              </div>

              <div className="space-y-6">
                {/* Profile Summary */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    Your Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs">Name</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">
                        Student ID
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {user?.student_id || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">Email</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {user?.email}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">Phone</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {user?.phone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Data Summary */}
                {currentDrive.registration_form_fields?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                      Application Details
                    </h3>
                    <div className="space-y-4">
                      {currentDrive.registration_form_fields.map((field) => (
                        <div key={field.id}>
                          <span className="block text-gray-500 text-xs">
                            {field.label}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formData[field.id] || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium text-center">
                    Please review your details carefully. You cannot edit your
                    application after submission.
                  </p>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Application Submitted!
              </h2>
              <p className="text-gray-500 mb-10 max-w-sm mx-auto">
                Your application for {currentDrive.drive_name} has been
                successfully recorded. You will be notified of further updates.
              </p>
              <button
                onClick={() => navigate("/placement/student/dashboard")}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyDrive;
