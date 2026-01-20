import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  ArrowUpRight,
  UserCheck,
  Layout,
  PlusCircle,
  Settings,
  ListChecks, // Added for Manage Sections
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const HodDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    activeClasses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch HOD specific stats
      const res = await api.get("/hr/hod/dashboard-stats");
      setStats(res.data.data.stats);
      setDepartment(res.data.data.department);
      setUpdates(res.data.data.recentUpdates || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch HOD stats:", error);
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const statCards = [
    {
      name: "Department Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "bg-blue-500",
      description: "Enrolled in your dept",
    },
    {
      name: "Faculty Members",
      value: stats.totalFaculty,
      icon: Users,
      color: "bg-indigo-500",
      description: "Teaching staff",
    },
    {
      name: "Department Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "bg-emerald-500",
      description: "Active this semester",
    },
    {
      name: "Classes Today",
      value: stats.activeClasses,
      icon: Calendar,
      color: "bg-amber-500",
      description: "Scheduled slots",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
            Departmental View: {department?.name || "Loading..."} 🏛️
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome, HOD {user?.first_name} {user?.last_name}. Manage your
            department's academic operations here.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/timetable/manage"
            className="btn btn-primary shadow-lg shadow-primary-500/20 flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Schedule Class
          </Link>
          <Link
            to="/settings"
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="card p-6 flex items-start justify-between group hover:border-primary-500/20 transition-all duration-300"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                {stat.name}
              </p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-[10px] font-bold text-gray-500 mt-2">
                {stat.description}
              </p>
            </div>
            <div
              className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
            >
              <stat.icon
                className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Quick Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-6 flex items-center">
              <Layout className="w-5 h-5 mr-3 text-primary-500" /> Quick
              Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/timetable/manage"
                className="flex items-center p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 hover:scale-[1.02] transition-all"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm mr-4">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-100">
                    Schedule Planner
                  </h4>
                  <p className="text-xs text-indigo-600/70">
                    Manage department timetable
                  </p>
                </div>
              </Link>

              <Link
                to="/regulations"
                className="flex items-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 hover:scale-[1.02] transition-all"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm mr-4">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-100">
                    Curriculum
                  </h4>
                  <p className="text-xs text-emerald-600/70">
                    Review courses & syllabus
                  </p>
                </div>
              </Link>

              <Link
                to="/faculty"
                className="flex items-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 hover:scale-[1.02] transition-all"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-100">
                    Faculty List
                  </h4>
                  <p className="text-xs text-blue-600/70">
                    View department instructors
                  </p>
                </div>
              </Link>

              <Link
                to="/lifecycle"
                className="flex items-center p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 hover:scale-[1.02] transition-all"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm mr-4">
                  <UserCheck className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-100">
                    Student Lifecycle
                  </h4>
                  <p className="text-xs text-amber-600/70">
                    Promotions & Year-end
                  </p>
                </div>
              </Link>

              <Link
                to="/academic/sections"
                className="flex items-center p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 hover:scale-[1.02] transition-all"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm mr-4">
                  <Layout className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-purple-900 dark:text-purple-100">
                    Manage Sections
                  </h4>
                  <p className="text-xs text-purple-600/70">
                    Organize students into batches
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section: Dept Activity / Notifications */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-6">
              Recent Departmental Updates
            </h3>
            <div className="space-y-4">
              {updates.length > 0 ? (
                updates.map((update, i) => (
                  <div key={i} className="flex space-x-3">
                    <div
                      className={`w-1 h-8 ${update.type === "STUDENT" ? "bg-amber-500" : "bg-primary-500"} rounded-full mt-1`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{update.title}</p>
                      <p className="text-[10px] text-gray-500 line-clamp-2">
                        {update.message}
                      </p>
                      <p className="text-[9px] font-black text-gray-400 uppercase mt-1">
                        {formatTimeAgo(update.time)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center italic">
                  No recent activity recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
