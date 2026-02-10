import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchJobPostings,
  fetchDriveById,
  createDrive,
  updateDrive,
} from "../../store/slices/placementSlice";
import { fetchBatchYears } from "../../store/slices/userSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchRegulations } from "../../store/slices/regulationSlice";
import FormBuilder from "./components/FormBuilder";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";
import {
  CalendarDays,
  MapPin,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Check,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import RoundsSetup from "./components/RoundsSetup";
import toast from "react-hot-toast";

const DriveForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { jobPostings, currentDrive } = useSelector((state) => state.placement);
  const { departments } = useSelector((state) => state.departments);
  const { regulations } = useSelector((state) => state.regulations);
  const { batchYears: availableBatches } = useSelector((state) => state.users);

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    job_posting_id: location.state?.jobPostingId || "",
    drive_name: "",
    drive_type: "on_campus",
    drive_date: "",
    venue: "",
    mode: "offline",
    registration_start: "",
    registration_end: "",
    registration_form_fields: [],
    has_internal_form: true,
    external_registration_url: "",
    // Eligibility fields
    min_cgpa: "0.0",
    max_active_backlogs: "0",
    department_ids: [],
    regulation_ids: [],
    batch_ids: [],
    // Selection Process
    rounds: [],
  });

  useEffect(() => {
    dispatch(fetchJobPostings());
    dispatch(fetchDepartments({ type: "academic" }));
    dispatch(fetchRegulations());
    dispatch(fetchBatchYears());

    if (isEdit) {
      if (currentDrive && currentDrive.id === id) {
        populateForm(currentDrive);
      } else {
        dispatch(fetchDriveById(id));
      }
    }
  }, [isEdit, id, currentDrive, dispatch]);

  const populateForm = (drive) => {
    setFormData({
      job_posting_id: drive.job_posting_id || "",
      drive_name: drive.drive_name || "",
      drive_type: drive.drive_type || "on_campus",
      drive_date: drive.drive_date || "",
      venue: drive.venue || "",
      mode: drive.mode || "offline",
      registration_start: drive.registration_start
        ? new Date(drive.registration_start).toISOString().slice(0, 16)
        : "",
      registration_end: drive.registration_end
        ? new Date(drive.registration_end).toISOString().slice(0, 16)
        : "",
      registration_form_fields: drive.registration_form_fields || [],
      has_internal_form:
        drive.registration_form_fields?.length > 0 ||
        !drive.external_registration_url,
      external_registration_url: drive.external_registration_url || "",
      min_cgpa: drive.eligibility?.min_cgpa || "0.0",
      max_active_backlogs: drive.eligibility?.max_active_backlogs || "0",
      department_ids: drive.eligibility?.department_ids || [],
      regulation_ids: drive.eligibility?.regulation_ids || [],
      batch_ids: drive.eligibility?.batch_ids || [],
      rounds: drive.rounds || [],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const current = prev[name];
      if (current.includes(value)) {
        return { ...prev, [name]: current.filter((id) => id !== value) };
      }
      return { ...prev, [name]: [...current, value] };
    });
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        registration_form_fields: formData.has_internal_form
          ? formData.registration_form_fields
          : [],
        eligibility: {
          min_cgpa: parseFloat(formData.min_cgpa),
          max_active_backlogs: parseInt(formData.max_active_backlogs),
          department_ids: formData.department_ids,
          regulation_ids: formData.regulation_ids,
          batch_ids: formData.batch_ids,
        },
      };

      if (isEdit) {
        await dispatch(updateDrive({ id, data: payload })).unwrap();
        toast.success("Drive updated successfully");
      } else {
        await dispatch(createDrive(payload)).unwrap();
        toast.success("Drive scheduled successfully");
      }
      navigate("/placement/drives");
    } catch (error) {
      toast.error(error?.error || error || "Failed to save drive");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PlacementBreadcrumbs
        items={[
          { label: "Drives", href: "/placement/drives" },
          { label: isEdit ? "Edit Drive" : "Schedule Drive" },
        ]}
      />
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-indigo-600 font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-10 h-1 pb-4 border-b-4 transition-all ${step >= i ? "border-indigo-600" : "border-gray-200"}`}
            ></div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {step === 1 && (
          <div className="p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Step 1: Drive Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Job Posting *
                </label>
                <select
                  name="job_posting_id"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.job_posting_id}
                  onChange={handleChange}
                >
                  <option value="">Select Job Role</option>
                  {jobPostings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.role_title} ({p.company?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Drive Name *
                </label>
                <input
                  type="text"
                  name="drive_name"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Google Campus Hiring 2026"
                  value={formData.drive_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Drive Date
                </label>
                <input
                  type="date"
                  name="drive_date"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.drive_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Registration Start
                </label>
                <input
                  type="datetime-local"
                  name="registration_start"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.registration_start}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  name="registration_end"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.registration_end}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Mode
                </label>
                <select
                  name="mode"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.mode}
                  onChange={handleChange}
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Venue / Link
                </label>
                <input
                  type="text"
                  name="venue"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Auditorium 1 or Zoom Link"
                  value={formData.venue}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Step 2: Eligibility Criteria
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="min_cgpa"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.min_cgpa}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Max Active Backlogs
                  </label>
                  <input
                    type="number"
                    name="max_active_backlogs"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.max_active_backlogs}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Eligible Departments
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    {departments.map((dept) => (
                      <label
                        key={dept.id}
                        className="flex items-center group cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          checked={formData.department_ids?.includes(dept.id)}
                          onChange={() =>
                            handleMultiSelect("department_ids", dept.id)
                          }
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">
                          {dept.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Eligible Batches (Joining Years)
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    {availableBatches.length > 0 ? (
                      availableBatches.map((batch) => (
                        <label
                          key={batch}
                          className="flex items-center group cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            checked={formData.batch_ids?.includes(batch)}
                            onChange={() =>
                              handleMultiSelect("batch_ids", batch)
                            }
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">
                            Batch {batch}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="col-span-2 text-xs text-gray-400 italic">
                        No batches found. Using default list...
                        {[2022, 2023, 2024, 2025].map((batch) => (
                          <label
                            key={batch}
                            className="flex items-center mt-2 group cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                              checked={formData.batch_ids?.includes(batch)}
                              onChange={() =>
                                handleMultiSelect("batch_ids", batch)
                              }
                            />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                              Batch {batch}
                            </span>
                          </label>
                        ))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Step 3: Registration Setup
            </h2>

            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${formData.has_internal_form ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100"}`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    has_internal_form: !prev.has_internal_form,
                  }))
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${formData.has_internal_form ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}
                    >
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Internal Registration Form
                      </h3>
                      <p className="text-sm text-gray-500">
                        Collect custom data via UniPilot portal
                      </p>
                    </div>
                  </div>
                  {formData.has_internal_form ? (
                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                {formData.has_internal_form && (
                  <div
                    className="mt-8 pt-8 border-t border-indigo-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FormBuilder
                      fields={formData.registration_form_fields}
                      onChange={(fields) =>
                        setFormData((prev) => ({
                          ...prev,
                          registration_form_fields: fields,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 text-indigo-600 rounded-xl">
                    <LinkIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      External Company Link (Optional)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Link to company's own registration portal
                    </p>
                  </div>
                </div>
                <input
                  type="url"
                  name="external_registration_url"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="https://company.com/careers/apply"
                  value={formData.external_registration_url}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Step 4: Selection Process
            </h2>
            <RoundsSetup
              rounds={formData.rounds}
              onChange={(rounds) =>
                setFormData((prev) => ({ ...prev, rounds }))
              }
            />
          </div>
        )}

        <div className="p-8 bg-gray-50 dark:bg-gray-900/50 flex justify-between border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={step === 1 ? () => navigate(-1) : prevStep}
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 font-bold hover:text-gray-900 transition-colors"
          >
            {step === 1 ? "Cancel" : "Previous Step"}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              Next Step
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
            >
              <Check className="w-5 h-5 mr-2" />
              {isEdit ? "Update Drive" : "Schedule Drive"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveForm;
