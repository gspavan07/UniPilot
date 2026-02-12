import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ClipboardCheck,
  UserPlus,
  Sliders,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const AdmissionManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const admissionModules = [
    {
      id: "verifications",
      name: "Admission Verifications",
      description:
        "Verify student documents, manage applications, and ensure compliance with admission policies.",
      icon: ClipboardCheck,
      href: "/admission/verifications",
      permission: "admissions:view",
      color: "blue",
    },
    {
      id: "registration",
      name: "Student Registration",
      description:
        "Register new students, collect documents, and manage the eligibility workflow.",
      icon: UserPlus,
      href: "/student/register",
      permission: "admissions:manage",
      color: "emerald",
    },
    {
      id: "settings",
      name: "Admission Config",
      description:
        "Configure admission cycles, application forms, and fee structures for new students.",
      icon: Sliders,
      href: "/admission/settings",
      permission: "admissions:manage",
      color: "purple",
    },
  ];

  const filteredModules = admissionModules.filter((module) => {
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
    };
    return classes[color] || classes.blue;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">
          Admission Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage the entire student admission lifecycle, from inquiry analytics
          to final registration.
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

      {/* Strategic Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-6 h-6" />
            <span>Efficient Admissions</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Scale-Ready Infrastructure
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            Our admission system is engineered to handle thousands of
            applications concurrently. Whether it's peak season or specialized
            intakes, UniPilot remains stable and responsive.
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <span>Engineering Excellence from Kakinada</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Data-Driven Intakes</h2>
            <p className="text-primary-100 mb-6">
              Use Analytics to understand which programs are trending and
              optimize your marketing efforts across South India.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default AdmissionManagement;
