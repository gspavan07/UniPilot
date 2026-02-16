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
const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, status } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);
  const [selectedBatch, setSelectedBatch] = React.useState("all");

  useEffect(() => {
    dispatch(fetchSuperAdminStats(selectedBatch));
  }, [dispatch, selectedBatch]);

  const handleRefresh = () => {
    dispatch(fetchSuperAdminStats(selectedBatch));
  };

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      year: "2-digit",
    }).format(date);
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
      // change: "+12.5%",
      changeType: "increase",
      color: "from-blue-500 to-indigo-600",
    },
    {
      name: "Total Faculty",
      value: stats?.kpis?.faculty || 0,
      icon: Users,
      // change: "+3.2%",
      changeType: "increase",
      color: "from-emerald-500 to-teal-600",
    },
    {
      name: "Collected Revenue",
      value: `₹${(stats?.kpis?.revenue || 0).toLocaleString()}`,
      icon: IndianRupee,
      // change: "Received",
      changeType: "neutral",
      color: "from-amber-500 to-orange-600",
    },
    {
      name: "Academic Depts",
      value: stats?.kpis?.academic_depts || 0,
      icon: Globe,
      // change: "Institutional",
      changeType: "neutral",
      color: "from-violet-500 to-purple-600",
    },
    {
      name: "Admin Depts",
      value: stats?.kpis?.admin_depts || 0,
      icon: ShieldCheck,
      // change: "Operations",
      changeType: "neutral",
      color: "from-zinc-500 to-slate-600",
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
      name: "Roles & Permissions",
      icon: Settings,
      color: "text-gray-600",
      bg: "bg-gray-100",
      path: "/settings/roles",
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
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <Calendar className="w-4 h-4 text-primary-600" />
            <select
              value={selectedBatch}
              onChange={handleBatchChange}
              className="bg-transparent text-sm font-bold border-none outline-none cursor-pointer"
            >
              <option value="all">All Batches</option>
              {stats?.analytics?.batches?.map((b) => (
                <option key={b} value={b}>
                  Batch {b}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ${status === "loading" ? "animate-spin" : ""}`}
          >
            <RefreshCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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

        {/* Enrollment Section */}
        <div className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            Academic Program Enrollment Mix
          </h3>
          <div className="flex  items-center justify-center space-y-6">
            <div className="w-full h-[300px]">
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
            <div className="flex flex-col gap-x-6 gap-y-3 w-full">
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
        {/* Revenue Trend Area Chart - Full Width */}
        <div className="lg:col-span-2 xl:col-span-3 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Revenue Intelligence
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Analysis of actual revenue inflows
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500 shadow-lg shadow-primary-200"></div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Collected
                </span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.analytics?.revenue_trend || []}>
                <defs>
                  <linearGradient
                    id="colorCollected"
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
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#64748b" }}
                  tickFormatter={formatMonth}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#64748b" }}
                  tickFormatter={(value) =>
                    `₹${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "20px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)",
                    padding: "12px 16px",
                  }}
                  itemStyle={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                  labelStyle={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#64748b",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                  }}
                  labelFormatter={formatMonth}
                  formatter={(value) => [formatCurrency(value), "Collected"]}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Collected"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
