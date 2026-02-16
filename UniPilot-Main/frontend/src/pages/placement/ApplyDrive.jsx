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
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle
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
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full mb-3"></div>
          <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );

  if (!currentDrive)
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white text-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 mb-2">Drive Not Found</h1>
          <p className="text-sm text-gray-500 mb-4">The recruitment drive you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-bold">Go Back</button>
        </div>
      </div>
    );

  const steps = [
    { num: 0, label: "Overview" },
    { num: 1, label: "Eligibility" },
    { num: 2, label: "Form" },
    { num: 3, label: "Review" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-16 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">

        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <PlacementBreadcrumbs
              items={[
                { label: "Dashboard", href: "/placement/student/dashboard" },
                { label: "Drives", href: "/placement/eligible" },
                { label: "Apply" },
              ]}
            />
            <button
              onClick={() => navigate(-1)}
              className="mt-3 flex items-center text-xs font-bold text-gray-400 hover:text-black transition-colors group"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Listings
            </button>
          </div>

          {/* Step Indicator */}
          {step < 4 && (
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-full p-1.5 border border-gray-100 self-start sm:self-auto">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${step === s.num
                      ? "bg-black text-white shadow-md shadow-gray-200"
                      : step > s.num
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {step > s.num ? <Check className="w-3 h-3" strokeWidth={3} /> : s.num + 1}
                  <span className={step !== s.num && step <= s.num ? "hidden sm:inline" : ""}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500">

          {/* Drive Header Banner */}
          <div className="px-6 pt-8 pb-0 md:px-10 md:pt-10">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0 p-3">
                {currentDrive.job_posting?.company?.logo_url ? (
                  <img
                    src={currentDrive.job_posting.company.logo_url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black text-gray-300">
                    {currentDrive.job_posting?.company?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black mb-2 leading-tight">
                  {currentDrive.drive_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    {currentDrive.job_posting?.company?.name}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-100 text-blue-700">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                    {currentDrive.job_posting?.role_title}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">

            {/* STEP 0: DETAILS VIEW */}
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">

                  {/* Left Column - Main Details */}
                  <div className="lg:col-span-8 space-y-8">

                    {/* Job Description */}
                    <section>
                      <h3 className="text-lg font-black text-black mb-3 flex items-center gap-2">
                        Description
                      </h3>
                      <div className="prose prose-sm text-gray-600 leading-relaxed font-medium max-w-none">
                        {currentDrive.job_posting?.job_description || "No description provided."}
                      </div>
                    </section>

                    {/* Rounds */}
                    <section>
                      <h3 className="text-lg font-black text-black mb-3 flex items-center gap-2">
                        Selection Process
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentDrive.rounds?.length > 0 ? (
                          [...currentDrive.rounds]
                            .sort((a, b) => a.round_number - b.round_number)
                            .map((round) => (
                              <div key={round.id} className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-lg text-xs font-bold shadow-md shadow-gray-200 group-hover:bg-blue-600 group-hover:shadow-blue-200 transition-all">
                                    {round.round_number}
                                  </div>
                                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                                    {new Date(round.round_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors mb-0.5">
                                  {round.round_name}
                                </h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  {round.round_type.replace('_', ' ')}
                                </p>
                              </div>
                            ))
                        ) : (
                          <div className="col-span-full p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 font-bold text-sm">
                            To be announced
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* Right Column - Highlights */}
                  <div className="lg:col-span-4 space-y-5">
                    {/* Key Stats Card */}
                    <div className="p-6 rounded-2xl bg-black text-white relative overflow-hidden shadow-xl shadow-gray-200">
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Annual Package</p>
                        <div className="flex items-baseline gap-1 mb-5">
                          <span className="text-3xl font-black tracking-tight">₹{currentDrive.job_posting?.ctc_lpa}</span>
                          <span className="text-sm font-bold text-gray-500">LPA</span>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/10">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Job Location</p>
                            <p className="font-bold text-sm flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {currentDrive.job_posting?.work_location || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Positions</p>
                            <p className="font-bold text-sm flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              {currentDrive.job_posting?.number_of_positions || "Open"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Abstract Decor */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-gray-800 to-black rounded-full blur-2xl opacity-50 -mr-12 -mt-12 pointer-events-none"></div>
                    </div>

                    {/* Skills */}
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                      <h4 className="font-black text-gray-900 mb-3 text-[10px] uppercase tracking-wider">Required Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentDrive.job_posting?.required_skills?.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[11px] font-bold shadow-sm">
                            {skill}
                          </span>
                        )) || <span className="text-gray-400 text-xs font-medium italic">Not specified</span>}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-1">
                      {!currentDrive.isEligible ? (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-start">
                          <div className="p-1.5 bg-red-100 rounded-full shrink-0">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-bold text-red-900 text-sm mb-0.5">Not Eligible</p>
                            <p className="text-xs text-red-700 font-medium leading-relaxed">{currentDrive.ineligible_reason}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setStep(1)}
                          className="w-full group relative overflow-hidden bg-blue-600 text-white p-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Apply Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      )}
                      <p className="text-center text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-wider">
                        Deadline: {new Date(currentDrive.registration_end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: ELIGIBILITY CHECK */}
            {step === 1 && (
              <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500 py-4">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100 transform -rotate-3">
                    <ShieldCheck className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Eligibility Check</h2>
                  <p className="text-gray-500 font-medium mt-1 text-sm">Let's verify your academic records against the requirements.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                  {[
                    { label: "Minimum CGPA", req: currentDrive.eligibility?.min_cgpa, val: systemFields?.cgpa },
                    { label: "10th Percentage", req: `${currentDrive.eligibility?.min_10th_percent}%`, val: `${systemFields?.ten_percent}%` },
                    { label: "12th Percentage", req: `${currentDrive.eligibility?.min_inter_percent}%`, val: `${systemFields?.inter_percent}%` },
                    { label: "Max Backlogs", req: currentDrive.eligibility?.max_active_backlogs, val: systemFields?.active_backlogs }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-0.5">{item.label}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">Required: {item.req}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Simplified Visual Check */}
                        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                          <Check className="w-3 h-3" strokeWidth={3} /> Pass
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-[2] py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
                  >
                    Confirm Eligibility
                  </button>
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
                className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500 py-4"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Application Form</h2>
                  <p className="text-gray-500 font-medium mt-1 text-sm">Fill in the required details to proceed.</p>
                </div>

                <div className="space-y-5 mb-8">
                  {currentDrive.registration_form_fields?.length === 0 ? (
                    <div className="p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                      <p className="text-gray-400 font-bold text-base">No additional fields required.</p>
                      <p className="text-gray-400 text-xs mt-1">You can proceed directly to review.</p>
                    </div>
                  ) : (
                    currentDrive.registration_form_fields.map((field) => {
                      const isSystemField = field.type === "system";
                      const isReadOnly = isSystemField && ["cgpa", "ten_percent", "inter_percent"].includes(field.systemField);
                      const isResumeField = isSystemField && field.systemField === "resume";

                      return (
                        <div key={field.id} className="space-y-2">
                          <div className="flex justify-between items-end px-1">
                            <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {isSystemField && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Autofilled
                              </span>
                            )}
                          </div>

                          {isResumeField ? (
                            <div className="mt-1">
                              {formData[field.id] ? (
                                <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl hover:border-blue-200 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                      <FileText className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-900">Active Resume PDF</p>
                                      <p className="text-[10px] text-blue-600 font-bold mt-0.5 uppercase tracking-wider">Ready</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={formData[field.id]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-8 h-8 flex items-center justify-center bg-white text-gray-500 hover:text-blue-600 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-blue-100"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleInputChange(field.id, "")}
                                      className="w-8 h-8 flex items-center justify-center bg-white text-gray-400 hover:text-red-500 hover:shadow-md rounded-lg transition-all border border-transparent hover:border-red-100"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/10 transition-all group duration-300">
                                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 border border-gray-100">
                                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                  </div>
                                  <span className="font-bold text-gray-900 text-sm">Upload Resume</span>
                                  <span className="text-xs text-gray-400 mt-1 font-medium">PDF up to 10MB</span>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => handleResumeUpload(field.id, e.target.files[0])}
                                  />
                                </label>
                              )}
                            </div>
                          ) : (
                            field.type === "dropdown" ? (
                              <div className="relative">
                                <select
                                  required={field.required}
                                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white hover:bg-white hover:border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 appearance-none text-sm cursor-pointer"
                                  value={formData[field.id] || ""}
                                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                                >
                                  <option value="">Select Option</option>
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                                </div>
                              </div>
                            ) : (
                              <input
                                type={isSystemField ? "text" : field.type}
                                required={field.required}
                                readOnly={isReadOnly}
                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all font-bold text-gray-900 text-sm ${isReadOnly
                                    ? "bg-gray-100 border border-transparent text-gray-500 cursor-not-allowed"
                                    : "bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-50 focus:border-blue-500"
                                  }`}
                                value={formData[field.id] || ""}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                placeholder={`Enter ${field.label}`}
                              />
                            )
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
                  >
                    Proceed to Review
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500 py-4">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Review Application</h2>
                  <p className="text-gray-500 font-medium mt-1 text-sm">Final check before submission.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-6 h-px bg-gray-200"></span> Candidate Details
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                      <p className="font-bold text-sm text-gray-900">{user?.first_name} {user?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Student ID</p>
                      <p className="font-bold text-sm text-gray-900 font-mono tracking-tight">{user?.student_id || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Email</p>
                      <p className="font-bold text-sm text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {currentDrive.registration_form_fields?.length > 0 && (
                  <div className="bg-gray-50 border border-transparent rounded-2xl p-6 mb-8">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-6 h-px bg-gray-300"></span> Form Responses
                    </h3>
                    <div className="space-y-4">
                      {currentDrive.registration_form_fields.map((field) => (
                        <div key={field.id} className="pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{field.label}</p>
                          <p className="font-bold text-sm text-gray-900 break-words leading-relaxed">{formData[field.id] || "-"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 mb-8 items-start">
                  <div className="p-1.5 bg-blue-100 rounded-full shrink-0">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-900 font-medium leading-relaxed pt-0.5">
                    Please ensure all details are correct. By submitting, you confirm that the information provided is accurate. You will not be able to edit this application after submission.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Submit Application <Check className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
              <div className="max-w-sm mx-auto text-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 rotate-3">
                  <Check className="w-10 h-10 text-emerald-600 -rotate-3" strokeWidth={4} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Application Sent!</h2>
                <p className="text-gray-500 font-medium leading-relaxed mb-8 text-sm">
                  You have successfully applied for <strong>{currentDrive.drive_name}</strong>. Keep an eye on your email for further updates.
                </p>
                <button
                  onClick={() => navigate("/placement/student/dashboard")}
                  className="w-full py-3.5 bg-black text-white rounded-xl font-bold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-[0.98] text-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyDrive;
