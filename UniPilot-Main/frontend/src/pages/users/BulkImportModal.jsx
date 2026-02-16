import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Loader2,
  ChevronRight,
  Info,
} from "lucide-react";
import { bulkImportUsers } from "../../store/slices/userSlice";

const BulkImportModal = ({
  isOpen,
  onClose,
  forcedRole,
  roleList,
  departmentList,
}) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedRole, setSelectedRole] = useState(forcedRole || "");
  const [selectedDept, setSelectedDept] = useState("");

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (selectedRole) {
      formData.append("role", selectedRole);
      const roleObj = roleList.find((r) => r.slug === selectedRole);
      if (roleObj) formData.append("role_id", roleObj.id);
    }
    if (selectedDept) formData.append("department_id", selectedDept);

    try {
      const resp = await dispatch(bulkImportUsers(formData)).unwrap();
      setResults(resp);
    } catch (err) {
      setError(err || "Failed to process import");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setError(null);
    setLoading(false);
  };

  const downloadTemplate = () => {
    const headers = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "gender",
      "date_of_birth",
      "address",
      "city",
      "state",
      "zip_code",
      "religion",
      "caste",
      "nationality",
      "aadhaar_number",
      "passport_number",
      "student_id",
      "employee_id",
      "admission_number",
      "batch_year",
      "current_semester",
      "joining_date",
      "bank_name",
      "account_number",
      "ifsc_code",
      "branch_name",
      "holder_name",
    ];

    if (selectedRole === "student") {
      headers.push(
        "guardian_type",
        "father_name",
        "father_job",
        "father_income",
        "father_email",
        "father_mobile",
        "mother_name",
        "mother_job",
        "mother_income",
        "mother_email",
        "mother_mobile"
      );
    } else {
      headers.push(
        "designation",
        "specialization",
        "staff_category",
        "experience_years",
        "qualification"
      );
    }

    const blob = new Blob([headers.join(",")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unipilot_import_template_${selectedRole || "users"}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="px-8 py-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white font-display">
              Bulk Enrollment
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Onboard hundreds of users in seconds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!results ? (
            <>
              {/* Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                    Target Role
                  </label>
                  <select
                    className="input text-sm"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={forcedRole}
                  >
                    <option value="">Detect from file</option>
                    {roleList.map((r) => (
                      <option key={r.id} value={r.slug}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                    Default Dept
                  </label>
                  <select
                    className="input text-sm"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="">Select Department...</option>
                    {departmentList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center group ${dragActive
                    ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="w-20 h-20 rounded-3xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-4">
                      <FileSpreadsheet className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs text-error-500 font-bold mt-4 uppercase tracking-widest hover:underline"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-500" />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      Drop CSV or Excel here
                    </p>
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="text-sm text-primary-600 font-bold mt-2 hover:underline"
                    >
                      or browse files
                    </button>
                  </>
                )}
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-error-50 dark:bg-error-900/30 border border-error-500/30 text-error-700 dark:text-error-300 text-sm flex items-start animate-shake">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Template Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-5 flex items-center justify-between border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center mr-4">
                    <Download className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Need a template?
                    </h4>
                    <p className="text-xs text-gray-400">
                      Download our optimized format.
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="btn btn-secondary py-2 text-xs"
                >
                  Download
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={onClose}
                  className="btn btn-secondary flex-1 py-4 text-[10px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="btn btn-primary flex-1 py-4 text-[10px] flex items-center justify-center shadow-xl shadow-primary-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Process Import"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="animate-fade-in space-y-6">
              {/* Results Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-800 rounded-3xl p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-success-500 mx-auto mb-2" />
                  <h3 className="text-3xl font-black text-success-700 dark:text-success-400">
                    {results.success}
                  </h3>
                  <p className="text-[10px] font-black uppercase text-success-600 tracking-widest">
                    Success
                  </p>
                </div>
                <div className="bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800 rounded-3xl p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-error-500 mx-auto mb-2" />
                  <h3 className="text-3xl font-black text-error-700 dark:text-error-400">
                    {results.failed}
                  </h3>
                  <p className="text-[10px] font-black uppercase text-error-600 tracking-widest">
                    Failed
                  </p>
                </div>
              </div>

              {/* Error Detail Scroll */}
              {results.errors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Error Log
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                    {results.errors.map((err, i) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between group"
                      >
                        <div className="flex items-center overflow-hidden">
                          <span className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 text-[10px] font-bold flex items-center justify-center mr-3 shrink-0">
                            {err.row}
                          </span>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                              {err.email}
                            </p>
                            <p className="text-[10px] text-error-500 truncate">
                              {err.error}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={results.failed === 0 ? onClose : reset}
                className="btn btn-primary w-full py-5 text-[10px] shadow-xl"
              >
                {results.failed === 0 ? "Finish & Close" : "Retry Failed Rows"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
