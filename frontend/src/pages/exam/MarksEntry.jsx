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
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase tracking-tight">
                Bulk Import Results
              </h3>
              <p className="text-xs text-gray-500 font-medium">{cycle.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {!importResults ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    Download Template First
                  </span>
                </div>
                <button
                  onClick={() => dispatch(downloadTemplate(cycle.id))}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download
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
                  className={`w-full flex flex-col items-center justify-center px-4 py-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${file
                      ? "border-green-400 bg-green-50/50"
                      : "border-gray-200 dark:border-gray-700 hover:border-indigo-400 group-hover:bg-indigo-50/20"
                    }`}
                >
                  {file ? (
                    <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-300 mb-2" />
                  )}
                  <span className="text-sm font-bold">
                    {file ? file.name : "Choose CSV or Excel file"}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">
                    Max 5MB SIZE
                  </span>
                </label>
              </div>

              <button
                disabled={!file || isUploading}
                onClick={handleUpload}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${!file || isUploading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
              >
                {isUploading ? "Processing..." : "Commence Import"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">
                  Import results
                </span>
                <div className="flex gap-2">
                  <span className="text-[10px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded uppercase">
                    {importResults.success} success
                  </span>
                  <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">
                    {importResults.failed} failed
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {importResults.errors.length > 0 ? (
                  importResults.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="flex items-start p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-xs font-medium text-red-700 dark:text-red-400 leading-normal">
                        {err}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                    <h4 className="font-bold text-lg">Perfect Import!</h4>
                    <p className="text-sm text-gray-500">
                      All student marks have been committed successfully.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setImportResults(null)}
                className="w-full py-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-100"
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

  // Derive unique batch years and semesters from cycles
  const uniqueBatches = [
    ...new Set(cycles.map((c) => c.batch_year).filter(Boolean)),
  ].sort((a, b) => b - a);
  const uniqueSemesters = [
    ...new Set(cycles.map((c) => c.semester).filter(Boolean)),
  ].sort((a, b) => a - b);

  // Filter cycles: Students/Faculty shouldn't see "Semester End" in dropdown unless they have specific permission
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
    // 1. Must be teaching this course (Backend identifies this) OR be an admin with entry permission
    if (!s.is_teaching && !user?.permissions?.includes("exams:results:entry"))
      return false;

    // 2. Program Filter
    if (selectedProgram) {
      // If branches is defined and not empty, it must include selectedProgram
      // If branches is empty/null, we assume it's common? 
      // Strategy: If user filters by Program, they usually want specific subjects.
      // But Common subjects (empty branches) should also appear?
      // Let's assume strict filtering: If branches exist, check match. If empty, include.
      if (s.branches && s.branches.length > 0 && !s.branches.includes(selectedProgram)) {
        return false;
      }
    }

    // 3. Search filter
    const searchLower = searchTerm.toLowerCase();
    return (
      s.course?.name?.toLowerCase().includes(searchLower) ||
      s.course?.code?.toLowerCase().includes(searchLower)
    );
  });

  const activeCycle = cycles.find((c) => c.id === selectedCycle);

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Marks Entry</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Select an exam cycle and course to start entering student marks
            </p>
          </div>
        </div>

        {activeCycle?.cycle_type === "end_semester" && hasPublishPermission && (
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <Upload className="w-4 h-4 mr-2" /> Bulk Import results
          </button>
        )}
      </header>

      {/* Cycle Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-3 bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-tight">
              Current Exam Session
            </h2>
            <div className="flex flex-wrap gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="bg-white/20 border-white/20 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-white outline-none font-bold backdrop-blur-md"
                >
                  <option value="" className="text-gray-900">
                    Select Batch
                  </option>
                  {uniqueBatches.map((year) => (
                    <option key={year} value={year} className="text-gray-900">
                      {year} Batch
                    </option>
                  ))}
                </select>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="bg-white/20 border-white/20 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-white outline-none font-bold backdrop-blur-md"
                >
                  <option value="" className="text-gray-900">
                    Select Semester
                  </option>
                  {uniqueSemesters.map((sem) => (
                    <option key={sem} value={sem} className="text-gray-900">
                      Semester {sem}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="bg-white/20 border-white/20 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-white outline-none font-bold backdrop-blur-md"
                >
                  <option value="" className="text-gray-900">
                    Select Program
                  </option>
                  {programs.map((prog) => (
                    <option key={prog.id} value={prog.id} className="text-gray-900">
                      {prog.name} ({prog.code})
                    </option>
                  ))}
                </select>
                <select
                  value={selectedCycle}
                  onChange={(e) => setSelectedCycle(e.target.value)}
                  className="bg-white/20 border-white/20 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-white outline-none font-bold backdrop-blur-md"
                >
                  <option value="" className="text-gray-900">
                    Choose Exam Cycle
                  </option>
                  {filteredCycles.map((cycle) => (
                    <option
                      key={cycle.id}
                      value={cycle.id}
                      className="text-gray-900"
                    >
                      {cycle.name} ({cycle.batch_year}){" "}
                      {cycle.cycle_type === "end_semester"
                        ? "[UNIVERSITY]"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
              {activeCycle && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {activeCycle.start_date} to {activeCycle.end_date}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 -mr-10 -mb-10 text-white">
            <BookOpen className="w-64 h-64" />
          </div>
        </div>
      </div>

      {selectedCycle ? (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your assigned courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Assigned Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                    <Layout className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                    Sem {s.course?.semester}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                  {s.course?.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{s.course?.code}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Exam: {new Date(s.exam_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>
                      {s.start_time.substring(0, 5)} -{" "}
                      {s.end_time.substring(0, 5)}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/marks-entry/${s.id}`}
                  className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  Enter Marks <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}

            {filteredSchedules.length === 0 && (
              <div className="col-span-full py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-12 h-12 text-gray-200 mb-4 animate-spin-slow" />
                <h3 className="text-lg font-bold">No Assigned Courses Found</h3>
                <p className="text-gray-500 max-w-sm">
                  You are not assigned to any courses in this exam cycle, or no
                  schedules have been created yet.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <Calendar className="w-16 h-16 text-indigo-100 mb-4" />
          <h3 className="text-xl font-bold">Select an Exam Cycle</h3>
          <p className="text-gray-500 max-w-sm mt-2">
            Choose an exam cycle from the dropdown above to view your assigned
            courses and start entry.
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
