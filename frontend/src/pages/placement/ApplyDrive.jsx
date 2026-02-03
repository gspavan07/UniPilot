import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDriveById,
  applyToDrive,
} from "../../store/slices/placementSlice";
import { ChevronLeft, CheckCircle2, FileText, Info } from "lucide-react";
import toast from "react-hot-toast";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const ApplyDrive = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentDrive, loading } = useSelector((state) => state.placement);
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    dispatch(fetchDriveById(id));
  }, [id, dispatch]);

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
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
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(
        applyToDrive({
          driveId: id,
          registrationFormData: formData,
        }),
      ).unwrap();
      setStep(3); // Success step
    } catch (error) {
      toast.error(error.error || "Failed to submit application");
    }
  };

  if (!currentDrive && loading)
    return <div className="p-20 text-center">Loading drive details...</div>;
  if (!currentDrive)
    return <div className="p-20 text-center text-red-500">Drive not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PlacementBreadcrumbs
        items={[
          { label: "Dashboard", href: "/placement/student/dashboard" },
          { label: "Drives", href: "/placement/eligible" },
          { label: "Apply" },
        ]}
      />

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-indigo-100/20 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-indigo-600 text-white">
          <h1 className="text-2xl font-bold">{currentDrive.drive_name}</h1>
          <p className="text-indigo-100 mt-1">
            {currentDrive.job_posting?.company?.name} •{" "}
            {currentDrive.job_posting?.role_title}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex h-1.5 w-full bg-gray-100 dark:bg-gray-700">
          <div
            className={`h-full bg-indigo-500 transition-all duration-500 ${step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"}`}
          ></div>
        </div>

        <div className="p-10">
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
                      Max Active Backlogs:{" "}
                      <span className="font-bold ml-1">
                        {currentDrive.eligibility?.max_active_backlogs}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-xl">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    By proceeding, you confirm that the information in your
                    placement profile is accurate and up-to-date.
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    Confirm & Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <form
              onSubmit={handleSubmit}
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
                  <p className="text-gray-500 italic">
                    No additional information required for this drive.
                  </p>
                ) : (
                  currentDrive.registration_form_fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      {field.type === "dropdown" ? (
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
                        <input
                          type={field.type}
                          required={field.required}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={formData[field.id] || ""}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))
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
                    disabled={loading}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 3 && (
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
