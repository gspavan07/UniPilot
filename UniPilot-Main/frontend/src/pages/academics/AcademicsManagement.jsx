import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  GraduationCap,
  Book,
  FileText,
  RefreshCcw,
  Calendar,
  Layout,
  Clock,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const AcademicsManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Academic Analytics Stats (Placeholders - easily mapped to store later)
  const academicStats = [
    {
      name: "Total Departments",
      value: "12",
      change: "Institutional",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
    },
    {
      name: "Current Regulation",
      value: "R23",
      change: "Active",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600",
    },
    {
      name: "Total Courses",
      value: "450+",
      change: "Catalog",
      icon: FileText,
      color: "from-purple-500 to-violet-600",
    },
    {
      name: "Available Sections",
      value: "84",
      change: "Live",
      icon: Layout,
      color: "from-amber-500 to-orange-600",
    },
  ];

  const academicModules = [
    {
      id: "departments",
      name: "Departments",
      description:
        "Manage academic departments, HODs, and department settings.",
      icon: BookOpen,
      href: "/departments",
      permission: "academics:manage",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "programs",
      name: "Programs",
      description:
        "Define and manage degree programs, branches, and specializations.",
      icon: GraduationCap,
      href: "/programs",
      permission: "academics:manage",
      color: "from-purple-500 to-violet-600",
    },
    {
      id: "regulations",
      name: "Regulations",
      description:
        "Setup academic regulations, credit systems, and grading scales.",
      icon: Book,
      href: "/regulations",
      permission: "academics:manage",
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "courses",
      name: "Courses",
      description:
        "Manage course catalog, syllabus, and course-program mapping.",
      icon: FileText,
      href: "/courses",
      permission: "academics:manage",
      color: "from-rose-500 to-pink-600",
    },
    {
      id: "sections",
      name: "Sections",
      description:
        "Manage class sections, student groups, and section-wise data.",
      icon: Layout,
      href: "/academic/sections",
      permission: "academics:sections:manage",
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "lifecycle",
      name: "Lifecycle",
      description:
        "Manage student promotions, year-end processing, and academic lifecycle.",
      icon: RefreshCcw,
      href: "/lifecycle",
      permission: "academics:promotion:manage",
      color: "from-blue-600 to-cyan-600",
    },
    {
      id: "timetable",
      name: "Schedule Management",
      description:
        "Configure timetables, class timings, and faculty assignments.",
      icon: Clock,
      href: "/timetable/manage",
      permission: "academics:timetable:manage",
      color: "from-indigo-500 to-blue-600",
    },
    {
      id: "calendar",
      name: "Academic Calendar",
      description: "Define academic events, holidays, and semester schedules.",
      icon: Calendar,
      href: "/academic/calendar",
      permission: "academics:timetable:manage",
      color: "from-orange-500 to-red-600",
    },
  ];

  const filteredModules = academicModules.filter((module) => {
    if (!module.permission) return true;
    if (Array.isArray(module.permission)) {
      return module.permission.some((p) => user?.permissions?.includes(p));
    }
    return user?.permissions?.includes(module.permission);
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Academic Management
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
              Centralized administrative hub for orchestrating university
              curricula, managing faculty hierarchies, and overseeing the
              academic student lifecycle.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {academicStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {stat.name}
              </p>
              <h3 className="text-2xl font-bold text-black dark:text-white">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredModules.map((module, idx) => (
            <button
              key={module.id}
              onClick={() => navigate(module.href)}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-transparent hover:-translate-y-1 transition-all duration-500 text-left shadow-sm hover:shadow-2xl"
              style={{
                animationDelay: `${idx * 50}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              {/* Vertical Accent Strip */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 group-hover:w-2 bg-gradient-to-b ${module.color} transition-all duration-500`}
              />

              {/* Gradient Overlay on Hover */}
              {/* <div
                className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
              /> */}

              {/* Glowing Border on Hover */}
              {/* <div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${module.color} blur-xl -z-10`}
                style={{ transform: "scale(1.02)" }}
              /> */}

              <div className="relative p-6 pl-7">
                {/* Icon & Title Row */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`relative p-3 rounded-xl bg-gradient-to-br ${module.color} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                  >
                    <module.icon
                      className="w-6 h-6 text-white relative z-10"
                      strokeWidth={2}
                    />
                    {/* Icon Glow */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${module.color} blur-md opacity-50 rounded-xl`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-black dark:text-white mb-1 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                      {module.name}
                    </h3>
                    <div
                      className={`h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${module.color} transition-all duration-500 rounded-full`}
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 line-clamp-2">
                  {module.description}
                </p>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors duration-300">
                    Access Module
                  </span>
                  <div className="flex items-center gap-1 text-gray-300 group-hover:text-blue-500 group-hover:gap-2 transition-all duration-300">
                    <ChevronRight className="w-4 h-4" strokeWidth={3} />
                    <ChevronRight
                      className="w-4 h-4 -ml-3 opacity-0 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300"
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AcademicsManagement;
