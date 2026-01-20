import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Search,
  Filter,
  LayoutDashboard,
  CheckCircle,
  RefreshCw,
  Download,
  ShieldCheck,
  ChevronRight,
  Award,
} from "lucide-react";
import {
  fetchExamCycles,
  fetchConsolidatedResults,
  updateModerationStatus,
  bulkPublishResults,
} from "../../store/slices/examSlice";
import { fetchPrograms } from "../../store/slices/programSlice";

const PublishMarks = () => {
  const dispatch = useDispatch();
  const { cycles } = useSelector((state) => state.exam);
  const { programs } = useSelector((state) => state.programs);
  const { user } = useSelector((state) => state.auth);

  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchExamCycles());
    dispatch(fetchPrograms());
  }, [dispatch]);

  // Derive unique batch years and semesters from cycles
  const uniqueBatches = [
    ...new Set(cycles.map((c) => c.batch_year).filter(Boolean)),
  ].sort((a, b) => b - a);
  const uniqueSemesters = [
    ...new Set(cycles.map((c) => c.semester).filter(Boolean)),
  ].sort((a, b) => a - b);

  // Filter cycles based on selected batch and semester
  const filteredCycles = cycles.filter((c) => {
    const matchesBatch =
      !selectedBatch || c.batch_year === parseInt(selectedBatch);
    const matchesSemester =
      !selectedSemester || c.semester === parseInt(selectedSemester);
    return matchesBatch && matchesSemester;
  });

  const activeCycle = cycles.find((c) => c.id === selectedCycle);

  const handleFetchResults = async () => {
    if (!selectedCycle || !selectedProgram) return;

    setLoading(true);
    try {
      const res = await dispatch(
        fetchConsolidatedResults({
          exam_cycle_id: selectedCycle,
          program_id: selectedProgram,
          section: selectedSection,
          semester: activeCycle.semester,
          batch_year: activeCycle.batch_year,
        }),
      ).unwrap();
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedCycle) {
      alert("Please select an Exam Cycle first.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to publish these results? Students will be able to see their marks.",
      )
    )
      return;

    setLoading(true);
    try {
      const res = await dispatch(
        bulkPublishResults({
          exam_cycle_id: selectedCycle,
          program_id: selectedProgram,
          section: selectedSection,
          batch_year: selectedBatch,
          semester: selectedSemester,
        }),
      ).unwrap();
      alert(res.message || "Results published successfully!");
      handleFetchResults(); // Refresh table
    } catch (err) {
      alert(err || "Failed to publish results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Publish Marks</h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px]">
              {results[0]?.reportType ||
                "Review consolidated student performance and publish final results"}
            </p>
          </div>
        </div>
        <button
          onClick={handlePublish}
          disabled={!selectedCycle || loading}
          className="flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4 mr-2" />
          )}
          Publish Results
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Batch (Year)
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="">All Batches</option>
              {uniqueBatches.map((year) => (
                <option key={year} value={year}>
                  {year} Batch
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="">All Semesters</option>
              {uniqueSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Exam Cycle
            </label>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="">Select Cycle</option>
              {filteredCycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Program
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="">All Sections</option>
              {["A", "B", "C", "D"].map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleFetchResults}
            disabled={!selectedCycle || !selectedProgram || loading}
            className="w-full py-2.5 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            View Results
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">
                    {results[0]?.isFinalSemester
                      ? "Course-wise Performance (%)"
                      : "Cycle Scores"}
                  </th>
                  {results[0]?.isFinalSemester && (
                    <th className="px-6 py-4 text-center">Semester SGPA</th>
                  )}
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">
                        {row.first_name} {row.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {row.student_id} | Sec {row.section}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {row.courses.map((c) => (
                          <div
                            key={c.course_code}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-[10px] font-bold"
                          >
                            <span className="text-gray-400 mr-1">
                              {c.course_code}:
                            </span>
                            <span
                              className={
                                c.grade === "F"
                                  ? "text-red-500"
                                  : "text-indigo-600 dark:text-indigo-400"
                              }
                            >
                              {row.isFinalSemester
                                ? `${c.grade} (${c.totalScore}%)`
                                : `${c.totalScore}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    {row.isFinalSemester && (
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-black">
                          {row.sgpa}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      {row.moderation_status === "locked" ? (
                        <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold text-xs uppercase">
                          <ShieldCheck className="w-3 h-3" /> Published
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 text-amber-600 font-bold text-xs uppercase">
                          <FileText className="w-3 h-3" /> Draft
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <LayoutDashboard className="w-16 h-16 text-gray-100 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-bold">No Data Generated</h3>
            <p className="text-gray-500 max-w-sm">
              Select filters above to view the consolidated result sheet for a
              specific batch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishMarks;
