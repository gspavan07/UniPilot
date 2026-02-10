import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Calendar,
  ChevronRight,
  Search,
  BookOpen,
  User as UserIcon,
  RefreshCw,
  Clock,
  Layout,
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  PieChart,
  Download,
  Filter,
} from "lucide-react";
import {
  fetchExamCycles,
  fetchExamSchedules,
  bulkImportMarks,
  downloadTemplate,
} from "../../store/slices/examSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import toast from "react-hot-toast";

const BulkImportModal = ({ isOpen, onClose, cycle, onImportSuccess }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        setImportResults(null);
      } else {
        toast.error("Please upload an Excel or CSV file");
        e.target.value = null;
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file");
    setIsUploading(true);
    try {
      const resultAction = await dispatch(
        bulkImportMarks({ exam_cycle_id: cycle.id, file }),
      );
      if (bulkImportMarks.fulfilled.match(resultAction)) {
        setImportResults(resultAction.payload.data);
        toast.success(resultAction.payload.message);
        setFile(null);
        onImportSuccess();
      } else {
        toast.error(resultAction.payload || "Import failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">
                Bulk Import Results
              </h3>
              <p className="text-xs text-indigo-100 font-medium">{cycle.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {!importResults ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    Download Template First
                  </span>
                </div>
                <button
                  onClick={() => dispatch(downloadTemplate(cycle.id))}
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </button>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="modal-file-upload"
                />
                <label
                  htmlFor="modal-file-upload"
                  className={`w-full flex flex-col items-center justify-center px-4 py-16 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                    file
                      ? "border-green-400 bg-green-50/50 dark:bg-green-900/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10"
                  }`}
                >
                  {file ? (
                    <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
                  ) : (
                    <Upload className="w-16 h-16 text-gray-300 mb-3" />
                  )}
                  <span className="text-base font-bold text-gray-700 dark:text-gray-200">
                    {file ? file.name : "Choose CSV or Excel file"}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-widest">
                    Max 5MB SIZE
                  </span>
                </label>
              </div>

              <button
                disabled={!file || isUploading}
                onClick={handleUpload}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
                  !file || isUploading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30"
                }`}
              >
                {isUploading ? "Processing..." : "Commence Import"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">
                  Import results
                </span>
                <div className="flex gap-2">
                  <span className="text-[10px] font-black bg-green-100 text-green-600 px-3 py-1 rounded-lg uppercase">
                    {importResults.success} success
                  </span>
                  <span className="text-[10px] font-black bg-red-100 text-red-600 px-3 py-1 rounded-lg uppercase">
                    {importResults.failed} failed
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {importResults.errors.length > 0 ? (
                  importResults.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="flex items-start p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium text-red-700 dark:text-red-400 leading-relaxed">
                        {err}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h4 className="font-black text-xl text-gray-900 dark:text-white">
                      Perfect Import!
                    </h4>
                    <p className="text-sm text-gray-500 mt-2">
                      All student marks have been committed successfully.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setImportResults(null)}
                className="w-full py-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
              >
                Import Another File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MarksEntry = () => {
  const dispatch = useDispatch();
  const { cycles, schedules, status } = useSelector((state) => state.exam);
  const { programs } = useSelector((state) => state.programs);
  const { user } = useSelector((state) => state.auth);

  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchExamCycles());
    dispatch(fetchPrograms());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCycle) {
      dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle }));
    }
  }, [selectedCycle, dispatch]);

  const hasPublishPermission = user?.permissions?.includes(
    "exams:results:publish",
  );

  const uniqueBatches = [
    ...new Set(cycles.map((c) => c.batch_year).filter(Boolean)),
  ].sort((a, b) => b - a);
  const uniqueSemesters = [
    ...new Set(cycles.map((c) => c.semester).filter(Boolean)),
  ].sort((a, b) => a - b);

  const filteredCycles = cycles.filter((c) => {
    if (c.cycle_type === "end_semester" && !hasPublishPermission) {
      return false;
    }
    const matchesBatch =
      !selectedBatch || c.batch_year === parseInt(selectedBatch, 10);
    const matchesSemester =
      !selectedSemester || c.semester === parseInt(selectedSemester, 10);

    return matchesBatch && matchesSemester;
  });

  const filteredSchedules = schedules.filter((s) => {
    if (!s.is_teaching && !user?.permissions?.includes("exams:results:entry"))
      return false;

    if (selectedProgram) {
      if (s.programs && s.programs.length > 0 && !s.programs.includes(selectedProgram)) {
        return false;
      }
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      s.course?.name?.toLowerCase().includes(searchLower) ||
      s.course?.code?.toLowerCase().includes(searchLower)
    );
  });

  const activeCycle = cycles.find((c) => c.id === selectedCycle);

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      {/* Header Section - Redesigned */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">
                Marks Entry
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Select an exam cycle and course to start entering student marks
              </p>
            </div>
          </div>

          {activeCycle?.cycle_type === "end_semester" && hasPublishPermission && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Upload className="w-4 h-4 mr-2" /> Bulk Import
            </button>
          )}
        </div>
      </div>

      {/* Filter Section - Redesigned for better visual hierarchy */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd6bTAtNWg3djFoLTd6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase tracking-tight">
              Exam Session Filters
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">
                Batch Year
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border-white/20 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-white outline-none font-bold"
              >
                <option value="" className="text-gray-900">
                  All Batches
                </option>
                {uniqueBatches.map((year) => (
                  <option key={year} value={year} className="text-gray-900">
                    {year} Batch
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border-white/20 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-white outline-none font-bold"
              >
                <option value="" className="text-gray-900">
                  All Semesters
                </option>
                {uniqueSemesters.map((sem) => (
                  <option key={sem} value={sem} className="text-gray-900">
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border-white/20 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-white outline-none font-bold"
              >
                <option value="" className="text-gray-900">
                  All Programs
                </option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id} className="text-gray-900">
                    {prog.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">
                Exam Cycle
              </label>
              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border-white/20 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-white outline-none font-bold"
              >
                <option value="" className="text-gray-900">
                  Choose Cycle
                </option>
                {filteredCycles.map((cycle) => (
                  <option
                    key={cycle.id}
                    value={cycle.id}
                    className="text-gray-900"
                  >
                    {cycle.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeCycle && (
            <div className="mt-6 flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-bold">
                {activeCycle.start_date} to {activeCycle.end_date}
              </span>
            </div>
          )}
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 -mr-10 -mb-10">
          <BookOpen className="w-64 h-64" />
        </div>
      </div>

      {selectedCycle ? (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your assigned courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
              />
            </div>
          </div>

          {/* Courses Grid - Improved card design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 hover:shadow-lg transition-all group overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-md">
                      <Layout className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                      Sem {s.course?.semester}
                    </span>
                  </div>
                  
                  <h3 className="font-black text-lg mb-1 group-hover:text-indigo-600 transition-colors leading-tight">
                    {s.course?.name}
                  </h3>
                  <p className="text-indigo-600 text-sm font-bold mb-4">
                    {s.course?.code}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">
                        {new Date(s.exam_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">
                        {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/marks-entry/${s.id}`}
                    className="w-full py-3 px-4 bg-indigo-600 text-white font-black text-sm rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    Enter Marks <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}

            {filteredSchedules.length === 0 && (
              <div className="col-span-full py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
                <h3 className="text-xl font-black text-gray-400">
                  No Assigned Courses Found
                </h3>
                <p className="text-gray-500 max-w-md mt-2">
                  You are not assigned to any courses in this exam cycle, or no
                  schedules have been created yet.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-24 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl mb-6">
            <Calendar className="w-20 h-20 text-indigo-300 dark:text-indigo-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Select an Exam Cycle
          </h3>
          <p className="text-gray-500 max-w-md">
            Choose an exam cycle from the filters above to view your assigned
            courses and start marks entry.
          </p>
        </div>
      )}

      {activeCycle && (
        <BulkImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          cycle={activeCycle}
          onImportSuccess={() =>
            dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle }))
          }
        />
      )}
    </div>
  );
};

export default MarksEntry;
