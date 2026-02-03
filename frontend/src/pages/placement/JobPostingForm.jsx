import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanies,
  fetchJobPostings,
  fetchJobPostingById,
  clearCurrentJobPosting,
} from "../../store/slices/placementSlice";
import api from "../../utils/api";
import FormBuilder from "./components/FormBuilder";
import RoundsSetup from "./components/RoundsSetup";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";
import {
  Building2,
  MapPin,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Check,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

const JobPostingForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { companies, jobPostings, currentJobPosting } = useSelector(
    (state) => state.placement,
  );

  const [step, setStep] = useState(1);
  const [scheduleDrive, setScheduleDrive] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [regulations, setRegulations] = useState([]);

  const [formData, setFormData] = useState({
    // Job Posting Fields
    company_id: "",
    role_title: "",
    job_description: "",
    ctc_lpa: "",
    work_location: "",
    number_of_positions: "",
    application_deadline: "",
    required_skills: "",

    // Drive Fields (if scheduleDrive is true)
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

    // Eligibility
    min_cgpa: "0.0",
    max_active_backlogs: "0",
    department_ids: [],
    regulation_ids: [],

    // Rounds
    rounds: [],
  });

  useEffect(() => {
    dispatch(fetchCompanies());
    fetchMetadata();
    if (isEdit) {
      dispatch(fetchJobPostingById(id));
    }
    return () => {
      dispatch(clearCurrentJobPosting());
    };
  }, [isEdit, id, dispatch]);

  useEffect(() => {
    if (isEdit && currentJobPosting) {
      populateForm(currentJobPosting);
    }
  }, [isEdit, currentJobPosting]);

  const fetchMetadata = async () => {
    try {
      const [deptRes, regRes] = await Promise.all([
        api.get("/departments?type=academic"),
        api.get("/regulations"),
      ]);
      setDepartments(deptRes.data.data);
      setRegulations(regRes.data.data);
    } catch (error) {
      console.error("Failed to fetch metadata", error);
    }
  };

  const populateForm = (posting) => {
    setFormData((prev) => ({
      ...prev,
      company_id: posting.company_id || "",
      role_title: posting.role_title || "",
      job_description: posting.job_description || "",
      ctc_lpa: posting.ctc_lpa || "",
      work_location: posting.work_location || "",
      number_of_positions: posting.number_of_positions || "",
      application_deadline: posting.application_deadline
        ? new Date(posting.application_deadline).toISOString().split("T")[0]
        : "",
      required_skills: posting.required_skills?.join(", ") || "",
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobPayload = {
      company_id: formData.company_id,
      role_title: formData.role_title,
      job_description: formData.job_description,
      ctc_lpa: formData.ctc_lpa,
      work_location: formData.work_location,
      number_of_positions: formData.number_of_positions,
      application_deadline: formData.application_deadline,
      required_skills: formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    try {
      let postingId = id;
      if (isEdit) {
        await api.put(`/placement/job-postings/${id}`, jobPayload);
        toast.success("Job posting updated");
      } else {
        const response = await api.post("/placement/job-postings", jobPayload);
        postingId = response.data.data.id;
        toast.success("Job posting created");
      }

      // If scheduling a drive
      if (scheduleDrive) {
        const drivePayload = {
          job_posting_id: postingId,
          drive_name:
            formData.drive_name || `${formData.role_title} Recruitment Drive`,
          drive_type: formData.drive_type,
          drive_date: formData.drive_date,
          venue: formData.venue,
          mode: formData.mode,
          registration_start: formData.registration_start,
          registration_end: formData.registration_end,
          registration_form_fields: formData.has_internal_form
            ? formData.registration_form_fields
            : [],
          external_registration_url: formData.external_registration_url,
          eligibility: {
            min_cgpa: parseFloat(formData.min_cgpa),
            max_active_backlogs: parseInt(formData.max_active_backlogs),
            department_ids: formData.department_ids,
            regulation_ids: formData.regulation_ids,
          },
          rounds: formData.rounds,
        };

        await api.post("/placement/drives", drivePayload);
        toast.success("Recruitment drive scheduled!");
      }

      navigate("/placement/job-postings");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save job posting");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PlacementBreadcrumbs
        items={[
          { label: "Job Postings", href: "/placement/job-postings" },
          { label: isEdit ? "Edit Posting" : "New Recruiting Configuration" },
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
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-10 h-1 pb-4 border-b-4 transition-all ${step >= i ? "border-indigo-600" : "border-gray-200"} ${!scheduleDrive && i > 1 ? "hidden" : ""}`}
            ></div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {step === 1 && (
          <form className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Job Role Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Basic information about the vacancy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Company *
                </label>
                <select
                  name="company_id"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.company_id}
                  onChange={handleChange}
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Role Title *
                </label>
                <input
                  type="text"
                  name="role_title"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Associate Software Engineer"
                  value={formData.role_title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Package (LPA) *
                </label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    name="ctc_lpa"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.ctc_lpa}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Work Location
                </label>
                <input
                  type="text"
                  name="work_location"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.work_location}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-indigo-600 rounded-lg"
                    checked={scheduleDrive}
                    onChange={(e) => setScheduleDrive(e.target.checked)}
                  />
                  <div>
                    <span className="font-bold text-indigo-900 dark:text-indigo-100">
                      Schedule recruitment drive for this role immediately
                    </span>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      This will guide you through scheduling, eligibility and
                      rounds setup.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Registration Setup
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                How should students apply for this role?
              </p>
            </div>

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
                <div className="flex items-center justify-between mb-2">
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
                      Link to company's own registration portal (e.g. Workday,
                      Lever)
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

        {step === 3 && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Eligibility Criteria
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Define which students can apply
              </p>
            </div>

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

              <div className="flex flex-col h-full">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 ml-1">
                  Eligible Departments
                </label>
                <div className="flex-1 grid grid-cols-1 gap-2 min-h-[160px] max-h-[300px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  {departments.map((dept) => (
                    <label
                      key={dept.id}
                      className="flex items-center group cursor-pointer p-1"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        checked={formData.department_ids.includes(dept.id)}
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
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Schedule & Logistics
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                When and where is the primary event?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Drive Display Name
                </label>
                <input
                  type="text"
                  name="drive_name"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Google Campus Hiring - Batch 2026"
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
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Selection Process
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Define the sequence of rounds
              </p>
            </div>
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

          <div className="flex gap-4">
            {!scheduleDrive && step === 1 && (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                <Check className="w-5 h-5 mr-2" />
                {isEdit ? "Update Posting" : "Create Posting Only"}
              </button>
            )}

            {scheduleDrive && step < 5 && (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                Next Step
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            )}

            {scheduleDrive && step === 5 && (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
              >
                <Check className="w-5 h-5 mr-2" />
                Finish & Schedule Drive
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingForm;
