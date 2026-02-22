import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  Shield,
  LogIn,
  LogOut,
  Key,
  AlertTriangle,
  RefreshCw,
  User,
  Globe,
  X,
} from "lucide-react";

const ACTION_CONFIG = {
  LOGIN_SUCCESS: {
    label: "Login Success",
    icon: LogIn,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  LOGIN_FAIL: {
    label: "Login Failed",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  LOGIN_BLOCKED: {
    label: "Login Blocked",
    icon: Shield,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  TOKEN_REFRESH: {
    label: "Token Refresh",
    icon: RefreshCw,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  LOGOUT: {
    label: "Logout",
    icon: LogOut,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-100",
  },
  LOGOUT_ALL: {
    label: "Logout All",
    icon: LogOut,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  PASSWORD_CHANGE: {
    label: "Password Changed",
    icon: Key,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
};

const getActionConfig = (action) =>
  ACTION_CONFIG[action] || {
    label: action,
    icon: Activity,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-100",
  };

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedLog, setExpandedLog] = useState(null);

  const fetchActions = useCallback(async () => {
    try {
      const res = await api.get("/audit-logs/actions");
      setActions(res.data.data);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (selectedAction !== "all") params.action = selectedAction;
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/audit-logs", { params });
      setLogs(res.data.data.logs);
      setPagination((prev) => ({ ...prev, ...res.data.data.pagination }));
    } catch (error) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    selectedAction,
    searchTerm,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterReset = () => {
    setSelectedAction("all");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                  System Security
                </span>
                <div className="h-px w-8 bg-gray-100"></div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                Audit <span className="text-blue-600">Log Viewer.</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
                Monitor all authentication events across the system — logins,
                logouts, password changes, and security incidents.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="font-black text-black text-lg">
                {pagination.total}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Total Events
              </span>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-[2rem] p-2 border border-blue-100 shadow-xl shadow-blue-500/5 mb-10 sticky top-4 z-20">
          <div className="flex flex-wrap items-center gap-2 p-2">
            {/* Action Filter */}
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
              <select
                className="pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-gray-100 transition-colors appearance-none min-w-[180px]"
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <option value="all">All Actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {getActionConfig(action).label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-gray-100 transition-colors"
              title="Start Date"
            />
            <span className="text-gray-300 font-bold">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-gray-100 transition-colors"
              title="End Date"
            />

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="SEARCH BY EMAIL, IP, OR ACTION..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-wider text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Reset */}
            {(selectedAction !== "all" ||
              searchTerm ||
              startDate ||
              endDate) && (
              <button
                onClick={handleFilterReset}
                className="p-3 bg-gray-50 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors group"
                title="Reset Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                  Loading audit logs...
                </p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Activity className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-xl font-black text-gray-400">
                No audit events found
              </h3>
              <p className="text-gray-400 text-sm mt-2">
                Adjust your filters or wait for activity to be logged.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Event
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      User
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      IP Address
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Timestamp
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => {
                    const config = getActionConfig(log.action);
                    const IconComp = config.icon;
                    const isExpanded = expandedLog === log.id;

                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          className="hover:bg-blue-50/20 transition-all duration-300 cursor-pointer"
                          onClick={() =>
                            setExpandedLog(isExpanded ? null : log.id)
                          }
                        >
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center`}
                              >
                                <IconComp
                                  className={`w-4 h-4 ${config.color}`}
                                />
                              </div>
                              <span
                                className={`text-xs font-black uppercase tracking-wider ${config.color}`}
                              >
                                {config.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            {log.actor ? (
                              <div>
                                <p className="text-sm font-bold text-black">
                                  {log.actor.first_name} {log.actor.last_name}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono">
                                  {log.actor.email}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400">
                                <User className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">
                                  Unknown
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                {log.ip_address || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600">
                                {formatDate(log.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            {log.details &&
                            Object.keys(log.details).length > 0 ? (
                              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">
                                {isExpanded ? "Hide" : "View"}
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-300 font-bold uppercase">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                        {isExpanded &&
                          log.details &&
                          Object.keys(log.details).length > 0 && (
                            <tr>
                              <td colSpan="5" className="px-8 py-4 bg-gray-50">
                                <div className="rounded-2xl bg-white p-6 border border-gray-100 max-w-2xl">
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    Event Details
                                  </h4>
                                  <div className="space-y-2">
                                    {Object.entries(log.details).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex items-center gap-4"
                                        >
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider min-w-[120px]">
                                            {key.replace(/_/g, " ")}
                                          </span>
                                          <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-lg">
                                            {typeof value === "object"
                                              ? JSON.stringify(value)
                                              : String(value)}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/30">
              <p className="text-xs font-bold text-gray-400">
                Showing{" "}
                <span className="text-black font-black">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="text-black font-black">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}
                </span>{" "}
                of{" "}
                <span className="text-black font-black">
                  {pagination.total}
                </span>{" "}
                events
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const start = Math.max(
                      1,
                      Math.min(pagination.page - 2, pagination.totalPages - 4),
                    );
                    const pageNum = start + i;
                    if (pageNum > pagination.totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                          pageNum === pagination.page
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
