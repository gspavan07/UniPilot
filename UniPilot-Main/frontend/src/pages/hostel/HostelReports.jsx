import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Users,
  ClipboardCheck,
  AlertCircle,
  Shield,
  Loader2,
} from "lucide-react";
import { downloadReport } from "../../store/slices/hostelSlice";
import toast from "react-hot-toast";

const ReportCard = ({
  title,
  description,
  icon: Icon,
  color,
  onDownload,
  loading,
}) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group">
    <div
      className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
    >
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 font-display">
      {title}
    </h3>
    <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
      {description}
    </p>
    <button
      onClick={onDownload}
      disabled={loading}
      className="w-full py-4 flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>Download Excel</span>
    </button>
  </div>
);

const HostelReports = () => {
  const dispatch = useDispatch();
  const [downloading, setDownloading] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      await dispatch(downloadReport({ type, params: filters })).unwrap();
      toast.success(`${type} Report Downloaded!`);
    } catch (error) {
      toast.error("Failed to download report");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-3xl">
              <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                Hostel Reports
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium font-display uppercase tracking-widest text-[10px] mt-1">
                Export Data & Analytics
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-600">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: parseInt(e.target.value) })
              }
              className="bg-transparent border-none text-xs font-bold text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
            <select
              value={filters.year}
              onChange={(e) =>
                setFilters({ ...filters, year: parseInt(e.target.value) })
              }
              className="bg-transparent border-none text-xs font-bold text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Occupancy Report"
          description="Detailed list of all students currently allocated to rooms, including bed numbers."
          icon={Users}
          color="bg-blue-500"
          onDownload={() => handleDownload("occupancy")}
          loading={downloading === "occupancy"}
        />
        <ReportCard
          title="Attendance Log"
          description="Monthly attendance records for all students, including night roll calls."
          icon={ClipboardCheck}
          color="bg-emerald-500"
          onDownload={() => handleDownload("attendance")}
          loading={downloading === "attendance"}
        />
        <ReportCard
          title="Complaints Register"
          description="Log of all maintenance complaints submitted with their current status."
          icon={AlertCircle}
          color="bg-orange-500"
          onDownload={() => handleDownload("complaints")}
          loading={downloading === "complaints"}
        />
        <ReportCard
          title="Gate Pass History"
          description="Complete history of student movements and leave requests."
          icon={Shield}
          color="bg-purple-500"
          onDownload={() => handleDownload("gate-passes")}
          loading={downloading === "gate-passes"}
        />
      </div>
    </div>
  );
};

export default HostelReports;
