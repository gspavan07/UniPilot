import {
  Upload,
  X,
  HelpCircle,
  Loader,
  AlertCircle,
  FileImage,
} from "lucide-react";
import api from "../../utils/api";
import { useState } from "react";

const BulkPhotoUploadModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setReport(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setReport(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });

    try {
      // Direct axios call or use api service if it supports formData properly
      // Assuming api wrapper adds headers. If not, might need 'Content-Type': 'multipart/form-data'
      // But axios sets it automatically for FormData.
      const response = await api.post("/admission/photos/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setReport(response.data.report);
      setFiles([]); // Clear selection on success
    } catch (err) {
      console.error("Upload failed", err);
      setError(err.response?.data?.error || "Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setReport(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary-500" />
              Bulk Photo Upload
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload folder of student photos
            </p>
          </div>
          <button
            onClick={reset}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {!report ? (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                      Instructions
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      1. File names MUST match the <strong>Student ID</strong>{" "}
                      exactly (e.g., <code>2024CSE101.jpg</code>).
                      <br />
                      2. Supported formats: JPG, PNG, WEBP.
                      <br />
                      3. Max size: 5MB per file.
                    </p>
                  </div>
                </div>
              </div>

              {/* Drop Zone / File Input */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 hover:border-primary-500 transition-colors text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-2">
                    <FileImage className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {files.length > 0
                      ? `${files.length} files selected`
                      : "Click to select photos"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    or drag and drop them here
                  </span>
                </label>
              </div>

              {files.length > 0 && (
                <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                    Selected Files
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {files.map((f, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{f.name}</span>
                        <span className="text-gray-400">
                          {(f.size / 1024).toFixed(1)} KB
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          ) : (
            // Report View
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Uploaded
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {report.total}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-100 dark:border-green-800/30">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Success
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {report.success}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center border border-red-100 dark:border-red-800/30">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Failed
                  </p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {report.failed}
                  </p>
                </div>
              </div>

              {report.details.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Failed Files
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      (Check IDs)
                    </span>
                  </h4>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                        <tr>
                          <th className="p-2 pl-4">File</th>
                          <th className="p-2">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {report.details.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="p-2 pl-4 font-mono text-gray-700 dark:text-gray-300">
                              {item.file}
                            </td>
                            <td className="p-2 text-red-500">{item.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {report.updates && report.updates.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-4">
                    Matched
                  </h4>
                  <p className="text-sm text-gray-500">
                    Updated profile pictures for:{" "}
                    {report.updates
                      .map((u) => u.user)
                      .slice(0, 5)
                      .join(", ")}{" "}
                    {report.updates.length > 5
                      ? `and ${report.updates.length - 5} more`
                      : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
          {!report ? (
            <>
              <button
                onClick={reset}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="btn btn-primary flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Photos
                  </>
                )}
              </button>
            </>
          ) : (
            <button onClick={reset} className="btn btn-primary">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkPhotoUploadModal;
