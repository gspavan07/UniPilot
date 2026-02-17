import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDrives, fetchCompanies } from "../../store/slices/placementSlice";
import {
  Building2,
  CalendarDays,
  Users,
  Trophy,
  Plus,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Briefcase,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const PlacementDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drives, companies } = useSelector((state) => state.placement);

  useEffect(() => {
    dispatch(fetchDrives());
    dispatch(fetchCompanies());
  }, [dispatch]);

  const stats = [
    {
      name: "Active Companies",
      value: companies.length,
      icon: Building2,
      link: "/placement/companies",
    },
    {
      name: "Upcoming Drives",
      value: drives.filter((d) => d.status === "scheduled").length,
      icon: CalendarDays,
      link: "/placement/drives",
    },
    {
      name: "Students Placed",
      value: "128",
      icon: Trophy
    },
    {
      name: "Total Offers",
      value: "145",
      icon: Users
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Header Navigation */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="flex items-start gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-black">
                Placement Overview
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl">
                Monitor recruitment drives, manage company relations, and track
                student success metrics.
              </p>
            </div>
          </div>
          <Link
            to="/placement/job-postings/new"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Job</span>
          </Link>
        </header>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          { stats.map((stat, idx) => (
            <Link
              key={stat.name}
              to={stat.link}
              className="group relative p-8 rounded-[2.5rem] bg-white border border-blue-300 hover:border-blue-200 shadow-[0_2px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.08)] transition-all duration-500 ease-out overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.2] group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                <stat.icon className="w-20 h-20 text-blue-600" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500 mb-6">
                  <stat.icon className="w-6 h-6" />
                </div>

                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                  {stat.name}
                </p>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-black tracking-tighter group-hover:text-blue-600 transition-colors duration-500">
                    {stat.value}
                  </span>
                  {idx === 1 && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse mb-4"></span>
                  )}
                </div>
                 {stat.name !== "Students Placed" && stat.name !== "Total Offers" && (
          <div className="absolute right-0 -bottom-4 w-10 h-10 rounded-full bg-gray-50 border border-blue-200 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500">
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-white group-hover:-rotate-45 transition-colors" />
          </div>
        )}
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-end justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                  Live Recruitment Drives
                </h2>
                <p className="text-gray-400 text-sm mt-1 font-medium">
                  Currently tracking {drives.length} active opportunities
                </p>
              </div>
              <Link
                to="/placement/drives"
                className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:gap-2 transition-all"
              >
                View Full Schedule <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {drives.length === 0 ? (
                <div className="py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-900 font-bold text-lg">
                    No Drives Scheduled
                  </p>
                  <p className="text-gray-500">
                    New opportunities will appear here.
                  </p>
                </div>
              ) : (
                drives.slice(0, 5).map((drive) => (
                  <div
                    key={drive.id}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-xl font-bold text-gray-900 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                          {drive.job_posting?.company?.logo_url ? (
                            <img
                              src={drive.job_posting.company.logo_url}
                              alt=""
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            <span>
                              {drive.job_posting?.company?.name?.charAt(0) ||
                                "C"}
                            </span>
                          )}
                        </div>
                        {drive.status === "scheduled" && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-black group-hover:text-blue-600 transition-colors">
                          {drive.drive_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1.5">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            {drive.job_posting?.company?.name}
                          </span>
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            {new Date(drive.drive_date).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center gap-4 sm:pl-6 sm:border-l border-gray-100">
                      <span
                        className={`
                        px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                        ${
                          drive.status === "scheduled"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-500"
                        }
                      `}
                      >
                        {drive.status}
                      </span>
                      <Link
                        to={`/placement/drives/${drive.id}`}
                        className="p-3 rounded-full bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className=" rounded-3xl p-8 text-blue-600 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-xl  font-bold mb-6">Quick Access</h3>
                <div className="space-y-3">
                  {[
                    {
                      to: "/placement/companies",
                      label: "Partner Companies",
                      icon: Building2,
                    },
                    {
                      to: "/placement/job-postings",
                      label: "Job Board",
                      icon: Briefcase,
                    },
                    {
                      to: "/placement/coordinators",
                      label: "Manage Coordinators",
                      icon: ShieldCheck,
                    },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.to}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-800/5 hover:bg-white/20 hover:backdrop-blur-sm transition-all border border-white hover:border-blue-600 group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-black group-hover:text-blue-600" />
                        <span className="font-semibold text-black group-hover:text-blue-600 text-sm">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-black group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;
