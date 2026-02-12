import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Briefcase,
  UserPlus,
  Wallet,
  Layers,
  PlaneTakeoff,
  Users,
  Calendar as CalendarIcon,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const HRManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const hrModules = [
    {
      id: "employees",
      name: "Employee Directory",
      description: "Manage staff profiles, roles, and employment details.",
      icon: Briefcase,
      href: "/employees",
      permission: "hr:staff:view",
      color: "blue",
    },
    {
      id: "onboarding",
      name: "Employee Onboarding",
      description: "Onboard new staff members and manage recruitment workflow.",
      icon: UserPlus,
      href: "/hr/onboard",
      permission: "emp:onboarding:access",
      color: "emerald",
    },
    {
      id: "payroll",
      name: "Payroll Dashboard",
      description: "Manage salaries, deductions, and payroll processing.",
      icon: Wallet,
      href: "/hr/payroll",
      permission: "hr:payroll:view",
      color: "indigo",
    },
    {
      id: "salary-grades",
      name: "Salary Grades",
      description: "Define pay scales and salary structures for various roles.",
      icon: Layers,
      href: "/hr/payroll/grades",
      permission: "hr:payroll:manage",
      color: "purple",
    },
    {
      id: "leaves",
      name: "Leave Management",
      description: "Track and approve employee leave requests and balances.",
      icon: PlaneTakeoff,
      href: "/hr/leaves",
      permission: "hr:leaves:manage",
      color: "rose",
    },
    {
      id: "attendance",
      name: "Staff Attendance",
      description: "Monitor daily attendance and work hours for all staff.",
      icon: Users,
      href: "/hr/attendance",
      permission: "hr:attendance:view",
      color: "amber",
    },
    {
      id: "calendar",
      name: "Staff Calendar",
      description: "Manage staff schedules, holidays, and work shifts.",
      icon: CalendarIcon,
      href: "/hr/calendar",
      permission: "hr:staff:view",
      color: "cyan",
    },
  ];

  const filteredModules = hrModules.filter((module) => {
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
      indigo:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
      purple:
        "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800",
      rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-800",
      amber:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
      cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800",
    };
    return classes[color] || classes.blue;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">
          Human Resource Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage employee lifecycle, payroll, attendance, and leave
          administration from one place.
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

      {/* South India / Scalability Focus Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4 text-primary-600 dark:text-primary-400 font-bold">
            <ShieldCheck className="w-6 h-6" />
            <span>Compliance & Scale</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Managing Regional Compliance
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            UniPilot is designed to handle the specific HR requirements of
            large-scale institutions in Andhra Pradesh and across South India.
            Ensure all employee data is verified and payroll configurations
            follow regional regulations.
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <span>Powered by UniPilot, Kakinada</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Scalability First</h2>
            <p className="text-indigo-100 mb-6">
              Our system is optimized to handle thousands of staff members
              without any performance lag. Manage your entire workforce with
              confidence.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium backdrop-blur-sm">
                10k+ Staff Ready
              </div>
              <div className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium backdrop-blur-sm">
                Instant Processing
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default HRManagement;
