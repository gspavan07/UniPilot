import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchJobPostingById,
  deleteJobPosting,
} from "../../store/slices/placementSlice";
import {
  Building2,
  MapPin,
  Banknote,
  Briefcase,
  Calendar,
  ChevronLeft,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";
import toast from "react-hot-toast";

const JobPostingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentJobPosting: posting, loading } = useSelector(
    (state) => state.placement,
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchJobPostingById(id));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this job posting? This will also affect associated drives.",
      )
    ) {
      try {
        await dispatch(deleteJobPosting(id)).unwrap();
        toast.success("Job posting deleted successfully");
        navigate("/placement/job-postings");
      } catch (error) {
        toast.error(error.error || "Failed to delete job posting");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        Loading job details...
      </div>
    );
  }

  if (!posting) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Job Posting not found
        </h2>
        <Link
          to="/placement/job-postings"
          className="text-indigo-600 hover:underline mt-4 inline-block font-medium"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PlacementBreadcrumbs
        items={[
          { label: "Job Postings", href: "/placement/job-postings" },
          { label: posting.role_title },
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
        <div className="flex gap-3">
          <Link
            to={`/placement/job-postings/${posting.id}/edit`}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-bold"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Posting
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors font-bold"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-3xl font-bold text-indigo-600 border border-gray-100 dark:border-gray-700 overflow-hidden">
                {posting.company?.logo_url ? (
                  <img
                    src={posting.company.logo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  posting.company?.name?.charAt(0)
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {posting.role_title}
                </h1>
                <Link
                  to={`/placement/companies/${posting.company_id}`}
                  className="text-lg text-indigo-600 font-semibold hover:underline"
                >
                  {posting.company?.name}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-8 border-y border-gray-50 dark:border-gray-700 mb-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  CTC / Package
                </p>
                <div className="flex items-center text-emerald-600">
                  <Banknote className="w-5 h-5 mr-2" />
                  <span className="text-xl font-bold">
                    ₹{posting.ctc_lpa} LPA
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Location
                </p>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="font-bold">
                    {posting.work_location || "Not specified"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Positions
                </p>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Users className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="font-bold">
                    {posting.number_of_positions || "Open"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Job Description
                </h3>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {posting.job_description}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {posting.required_skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-900/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Deadline */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Posting Status
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500">
                  Current Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${posting.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {posting.is_active ? "Active" : "Closed"}
                </span>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-100 uppercase tracking-wider">
                    Application Deadline
                  </span>
                </div>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                  {posting.application_deadline
                    ? new Date(posting.application_deadline).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "No Deadline set"}
                </p>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  Recent Drives
                </h4>
                <div className="space-y-3">
                  {/* Placeholder for drives associated with this posting if we had them in the response */}
                  <p className="text-xs text-gray-500 italic">
                    No associated drives found for this posting.
                  </p>
                  <Link
                    to="/placement/drives/new"
                    className="mt-4 flex items-center justify-center w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none text-sm"
                  >
                    Schedule New Drive
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingDetail;
