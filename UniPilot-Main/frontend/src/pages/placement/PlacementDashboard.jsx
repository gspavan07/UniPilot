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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const PlacementDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drives, companies } = useSelector(
    (state) => state.placement,
  );

  useEffect(() => {
    dispatch(fetchDrives());
    dispatch(fetchCompanies());
  }, [dispatch]);

  const stats = [
    {
      name: "Active Companies",
      value: companies.length,
      icon: Building2,
    },
    {
      name: "Upcoming Drives",
      value: drives.filter((d) => d.status === "scheduled").length,
      icon: CalendarDays,
    },
    {
      name: "Students Placed",
      value: "128",
      icon: Trophy,
    },
    {
      name: "Total Offers",
      value: "145",
      icon: Users,
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
                Monitor recruitment drives, manage company relations, and track student success metrics.
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <div
              key={stat.name}
              className="group p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 transition-colors text-blue-600">
                  <stat.icon className="w-6 h-6" />
                </span>
                {idx === 1 && (
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black text-black tracking-tight">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.name}</p>
              </div>
            </div>
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
                  <p className="text-gray-900 font-bold text-lg">No Drives Scheduled</p>
                  <p className="text-gray-500">New opportunities will appear here.</p>
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
                            <span>{drive.job_posting?.company?.name?.charAt(0) || "C"}</span>
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
                            {new Date(drive.drive_date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center gap-4 sm:pl-6 sm:border-l border-gray-100">
                      <span className={`
                        px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                        ${drive.status === "scheduled"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-500"}
                      `}>
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
            <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6">Quick Access</h3>
                <div className="space-y-3">
                  {[
                    { to: "/placement/companies", label: "Partner Companies", icon: Building2 },
                    { to: "/placement/job-postings", label: "Job Board", icon: Briefcase },
                    { to: "/placement/reports", label: "Analytics Hub", icon: TrendingUp },
                    { to: "/placement/coordinators", label: "Manage Coordinators", icon: ShieldCheck },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.to}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 hover:backdrop-blur-sm transition-all border border-white/5 hover:border-white/10 group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                        <span className="font-semibold text-sm">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900">Weekly Insight</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Placement drives have increased by <span className="font-bold text-black">12%</span> compared to last month. Ensure all student profiles are updated before the next scheduled dates.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;
