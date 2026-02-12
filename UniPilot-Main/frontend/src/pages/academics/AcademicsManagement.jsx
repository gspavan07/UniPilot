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
} from "lucide-react";

const AcademicsManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const academicModules = [
    {
      id: "departments",
      name: "Departments",
      description:
        "Manage academic departments, HODs, and department settings.",
      icon: BookOpen,
      href: "/departments",
      permission: "academics:manage",
      color: "blue",
    },
    {
      id: "programs",
      name: "Programs",
      description:
        "Define and manage degree programs, branches, and specializations.",
      icon: GraduationCap,
      href: "/programs",
      permission: "academics:manage",
      color: "indigo",
    },
    {
      id: "regulations",
      name: "Regulations",
      description:
        "Setup academic regulations, credit systems, and grading scales.",
      icon: Book,
      href: "/regulations",
      permission: "academics:manage",
      color: "purple",
    },
    {
      id: "courses",
      name: "Courses",
      description:
        "Manage course catalog, syllabus, and course-program mapping.",
      icon: FileText,
      href: "/courses",
      permission: "academics:manage",
      color: "emerald",
    },
    {
      id: "sections",
      name: "Sections",
      description:
        "Manage class sections, student groups, and section-wise data.",
      icon: Layout,
      href: "/academic/sections",
      permission: "academics:sections:manage",
      color: "amber",
    },
    {
      id: "lifecycle",
      name: "Lifecycle",
      description:
        "Manage student promotions, year-end processing, and academic lifecycle.",
      icon: RefreshCcw,
      href: "/lifecycle",
      permission: "academics:promotion:manage",
      color: "rose",
    },
    {
      id: "timetable",
      name: "Schedule Management",
      description:
        "Configure timetables, class timings, and faculty assignments.",
      icon: Clock,
      href: "/timetable/manage",
      permission: "academics:timetable:manage",
      color: "cyan",
    },
    {
      id: "calendar",
      name: "Academic Calendar",
      description: "Define academic events, holidays, and semester schedules.",
      icon: Calendar,
      href: "/academic/calendar",
      permission: "academics:timetable:manage",
      color: "orange",
    },
  ];

  const filteredModules = academicModules.filter((module) => {
    if (!module.permission) return true;
    if (Array.isArray(module.permission)) {
      return module.permission.some((p) => user?.permissions?.includes(p));
    }
    return user?.permissions?.includes(module.permission);
  });

  const getColorClasses = (color) => {
    const classes = {
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800",
      indigo:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
      purple:
        "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800",
      emerald:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
      amber:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
      rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-800",
      cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800",
      orange:
        "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800",
    };
    return classes[color] || classes.blue;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Academic Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Centralized hub for managing all academic operations, programs, and
          student lifecycle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <button
            key={module.id}
            onClick={() => navigate(module.href)}
            className="group relative flex flex-col items-start p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 text-left"
          >
            <div
              className={`p-3 rounded-xl mb-4 transition-colors ${getColorClasses(module.color)} group-hover:bg-primary-500 group-hover:text-white dark:group-hover:bg-primary-500`}
            >
              <module.icon className="w-6 h-6" />
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {module.name}
                </h3>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                {module.description}
              </p>
            </div>

            {/* Hover Indicator */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-500 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </button>
        ))}
      </div>

      {/* Quick Overview Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-primary-100 mb-6 max-w-md">
              Managing large-scale university operations can be complex. Reach
              out to the support team for guidance on setting up academic
              structures.
            </p>
            <button className="px-6 py-2.5 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors">
              Contact Support
            </button>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -right-10 top-10 w-40 h-40 bg-primary-400/20 rounded-full blur-2xl" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Pro Tip
          </h2>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                "We are building this for large scale universities. Ensure that
                departments and programs are standardized across the campus
                before mapping courses to them."
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-500">
                - UniPilot Team, Kakinada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicsManagement;
