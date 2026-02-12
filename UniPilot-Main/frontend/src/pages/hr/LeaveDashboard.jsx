import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
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
    <div className="max-w-7xl mx-auto space-y-8 pb-10 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Leave Approvals
              </h1>
              <p className="text-blue-100 mt-1">
                Manage pending leave requests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {/* Approvals List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : approvals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <CheckCircle className="w-16 h-16 text-green-100 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
            <p className="text-gray-500">
              No pending leave requests to approve.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((req) => (
              <div
                key={req.id}
                className="card bg-white dark:bg-gray-800 border border-gray-100 hover:shadow-md transition-all p-6"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                      {req.applicant?.first_name?.[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                        {req.applicant?.first_name} {req.applicant?.last_name}
                      </h4>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                        {req.applicant?.role} •{" "}
                        {req.applicant?.department?.name}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <span className="badge badge-neutral">
                          {req.leave_type}
                        </span>
                        <span>
                          {req.start_date} to {req.end_date}
                        </span>
                      </div>
                      <p className="mt-2 text-sm bg-gray-50 p-2 rounded-lg italic text-gray-600 border border-gray-100">
                        "{req.reason}"
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 justify-center">
                    {hasPermission && (
                      <>
                        <button
                          onClick={() => handleDecision(req.id, "approved")}
                          className="btn btn-sm btn-success text-white w-full md:w-32"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(req.id, "rejected")}
                          className="btn btn-sm btn-error text-white w-full md:w-32"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Placeholder not used but kept to avoid breaking if referenced elsewhere strictly
const HistoryPlaceholder = () => <div className="w-full h-20 opacity-20"></div>;

export default LeaveDashboard;
