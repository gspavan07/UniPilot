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
    // Admin Override
    if (["super_admin", "admin", "administrator"].includes(user?.role))
      return true;

    if (!module.permission) return true;
    if (Array.isArray(module.permission)) {
      return module.permission.some((p) => user?.permissions?.includes(p));
    }
    return user?.permissions?.includes(module.permission);
  });



  return (
    <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-blue-100 selection:text-blue-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              HR Management
            </h1>
            <p className="text-base text-gray-500 font-normal leading-relaxed max-w-2xl">
              Centralized administration for employee lifecycles and payroll.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Workforce Command
            </div>
            <div className="text-sm text-gray-400 text-left md:text-right">
              Access: <span className="text-gray-900 font-medium">{user?.role || "Administrator"}</span>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredModules.map((module) => (
            <button
              key={module.id}
              onClick={() => navigate(module.href)}
              className="group relative flex flex-col justify-between h-full min-h-[240px] p-6 bg-white border border-blue-200 hover:border-blue-500 rounded-2xl transition-all duration-300 text-left hover:shadow-xl hover:shadow-blue-900/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden"
            >
              {/* Top Section */}
              <div className="flex justify-between items-start w-full mb-6">
                <div className="relative p-3 rounded-xl bg-gray-50 group-hover:bg-blue-600 transition-colors duration-300">
                  <module.icon
                    strokeWidth={1.5}
                    className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors duration-300"
                  />
                </div>
                <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* Bottom Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {module.name}
                </h3>
                <p className="text-sm text-gray-500 font-normal leading-relaxed group-hover:text-gray-600 transition-colors">
                  {module.description}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRManagement;
