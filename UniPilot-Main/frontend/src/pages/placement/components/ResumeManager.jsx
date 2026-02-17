import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Upload,
  ExternalLink,
  CheckCircle2,
  Info,
} from "lucide-react";
import { uploadResume } from "../../../store/slices/placementSlice";
import toast from "react-hot-toast";

const ResumeManager = ({ onUploadSuccess, className = "" }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { systemFields, loading } = useSelector((state) => state.placement);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    const promise = dispatch(uploadResume(formData)).unwrap();

    toast.promise(promise, {
      loading: "Processing document...",
      success: "Resume updated successfully",
      error: "Upload failed",
    });

    try {
      const result = await promise;
      if (onUploadSuccess && result.resume_url) {
        onUploadSuccess(result.resume_url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resumeUrl = systemFields?.resume;

  const getFullUrl = (url) => {
    if (!url) return "";
    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "";
    const finalUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
    const separator = finalUrl.includes("?") ? "&" : "?";
    return `${finalUrl}${separator}t=${new Date().getTime()}`;
  };

  const fileName = resumeUrl ? resumeUrl.split("/").pop() : "No file selected";

  return (
    <div
      className={`w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden relative ${className}`}
    >
      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Master Resume
            {resumeUrl && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-[10px] font-bold uppercase tracking-wider text-blue-600 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            )}
          </h2>
          <p className="text-gray-500 mt-2 font-medium text-sm leading-relaxed max-w-lg">
            This is your primary document shared with recruiters. Keep it
            polished and always up-to-date.
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10">
        {resumeUrl ? (
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-transparent -z-10 group-hover:from-blue-50/50 transition-colors duration-500"></div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* File Info */}
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative w-14 h-14 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <div className="absolute inset-0 bg-blue-50 rounded-2xl rotate-6 scale-90 -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FileText
                    className="w-7 h-7 text-gray-800 group-hover:text-blue-600 transition-colors"
                    strokeWidth={1.5}
                  />
                </div>

                <div className="min-w-0">
                  <h3
                    className="text-base font-bold text-gray-900 truncate max-w-[200px] md:max-w-md"
                    title={fileName}
                  >
                    {fileName}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase tracking-wider">
                      PDF
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-xs font-medium text-gray-400">
                      Ready for review
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                <a
                  href={getFullUrl(resumeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none h-11 px-5 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center gap-2 hover:border-black hover:text-black transition-all shadow-sm hover:shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </a>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex-1 md:flex-none h-11 px-6 rounded-xl bg-black text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Upload className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                  )}
                  Update
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            // onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer group relative flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30 hover:bg-blue-50/10 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <Upload
                className="w-7 h-7 text-gray-400 group-hover:text-blue-600 transition-colors"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Upload Master Resume
            </h3>
            <p className="text-gray-500 text-center max-w-sm text-sm mb-8 font-medium">
              Drag and drop your PDF here, or click to browse. <br />
              <span className="text-gray-400 text-xs mt-1 block">
                Maximum file size: 10MB
              </span>
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-8 py-3 bg-black text-white rounded-full font-bold text-sm shadow-lg shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-500/20 active:scale-95 transition-all transform duration-200"
            >
              Select PDF File
            </button>
          </div>
        )}

        {/* Pro Tip Footer */}
        <div className="mt-6 flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100/50">
          <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm shrink-0">
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
              Pro Tip
            </span>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Use a professional naming convention like{" "}
              <span className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200 text-gray-800 mx-1">
                firstname_lastname_resume.pdf
              </span>{" "}
              to help recruiters identify your file instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;
