import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Wrench,
  Plus,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Filter,
  MessageSquare,
  User,
  Home,
  ChevronRight,
  Loader2,
  Phone,
  Calendar,
} from "lucide-react";
import {
  fetchComplaints,
  createComplaint,
  updateComplaint,
  resetOperationStatus,
} from "../../store/slices/hostelSlice";
import toast from "react-hot-toast";

const HostelComplaints = () => {
  const dispatch = useDispatch();
  const { complaints, status, operationStatus, operationError } = useSelector(
    (state) => state.hostel,
  );
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("active"); // 'active' (pending/in_progress) or 'history' (resolved/cancelled)
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    complaint_type: "plumbing",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    const params = {};
    if (user?.role !== "student") {
      params.month = filters.month;
      params.year = filters.year;
    }
    dispatch(fetchComplaints(params));
  }, [dispatch, filters, user?.role]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success("Complaint registered!");
      setIsModalOpen(false);
      setFormData({
        complaint_type: "plumbing",
        description: "",
        priority: "medium",
      });
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Failed to submit complaint");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch, operationError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createComplaint(formData));
  };

  const handleUpdateStatus = (id, newStatus) => {
    dispatch(updateComplaint({ id, data: { status: newStatus } }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-error-100 text-error-700 border-error-200";
      case "high":
        return "bg-warning-100 text-warning-700 border-warning-200";
      case "medium":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="w-5 h-5 text-success-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-warning-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-error-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "in_progress":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  // Filter complaints based on active tab for students
  const filteredComplaints =
    user?.role === "student"
      ? complaints?.filter((c) => {
        if (activeTab === "active")
          return ["pending", "in_progress"].includes(c.status);
        return ["resolved", "cancelled"].includes(c.status);
      })
      : complaints;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-error-50 dark:bg-error-900/30 rounded-3xl">
            <Wrench className="w-8 h-8 text-error-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
              Maintenance Portal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Track and resolve hostel maintenance requests.
            </p>
          </div>
        </div>
        {user?.role === "student" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center px-8 py-4 bg-error-600 hover:bg-error-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-error-600/30 active:scale-95 group"
          >
            <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
            Report Issue
          </button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {user?.role === "student" ? (
          <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "active"
                  ? "bg-white dark:bg-gray-700 text-error-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
                }`}
            >
              Active Issues
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "history"
                  ? "bg-white dark:bg-gray-700 text-error-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
                }`}
            >
              History
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
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
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
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
        )}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {status === "loading" ? (
          <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700">
            <Loader2 className="w-10 h-10 text-error-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              Loading requests...
            </p>
          </div>
        ) : (
          <>
            {user?.role === "student" ? (
              /* Student View - Cards */
              <div className="grid grid-cols-1 gap-6">
                {filteredComplaints?.length > 0 ? (
                  filteredComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="card bg-white dark:bg-gray-800 p-8 border border-gray-50 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-start space-x-6 flex-1">
                          <div
                            className={`p-4 rounded-[2rem] border-2 ${getPriorityColor(complaint.priority)} flex items-center justify-center shadow-sm`}
                          >
                            {getStatusIcon(complaint.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] bg-primary-50 px-2 py-0.5 rounded-md">
                                {complaint.complaint_type}
                              </span>
                              <span className="text-xs text-gray-400 font-bold">
                                • Room {complaint.room?.room_number || "N/A"}
                              </span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-2 mb-2 line-clamp-1">
                              {complaint.description}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />{" "}
                                {new Date(
                                  complaint.created_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(complaint.status)}`}
                          >
                            {complaint.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-32 bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      All Caught Up!
                    </h3>
                    <p className="text-gray-500 text-sm italic mt-2">
                      {activeTab === "active"
                        ? "You have no active maintenance requests."
                        : "No history of past complaints."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Management View - Table */
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Reporter
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Issue
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Priority
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      {complaints?.length > 0 ? (
                        complaints.map((complaint) => (
                          <tr
                            key={complaint.id}
                            className="hover:bg-gray-50/30 dark:hover:bg-gray-700/20 transition-colors"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center mr-3">
                                  <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-gray-900 dark:text-white">
                                    {complaint.student?.first_name}{" "}
                                    {complaint.student?.last_name}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                    Room {complaint.room?.room_number || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                                  {complaint.complaint_type}
                                </span>
                                <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 truncate w-48">
                                  {complaint.description}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(complaint.priority)}`}
                              >
                                {complaint.priority}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(complaint.status)}`}
                              >
                                {complaint.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center space-x-2">
                                {complaint.status === "pending" && (
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(
                                        complaint.id,
                                        "in_progress",
                                      )
                                    }
                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors"
                                  >
                                    Start
                                  </button>
                                )}
                                {complaint.status === "in_progress" && (
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(
                                        complaint.id,
                                        "resolved",
                                      )
                                    }
                                    className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors"
                                  >
                                    Resolve
                                  </button>
                                )}
                                {complaint.status === "resolved" && (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center">
                              <Search className="w-12 h-12 text-gray-200 mb-4" />
                              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                                No complaints found for this period
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal - Student Report Side */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/20">
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Report Issue
                  </h2>
                  <p className="text-error-500 text-xs font-black uppercase tracking-widest mt-1">
                    Maintenance Request
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-2xl"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Issue Category
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-error-500/10 transition-all shadow-sm"
                    value={formData.complaint_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        complaint_type: e.target.value,
                      })
                    }
                  >
                    <option value="plumbing">Plumbing / Water</option>
                    <option value="electrical">Electrical / Fans</option>
                    <option value="furniture">Furniture / Bed</option>
                    <option value="wifi">Internet / WiFi</option>
                    <option value="cleanliness">Cleaning / Hygiene</option>
                    <option value="other">Other Issues</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Severity / Urgency
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["low", "medium", "urgent"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, priority: p })
                        }
                        className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.priority === p
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-400 border-gray-100"
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Explain the problem in detail so our team can fix it quickly..."
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-error-500/10 transition-all shadow-sm resize-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-5 border-2 border-gray-100 dark:border-gray-700 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={operationStatus === "loading"}
                    className="flex-[2] px-8 py-5 bg-error-600 hover:bg-error-700 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center transition-all shadow-2xl shadow-error-600/30 active:scale-95 disabled:opacity-50"
                  >
                    {operationStatus === "loading" ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "Log Request"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelComplaints;
