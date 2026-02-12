import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { File, Upload, X, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadResume } from "../../../store/slices/placementSlice";
import toast from "react-hot-toast";

const ResumeManager = () => {
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
      loading: "Updating master resume...",
      success: "Master resume updated successfully!",
      error: "Failed to update resume",
    });

    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resumeUrl = systemFields?.resume;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl">
            <File className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-black text-gray-900 dark:text-white">
            Master Resume
          </h3>
        </div>
        {resumeUrl && (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        )}
      </div>

      <div className="p-8">
        {resumeUrl ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                <File className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                  {resumeUrl.split("/").pop()}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Standard PDF Document
                </p>
              </div>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white dark:bg-gray-800 text-indigo-600 hover:text-indigo-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:scale-110"
                title="View Current Resume"
              >
                <Eye className="w-5 h-5" />
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                Upload New Version
              </button>
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                Uploading a new version replaces the existing one everywhere
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
              <Upload className="w-6 h-6 text-gray-300" />
            </div>
            <h4 className="text-gray-900 dark:text-white font-black">
              No Resume Uploaded
            </h4>
            <p className="text-gray-500 text-sm font-medium mt-1 mb-6">
              You need a master resume to apply for any drive.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            >
              Upload Master Resume
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed uppercase tracking-tighter">
          Pro Tip: Keep your resume file name professional (e.g.,
          firstname_lastname_resume.pdf)
        </p>
      </div>
    </div>
  );
};

export default ResumeManager;
