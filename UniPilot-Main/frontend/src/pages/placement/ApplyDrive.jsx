import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEligibleDrives,
  applyToDrive,
  fetchMyProfile,
} from "../../store/slices/placementSlice";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertCircle,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  Rocket,
  ArrowRight,
  UserCheck,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const ApplyDrive = () => {
  const { id: driveId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { eligibleDrives, myProfile, loading, applying } = useSelector(
    (state) => state.placement,
  );

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const drive = eligibleDrives.find((d) => d.id === driveId || d.id === String(driveId));

  useEffect(() => {
    if (eligibleDrives.length === 0) {
      dispatch(fetchEligibleDrives());
    }
    if (!myProfile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, eligibleDrives.length, myProfile]);

  useEffect(() => {
    if (drive && drive.registration_form_fields) {
      const initialData = {};
      drive.registration_form_fields.forEach((field) => {
        initialData[field.name] = "";
      });
      setFormData(initialData);
    }
  }, [drive]);

  if (!drive) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
            Loading Drive Intelligence...
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, label: "Overview", icon: Building2 },
    { id: 2, label: "Eligibility", icon: ShieldCheck },
    { id: 3, label: "Application", icon: FileText },
    { id: 4, label: "Review", icon: UserCheck },
  ];

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(applyToDrive({ driveId: drive.id, formData })).unwrap();
      toast.success("Application submitted successfully!");
      setStep(5); // Success step
    } catch (err) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        <PlacementBreadcrumbs
          items={[
            { label: "Dashboard", href: "/placement/student/dashboard" },
            { label: "Active Drives", href: "/placement/eligible" },
            { label: "Application Wizard" },
          ]}
        />

        {/* Wizard Header */}
        <header className="mt-10 mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                  Recruitment Pipeline
                </span>
                <div className="h-px w-8 bg-gray-100"></div>
                {step < 5 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Step {step} of 4
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                {step === 5 ? (
                  "Success!"
                ) : (
                  <>
                    Apply for <span className="text-blue-600">Position.</span>
                  </>
                )}
              </h1>
              {step < 5 && (
                <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
                  You are applying for{" "}
                  <span className="text-black font-bold">
                    {drive.drive_name}
                  </span>{" "}
                  at{" "}
                  <span className="text-black font-bold">
                    {drive.job_posting?.company?.name}
                  </span>
                  .
                </p>
              )}
            </div>

            {/* Step Navigation */}
            {step < 5 && (
              <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-[2rem] border border-gray-100">
                {steps.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-500 ${step === s.id
                      ? "bg-gray-950 text-white shadow-xl shadow-black/10"
                      : step > s.id
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-300"
                      }`}
                  >
                    <s.icon
                      className={`w-4 h-4 ${step === s.id ? "animate-pulse" : ""}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                      {s.label}
                    </span>
                    {step > s.id && <CheckCircle2 className="w-3 h-3 ml-1" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden min-h-[500px] flex flex-col">
              {/* Step Content */}
              <div className="p-12 md:p-20 flex-1">
                {step === 1 && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-8">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center border border-gray-100">
                            {drive.job_posting?.company?.logo_url ? (
                              <img
                                src={drive.job_posting.company.logo_url}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <Building2 className="w-10 h-10 text-gray-200" />
                            )}
                          </div>
                          <div>
                            <h2 className="text-3xl font-black text-black tracking-tight mb-1">
                              {drive.job_posting?.company?.name}
                            </h2>
                            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5" />
                              {drive.job_posting?.company?.website ||
                                "Visit Website"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            Job Summary
                          </h4>
                          <p className="text-gray-500 font-medium leading-[1.8] text-lg">
                            {drive.job_posting?.description ||
                              "High-growth potential role focusing on core technical implementation and collaborative development within a distributed team architecture."}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          {
                            label: "Designation",
                            value:
                              drive.job_posting?.designation ||
                              "Software Engineer",
                            icon: Briefcase,
                          },
                          {
                            label: "Package",
                            value: `₹${drive.job_posting?.ctc_lpa} LPA`,
                            icon: Rocket,
                            color: "text-amber-500",
                          },
                          {
                            label: "Location",
                            value: drive.job_posting?.location || "Remote",
                            icon: MapPin,
                          },
                          {
                            label: "Job Mode",
                            value: drive.mode,
                            icon: Layers,
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="p-8 rounded-[2rem] bg-gray-50/50 border border-gray-50 space-y-4 hover:bg-white hover:border-blue-100 transition-all duration-300"
                          >
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                              <item.icon
                                className={`w-4 h-4 ${item.color || "text-blue-600"}`}
                              />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">
                                {item.label}
                              </p>
                              <p className="text-sm font-black text-black">
                                {item.value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-3xl">
                      <h2 className="text-3xl font-black text-black tracking-tight mb-6">
                        Eligibility Check.
                      </h2>
                      <p className="text-gray-500 font-medium text-lg leading-relaxed mb-12">
                        Please review the academic and professional criteria
                        defined for this recruitment drive. Compliance is
                        required for progression.
                      </p>

                      <div className="space-y-4">
                        {[
                          {
                            label: "Minimal CGPA Requirement",
                            value: "6.5 or above",
                            verified: true,
                          },
                          {
                            label: "Active Backlogs",
                            value: "None",
                            verified: true,
                          },
                          {
                            label: "Degree Path",
                            value: "B.Tech / MCA",
                            verified: true,
                          },
                          {
                            label: "Batch Year",
                            value: "2024 / 2025",
                            verified: true,
                          },
                        ].map((criteria, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-emerald-200 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl border border-gray-50 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-black">
                                  {criteria.label}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {criteria.value}
                                </p>
                              </div>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shadow-xl shadow-emerald-500/20" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-4xl">
                      <h2 className="text-3xl font-black text-black tracking-tight mb-8">
                        Registration Form.
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {drive.registration_form_fields?.map((field, index) => (
                          <div key={field.name || index} className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                              {field.label}{" "}
                              {field.required && (
                                <span className="text-red-500">*</span>
                              )}
                            </label>
                            <div className="relative group">
                              <input
                                type={
                                  field.type === "number" ? "number" : "text"
                                }
                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                required={field.required}
                                value={formData[field.name] || ""}
                                onChange={(e) =>
                                  handleFieldChange(field.name, e.target.value)
                                }
                                className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-3xl">
                      <h2 className="text-3xl font-black text-black tracking-tight mb-4">
                        Final Review.
                      </h2>
                      <p className="text-gray-500 font-medium text-lg leading-relaxed mb-12">
                        Please verify your information before definitive
                        submission. This action cannot be undone.
                      </p>

                      <div className="bg-gray-50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-white/50">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            Form Credentials
                          </h4>
                          <div className="space-y-6">
                            {Object.entries(formData).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between items-center px-4"
                              >
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span className="text-sm font-black text-black">
                                  {value || "N/A"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-10 flex items-center gap-6 bg-blue-50/30">
                          <div className="w-12 h-12 bg-white rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-black text-blue-600 uppercase tracking-widest leading-relaxed">
                            By submitting, you confirm that all provided details
                            are authentic and you meet the drive constraints.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="flex flex-col items-center justify-center text-center py-16 animate-in fade-in zoom-in duration-700">
                    <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] border border-emerald-100 flex items-center justify-center mb-10 relative">
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
                      <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h2 className="text-5xl font-black text-black tracking-tighter mb-4 leading-none">
                      Application Secured.
                    </h2>
                    <p className="text-gray-400 text-lg font-medium max-w-sm mb-12 leading-relaxed">
                      Your credentials have been successfully transmitted to{" "}
                      <span className="text-black font-bold">
                        {drive.job_posting?.company?.name}
                      </span>
                      's recruitment server.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                      <Link
                        to="/placement/my-applications"
                        className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-gray-950 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-black/10"
                      >
                        Track Application
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/placement/eligible"
                        className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-white text-black border-2 border-gray-100 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                      >
                        Explore More
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              {step < 5 && (
                <div className="px-12 py-10 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    disabled={step === 1}
                    className="flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors disabled:opacity-0 pointer-events-auto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Phase
                  </button>

                  {step < 4 ? (
                    <button
                      onClick={handleNext}
                      className="group flex items-center gap-3 px-10 py-5 bg-gray-950 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="group flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Rocket className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                      )}
                      {isSubmitting ? "Transmitting..." : "Confirm & Submit"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyDrive;
