import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  UserCheck,
  PlaneTakeoff,
  Wallet,
  TrendingUp,
  Calendar,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
  UserPlus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { fetchHRDashboardStats } from "../../store/slices/hrSlice";

const HRDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboardStats, status } = useSelector((state) => state.hr);

  useEffect(() => {
    dispatch(fetchHRDashboardStats());
  }, [dispatch]);

  const { metrics, workforceMix, attendanceTrend, pendingLeaves } =
    dashboardStats;

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const hrStats = [
    {
      name: "Total Workforce",
      value: metrics.totalStaff || "0",
      icon: Users,
      change: "+2.5%",
      changeType: "increase",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      name: "Present Today",
      value: `${metrics.presentToday || 0}`,
      secondaryValue: `/ ${metrics.totalStaff || 0}`,
      icon: UserCheck,
      change:
        metrics.totalStaff > 0
          ? `${Math.round((metrics.presentToday / metrics.totalStaff) * 100)}%`
          : "0%",
      changeType: "info",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      name: "Leave Requests",
      value: pendingLeaves.length,
      icon: PlaneTakeoff,
      change: `+${metrics.onLeaveToday || 0} Today`,
      changeType: "decrease",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      name: "Monthly Payout",
      value: `₹${(metrics.payrollTotal || 0).toLocaleString()}`,
      icon: Wallet,
      change: `${metrics.readinessPercentage}% Ready`,
      changeType: "success",
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Activity className="w-12 h-12 text-indigo-500 animate-bounce mb-4" />
        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest animate-pulse">
          Syncing Real-Time Insights...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 animate-fade-in">
      {/* 🚀 Premium Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl">
                <Activity className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 leading-none">
                  Management Console
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1">
                  Human Resources{" "}
                  <span className="text-indigo-400 underline decoration-indigo-400/30">
                    Hub
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
              Welcome back, {user?.first_name}. You have{" "}
              <span className="text-white font-bold">
                {pendingLeaves.length} pending leave requests
              </span>{" "}
              and today's attendance is{" "}
              <span className="text-emerald-400 font-bold">
                {metrics.totalStaff > 0
                  ? `${Math.round((metrics.presentToday / metrics.totalStaff) * 100)}%`
                  : "0%"}
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/hr/staff"
              className="group p-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl transition-all hover:scale-105"
            >
              <UserPlus className="w-6 h-6 text-indigo-400 mb-2" />
              <p className="text-xs font-black text-white uppercase tracking-widest">
                Add Staff
              </p>
            </Link>
            <Link
              to="/hr/attendance"
              className="group p-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-2" />
              <p className="text-xs font-black text-white uppercase tracking-widest">
                Attendance
              </p>
            </Link>
            <Link
              to="/hr/payroll"
              className="group p-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl transition-all hover:scale-105"
            >
              <Wallet className="w-6 h-6 text-amber-400 mb-2" />
              <p className="text-xs font-black text-white uppercase tracking-widest">
                Payroll
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* 📊 High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hrStats.map((stat) => (
          <div
            key={stat.name}
            className="group relative bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-[0.03] rounded-full -mr-8 -mt-8 group-hover:scale-[3] transition-transform duration-700`}
            ></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg group-hover:rotate-12 transition-transform duration-500`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-sm ${
                    stat.changeType === "increase"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                      : stat.changeType === "decrease"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30"
                        : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30"
                  }`}
                >
                  {stat.change}
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
                {stat.secondaryValue && (
                  <span className="text-gray-400 text-sm font-bold">
                    {stat.secondaryValue}
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                {stat.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 Detailed Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Trend Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                Attendance Analytics
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Weekly engagement overview
              </p>
            </div>
            <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl p-1 gap-1">
              <button className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold shadow-sm">
                Weekly
              </button>
              <button className="px-4 py-2 text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs font-bold transition-colors">
                Monthly
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#attGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍰 Composition Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            Workforce Mix
          </h3>
          <p className="text-sm text-gray-500 font-medium mb-8">
            Department distribution
          </p>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    workforceMix.length > 0
                      ? workforceMix
                      : [{ name: "Empty", value: 1 }]
                  }
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {workforceMix.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                  {workforceMix.length === 0 && <Cell fill="#e2e8f0" />}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                100%
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Staffed
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {workforceMix.map((dept, idx) => (
              <div
                key={dept.name}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></div>
                  <span className="font-bold text-gray-600 dark:text-gray-400">
                    {dept.name}
                  </span>
                </div>
                <span className="font-black text-gray-900 dark:text-white">
                  {metrics.totalStaff > 0
                    ? Math.round((dept.value / metrics.totalStaff) * 100)
                    : 0}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⚠️ Critical Actions & Approvals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Leaves Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  Pending Approvals
                </h3>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mt-1">
                  {pendingLeaves.length} Requiring Action
                </p>
              </div>
            </div>
            <Link
              to="/hr/leaves"
              className="text-xs font-black text-indigo-500 uppercase tracking-widest hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {pendingLeaves.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-100 mx-auto mb-3" />
                <p className="text-gray-400 font-bold">
                  All caught up! No pending requests.
                </p>
              </div>
            ) : (
              pendingLeaves.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400">
                      {req.applicant?.first_name?.[0]}
                      {req.applicant?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white leading-none">
                        {req.applicant?.first_name} {req.applicant?.last_name}
                      </p>
                      <p className="text-xs font-bold text-gray-400 mt-1">
                        {req.leave_type} • {req.start_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 text-red-500 border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all">
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🏢 Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Briefcase className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Central Staff
                  <br />
                  Directory
                </h3>
                <p className="text-white/60 text-sm mt-2 font-medium">
                  Manage records, contracts, and profiles.
                </p>
              </div>
              <Link
                to="/hr/staff"
                className="mt-8 flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-white hover:text-indigo-600 font-black text-xs uppercase tracking-widest py-3 rounded-2xl backdrop-blur-md transition-all"
              >
                Directory Access <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-800 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group border border-slate-700">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Calendar className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Institutional
                  <br />
                  Calendar
                </h3>
                <p className="text-white/40 text-sm mt-2 font-medium">
                  Configure holidays, events, and academic cycles.
                </p>
              </div>
              <Link
                to="/hr/calendar"
                className="mt-8 flex items-center justify-center gap-2 bg-white/5 hover:bg-white text-white hover:text-slate-900 font-black text-xs uppercase tracking-widest py-3 rounded-2xl backdrop-blur-md transition-all"
              >
                Update Schedule <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
