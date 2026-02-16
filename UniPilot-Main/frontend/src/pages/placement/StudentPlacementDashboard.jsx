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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        {/* Header Section */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                  Career Portal
                </span>
                <div className="h-px w-8 bg-gray-100"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Session 2024-2025
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black tracking-tight leading-none">
                Placement <span className="text-blue-600">Overview.</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
                Welcome back,{" "}
                <span className="text-black font-bold underline decoration-blue-500/30 underline-offset-4">
                  {user?.first_name}
                </span>
                . Everything you need to launch your professional journey in one
                place.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/placement/profile"
                className="group flex items-center gap-3 px-6 py-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-blue-200 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Your Profile
                  </p>
                  <p className="text-sm font-bold text-black group-hover:text-blue-600 transition-colors">
                    Update Credentials
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, idx) => (
            <div
              key={stat.name}
              className="group relative p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-blue-200 shadow-[0_2px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.08)] transition-all duration-500 ease-out overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                <stat.icon className="w-24 h-24 text-blue-600" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500 mb-6">
                  <stat.icon className="w-6 h-6" />
                </div>

                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                  {stat.name}
                </p>

                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black text-black tracking-tighter group-hover:text-blue-600 transition-colors duration-500">
                    {stat.value}
                  </span>
                  <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content: Opportunities */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between border-b-2 border-gray-50 pb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Latest Opportunities
                </h2>
                <p className="text-sm text-gray-400 font-medium pl-4">
                  Recently added recruitment drives matching your profile
                </p>
              </div>
              <Link
                to="/placement/eligible"
                className="group flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
              >
                View all drives
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-6">
              {eligibleDrives.length === 0 ? (
                <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                  <div className="mx-auto w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6">
                    <Briefcase className="w-8 h-8 text-gray-200" />
                  </div>
                  <h3 className="text-black font-black text-2xl tracking-tight">
                    No drives available yet.
                  </h3>
                  <p className="text-gray-400 max-w-xs mx-auto mt-2 font-medium leading-relaxed">
                    We'll notify you as soon as new opportunities align with
                    your profile.
                  </p>
                </div>
              ) : (
                eligibleDrives.slice(0, 4).map((drive) => (
                  <div
                    key={drive.id}
                    className="group bg-white rounded-[2rem] p-8 border border-gray-100 hover:border-blue-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between relative z-10">
                      {/* Company Info */}
                      <div className="flex gap-6 items-center flex-1">
                        <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center border border-gray-100 text-2xl font-black text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-500 overflow-hidden shadow-sm">
                          {drive.job_posting?.company?.logo_url ? (
                            <img
                              src={drive.job_posting.company.logo_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            drive.job_posting?.company?.name?.charAt(0) || "C"
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-black group-hover:text-blue-600 transition-colors tracking-tight">
                            {drive.drive_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
                            <span className="text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 font-black uppercase tracking-wider">
                              {drive.job_posting?.company?.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-black">
                              <span className="text-blue-600">₹</span>
                              {drive.job_posting?.ctc_lpa} LPA
                            </div>
                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                            <span
                              className={
                                drive.mode === "Virtual"
                                  ? "text-purple-600 bg-purple-50 px-3 py-1 rounded-full"
                                  : "text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase italic"
                              }
                            >
                              {drive.mode}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-6 self-end md:self-center">
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-300 mb-1 leading-none">
                            Registration Ends
                          </p>
                          <p className="text-sm font-black text-black">
                            {new Date(
                              drive.registration_end,
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        {drive.hasApplied ? (
                          <Link
                            to={`/placement/my-applications`}
                            className="px-8 py-4 bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-black/10"
                          >
                            Track Status
                          </Link>
                        ) : !drive.isEligible ? (
                          <div className="relative group/tooltip">
                            <div className="px-6 py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-red-100 cursor-help">
                              Ineligible
                            </div>
                            <div className="absolute bottom-full right-0 mb-3 w-48 p-4 bg-gray-900 text-white rounded-2xl text-[10px] leading-relaxed opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50">
                              <span className="block font-black uppercase tracking-widest border-b border-white/10 pb-2 mb-2">
                                Reason:
                              </span>
                              {drive.ineligible_reason ||
                                "Requirements not met"}
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={`/placement/drives/${drive.id}/apply`}
                            className="relative px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40"
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
          <aside className="lg:col-span-4 space-y-12">
            {/* Profile Widget */}
            <div className="bg-gray-950 text-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl shadow-blue-900/10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                      Profile Status
                    </p>
                    <h3 className="font-black text-2xl tracking-tight">
                      Readiness
                    </h3>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/5">
                    {profileCompletion > 80 ? "Premium" : "Standard"}
                  </div>
                </div>

                <div className="mb-10">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-6xl font-black tracking-tighter tabular-nums">
                      {profileCompletion}
                      <span className="text-2xl text-blue-500 ml-1">%</span>
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                  A complete profile increases your visibility to{" "}
                  <span className="text-white font-bold">
                    top-tier recruiters
                  </span>{" "}
                  by up to 3x.
                </p>

                <Link
                  to="/placement/profile"
                  className="group flex items-center justify-center gap-3 w-full py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl shadow-white/5"
                >
                  <UserCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Optimize Profile
                </Link>
              </div>
            </div>

            {/* Navigation Widget */}
            <div className="bg-gray-50/50 rounded-[3rem] p-10 border border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-gray-200"></div>
                Quick Access
              </h3>
              <nav className="space-y-3">
                {[
                  {
                    to: "/placement/my-applications",
                    label: "Application History",
                    icon: Clock,
                  },
                  {
                    to: "/placement/offers",
                    label: "My Success Stories",
                    icon: BadgeCheck,
                  },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white text-gray-900 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Help/Support Box */}
            <div className="bg-blue-50/50 rounded-[3rem] p-10 border border-blue-100 relative overflow-hidden">
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center mb-6">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-black text-black text-xl tracking-tight mb-2 leading-none">
                  Need assistance?
                </h4>
                <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
                  Our placement coordinators are here to guide you through every
                  step of your career journey.
                </p>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors group">
                  Connect with Support
                  <span className="group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StudentPlacementDashboard;
