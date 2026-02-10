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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-700 to-indigo-900 border-b border-indigo-500 overflow-hidden mb-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-16 -mb-16 opacity-50"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <PlacementBreadcrumbs
            items={[{ label: "Dashboard" }]}
            className="text-indigo-100 mb-6"
          />
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-4xl font-black text-white tracking-tight">
              Career Launchpad
            </h1>
            <p className="text-indigo-100 mt-2 text-lg max-w-xl font-medium">
              Welcome back, {user?.first_name}. Your future starts here. Track
              your eligible drives and manage applications in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Drives */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={stat.name}
                  className={`group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-[${idx * 100}ms]`}
                >
                  <div
                    className={`p-4 rounded-2xl w-fit ${stat.bg} ${stat.color} mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">
                    {stat.name}
                  </h3>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Eligible Drives Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    Eligible Upcoming Drives
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">
                    Recommended opportunities for your profile
                  </p>
                </div>
                <Link
                  to="/placement/eligible"
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-black hover:bg-indigo-100 transition-colors"
                >
                  Explore All
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {eligibleDrives.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <Briefcase className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold text-lg">
                      No eligible drives found
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try updating your profile to see more
                    </p>
                  </div>
                ) : (
                  eligibleDrives.slice(0, 3).map((drive) => (
                    <div
                      key={drive.id}
                      className="group p-5 bg-gray-50/50 dark:bg-gray-900/50 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-5">
                          <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden group-hover:scale-105 transition-transform">
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
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                {drive.drive_name}
                              </h4>
                              {drive.hasApplied && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                  <BadgeCheck className="w-3 h-3" />
                                  Applied
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                              {drive.job_posting?.company?.name} • ₹
                              {drive.job_posting?.ctc_lpa} LPA
                            </p>
                            <div className="mt-2 flex flex-wrap gap-3">
                              <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg">
                                {drive.mode}
                              </span>
                              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Deadline:{" "}
                                {new Date(
                                  drive.registration_end,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {drive.hasApplied ? (
                          <Link
                            to={`/placement/my-applications`}
                            className="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 transition-all font-black text-sm text-center"
                          >
                            Track Application
                          </Link>
                        ) : (
                          <Link
                            to={`/placement/drives/${drive.id}/apply`}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm shadow-lg shadow-indigo-600/20 text-center"
                          >
                            Apply Now
                          </Link>
                        )}
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
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <div className="relative w-28 h-28 mx-auto mb-6">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="52"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    className="text-gray-100 dark:text-gray-700"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="52"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={
                      2 * Math.PI * 52 * (1 - profileCompletion / 100)
                    }
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    className="text-indigo-600 transition-all duration-1000 group-hover:stroke-indigo-400"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-black text-gray-900 dark:text-white text-2xl">
                    {profileCompletion}%
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Ready
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                Application Profile
              </h3>
              <p className="text-gray-500 text-sm mt-1 mb-8 font-medium">
                Higher completion rates increase your selection chances
              </p>
              <Link
                to="/placement/profile"
                className="group flex items-center justify-center gap-2 w-full py-4 bg-gray-900 dark:bg-gray-700 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 dark:shadow-none"
              >
                <UserCircle className="w-5 h-5 text-indigo-400" />
                Update Profile
              </Link>
            </div>

            {/* Quick Navigation Card */}
            <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <h3 className="text-xl font-black mb-6">Quick Actions</h3>
              <div className="space-y-4">
                {[
                  {
                    to: "/placement/my-applications",
                    label: "My Applications",
                    icon: ChevronRight,
                  },
                  {
                    to: "/placement/offers",
                    label: "Track My Offers",
                    icon: ChevronRight,
                  },
                ].map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.to}
                    className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all group/link"
                  >
                    <span className="font-bold text-sm">{link.label}</span>
                    <link.icon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-glow shadow-emerald-500/50"></div>
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-100">
                    Live Status: Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPlacementDashboard;
