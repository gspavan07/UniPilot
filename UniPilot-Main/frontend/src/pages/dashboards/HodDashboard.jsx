import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ArrowUpRight,
  UserCheck,
  Layout,
  UserPlus,
  Bell
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

  const statCards = [
    {
      label: "Department Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "group-hover:border-blue-200"
    },
    {
      label: "Faculty Members",
      value: stats.totalFaculty,
      icon: Users,
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "group-hover:border-purple-200"
    },
    {
      label: "Department Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "group-hover:border-emerald-200"
    },
  ];

  const managementTools = [
    {
      title: "Schedule Planner",
      desc: "Manage department timetable",
      icon: Calendar,
      link: "/timetable/manage",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Curriculum",
      desc: "Review courses & syllabus",
      icon: BookOpen,
      link: "/regulations",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Faculty List",
      desc: "View department instructors",
      icon: Users,
      link: "/faculty",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Student Lifecycle",
      desc: "Promotions & Year-end",
      icon: UserCheck,
      link: "/lifecycle",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Manage Sections",
      desc: "Organize students into batches",
      icon: Layout,
      link: "/academic/sections",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Assign Faculty",
      desc: "Course Instructors",
      icon: UserPlus,
      link: "/academic/faculty-assignment",
      color: "text-pink-600",
      bg: "bg-pink-50"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-blue-100 selection:text-blue-900 pb-20 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-8">

        {/* Hero Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-md shadow-black/[0.03]">
            <div className="space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                Head of Department
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-black leading-tight">
                Welcome back,
                <br />
                <span className="text-blue-600 truncate">
                  {user?.first_name} {user?.last_name}
                </span>
              </h1>
              <p className="text-gray-500 text-md font-medium max-w-md truncate">
                Department of {department?.name || "General"}
                <br />
                ID: {user?.employee_id || "HOD-001"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <img
                src={
                  user?.profile_picture ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt=""
                className="w-32 h-32 rounded-full"
              />
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className={`group p-8 rounded-[2rem] border border-gray-100 bg-white transition-all duration-500 shadow-md shadow-black/[0.03] hover:shadow-xl hover:-translate-y-1 ${stat.border}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.text} transition-colors`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
                  {stat.label}
                </h3>
                <p className="text-4xl font-black text-black tracking-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">

          {/* Left Column: Management Tools */}
          <div className="lg:col-span-7 space-y-10 ">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-black flex items-center gap-4">
                <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                Quick Administration
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {managementTools.map((tool, idx) => (
                <Link
                  key={idx}
                  to={tool.link}
                  className="group relative flex items-center gap-6 p-6 rounded-[1.5rem] border border-gray-100 bg-white transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:bg-gray-50/50"
                  style={{ textDecoration: 'none' }}
                >

                  <div className={`w-14 h-14 rounded-2xl ${tool.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-black group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 mt-1">
                      {tool.desc}
                    </p>
                  </div>

                  <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Updates */}

          <aside className="lg:col-span-5 h-fit flex flex-col">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.03] overflow-hidden sticky top-8 flex flex-col max-h-[600px]">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div>
                  <h2 className="text-xl font-black text-black">Notifications</h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="divide-y divide-gray-50 flex-1 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

                {updates.length > 0 ? (
                  updates.map((update, idx) => (
                    <div key={idx} className="group p-6 hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <div className="flex gap-4">
                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${update.type === "STUDENT" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"}`}></div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${update.type === "STUDENT" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                              {update.type || "System"}
                            </span>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">
                              {new Date(update.time).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-black leading-snug group-hover:text-blue-600 transition-colors">
                            {update.title}
                          </h4>

                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {update.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <Bell className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">All caught up!</p>
                    <p className="text-xs text-gray-400 mt-1">No new updates to show.</p>
                  </div>
                )}
              </div>

              {updates.length > 0 && (
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider hover:underline">
                    View All Archive
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
