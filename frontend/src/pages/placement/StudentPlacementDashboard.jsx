import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEligibleDrives,
  fetchMyApplications,
  fetchMyProfile,
} from "../../store/slices/placementSlice";
import {
  Briefcase,
  BadgeCheck,
  Clock,
  UserCircle,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const StudentPlacementDashboard = () => {
  const dispatch = useDispatch();
  const { eligibleDrives, myApplications, myProfile, loading } = useSelector(
    (state) => state.placement,
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchEligibleDrives());
    dispatch(fetchMyApplications());
    dispatch(fetchMyProfile());
  }, [dispatch]);

  const stats = [
    {
      name: "Eligible Drives",
      value: eligibleDrives.length,
      icon: Briefcase,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      name: "My Applications",
      value: myApplications.length,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      name: "Offers Received",
      value: "0",
      icon: BadgeCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  const profileCompletion = myProfile ? 85 : 0; // Simple logic for now

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PlacementBreadcrumbs items={[{ label: "Student Dashboard" }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Placement Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Hello {user?.first_name}, track your career opportunities here
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Stats & Profile */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div
                  className={`p-3 rounded-xl w-fit ${stat.bg} ${stat.color} mb-4`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  {stat.name}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Eligible Drives Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Eligible Upcoming Drives
              </h2>
              <Link
                to="/placement/eligible"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-bold"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {eligibleDrives.length === 0 ? (
                <div className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No eligible drives found for your profile.
                  </p>
                </div>
              ) : (
                eligibleDrives.slice(0, 3).map((drive) => (
                  <div
                    key={drive.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl font-bold text-indigo-600">
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
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            {drive.drive_name}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {drive.job_posting?.company?.name} • ₹
                            {drive.job_posting?.ctc_lpa} LPA
                          </p>
                          <div className="mt-2 flex gap-3">
                            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md font-bold">
                              {drive.mode}
                            </span>
                            <span className="text-xs text-gray-400 font-medium flex items-center">
                              Deadline:{" "}
                              {new Date(
                                drive.registration_end,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/placement/drive/${drive.id}`}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Calendar */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  className="text-gray-100 dark:text-gray-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={
                    2 * Math.PI * 44 * (1 - profileCompletion / 100)
                  }
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  className="text-indigo-600 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-900 dark:text-white text-lg">
                {profileCompletion}%
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Ready
            </h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">
              Complete your profile to unlock more opportunities
            </p>
            <Link
              to="/placement/profile"
              className="w-full py-3 bg-gray-50 dark:bg-gray-750 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50 transition-all block"
            >
              Update Profile
            </Link>
          </div>

          {/* Placement Status */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-2xl shadow-lg text-white">
            <h3 className="text-xl font-bold mb-4">Current Status</h3>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="font-bold">Actively Participating</span>
              </div>
              <p className="text-indigo-100 text-sm mt-1">
                You are eligible for upcoming drives.
              </p>
            </div>
            <div className="mt-8">
              <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">
                Quick Links
              </h4>
              <div className="space-y-3">
                <Link
                  to="/placement/my-applications"
                  className="flex items-center justify-between group"
                >
                  <span className="text-sm font-medium">My Applications</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/placement/offers"
                  className="flex items-center justify-between group"
                >
                  <span className="text-sm font-medium">Track Offers</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPlacementDashboard;
