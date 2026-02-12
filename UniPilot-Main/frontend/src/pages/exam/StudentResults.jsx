import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trophy,
  BookOpen,
  FileText,
  Award,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  PieChart,
} from "lucide-react";
import { fetchMyResults } from "../../store/slices/examSlice";

const StudentResults = () => {
  const dispatch = useDispatch();
  const { myResults, gpa, status } = useSelector((state) => state.exam);
  const { user } = useSelector((state) => state.auth);
  const [selectedSemester, setSelectedSemester] = React.useState(
    user?.current_semester || 1,
  );

  useEffect(() => {
    dispatch(fetchMyResults({ semester: selectedSemester }));
  }, [dispatch, selectedSemester]);

  const [activeTab, setActiveTab] = React.useState("end_semester");

  const [selectedMidInstance, setSelectedMidInstance] = React.useState(1);

  const calculateGPA = () => {
    return gpa?.currentSemester || "0.00";
  };

  const availableMidInstances = Array.from(
    new Set(
      (myResults?.mid_term || []).map(
        (m) => m.schedule?.cycle?.instance_number || 1,
      ),
    ),
  ).sort((a, b) => a - b);

  const getActiveResults = () => {
    if (!myResults || typeof myResults !== "object") return [];

    if (activeTab === "mid_term") {
      const mids = myResults.mid_term || [];
      if (availableMidInstances.length <= 1) return mids;
      return mids.filter(
        (m) =>
          (m.schedule?.cycle?.instance_number || 1) === selectedMidInstance,
      );
    }
    if (activeTab === "internal_lab")
      return [
        ...(myResults.internal_lab || []),
        ...(myResults.external_lab || []),
      ];
    if (activeTab === "end_semester") return myResults.end_semester || [];
    return [];
  };

  const currentResults = getActiveResults();

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Academic Performance</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your examination results and grade history
            </p>
          </div>
        </div>

        <button className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <Download className="w-4 h-4 mr-2" /> Download Marksheet (PDF)
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
              Current Semester GPA
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {calculateGPA()}
            </p>
          </div>
          <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-50 opacity-10 dark:opacity-5" />
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg border-none relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Overall CGPA
            </h3>
            <p className="text-4xl font-black text-white">
              {gpa?.overall || "0.00"}
            </p>
          </div>
          <Trophy className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            Semester Credits
          </h3>
          <p className="text-3xl font-bold">
            {gpa?.semesterGainedCredits || 0} /{" "}
            {gpa?.semesterPossibleCredits || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            Overall Credits
          </h3>
          <p className="text-3xl font-bold text-indigo-600">
            {gpa?.totalGainedCredits || 0} / {gpa?.totalPossibleCredits || 0}
          </p>
          <div className="mt-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(gpa?.totalGainedCredits / gpa?.totalPossibleCredits) * 100 || 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs & Semester Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl">
            {[
              { id: "end_semester", label: "Semester End", icon: Trophy },
              { id: "mid_term", label: "Mid-Terms", icon: Clock },
              { id: "internal_lab", label: "Internal/Lab", icon: PieChart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                  ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "mid_term" && availableMidInstances.length > 1 && (
            <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/20 p-1 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              {availableMidInstances.map((inst) => (
                <button
                  key={inst}
                  onClick={() => setSelectedMidInstance(inst)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${selectedMidInstance === inst
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-indigo-400 hover:text-indigo-600"
                    }`}
                >
                  Mid {inst}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm font-bold text-gray-500">Semester:</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Sem {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold uppercase text-xs tracking-widest text-gray-400">
            {activeTab.replace("_", " ")} Results
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Subject Code</th>
                <th className="px-6 py-4">Subject Name</th>
                {/* Dynamic Component Headers */}
                {activeTab !== "end_semester" &&
                  Array.from(
                    new Set(
                      currentResults.flatMap(
                        (r) =>
                          r.schedule?.cycle?.component_breakdown?.map(
                            (c) => c.name,
                          ) || [],
                      ),
                    ),
                  ).map((compName) => (
                    <th key={compName} className="px-6 py-4 text-center">
                      {compName}
                    </th>
                  ))}
                {activeTab !== "end_semester" && (
                  <th className="px-6 py-4 text-center">Marks</th>
                )}
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-center">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {currentResults.map((res) => {
                const totalCredits = res.schedule?.course?.credits || 3;
                const earnedCredits =
                  res.grade && !["F", "Ab", "Absent", "MP"].includes(res.grade)
                    ? totalCredits
                    : 0;
                const scores = res.component_scores || {};
                const dynamicComponents = Array.from(
                  new Set(
                    currentResults.flatMap(
                      (r) =>
                        r.schedule?.cycle?.component_breakdown?.map(
                          (c) => c.name,
                        ) || [],
                    ),
                  ),
                );

                return (
                  <tr
                    key={res.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                      {res.schedule?.course?.code || "SUB001"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {res.schedule?.course?.name}
                    </td>

                    {/* Dynamic Component Values */}
                    {activeTab !== "end_semester" &&
                      dynamicComponents.map((compName) => (
                        <td
                          key={compName}
                          className="px-6 py-4 text-center text-sm font-medium"
                        >
                          {scores[compName] ?? "-"}
                        </td>
                      ))}

                    {activeTab !== "end_semester" && (
                      <td className="px-6 py-4 text-center text-sm font-bold">
                        {res.marks_obtained}
                      </td>
                    )}

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-bold ${res.grade === "A+" ||
                          res.grade === "A" ||
                          res.grade === "O"
                          ? "bg-green-100 text-green-700"
                          : res.grade === "F"
                            ? "bg-red-100 text-red-700"
                            : "bg-indigo-100 text-indigo-700"
                          }`}
                      >
                        {res.grade || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center text-sm font-bold">
                      {earnedCredits}/{totalCredits}
                    </td>
                  </tr>
                );
              })}
              {currentResults.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <PieChart className="w-12 h-12 mx-auto mb-3 opacity-10" />
                    <p>No results have been published for this category yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
