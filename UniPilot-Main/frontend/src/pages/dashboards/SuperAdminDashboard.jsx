import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  IndianRupee,
  Activity,
  Award,
  Calendar,
  AlertTriangle,
  Server,
  Database,
  ShieldCheck,
  Zap,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  Settings,
  Bell,
  Cpu,
  RefreshCcw,
  Globe,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchSuperAdminStats } from "../../store/slices/dashboardSlice";
import { formatDistanceToNow } from "date-fns";

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, status } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchSuperAdminStats());
    const interval = setInterval(() => {
      dispatch(fetchSuperAdminStats());
    }, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchSuperAdminStats());
  };

  if (status === "loading" && !stats) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600 w-6 h-6" />
        </div>
      </div>
    );
  }

  const kpis = [
    {
      name: "Total Students",
      value: stats?.kpis?.students || 0,
      icon: GraduationCap,
      change: "+12.5%",
      changeType: "increase",
      color: "from-blue-500 to-indigo-600",
    },
    {
      name: "Total Faculty",
      value: stats?.kpis?.faculty || 0,
      icon: Users,
      change: "+3.2%",
      changeType: "increase",
      color: "from-emerald-500 to-teal-600",
    },
    {
      name: "Total Revenue",
      value: `₹${(stats?.kpis?.revenue || 0).toLocaleString()}`,
      icon: IndianRupee,
      change: "+18.4%",
      changeType: "increase",
      color: "from-amber-500 to-orange-600",
    },
    {
      name: "System Uptime",
      value: stats?.health?.uptime || "99.9%",
      icon: Activity,
      change: "Stable",
      changeType: "neutral",
      color: "from-violet-500 to-purple-600",
    },
    {
      name: "NAAC Status",
      value: stats?.kpis?.naac_grade || "A++",
      icon: Award,
      change: "Institutional",
      changeType: "neutral",
      color: "from-rose-500 to-pink-600",
    },
    {
      name: "Active Session",
      value: stats?.kpis?.academic_session || "2023-24",
      icon: Calendar,
      change: "Live",
      changeType: "neutral",
      color: "from-cyan-500 to-blue-600",
    },
  ];

  const quickActions = [
    {
      name: "Add Student",
      icon: Plus,
      color: "text-blue-600",
      bg: "bg-blue-100",
      path: "/student/register",
    },
    {
      name: "Fee Mgmt",
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      path: "/fees",
    },
    {
      name: "Exams Portal",
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-100",
      path: "/exams/schedules",
    },
    {
      name: "Faculty Mgmt",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
      path: "/faculty",
    },
    {
      name: "Attendance",
      icon: TrendingUp,
      color: "text-rose-600",
      bg: "bg-rose-100",
      path: "/attendance",
    },
    {
      name: "Account Settings",
      icon: Settings,
      color: "text-gray-600",
      bg: "bg-gray-100",
      path: "/settings/roles",
    },
    {
      name: "Infrastructure",
      icon: Server,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      path: "/infrastructure",
    },
    {
      name: "Departments",
      icon: Globe,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
      path: "/departments",
    },
  ];

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 space-y-8 p-4 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            University Command Center
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full uppercase tracking-widest">
              Live
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            System Overseer:{" "}
            <span className="text-gray-900 dark:text-gray-200 font-bold">
              {user?.first_name}
            </span>
            . Real-time institution vitals.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <button className="px-4 py-2 text-sm font-bold bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20">
              Kakinada Main
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-all">
              Vizag Branch
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className={`p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ${status === "loading" ? "animate-spin" : ""}`}
          >
            <RefreshCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* AI Insights Bar - Dynamic */}
      <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 rounded-[2rem] p-6 text-white shadow-xl shadow-primary-600/20 relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
            <Cpu className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold flex items-center gap-2">
              AI Predictive Intelligence
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono uppercase">
                Live Data
              </span>
            </h4>
            <p className="text-primary-100 text-sm mt-1 max-w-2xl leading-relaxed">
              {stats?.ai_insight ||
                "Analyzing latest transaction and attendance patterns. Optimization suggestions incoming."}
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-primary-600 font-bold rounded-xl text-sm hover:bg-primary-50 transition-all shadow-lg flex items-center gap-2">
            Detailed Analysis <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((stat, idx) => (
          <div
            key={idx}
            className="group bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg text-white`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-[10px] text-gray-400 font-bold bg-gray-50 dark:bg-gray-900/30 px-2 py-1 rounded-full uppercase tracking-tighter">
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                {stat.name}
              </p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2 font-display">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Analytics: Revenue & Performance */}
        <div className="xl:col-span-8 space-y-8">
          {/* Revenue Trend Area Chart */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Revenue Intelligence
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Monthly collection inflows
                </p>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.analytics?.revenue_trend || []}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions & System Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Functional Quick Actions */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                Rapid Access Modules
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 group transition-all"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center ${action.color} group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm`}
                    >
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 text-center">
                      {action.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Health Component */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Server Infrastructure
                </h3>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase">
                  <Activity className="w-3 h-3" /> Live
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-transparent hover:border-primary-100 transition-all">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      CPU Load (1m)
                    </span>
                  </div>
                  <span className="text-xs font-black text-indigo-600">
                    {stats?.health?.cpu_load || "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-transparent hover:border-primary-100 transition-all">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      Memory Utilization
                    </span>
                  </div>
                  <span className="text-xs font-black text-primary-600">
                    {stats?.health?.db_storage || "0%"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-transparent hover:border-primary-100 transition-all">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      Security Access
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-500 uppercase">
                    Secure
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Section */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 h-[450px]">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
              Academic Program Enrollment Mix
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-around h-full pb-12">
              <div className="w-full md:w-1/2 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.analytics?.enrollment_by_program || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="student_count"
                      nameKey="program_name"
                    >
                      {(stats?.analytics?.enrollment_by_program || []).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            cornerRadius={10}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {stats?.analytics?.enrollment_by_program?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-lg shadow-sm"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {item.program_name}:{" "}
                      <span className="text-gray-900 dark:text-white">
                        {item.student_count}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance Vitals - Separated Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Student Attendance
                </h3>
                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Today
                </div>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={stats?.analytics?.attendance_today || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="status"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[10, 10, 0, 0]}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Staff Attendance
                </h3>
                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Today
                </div>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={stats?.analytics?.staff_attendance_today || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="status"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    radius={[10, 10, 0, 0]}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar: Dynamic Alerts & Activity Feed */}
        <div className="xl:col-span-4 space-y-8">
          {/* Critical Radar Alerts */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Smart Radar
              </h3>
              <AlertTriangle className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              {stats?.alerts?.length > 0 ? (
                stats.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-3xl border-l-4 transition-all hover:translate-x-1 ${
                      alert.type === "high"
                        ? "bg-rose-50 border-rose-500 text-rose-700"
                        : alert.type === "medium"
                          ? "bg-amber-50 border-amber-500 text-amber-700"
                          : "bg-blue-50 border-blue-500 text-blue-700"
                    }`}
                  >
                    <p className="text-sm font-bold leading-tight">
                      {alert.message}
                    </p>
                    <span className="text-[10px] font-black opacity-60 mt-2 block uppercase">
                      {alert.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                  No critical alerts detected today.
                </div>
              )}
            </div>
          </div>

          {/* Live Activity Stream */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8">
              Activity Feed
            </h3>
            <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-gray-100 dark:before:bg-gray-700">
              {stats?.recent_activity?.map((activity, idx) => (
                <div key={idx} className="flex gap-6 relative">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center ring-4 ring-white dark:ring-gray-800 text-primary-600 font-bold overflow-hidden shadow-sm">
                      {activity.actor?.profile_picture ? (
                        <img
                          src={activity.actor.profile_picture}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {activity.actor?.first_name?.[0]}
                          {activity.actor?.last_name?.[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      {activity.actor?.first_name}{" "}
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        {activity.action}
                      </span>
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" />{" "}
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
