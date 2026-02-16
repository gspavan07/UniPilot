import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Bus,
  Users,
  AlertTriangle,
  BarChart3,
  UserPlus,
  Route as RouteIcon,
  PlusCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  Clock,
  Map,
  ShieldAlert,
} from "lucide-react";
import { fetchTransportDashboardStats } from "../../store/slices/transportSlice";

const TransportDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, status } = useSelector((state) => state.transport);

  useEffect(() => {
    dispatch(fetchTransportDashboardStats());
  }, [dispatch]);

  const stats = [
    {
      label: "Active Routes",
      value: dashboardStats?.totalRoutes || 0,
      icon: RouteIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Buses",
      value: dashboardStats?.totalVehicles || 0,
      icon: Bus,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Drivers",
      value: dashboardStats?.totalDrivers || 0,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Students",
      value: dashboardStats?.activeAllocations || 0,
      icon: UserPlus,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const modules = [
    {
      title: "Route Network",
      desc: "Manage paths & stops",
      icon: Map,
      link: "/transport/routes",
      accent: "border-l-4 border-l-blue-500",
    },
    {
      title: "Vehicle Fleet",
      desc: "Maintenance & status",
      icon: Bus,
      link: "/transport/vehicles",
      accent: "border-l-4 border-l-indigo-500",
    },
    {
      title: "Staff Directory",
      desc: "Drivers & assistants",
      icon: Users,
      link: "/transport/drivers",
      accent: "border-l-4 border-l-emerald-500",
    },
    {
      title: "Allocations",
      desc: "Student assignments",
      icon: UserPlus,
      link: "/transport/allocations",
      accent: "border-l-4 border-l-purple-500",
    },
    {
      title: "Trip Logs",
      desc: "Daily & special trips",
      icon: Clock,
      link: "/transport/trips",
      accent: "border-l-4 border-l-orange-500",
    },
    {
      title: "Analytics",
      desc: "Revenue & reports",
      icon: TrendingUp,
      link: "/transport/reports",
      accent: "border-l-4 border-l-gray-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30 text-gray-900 font-sans p-6 lg:p-10 selection:bg-blue-100">
      <div className="max-w-[1600px] mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Transport Command
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Overview of university logistics and fleet operations
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-4xl font-black text-gray-900 tracking-tight">
                  {stat.value}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Modules Grid */}
          <div className="xl:col-span-3 space-y-6">
            <div className="flex items-center gap-2 px-1">
              <Bus className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-900">
                Operational Modules
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {modules.map((mod, idx) => (
                <Link
                  key={idx}
                  to={mod.link}
                  className={`flex items-center justify-between p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group ${mod.accent}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3.5 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                      <mod.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportDashboard;
