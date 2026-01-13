import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowUpCircle,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Search,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Info,
} from "lucide-react";
import { fetchPrograms } from "../../store/slices/programSlice";
import {
  evaluateStudents,
  processPromotions,
  savePromotionCriteria,
} from "../../store/slices/promotionSlice";

const PromotionManager = () => {
  const dispatch = useDispatch();
  const { programs } = useSelector((state) => state.programs);
  const { evaluationResults, status, error } = useSelector(
    (state) => state.promotion
  );

  const [selectedProgram, setSelectedProgram] = useState("");
  const [currentSem, setCurrentSem] = useState(1);
  const [activeTab, setActiveTab] = useState("evaluate"); // evaluate, criteria

  // Criteria State
  const [criteria, setCriteria] = useState({
    min_attendance: 75,
    min_cgpa: 0,
    max_backlogs: 0,
    fee_required: true,
  });

  useEffect(() => {
    dispatch(fetchPrograms());
  }, [dispatch]);

  const handleEvaluate = () => {
    if (!selectedProgram) return;
    dispatch(
      evaluateStudents({
        program_id: selectedProgram,
        current_semester: parseInt(currentSem),
      })
    );
  };

  const handleProcess = () => {
    const eligibleIds = (evaluationResults || [])
      .filter((r) => r.overall_eligible)
      .map((r) => r.student_id);

    if (eligibleIds.length === 0) return;

    const toSemester = evaluationResults?.[0]?.to_semester;

    if (
      window.confirm(
        `Are you sure you want to promote ${eligibleIds.length} students to Semester ${toSemester}?`
      )
    ) {
      dispatch(
        processPromotions({
          student_ids: eligibleIds,
          to_semester: toSemester,
        })
      );
    }
  };

  const handleSaveCriteria = () => {
    dispatch(
      savePromotionCriteria({
        program_id: selectedProgram,
        from_semester: parseInt(currentSem),
        to_semester: parseInt(currentSem) + 1,
        ...criteria,
      })
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-900 dark:text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/40 rounded-2xl text-primary-600 dark:text-primary-400">
            <ArrowUpCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Student Promotion</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage academic progression and lifecycle transitions
            </p>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-4 flex items-center text-sm uppercase tracking-wider text-gray-500">
              <Settings className="w-4 h-4 mr-2" />
              Evaluation Scope
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Program
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                >
                  <option value="">Select Program</option>
                  {programs?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Semester
                </label>
                <select
                  value={currentSem}
                  onChange={(e) => setCurrentSem(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleEvaluate}
                disabled={!selectedProgram || status === "loading"}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center"
              >
                {status === "loading" ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  "Evaluate Students"
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("evaluate")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "evaluate" ? "bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              Promotion List
            </button>
            <button
              onClick={() => setActiveTab("criteria")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "criteria" ? "bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              Criteria Settings
            </button>
          </div>

          {activeTab === "evaluate" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {evaluationResults.length > 0 ? (
                <>
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Evaluation Results</h3>
                      <p className="text-sm text-gray-500">
                        {
                          (Array.isArray(evaluationResults)
                            ? evaluationResults
                            : []
                          ).filter((r) => r.overall_eligible).length
                        }{" "}
                        of {evaluationResults?.length || 0} students are
                        eligible for promotion.
                      </p>
                    </div>
                    <button
                      onClick={handleProcess}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-green-500/20 flex items-center"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Promote Eligible Students
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                        <tr>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Details</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Eligible</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {evaluationResults?.map((result) => (
                          <tr
                            key={result.student_id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold">{result.name}</div>
                              <div className="text-xs text-gray-500">
                                {result.student_code}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3 text-xs">
                                <span
                                  className={`flex items-center ${result.attendance_met ? "text-green-500" : "text-error-500"}`}
                                >
                                  {result.attendance}% Att.
                                </span>
                                <span
                                  className={`flex items-center ${result.cgpa_met ? "text-green-500" : "text-error-500"}`}
                                >
                                  {result.cgpa} CGPA
                                </span>
                                <span
                                  className={`flex items-center ${result.backlogs_met ? "text-green-500" : "text-error-500"}`}
                                >
                                  {result.backlogs} Backlogs
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <ArrowUpCircle className="w-4 h-4 mr-1 text-primary-500" />
                                <span className="text-sm">
                                  Sem {result.from_semester} →{" "}
                                  {result.to_semester}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {result.overall_eligible ? (
                                <CheckCircle className="w-6 h-6 text-green-500 ml-auto" />
                              ) : (
                                <XCircle className="w-6 h-6 text-error-500 ml-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p>Run evaluation to see student eligibility list.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "criteria" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-8">
              <div className="flex items-center space-x-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="p-2 bg-warning-100 dark:bg-warning-900/40 rounded-lg text-warning-600">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Define Promotion Rules</h3>
                  <p className="text-sm text-gray-500">
                    Rules applied when promoting from Semester {currentSem} to{" "}
                    {parseInt(currentSem) + 1}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Minimum Attendance (%)
                    </label>
                    <input
                      type="number"
                      value={criteria.min_attendance}
                      onChange={(e) =>
                        setCriteria({
                          ...criteria,
                          min_attendance: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Minimum CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={criteria.min_cgpa}
                      onChange={(e) =>
                        setCriteria({ ...criteria, min_cgpa: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Max Backlogs Allowed
                    </label>
                    <input
                      type="number"
                      value={criteria.max_backlogs}
                      onChange={(e) =>
                        setCriteria({
                          ...criteria,
                          max_backlogs: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>
                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      checked={criteria.fee_required}
                      onChange={(e) =>
                        setCriteria({
                          ...criteria,
                          fee_required: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 mr-3"
                    />
                    <label className="text-sm font-bold">
                      Require Fee Clearance
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button
                  onClick={handleSaveCriteria}
                  disabled={!selectedProgram}
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary-500/20"
                >
                  Save Evaluation Rules
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionManager;
