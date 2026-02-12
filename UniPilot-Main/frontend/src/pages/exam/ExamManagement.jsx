import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Calendar,
  FileText,
  Award,
  ClipboardCheck,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  RefreshCw,
  Upload,
} from "lucide-react";

const ExamManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const examModules = [
    {
      id: "schedules",
      name: "Exam Schedules",
      description:
        "Create and manage examination timetables, venues, and sessions.",
      icon: Calendar,
      href: "/exams/schedules",
      permission: "exams:manage",
      color: "blue",
    },
    {
      id: "marks-entry",
      name: "Marks Entry",
      description:
        "Enter and verify student marks for internal and external exams.",
      icon: FileText,
      href: "/exams/marks-entry",
      permission: "exams:results:entry",
      color: "emerald",
    },
    {
      id: "publish",
      name: "Publish Results",
      description:
        "Review, approve, and publish exam results to student portals.",
      icon: Award,
      href: "/exams/publish",
      permission: "exams:results:publish",
      color: "purple",
    },
    {
      id: "reverification",
      name: "Reverification Management",
      description:
        "Manage student reverification requests and update marks after review.",
      icon: RefreshCw,
      href: "/exams/reverification",
      permission: "exams:reverification:manage",
      color: "orange",
    },
    {
      id: "scripts",
      name: "Script Management",
      description:
        "Upload, manage, and control visibility of exam answer scripts.",
      icon: Upload,
      href: "/exams/scripts",
      permission: "exams:scripts:manage",
      color: "indigo",
    },
    // {
    //   id: "hall-tickets",
    //   name: "Hall Tickets",
    //   description:
    //     "Generate and manage exam hall tickets and student eligibility.",
    //   icon: ClipboardCheck,
    //   href: "/exams/hall-tickets",
    //   permission: "exams:manage",
    //   color: "amber",
    // },
  ];

  const filteredModules = examModules.filter((module) => {
    if (!module.permission) return true;
    if (Array.isArray(module.permission)) {
      return module.permission.some((p) => user?.permissions?.includes(p));
    }
    return user?.permissions?.includes(module.permission);
  });

  const getColorClasses = (color) => {
    const classes = {
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800",
      emerald:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
      purple:
        "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800",
      amber:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
      orange:
        "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800",
      indigo:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
    };
    return classes[color] || classes.blue;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">
          Exams & Grading
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage the entire examination process, from scheduling to results
          publication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredModules.map((module) => (
          <button
            key={module.id}
            onClick={() => navigate(module.href)}
            className="group relative flex flex-col items-start p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 text-left"
          >
            <div
              className={`p-4 rounded-2xl mb-6 transition-colors ${getColorClasses(module.color)} group-hover:bg-primary-500 group-hover:text-white dark:group-hover:bg-primary-500`}
            >
              <module.icon className="w-8 h-8" />
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {module.name}
                </h3>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                {module.description}
              </p>
            </div>

            {/* Hover Indicator */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary-500 rounded-b-3xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </button>
        ))}
      </div>

      {/* Accuracy & Integrity Section */}
      {/* <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" /> Data Integrity
            </h2>
            <p className="text-rose-100 mb-6 max-w-md">
              Examination data is critical for student futures. The UniPilot
              system ensures zero-error processing even when managing thousands
              of student marks simultaneously.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Directly Audit Logged
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            Pro Tip for Large Universities
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic mb-4">
            "For large-scale universities in South India, we recommend
            finalizing schedules at least 30 days in advance to ensure smooth
            logistics for thousands of students."
          </p>
          <p className="text-sm font-semibold text-gray-500">
            - UniPilot Team, Kakinada, AP
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default ExamManagement;
