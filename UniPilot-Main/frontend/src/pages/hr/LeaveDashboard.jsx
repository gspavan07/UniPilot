import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Briefcase,
  User,
  Check,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

const LeaveDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const hasPermission =
    user?.role === "super_admin" ||
    user?.permissions?.includes("hr:leaves:manage");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/hr/leave/approvals");
      setApprovals(res.data.data);
    } catch (error) {
      console.error(error);
      // toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (id, status) => {
    try {
      await api.put(`/hr/leave/${id}`, { status });
      toast.success(`Leave ${status} successfully`);
      fetchData();
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header Section */}
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 shadow-sm active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Leave Management
            </h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Review and process pending staff requests
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center justify-center shadow-sm">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading requests...</p>
            </div>
          ) : approvals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                There are no pending leave requests requiring your attention at this moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {approvals.map((req) => (
                <div
                  key={req.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    {/* User Info Column */}
                    <div className="flex-shrink-0 flex md:flex-col items-center md:items-start gap-4 md:w-48 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-2xl shadow-inner">
                          {req.applicant?.first_name?.[0]}
                          {req.applicant?.last_name?.[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                          <div className="w-4 h-4 bg-orange-400 rounded-full border-2 border-white" title="Pending"></div>
                        </div>
                      </div>

                      <div className="text-left">
                        <h4 className="font-bold text-lg text-slate-900 leading-tight">
                          {req.applicant?.first_name} <br className="hidden md:block" /> {req.applicant?.last_name}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {req.applicant?.department?.name || "No Dept"}
                        </p>
                      </div>
                    </div>

                    {/* Request Details Column */}
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-2 mb-1 text-slate-400">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Leave Type</span>
                          </div>
                          <p className="font-bold text-slate-700">{req.leave_type}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-2 mb-1 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                          </div>
                          <p className="font-bold text-slate-700">{req.start_date} <span className="text-slate-300 mx-1">→</span> {req.end_date}</p>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute top-3 left-3 text-slate-300">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.01699V21H14.017ZM16.017 21H21.017C21.5693 21 22.017 20.5523 22.017 20V4C22.017 3.44772 21.5693 3 21.017 3H3.01699C2.46471 3 2.01699 3.44772 2.01699 4V20C2.01699 20.5523 2.46471 21 3.01699 21H7.01699V13.999L14.017 13.999V14.002C15.1216 14.002 16.017 14.8974 16.017 16V21ZM5.01699 18H7.01699V16H5.01699V18ZM5.01699 14H7.01699V12H5.01699V14ZM5.01699 10H7.01699V8H5.01699V10ZM9.01699 10H11.017V8H9.01699V10ZM13.017 10H15.017V8H13.017V10ZM17.017 10H19.017V8H17.017V10ZM17.017 14H19.017V12H17.017V14ZM5.01699 6H7.01699V5H5.01699V6ZM9.01699 6H11.017V5H9.01699V6ZM13.017 6H15.017V5H13.017V6ZM17.017 6H19.017V5H17.017V6Z" /></svg>
                        </div>
                        <p className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 italic text-sm leading-relaxed">
                          "{req.reason}"
                        </p>
                      </div>
                    </div>

                    {/* Actions Column */}
                    {hasPermission && (
                      <div className="flex md:flex-col gap-3 justify-center md:justify-start md:min-w-[140px] border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                        <button
                          onClick={() => handleDecision(req.id, "approved")}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all active:scale-95 group/btn"
                        >
                          <Check className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(req.id, "rejected")}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-4 bg-white text-rose-600 font-bold rounded-xl border-2 border-rose-100 hover:border-rose-200 hover:bg-rose-50 transition-all active:scale-95 group/reject"
                        >
                          <X className="w-5 h-5 group-hover/reject:scale-110 transition-transform" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Placeholder kept for compatibility
const HistoryPlaceholder = () => <div className="w-full h-20 opacity-20"></div>;

export default LeaveDashboard;
