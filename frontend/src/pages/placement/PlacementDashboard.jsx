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
} from "lucide-react";
import { Link } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const PlacementDashboard = () => {
  const dispatch = useDispatch();
  const { drives, companies, loading } = useSelector(
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
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Upcoming Drives",
      value: drives.filter((d) => d.status === "scheduled").length,
      icon: CalendarDays,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      name: "Students Placed",
      value: "128",
      icon: Trophy,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      name: "Total Offers",
      value: "145",
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-12">
      {/* Hero Section */}
      <div className="relative bg-indigo-600 dark:bg-indigo-900 rounded-xl border-b border-indigo-500 overflow-hidden mb-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <PlacementBreadcrumbs
            items={[{ label: "Dashboard" }]}
            className="text-indigo-100 mb-6"
          />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Placement Hub
              </h1>
              <p className="text-indigo-100 mt-2 text-lg max-w-xl font-medium">
                Gateway to university excellence. Manage industry relations,
                track drives, and empower student careers.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/placement/job-postings/new"
                className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg shadow-black/10 hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-5 h-5" />
                Post Job
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Stats Grid - Glassmorphism style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={stat.name}
              className={`group relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-[${idx * 100}ms]`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="h-1.5 w-12 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.color.replace("text", "bg")} w-2/3`}
                  ></div>
                </div>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
                {stat.name}
              </h3>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Drives Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Live & Upcoming Drives
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5 font-medium">
                    Tracking {drives.length} recruitment windows
                  </p>
                </div>
                <Link
                  to="/placement/drives"
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
                >
                  View Library
                </Link>
              </div>
              <div className="p-2 space-y-2">
                {drives.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <CalendarDays className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">
                      No active drives found
                    </p>
                    <button className="mt-4 text-indigo-600 text-sm font-bold">
                      Configure new drive
                    </button>
                  </div>
                ) : (
                  drives.slice(0, 5).map((drive) => (
                    <div
                      key={drive.id}
                      className="p-4 rounded-2xl hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden group-hover:border-indigo-200 transition-colors">
                              {drive.job_posting?.company?.logo_url ? (
                                <img
                                  src={drive.job_posting.company.logo_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                drive.job_posting?.company?.name?.charAt(0) ||
                                "D"
                              )}
                            </div>
                            {drive.status === "scheduled" && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                              {drive.drive_name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                {drive.job_posting?.company?.name}
                              </span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="text-sm text-gray-400 flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {new Date(
                                  drive.drive_date,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden sm:block text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                              Status
                            </p>
                            <span
                              className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tight ${
                                drive.status === "scheduled"
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {drive.status}
                            </span>
                          </div>
                          <Link
                            to={`/placement/drives/${drive.id}`}
                            className="p-3 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all sm:translate-x-4 group-hover:translate-x-0 group-hover:opacity-100"
                          >
                            <ArrowUpRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Side Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Operations Center
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    to: "/placement/companies",
                    icon: Building2,
                    label: "Partner Companies",
                    desc: "Manage industry alliances",
                    color: "text-blue-500",
                    bg: "bg-blue-50",
                  },
                  {
                    to: "/placement/job-postings",
                    icon: CalendarDays,
                    label: "Live Job Board",
                    desc: "Manage all requirements",
                    color: "text-purple-500",
                    bg: "bg-purple-50",
                  },
                  {
                    to: "/placement/reports",
                    icon: Trophy,
                    label: "Insight Hub",
                    desc: "View placement analytics",
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                  },
                  {
                    to: "/placement/coordinators",
                    icon: ShieldCheck,
                    label: "Manage Coordinators",
                    desc: "Assign faculty access",
                    color: "text-emerald-500",
                    bg: "bg-emerald-50",
                  },
                ].map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.to}
                    className="group flex items-center p-4 rounded-2xl border border-gray-50 dark:border-gray-700 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-500/5 transition-all"
                  >
                    <div
                      className={`p-3 rounded-xl ${link.bg} dark:bg-gray-700 ${link.color} group-hover:scale-110 transition-transform`}
                    >
                      <link.icon className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {link.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {link.desc}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;
