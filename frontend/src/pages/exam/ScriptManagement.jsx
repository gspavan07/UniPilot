import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Upload,
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import {
  uploadScripts,
  updateScriptVisibility,
  getUploadedScripts,
  clearMessages,
} from "../../redux/slices/reverificationSlice";
import api from "../../utils/api";

const ScriptManagement = () => {
  const dispatch = useDispatch();
  const { scripts, loading, error, success } = useSelector(
    (state) => state.reverification,
  );

  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [examCycles, setExamCycles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchExamCycles();
  }, []);

  useEffect(() => {
    if (selectedCycle) {
      fetchSchedules();
    }
  }, [selectedCycle]);

  useEffect(() => {
    if (selectedCycle) {
      dispatch(getUploadedScripts({ exam_cycle_id: selectedCycle }));
    }
  }, [selectedCycle, dispatch]);

  useEffect(() => {
    if (success || error) {
      setTimeout(() => dispatch(clearMessages()), 3000);
    }
  }, [success, error, dispatch]);

  const fetchExamCycles = async () => {
    try {
      const response = await api.get("/exam/cycles");
      setExamCycles(response.data.data || []);
    } catch (err) {
      console.error("Error fetching cycles:", err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await api.get("/exam/schedules", {
        params: { exam_cycle_id: selectedCycle },
      });
      setSchedules(response.data.data || []);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (!selectedSchedule || files.length === 0) {
      alert("Please select an exam schedule and upload files");
      return;
    }

    setUploading(true);
    await dispatch(
      uploadScripts({
        examScheduleId: selectedSchedule,
        files,
      }),
    );
    setUploading(false);
    setFiles([]);
    dispatch(getUploadedScripts({ exam_cycle_id: selectedCycle }));
  };

  const handleToggleVisibility = (isVisible) => {
    if (
      confirm(`Make scripts ${isVisible ? "visible" : "hidden"} to students?`)
    ) {
      dispatch(
        updateScriptVisibility({
          exam_cycle_id: selectedCycle,
          is_visible: isVisible,
        }),
      ).then(() => {
        dispatch(getUploadedScripts({ exam_cycle_id: selectedCycle }));
      });
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredScripts = scripts.filter(
    (s) =>
      s.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Professional Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-8 py-5 flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Script Management
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              Examination Cell • Administrative Control
            </p>
          </div>
          <div className="flex items-center gap-4">
            {selectedCycle && (
              <>
                <button
                  onClick={() => handleToggleVisibility(true)}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <Eye size={14} /> Make All Visible
                </button>
                <button
                  onClick={() => handleToggleVisibility(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2"
                >
                  <EyeOff size={14} /> Hide All Scripts
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Status Notifications */}
        {(success || error) && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 transition-opacity ${
              success
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}
          >
            {success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-bold uppercase tracking-wide">
              {success || error}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Config & Upload */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Configuration
                </span>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                    Examination Cycle
                  </label>
                  <select
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  >
                    <option value="">Select Cycle</option>
                    {Array.isArray(examCycles) &&
                      examCycles.map((cycle) => (
                        <option key={cycle.id} value={cycle.id}>
                          {cycle.name} ({cycle.year})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                    Target Subject
                  </label>
                  <select
                    value={selectedSchedule}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    disabled={!selectedCycle}
                  >
                    <option value="">Select Subject</option>
                    {Array.isArray(schedules) &&
                      schedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.course?.code} - {schedule.course?.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Bulk Script Upload
                </span>
                <span className="text-[9px] font-bold text-slate-300">
                  .PDF ONLY
                </span>
              </div>
              <div className="p-6">
                <div className="border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-2xl p-8 text-center bg-slate-50/30 dark:bg-gray-900/30 hover:bg-slate-50 dark:hover:bg-gray-900 transition-all group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-gray-600 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                      <Upload size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Choose Script Files
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Format: rollnumber_course.pdf
                    </p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText
                              size={14}
                              className="text-slate-400 flex-shrink-0"
                            />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-gray-400 truncate">
                              {file.name}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setFiles(files.filter((_, i) => i !== idx))
                            }
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || !selectedSchedule}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:bg-slate-200 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        `Upload ${files.length} Scripts`
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] shadow-sm overflow-hidden min-h-[700px] flex flex-col">
              {/* List Header */}
              <div className="p-6 border-b border-slate-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search Index/Roll Number/Student Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-slate-100 dark:border-gray-700">
                  Showing {filteredScripts.length} Record(s)
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 dark:border-gray-700">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Student Identification
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Subject
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Metadata
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                        Visibility
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                        Engagement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-24 text-center">
                          <div className="inline-block w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Syncing Scripts...
                          </p>
                        </td>
                      </tr>
                    ) : filteredScripts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-32 text-center">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="text-slate-200" size={32} />
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            No Script Records Found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredScripts.map((script) => (
                        <tr
                          key={script.id}
                          className="group hover:bg-indigo-50/20 transition-colors"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-xl flex items-center justify-center text-slate-400 text-xs font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {script.student?.first_name?.charAt(0) || "S"}
                              </div>
                              <div>
                                <div className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-tight">
                                  {script.student?.first_name}{" "}
                                  {script.student?.last_name}
                                </div>
                                <div className="text-[10px] font-bold text-indigo-500 mt-0.5">
                                  {script.student?.student_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-[11px] font-black text-slate-600 dark:text-gray-300 uppercase tracking-wide truncate max-w-[200px]">
                              {script.schedule?.course?.name}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                              {script.schedule?.course?.code}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              {(script.file_size / 1024).toFixed(1)} KB
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1">
                              {new Date(script.uploaded_at).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <span
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${
                                  script.is_visible
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-slate-50 text-slate-500 border-slate-100 dark:bg-gray-900/50 dark:border-gray-700"
                                }`}
                              >
                                {script.is_visible ? (
                                  <>
                                    <CheckCircle size={10} /> Published
                                  </>
                                ) : (
                                  <>
                                    <EyeOff size={10} /> Internal
                                  </>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-black text-slate-700 dark:text-white">
                                {script.view_count}
                              </span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                Views
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptManagement;
