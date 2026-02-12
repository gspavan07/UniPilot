import React from "react";
import { useSelector } from "react-redux";
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
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
} from "recharts";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    {
      name: "Total Students",
      value: "2,450",
      icon: GraduationCap,
      change: "+12%",
      changeType: "increase",
      color: "bg-primary-500",
    },
    {
      name: "Total Faculty",
      value: "185",
      icon: Users,
      change: "+3%",
      changeType: "increase",
      color: "bg-secondary-500",
    },
    {
      name: "Active Courses",
      value: "42",
      icon: BookOpen,
      change: "-2%",
      changeType: "decrease",
      color: "bg-info-500",
    },
    {
      name: "Attendance Rate",
      value: "94%",
      icon: CheckCircle,
      change: "+5%",
      changeType: "increase",
      color: "bg-success-500",
    },
  ];

  const chartData = [
    { name: "Mon", students: 400, attendance: 95 },
    { name: "Tue", students: 300, attendance: 92 },
    { name: "Wed", students: 200, attendance: 98 },
    { name: "Thu", students: 278, attendance: 90 },
    { name: "Fri", students: 189, attendance: 94 },
    { name: "Sat", students: 239, attendance: 88 },
    { name: "Sun", students: 349, attendance: 91 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Here's what's happening in the university today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="card p-6 flex items-start justify-between border border-transparent hover:border-primary-500/20 group transition-all duration-300"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.name}
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </h3>
              <div className="flex items-center mt-2">
                {stat.changeType === "increase" ? (
                  <ArrowUpRight className="w-4 h-4 text-success-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-error-500 mr-1" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    stat.changeType === "increase"
                      ? "text-success-500"
                      : "text-error-500"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-gray-400 ml-1">
                  v. last month
                </span>
              </div>
            </div>
            <div
              className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
            >
              <stat.icon
                className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Area Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Weekly Attendance Trend
            </h3>
            <select className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-xs font-medium px-3 py-1.5 focus:ring-2 focus:ring-primary-500 cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="colorAttendance"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "600" }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAttendance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Recent Activities
          </h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  {item !== 5 && (
                    <div className="absolute top-10 left-5 w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    New Faculty Registered
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Dr. Sarah Chen joined CSE Dept.
                  </p>
                  <div className="flex items-center text-[10px] text-gray-400 mt-1">
                    <Clock className="w-3 h-3 mr-1" />2 hours ago
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 px-4 rounded-xl text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-200">
            View All Activities
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
