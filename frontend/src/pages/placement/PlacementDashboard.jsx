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
    <div className="p-6 max-w-7xl mx-auto">
      <PlacementBreadcrumbs items={[{ label: "Dashboard" }]} />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Placement Hub
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage university placements and industry relations
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/placement/drives/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Schedule Drive
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Drives List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Drives
            </h2>
            <Link
              to="/placement/drives"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {drives.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No upcoming drives scheduled
              </div>
            ) : (
              drives.slice(0, 5).map((drive) => (
                <div
                  key={drive.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl overflow-hidden">
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
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {drive.drive_name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {drive.job_posting?.company?.name} •{" "}
                          {drive.drive_date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          drive.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {drive.status}
                      </span>
                      <Link
                        to={`/placement/drives/${drive.id}`}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
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

        {/* Quick Actions / Recent Companies */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h2>
            <div className="space-y-3">
              <Link
                to="/placement/companies"
                className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
              >
                <Building2 className="w-5 h-5 mr-3" />
                Manage Companies
              </Link>
              <Link
                to="/placement/job-postings"
                className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
              >
                <CalendarDays className="w-5 h-5 mr-3" />
                Job Postings
              </Link>
              <Link
                to="/placement/reports"
                className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
              >
                <Trophy className="w-5 h-5 mr-3" />
                Placement Reports
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-lg font-bold mb-2">TPO Helpdesk</h3>
            <p className="text-indigo-100 text-sm mb-4">
              Need help managing companies or drives? Check the documentation.
            </p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-sm font-semibold transition-colors">
              Read Guides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;
