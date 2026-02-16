import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEligibleDrives,
  fetchMyApplications,
  fetchMyProfile,
  fetchMyOffers,
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
  const { eligibleDrives, myApplications, myOffers, myProfile, loading } =
    useSelector((state) => state.placement);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchEligibleDrives());
    dispatch(fetchMyApplications());
    dispatch(fetchMyProfile());
    dispatch(fetchMyOffers());
  }, [dispatch]);

  const stats = [
    {
      name: "Eligible Drives",
      value: eligibleDrives.length,
      icon: Briefcase,
    },
    {
      name: "My Applications",
      value: myApplications.length,
      icon: Clock,
    },
    {
      name: "Offers Received",
      value: myOffers.length,
      icon: BadgeCheck,
    },
  ];

  const profileCompletion = myProfile ? 85 : 0; // Simple logic for now

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Header Section */}
        <header className="mb-12">
          <div className="mb-4">
            {/* <PlacementBreadcrumbs
              items={[{ label: "Dashboard" }]}
              className="text-gray-400 text-sm font-medium"
            /> */}
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-black mb-2">
                Placement Overview
              </h1>
              <p className="text-gray-500 text-lg">
                Welcome back, <span className="text-gray-900 font-medium">{user?.first_name}</span>.
                Ready for your next career move?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Current Session
              </span>
              <div className="h-px w-8 bg-gray-200"></div>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                2024-2025
              </span>
            </div>
          </div>
        </header>

        {/* Key Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <div
              key={stat.name}
              className="group relative p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <stat.icon className="w-6 h-6 text-gray-200 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                {stat.name}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-black tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                  {stat.value}
                </span>
                <span className="text-base font-medium text-gray-400">
                  Total
                </span>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content: Opportunities */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Latest Opportunities
              </h2>
              <Link
                to="/placement/eligible"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                View all drives <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {eligibleDrives.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Briefcase className="w-6 h-6 text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-semibold text-lg">No drives available yet</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-1">
                    Check back later or update your profile skills.
                  </p>
                </div>
              ) : (
                eligibleDrives.slice(0, 4).map((drive) => (
                  <div
                    key={drive.id}
                    className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                      {/* Company Info */}
                      <div className="flex gap-5 items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 text-xl font-bold text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                          {drive.job_posting?.company?.logo_url ? (
                            <img
                              src={drive.job_posting.company.logo_url}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            drive.job_posting?.company?.name?.charAt(0) || "C"
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                            {drive.drive_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500">
                            <span className="text-gray-900">
                              {drive.job_posting?.company?.name}
                            </span>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <span>
                              ₹{drive.job_posting?.ctc_lpa} LPA
                            </span>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <span className={drive.mode === "Virtual" ? "text-purple-600" : "text-emerald-600"}>
                              {drive.mode}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-4 self-end md:self-center">
                        <div className="text-right hidden md:block mr-4">
                          <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">Deadline</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(drive.registration_end).toLocaleDateString()}
                          </p>
                        </div>

                        {drive.hasApplied ? (
                          <Link
                            to={`/placement/my-applications`}
                            className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Track Status
                          </Link>
                        ) : !drive.isEligible ? (
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded uppercase tracking-wide">
                              Ineligible
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1 max-w-[100px] leading-tight">
                              {drive.ineligible_reason || "Reqs not met"}
                            </p>
                          </div>
                        ) : (
                          <Link
                            to={`/placement/drives/${drive.id}/apply`}
                            className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-lg group-hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200 group-hover:shadow-blue-200"
                          >
                            Apply Now
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Profile Widget */}
            <div className="bg-gray-900 text-white rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-lg">Profile Status</h3>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/5">
                    {profileCompletion > 80 ? "Excellent" : "In Progress"}
                  </span>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-4xl font-black">{profileCompletion}%</span>
                    <span className="text-sm text-gray-400 font-medium mb-1">Completeness</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
                  Complete your profile to unlock more premium drive opportunities tailored to your skills.
                </p>

                <Link
                  to="/placement/profile"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-bold text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  Update Profile
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                Navigation
              </h3>
              <nav className="space-y-2">
                {[
                  { to: "/placement/my-applications", label: "My Applications" },
                  { to: "/placement/offers", label: "My Offers" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between p-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all group"
                  >
                    <span className="font-semibold text-sm">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Help/Support Box */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700/80 mb-4 font-medium">
                Contact the placement cell for queries regarding eligibility or drive schedules.
              </p>
              <button className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors">
                Contact Support &rarr;
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StudentPlacementDashboard;
