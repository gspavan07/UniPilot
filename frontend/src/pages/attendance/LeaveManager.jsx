import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  applyForLeave,
  fetchLeaveRequests,
} from "../../store/slices/attendanceSlice";

const LeaveManager = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { leaveRequests, status } = useSelector((state) => state.attendance);

  const [showApply, setShowApply] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: "Sick Leave",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    if (user?.role !== "student") {
      dispatch(fetchLeaveRequests());
    }
  }, [dispatch, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(applyForLeave(formData)).then(() => {
      alert("Application sent successfully");
      setShowApply(false);
    });
  };

  const StudentView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Leave Applications</h2>
        <button
          onClick={() => setShowApply(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Apply for Leave
        </button>
      </div>

      {showApply && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-slide-up">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">
                New Application
              </h3>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Leave Type
              </label>
              <select
                value={formData.leave_type}
                onChange={(e) =>
                  setFormData({ ...formData, leave_type: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option>Sick Leave</option>
                <option>Personal Leave</option>
                <option>Medical Emergency</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Date Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none uppercase text-xs font-bold"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none uppercase text-xs font-bold"
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">
                Reason for Absence
              </label>
              <textarea
                rows="4"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Briefly explain the reason..."
              ></textarea>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowApply(false)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-500/20"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Placeholder list for student view */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400">
        <Clock className="w-16 h-16 mx-auto mb-4 opacity-10" />
        <p>No recent leave applications found.</p>
      </div>
    </div>
  );

  const AdminView = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold">Pending Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {leaveRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm">
                      {req.student?.first_name} {req.student?.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Roll: {req.student?.student_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{req.leave_type}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {req.start_date} → {req.end_date}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-warning-100 text-warning-600 rounded-full text-xs font-bold uppercase">
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-error-50 text-error-600 hover:bg-error-100 rounded-lg transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {leaveRequests.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-10" />
                    No pending leave requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      <header className="flex items-center space-x-4">
        <div className="p-3 bg-warning-100 dark:bg-warning-900/40 rounded-2xl text-warning-600">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Handle absence requests and approvals
          </p>
        </div>
      </header>

      {user?.role === "student" ? <StudentView /> : <AdminView />}
    </div>
  );
};

export default LeaveManager;
