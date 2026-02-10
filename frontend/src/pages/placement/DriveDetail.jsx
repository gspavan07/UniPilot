import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDriveById } from "../../store/slices/placementSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import {
  Clock,
  CalendarDays,
  MapPin,
  Briefcase,
  Calendar,
  ExternalLink,
  Globe,
  Building,
  ShieldCheck,
  CheckCircle2,
  Users,
} from "lucide-react";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";
import SelectionPipeline from "./SelectionPipeline";

const DriveDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentDrive: drive, loading } = useSelector(
    (state) => state.placement,
  );
  const { departments } = useSelector((state) => state.departments);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      dispatch(fetchDriveById(id));
      dispatch(fetchDepartments({ type: "academic" }));
    }
  }, [dispatch, id]);

  if (loading) {
    return <div className="p-8 text-center">Loading drive details...</div>;
  }

  if (!drive) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Drive not found</h2>
        <Link
          to="/placement/drives"
          className="text-indigo-600 hover:underline mt-4 inline-block"
        >
          Back to Drives
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "eligibility", name: "Eligibility" },
    { id: "rounds", name: "Selection Rounds" },
    { id: "applicants", name: "Applicants" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PlacementBreadcrumbs
        items={[
          { label: "Drives", href: "/placement/drives" },
          { label: drive.drive_name },
        ]}
      />

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-6">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-indigo-600 overflow-hidden">
              {drive.job_posting?.company?.logo_url ? (
                <img
                  src={drive.job_posting.company.logo_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                drive.job_posting?.company?.name?.charAt(0) || "D"
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {drive.drive_name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    drive.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : drive.status === "ongoing"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {drive.status}
                </span>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 font-medium mb-4">
                {drive.job_posting?.company?.name} •{" "}
                {drive.job_posting?.role_title}
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2 text-gray-400" />
                  {drive.drive_date}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                  {drive.venue || drive.mode}
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                  {drive.drive_type?.replace("_", " ").toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 justify-center">
            <button
              onClick={() => setActiveTab("applicants")}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              Manage Applicants
            </button>
            <Link
              to={`/placement/drives/${drive.id}/edit`}
              className="px-6 py-2.5 bg-white dark:bg-gray-750 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              Edit Drive Details
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 active-tab"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                Job Details
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Role Title
                  </h4>
                  <p className="text-gray-900 dark:text-gray-200 font-medium">
                    {drive.job_posting?.role_title}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Package (CTC)
                  </h4>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₹{drive.job_posting?.ctc_lpa} LPA
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Job Description
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {drive.job_posting?.job_description ||
                      "No description provided."}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {drive.job_posting?.required_skills?.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold"
                      >
                        {skill}
                      </span>
                    )) || "None"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 font-medium">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                  Registration Info
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <span className="text-gray-500">Starts</span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {drive.registration_start || "Not Set"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <span className="text-gray-500">Ends</span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {drive.registration_end
                        ? new Date(drive.registration_end).toLocaleString()
                        : "Not Set"}
                    </span>
                  </div>
                  {drive.external_registration_url && (
                    <a
                      href={drive.external_registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full p-4 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors border border-indigo-100 mt-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      External Apply Link
                    </a>
                  )}
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Drive Coordinator
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {drive.coordinator?.first_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-bold">
                          {drive.coordinator
                            ? `${drive.coordinator.first_name} ${drive.coordinator.last_name}`
                            : "Not Assigned"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {drive.coordinator?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "eligibility" && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              Eligibility Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Minimum CGPA
                </p>
                <p className="text-3xl font-bold text-indigo-600">
                  {drive.eligibility?.min_cgpa || "0.0"}
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Active Backlogs
                </p>
                <p className="text-3xl font-bold text-amber-600">
                  ≤ {drive.eligibility?.max_active_backlogs ?? "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  Eligible Departments
                </h4>
                <div className="flex flex-wrap gap-2">
                  {drive.eligibility?.department_ids?.length > 0 ? (
                    drive.eligibility.department_ids.map((deptId) => {
                      const dept = departments.find((d) => d.id === deptId);
                      return (
                        <span
                          key={deptId}
                          className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm"
                        >
                          {dept ? dept.name : `Dept ID: ${deptId}`}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-500 text-sm italic">
                      Open to all departments
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  Eligible Batches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {drive.eligibility?.batch_ids?.length > 0 ? (
                    drive.eligibility.batch_ids.map((batch) => (
                      <span
                        key={batch}
                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm"
                      >
                        Batch {batch}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm italic">
                      Open to all batches
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rounds" && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              Recruitment Timeline
            </h3>
            <div className="space-y-4">
              {drive.rounds?.length > 0 ? (
                [...drive.rounds]
                  .sort((a, b) => a.round_number - b.round_number)
                  .map((round, idx) => (
                    <div
                      key={round.id}
                      className="flex gap-6 items-start p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 relative last:pb-6"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm border border-indigo-50">
                        {round.round_number}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                              {round.round_name}
                            </h4>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                              {round.round_type}
                            </p>
                          </div>
                          {round.is_eliminatory && (
                            <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase">
                              Elimination
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            {round.round_date
                              ? new Date(round.round_date).toLocaleDateString()
                              : "TBD"}
                          </div>
                          <div className="flex items-center capitalize">
                            {round.venue_type === "online" ? (
                              <Globe className="w-4 h-4 mr-1.5" />
                            ) : (
                              <Building className="w-4 h-4 mr-1.5" />
                            )}
                            {round.venue_type}{" "}
                            {round.venue ? `(${round.venue})` : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No rounds configured for this drive.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "applicants" && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <SelectionPipeline driveId={drive.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveDetail;
