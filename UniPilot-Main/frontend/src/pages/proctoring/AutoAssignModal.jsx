import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, UserCheck, Loader2 } from "lucide-react";
import api from "../../utils/api";
import { fetchDepartments } from "../../store/slices/departmentSlice";

const AutoAssignModal = ({ isOpen, onClose, onComplete }) => {
  const dispatch = useDispatch();
  const { list: departments } = useSelector((state) => state.departments);
  const [selectedDept, setSelectedDept] = useState("");
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDepartments());
    }
  }, [isOpen, dispatch]);

  const handleAutoAssign = async () => {
    if (!selectedDept) {
      setError("Please select a department");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/proctor/auto-assign", {
        department_id: selectedDept,
        batch_year: batchYear,
      });

      if (response.data.success) {
        onComplete(response.data.message);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Auto-assignment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg text-primary-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Auto-Assign
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 text-sm rounded-xl border border-error-100 dark:border-error-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Batch Year
            </label>
            <input
              type="number"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Note: This will redistribute students in the selected batch evenly
            across all active faculty members in the department.
          </p>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAutoAssign}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl transition-all font-bold flex items-center shadow-lg shadow-primary-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Assign Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoAssignModal;
