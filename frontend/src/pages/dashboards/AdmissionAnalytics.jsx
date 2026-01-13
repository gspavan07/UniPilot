import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Globe,
  Filter,
  Download,
  Calendar,
  Layers,
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
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import api from "../../utils/api";

const AdmissionAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2024); // Default to a year with data
  const [stats, setStats] = useState({
    batchWise: [],
    deptMix: [],
    funnelData: [],
    geoData: [],
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [batchRes, funnelRes, geoRes] = await Promise.all([
        api.get("/admission/stats", { params: { year: selectedYear } }),
        api.get("/admission/funnel"),
        api.get("/admission/geo-stats"),
      ]);

      setStats({
        batchWise: batchRes.data.data?.batchWise || [],
        deptMix: (batchRes.data.data?.deptWise || []).map((d) => ({
          name: d.department?.name || "Unknown",
          count: parseInt(d.count),
        })),
        funnelData: (funnelRes.data.data || []).map((f) => ({
          name: f.stage,
          value: parseInt(f.count),
        })),
        geoData: (geoRes.data.data || []).map((g) => ({
          name: g.state,
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

  const totalApplications = stats.funnelData[0]?.value || 0;
  const totalEnrolled =
    stats.funnelData[stats.funnelData.length - 1]?.value || 0;
  const conversionRate = totalApplications
    ? ((totalEnrolled / totalApplications) * 100).toFixed(1)
    : 0;

  if (loading) {
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
            Real-time insights across the admission lifecycle
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none cursor-pointer"
            >
              {[2022, 2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  Academic Year {y}
                </option>
              ))}
            </select>
          </div>
          <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-600 dark:text-gray-400">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-none shadow-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              Total Applications
            </span>
          </div>
          <div className="text-3xl font-black">{totalApplications}</div>
          <p className="text-xs mt-2 opacity-80">
            Accumulated via all channels
          </p>
        </div>

        <div className="card p-6 border-none shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              Total Enrolled
            </span>
          </div>
          <div className="text-3xl font-black">{totalEnrolled}</div>
          <p className="text-xs mt-2 opacity-80">
            Successfully joined the academy
          </p>
        </div>

        <div className="card p-6 border-none shadow-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              Conversion Rate
            </span>
          </div>
          <div className="text-3xl font-black">{conversionRate}%</div>
          <p className="text-xs mt-2 opacity-80">
            Lead to Enrollment efficiency
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch-wise Enrollment */}
        <div className="card p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary-500" />
              Batch-wise Enrollment
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
                <p className="text-gray-400 text-xs">
                  No batch data available for this year
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Admission Funnel */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <Filter className="w-4 h-4 mr-2 text-primary-500" />
              Admission Funnel
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            {stats.funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey="value"
                    data={stats.funnelData}
                    isAnimationActive
                  >
                    <LabelList
                      position="right"
                      fill="#888"
                      stroke="none"
                      dataKey="name"
                    />
                    {stats.funnelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 text-xs">
                  No applications found for {selectedYear}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Department Mix */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-primary-500" />
              Department Mix
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
                  No department breakdown available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-primary-500" />
              Geographic Distribution
            </h3>
          </div>
          <div className="h-72 flex items-center justify-center">
            {stats.geoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.geoData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "12px", border: "none" }}
                  />
                  <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 text-xs">
                  No geographic data available
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
