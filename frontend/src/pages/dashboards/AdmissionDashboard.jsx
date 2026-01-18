import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Clock,
  Send,
  UserPlus,
  ArrowRight,
  FileText,
  FileDown,
} from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import DocumentVerificationModal from "../../components/admission/DocumentVerificationModal";
import BulkCommunicationModal from "../../components/admission/BulkCommunicationModal";

const AdmissionDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  const [recentStudents, setRecentStudents] = useState([]);
  const [docModal, setDocModal] = useState({
    isOpen: false,
    studentId: null,
    studentName: "",
  });
  const [isBulkNotifOpen, setIsBulkNotifOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [recentRes] = await Promise.all([
        api.get("/users", {
          params: { role: "student", limit: 10, sort: "created_at:desc" },
        }),
      ]);
      setRecentStudents(recentRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch admission stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500 font-medium">
          Loading admission dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="card overflow-hidden border-none shadow-xl">
        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Student Verification & Operations
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              Active candidates awaiting document verification and admission
              letters
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/student/register"
              className="px-6 py-3 bg-white text-primary-600 rounded-2xl font-black text-sm flex items-center justify-center shadow-lg hover:bg-primary-50 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 mr-3" />
              Register Student
            </Link>
            <Link to="/students" className="btn btn-secondary text-xs px-4">
              Manage All Students
            </Link>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Candidate Info
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Academic Details
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                  Quick Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xs font-bold mr-4 shadow-md group-hover:scale-110 transition-transform">
                        {(student.first_name?.[0] || "") +
                          (student.last_name?.[0] || "")}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {student.student_id || student.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {student.department?.code || "N/A"}
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium truncate w-40">
                      {student.program?.name || "N/A"}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit ${
                          student.admission_type === "management"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {student.admission_type || "N/A"}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 font-medium">
                        Batch {student.batch_year}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit ${
                        student.is_verified
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {student.is_verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() =>
                          setDocModal({
                            isOpen: true,
                            studentId: student.id,
                            studentName: `${student.first_name} ${student.last_name}`,
                          })
                        }
                        className="flex items-center px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all border border-primary-200/50 dark:border-primary-800/50"
                        title="Verify Documents"
                      >
                        <FileText className="w-3.5 h-3.5 mr-2" />
                        Verify
                      </button>
                      <button
                        onClick={() => handleDownloadLetter(student.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
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
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-3" />
                      <p className="text-gray-400 text-sm font-medium">
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

      {/* Modals */}
      <DocumentVerificationModal
        isOpen={docModal.isOpen}
        onClose={() => setDocModal({ ...docModal, isOpen: false })}
        studentId={docModal.studentId}
        studentName={docModal.studentName}
      />
      <BulkCommunicationModal
        isOpen={isBulkNotifOpen}
        onClose={() => setIsBulkNotifOpen(false)}
        userCount={100} // Hardcoded for simplified view since we removed complex stats
      />
    </div>
  );
};

export default AdmissionDashboard;
