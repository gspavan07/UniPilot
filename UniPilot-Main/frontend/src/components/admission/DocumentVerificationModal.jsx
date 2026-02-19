import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  UserCheck,
} from "lucide-react";
import api from "../../utils/api";

const DocumentVerificationModal = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchDocuments();
    }
  }, [isOpen, studentId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admission/documents/${studentId}`);
      setDocuments(res.data.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (docId, status) => {
    const remarks = prompt("Add any remarks (optional):");
    try {
      setUpdatingId(docId);
      await api.put(`/admission/documents/${docId}/status`, {
        status,
        remarks,
      });
      fetchDocuments(); // Refresh
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReupload = async (docId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("document", file);

    try {
      setUpdatingId(docId);
      await api.post(`/admission/documents/${docId}/reupload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchDocuments();
    } catch (err) {
      alert("Failed to re-upload document");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyStudent = async () => {
    if (
      !confirm(
        "Are you sure you want to verify this student? This marks their admission as final."
      )
    )
      return;

    try {
      setLoading(true);
      await api.post(`/admission/verify-student/${studentId}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to verify student");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Document Verification
            </h2>
            <p className="text-sm text-gray-500">{studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No documents uploaded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mr-4">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                          {doc.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000"}${doc.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                        title="View Document"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <div
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center ${doc.status === "approved"
                          ? "bg-success-100 text-success-700"
                          : doc.status === "rejected"
                            ? "bg-error-100 text-error-700"
                            : "bg-warning-100 text-warning-700"
                          }`}
                      >
                        {doc.status === "approved" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : doc.status === "rejected" ? (
                          <XCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {doc.status.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {doc.remarks && (
                    <div className="mt-3 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] text-gray-400 font-medium mb-1">
                        REMARKS
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                        "{doc.remarks}"
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end space-x-3">
                    <label className="cursor-pointer mr-auto">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleReupload(doc.id, e.target.files[0])
                        }
                        disabled={updatingId === doc.id}
                      />
                      <div className="flex items-center text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest">
                        <Upload className="w-3 h-3 mr-1" />
                        Re-upload
                      </div>
                    </label>
                    <button
                      disabled={
                        updatingId === doc.id || doc.status === "rejected"
                      }
                      onClick={() => handleUpdateStatus(doc.id, "rejected")}
                      className="btn btn-secondary py-1.5 px-3 text-[10px] bg-white dark:bg-gray-800 border-error-200 text-error-600 hover:bg-error-50"
                    >
                      Reject
                    </button>
                    <button
                      disabled={
                        updatingId === doc.id || doc.status === "approved"
                      }
                      onClick={() => handleUpdateStatus(doc.id, "approved")}
                      className="btn btn-primary py-1.5 px-3 text-[10px] bg-success-600 hover:bg-success-700 border-none shadow-lg shadow-success-600/20"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex space-x-3">
          <button onClick={onClose} className="flex-1 btn btn-secondary py-2.5">
            Close
          </button>
          <button
            onClick={handleVerifyStudent}
            disabled={loading || documents.some((d) => d.status !== "approved")}
            className="flex-[2] btn btn-primary py-2.5 bg-indigo-600 hover:bg-indigo-700 border-none flex items-center justify-center space-x-2 shadow-xl shadow-indigo-500/20 disabled:grayscale disabled:opacity-50"
          >
            <UserCheck className="w-5 h-5" />
            <span>Verify Applicant</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationModal;
