import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchJobPostings,
  deleteJobPosting,
} from "../../store/slices/placementSlice";
import {
  Building2,
  Banknote,
  MapPin,
  Briefcase,
  Plus,
  SlidersHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import { Link } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const JobPostings = () => {
  const dispatch = useDispatch();
  const { jobPostings, loading } = useSelector((state) => state.placement);

  useEffect(() => {
    dispatch(fetchJobPostings());
  }, [dispatch]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PlacementBreadcrumbs items={[{ label: "Job Postings" }]} />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Job Postings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure job roles and package details for companies
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filters
          </button>
          <Link
            to="/placement/job-postings/new"
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Posting
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobPostings.map((posting) => (
          <div
            key={posting.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-indigo-500"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl font-bold text-indigo-600">
                  {posting.company?.logo_url ? (
                    <img
                      src={posting.company.logo_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    posting.company?.name?.charAt(0) || "C"
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {posting.role_title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {posting.company?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Banknote className="w-5 h-5 mr-3 text-emerald-500" />
                  <span className="font-bold text-gray-900 dark:text-gray-200">
                    ₹{posting.ctc_lpa} LPA
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  {posting.work_location || "Not Specified"}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                  {posting.number_of_positions || "No info"} Positions
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/placement/job-postings/${posting.id}`}
                  className="flex-1 py-2 text-center bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Details
                </Link>
                <Link
                  to={`/placement/job-postings/${posting.id}/edit`}
                  className="px-3 py-2 border border-gray-100 dark:border-gray-700 rounded-lg text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this posting?")) {
                      dispatch(deleteJobPosting(posting.id));
                    }
                  }}
                  className="px-3 py-2 border border-gray-100 dark:border-gray-700 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${posting.is_active ? "text-green-600" : "text-red-500"}`}
              >
                {posting.is_active ? "Active" : "Closed"}
              </span>
              <span className="text-[10px] text-gray-400 font-medium italic">
                {posting.application_deadline
                  ? `Deadline: ${new Date(posting.application_deadline).toLocaleDateString()}`
                  : "No deadline"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {jobPostings.length === 0 && !loading && (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Briefcase className="w-16 h-16 text-gray-100 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            No job postings created yet
          </h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            Start by creating job roles for your partner companies before
            scheduling drives.
          </p>
          <Link
            to="/placement/job-postings/new"
            className="mt-6 inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Posting
          </Link>
        </div>
      )}
    </div>
  );
};

export default JobPostings;
