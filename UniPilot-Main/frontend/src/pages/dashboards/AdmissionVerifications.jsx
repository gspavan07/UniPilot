import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  Send,
  UserPlus,
  ArrowRight,
  FileText,
  FileDown,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Filter,
} from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import DocumentVerificationModal from "../../components/admission/DocumentVerificationModal";
import BulkCommunicationModal from "../../components/admission/BulkCommunicationModal";

const AdmissionVerifications = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Initially null, will be set from API
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batches, setBatches] = useState([]);

  const [recentStudents, setRecentStudents] = useState([]);
  const [docModal, setDocModal] = useState({
    isOpen: false,
    studentId: null,
    studentName: "",
  });
  const [isBulkNotifOpen, setIsBulkNotifOpen] = useState(false);

  useEffect(() => {
    fetchActiveBatch();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchStats();
    }
  }, [selectedBatch]);

  const fetchActiveBatch = async () => {
    try {
      // Fetch analytics to get active batch year
      const response = await api.get("/admission/analytics");
      const activeBatchYear = response.data.data.kpis.activeBatchYear;

      setSelectedBatch(activeBatchYear.toString());

      // Also fetch batches list
      fetchBatches(activeBatchYear);
    } catch (error) {
      console.error("Failed to fetch active batch:", error);
      // Fallback to current year
      const currentYear = new Date().getFullYear();
      setSelectedBatch(currentYear.toString());
      fetchBatches(currentYear);
    }
  };

  const fetchBatches = async (activeBatchYear) => {
    try {
      const response = await api.get("/users", {
        params: {
          role: "student",
          fields: "batch_year",
        },
      });

      // Extract unique batch years
      let uniqueBatches = [...new Set(
        response.data.data
          .map(s => s.batch_year)
          .filter(Boolean)
      )];

      // Always include active batch year if not present
      if (activeBatchYear && !uniqueBatches.includes(activeBatchYear)) {
        uniqueBatches.push(activeBatchYear);
      }

      // Sort descending
      uniqueBatches.sort((a, b) => b - a);

      setBatches(uniqueBatches);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      // Fallback to active batch year if fetch fails
      if (activeBatchYear) {
        setBatches([activeBatchYear]);
      }
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [recentRes] = await Promise.all([
        api.get("/users", {
          params: {
            role: "student",
            batch_year: selectedBatch,
            limit: 100,
            sort: "created_at:desc"
          },
        }),
      ]);
      setRecentStudents(recentRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch admission stats:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedBatch]);

  const handleDownloadLetter = async (userId) => {
    try {
      const response = await api.get(`/admission/letter/${userId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Admission_Letter_${userId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download letter:", error);
      alert("Failed to generate admission letter.");
    }
  };

  if (loading && !recentStudents.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">
          Loading verification dashboard...
        </p>
      </div>
    );
  }

  const verifiedCount = recentStudents.filter(s => s.is_verified).length;
  const pendingCount = recentStudents.length - verifiedCount;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700">
          {/* Back button and title row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admission")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to Admission Management"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Student Verifications
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Viewing batch {selectedBatch}-{(parseInt(selectedBatch) + 1).toString().slice(-2)} • {recentStudents.length} students
              </p>

            </div>
            <div className="flex items-center gap-3">
              {/* <Filter className="w-4 h-4 text-gray-400" /> */}
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-4 py-2 w-28 bg-white dark:bg-gray-800 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}-{(batch + 1).toString().slice(-2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters and actions row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

            {/* <div className="flex items-center gap-3">
              <Link
                to="/student/register"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Register Student
              </Link>
              <Link
                to="/students"
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Manage All
              </Link>
            </div> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total
              </span>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white">
              {recentStudents.length}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Recent students
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Verified
              </span>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white">
              {verifiedCount}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Completed verifications
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white">
              {pendingCount}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Awaiting verification
            </p>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Admission
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                          {(student.first_name?.[0] || "") +
                            (student.last_name?.[0] || "")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black dark:text-white">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {student.student_id || student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {student.department?.code || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {student.program?.name || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${student.admission_type === "management"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            }`}
                        >
                          {student.admission_type || "N/A"}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Batch {student.batch_year}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${student.is_verified
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                          }`}
                      >
                        {student.is_verified ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setDocModal({
                              isOpen: true,
                              studentId: student.id,
                              studentName: `${student.first_name} ${student.last_name}`,
                            })
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Verify Documents"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Verify
                        </button>
                        <button
                          onClick={() => handleDownloadLetter(student.id)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Download Letter"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {recentStudents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          No recent applications found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentVerificationModal
        isOpen={docModal.isOpen}
        onClose={() => setDocModal({ ...docModal, isOpen: false })}
        studentId={docModal.studentId}
        studentName={docModal.studentName}
        onSuccess={fetchStats}
      />
      <BulkCommunicationModal
        isOpen={isBulkNotifOpen}
        onClose={() => setIsBulkNotifOpen(false)}
        userCount={100}
      />
    </div>
  );
};

export default AdmissionVerifications;
