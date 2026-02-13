import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ClipboardCheck,
  UserPlus,
  Sliders,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Users,
  GraduationCap,
  Globe,
  MapPin,
  Filter,
  Calendar,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { fetchAdmissionAnalytics } from "../../store/slices/admissionSlice";

const AdmissionManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { analytics, status, error } = useSelector((state) => state.admission);
  const [selectedBatch, setSelectedBatch] = useState("all");

  useEffect(() => {
    dispatch(fetchAdmissionAnalytics(selectedBatch));
  }, [dispatch, selectedBatch]);

  // Color mapping for charts
  const CHART_COLORS = {
    gender: {
      Male: "#3b82f6",
      Female: "#ec4899",
      Other: "#8b5cf6",
    },
    caste: {
      General: "#3b82f6",
      OBC: "#10b981",
      SC: "#f59e0b",
      ST: "#8b5cf6",
      "": "#6b7280",
    },
    default: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"],
  };

  // Map data to include colors
  const genderDataWithColors = analytics.gender.map((item) => ({
    ...item,
    color: CHART_COLORS.gender[item.name] || CHART_COLORS.default[0],
  }));

  const casteDataWithColors = analytics.caste.map((item) => ({
    ...item,
    color: CHART_COLORS.caste[item.name] || CHART_COLORS.default[0],
  }));

  const religionDataWithColors = analytics.religion.map((item, idx) => ({
    ...item,
    color: CHART_COLORS.default[idx % CHART_COLORS.default.length],
  }));

  const countryDataWithColors = analytics.country.map((item, idx) => ({
    ...item,
    color: CHART_COLORS.default[idx % CHART_COLORS.default.length],
  }));

  const departmentDataWithColors = analytics.departments.map((item, idx) => ({
    ...item,
    color: CHART_COLORS.default[idx % CHART_COLORS.default.length],
  }));


  // Statistics cards using live data
  const stats = [
    {
      name: "Total Admissions",
      value: analytics.kpis.totalAdmissions.toString(),
      change: selectedBatch === "all" ? "All Batches" : selectedBatch,
      icon: Users,
      color: "from-blue-500 to-indigo-600",
    },
    {
      name: "Active Batch",
      value: analytics.kpis.activeBatch,
      change: "Live",
      icon: Calendar,
      color: "from-emerald-500 to-teal-600",
    },
    {
      name: "Departments",
      value: analytics.kpis.departments.toString(),
      change: "Programs",
      icon: GraduationCap,
      color: "from-purple-500 to-violet-600",
    },
    {
      name: "International",
      value: analytics.kpis.international.toString(),
      change: `${analytics.kpis.internationalPercentage}%`,
      icon: Globe,
      color: "from-amber-500 to-orange-600",
    },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-black dark:text-white mb-1">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading admission analytics...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Failed to load data"}</p>
          <button
            onClick={() => dispatch(fetchAdmissionAnalytics(selectedBatch))}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Admission Analytics
              </h1>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-md">
                {analytics.kpis.activeBatch}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comprehensive insights into student admissions and demographics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-4 py-2 w-32 bg-white dark:bg-gray-800 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Batches</option>
              {analytics.batches.map((batch) => (
                <option key={batch} value={batch.split("-")[0]}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {stat.name}
              </p>
              <h3 className="text-2xl font-bold text-black dark:text-white">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Main Charts Row with Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* Growth Trend Chart */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Admission Growth Trends
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Year-over-year enrollment analysis
                </p>
              </div>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.batchGrowth}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="batch"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorStudents)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Departments
              </h3>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentDataWithColors}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="students"
                    nameKey="name"
                  >
                    {departmentDataWithColors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {departmentDataWithColors.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {dept.name}
                    </span>
                  </div>
                  <span className="font-semibold text-black dark:text-white">
                    {dept.students}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col">
              <h3 className="text-base font-semibold text-black dark:text-white mb-3 px-1">
                Quick Actions
              </h3>

              <div className="flex flex-col gap-2">
                {/* Verifications */}
                <button
                  onClick={() => navigate("/admission/verifications")}
                  className="group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 
        hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-md 
        bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400
        group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-black dark:text-white leading-tight">
                      Verifications
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Verify documents
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 
        group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Register */}
                <button
                  onClick={() => navigate("/student/register")}
                  className="group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 
        hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-md 
        bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400
        group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-black dark:text-white leading-tight">
                      Register Student
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Add new student
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 
        group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Config */}
                <button
                  onClick={() => navigate("/admission/settings")}
                  className="group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 
        hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-md 
        bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400
        group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Sliders className="w-4 h-4" />
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-black dark:text-white leading-tight">
                      Config
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Manage settings
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 
        group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demographics Section */}
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            Demographics Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gender */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-black dark:text-white mb-4">
                Gender Distribution
              </h4>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderDataWithColors}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                      nameKey="name"
                    >
                      {genderDataWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {genderDataWithColors.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-black dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Caste */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-black dark:text-white mb-4">
                Caste Category
              </h4>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={casteDataWithColors}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                      nameKey="name"
                    >
                      {casteDataWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {casteDataWithColors.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-black dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Religion */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-black dark:text-white mb-4">
                Religion Distribution
              </h4>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={religionDataWithColors}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                      nameKey="name"
                    >
                      {religionDataWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {religionDataWithColors.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-black dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Country */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-semibold text-black dark:text-white">
                  Country
                </h4>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={countryDataWithColors}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                      nameKey="name"
                    >
                      {countryDataWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {countryDataWithColors.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-black dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* State Distribution */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white">
                State-wise Distribution (India)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Geographic spread of domestic students
              </p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.states}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#374151" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="students" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={24}>
                  {analytics.states.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


      </div>
    </div>
  );
};

export default AdmissionManagement;
