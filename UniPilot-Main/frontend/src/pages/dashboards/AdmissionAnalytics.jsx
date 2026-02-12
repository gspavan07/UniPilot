import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Filter,
  Download,
  Calendar,
  Layers,
  PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../../utils/api";

const AdmissionAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [stats, setStats] = useState({
    batchWise: [],
    deptMix: [],
    genderData: [],
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats (Batch-wise & Dept-wise)
      // 2. Fetch Gender Stats
      const [statsRes, genderRes] = await Promise.all([
        api.get("/admission/stats", { params: { year: selectedYear } }),
        api.get("/admission/gender-stats", { params: { year: selectedYear } }),
      ]);

      const batchData = statsRes.data.data?.batchWise || [];
      const deptData = statsRes.data.data?.deptWise || [];
      const genderDataRaw = genderRes.data.data || [];

      // Extract unique batch years for the filter
      const years = batchData.map((b) => b.batch_year).sort((a, b) => b - a); // Descending
      if (years.length > 0) {
        setAvailableYears(years);
        // If current selectedYear is not in list (and list has data), maybe switch?
        // But let's keep user selection or default to latest if not set.
      }

      setStats({
        batchWise: batchData.map((b) => ({
          ...b,
          count: parseInt(b.count),
        })),
        deptMix: deptData.map((d) => ({
          name: d.department?.name || "Unknown",
          count: parseInt(d.count),
        })),
        genderData: genderDataRaw.map((g) => ({
          name: g.gender || "Unknown",
          value: parseInt(g.count),
        })),
      });
    } catch (error) {
      console.error("Failed to fetch admission analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const totalEnrolled = stats.batchWise.reduce((acc, curr) => {
    if (curr.batch_year == selectedYear) return parseInt(curr.count);
    return acc;
  }, 0);

  // Derive total from gender or dept data for current year snapshot
  const currentYearTotal = stats.deptMix.reduce(
    (acc, curr) => acc + curr.count,
    0
  );

  if (loading && stats.batchWise.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500 font-medium text-sm">
          Loading Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Admission Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time insights for Academic Year {selectedYear}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none cursor-pointer"
            >
              {availableYears.length > 0 ? (
                availableYears.map((y) => (
                  <option key={y} value={y}>
                    Batch {y}
                  </option>
                ))
              ) : (
                <option value={selectedYear}>Year {selectedYear}</option>
              )}
            </select>
          </div>
          <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-600 dark:text-gray-400">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-none shadow-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              Total Students ({selectedYear})
            </span>
          </div>
          <div className="text-3xl font-black">{currentYearTotal}</div>
          <p className="text-xs mt-2 opacity-80">Admitted in selected batch</p>
        </div>

        <div className="card p-6 border-none shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              All Time Admitted
            </span>
          </div>
          <div className="text-3xl font-black">
            {stats.batchWise.reduce(
              (acc, curr) => acc + parseInt(curr.count),
              0
            )}
          </div>
          <p className="text-xs mt-2 opacity-80">Across all batches</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch-wise Enrollment */}
        <div className="card p-6 overflow-hidden col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary-500" />
              Batch-wise Enrollment Trend
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            {stats.batchWise.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.batchWise}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="batch_year"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(79, 70, 229, 0.05)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 text-xs">No batch data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Department Mix */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-primary-500" />
              Department Distribution
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            {stats.deptMix.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.deptMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="name"
                  >
                    {stats.deptMix.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none" }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 text-xs">
                  No department data for {selectedYear}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gender Distribution (New) */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <PieIcon className="w-4 h-4 mr-2 text-primary-500" />
              Gender Distribution
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            {stats.genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {stats.genderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none" }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 text-xs">
                  No gender data for {selectedYear}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionAnalytics;
