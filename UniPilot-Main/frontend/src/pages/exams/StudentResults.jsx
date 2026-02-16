import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trophy,
  BookOpen, // Preserved
  FileText, // Preserved
  Award,
  Download,
  CheckCircle, // Preserved
  AlertCircle, // Preserved
  Clock,
  PieChart,
  ChevronDown,
  TrendingUp,
  Target,
  Grid
} from "lucide-react";
import { fetchMyResults } from "../../store/slices/examSlice";

const StudentResults = () => {
  const dispatch = useDispatch();

  // Fixed Destructuring from {} to [] to prevent runtime crash, 
  // ensuring the UI can render even if data processing logic is incomplete.
  const [myResults, setMyResults] = useState({
    mid_term: [],
    internal_lab: [],
    external_lab: [],
    end_semester: [],
    currentSemester: "0.00",
    overall: "0.00",
    semesterGainedCredits: 0,
    semesterPossibleCredits: 0,
    totalGainedCredits: 0,
    totalPossibleCredits: 0
  });

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
    return myResults?.currentSemester || "0.00";
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
      const mids = myResults?.mid_term || [];
      if (availableMidInstances.length <= 1) return mids;
      return mids.filter(
        (m) =>
          (m.schedule?.cycle?.instance_number || 1) === selectedMidInstance,
      );
    }
    if (activeTab === "internal_lab")
      return [
        ...(myResults?.internal_lab || []),
        ...(myResults?.external_lab || []),
      ];
    if (activeTab === "end_semester") return myResults?.end_semester || [];
    return [];
  };

  const currentResults = getActiveResults();

  // Helper for Grade Colors (Modern Palette)
  const getGradeStyle = (grade) => {
    const g = grade?.toUpperCase();
    if (["O", "A+", "A"].includes(g)) return "bg-green-100 text-green-700 border-green-200";
    if (["B+", "B", "C"].includes(g)) return "bg-blue-50 text-blue-700 border-blue-100";
    if (["D", "P"].includes(g)) return "bg-gray-100 text-gray-700 border-gray-200";
    if (["F", "AB", "ABSENT", "FAIL"].includes(g)) return "bg-red-50 text-red-600 border-red-100";
    return "bg-gray-50 text-gray-600 border-gray-100";
  };

  return (
    <div className="min-h-screen  bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-8 pt-6 mb-10 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black">
              Performance
            </h1>
            <p className="text-lg text-gray-500 font-medium">
              Academic Report & Grades
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Semester Dropdown */}
            <div className="relative group">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 hover:border-blue-400 rounded-xl font-bold text-sm text-black outline-none focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer shadow-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <button className="flex items-center px-5 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </header>

        {/* KPI Ribbon */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {/* GPA Card */}
          <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-blue-600" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current GPA</p>
            <p className="text-4xl font-extrabold text-black tracking-tight">{calculateGPA()}</p>
          </div>

          {/* CGPA Card */}
          <div className="p-6 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
              <Trophy className="w-24 h-24" />
            </div>
            <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Overall CGPA</p>
            <p className="text-4xl font-extrabold tracking-tight">{myResults?.overall || "0.00"}</p>
          </div>

          {/* Credits Card */}
          <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="w-16 h-16 text-black" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sem Credits</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-extrabold text-black">{myResults?.semesterGainedCredits || 0}</p>
              <span className="text-sm font-medium text-gray-400">/ {myResults?.semesterPossibleCredits || 0}</span>
            </div>
          </div>

          {/* Total Credits Card */}
          <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award className="w-16 h-16 text-black" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Credits</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-extrabold text-black">{myResults?.totalGainedCredits || 0}</p>
              <span className="text-sm font-medium text-gray-400">/ {myResults?.totalPossibleCredits || 0}</span>
            </div>
            <div className="w-full bg-gray-100 h-1 mt-4 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${(myResults?.totalGainedCredits / myResults?.totalPossibleCredits) * 100 || 0}%` }}
              />
            </div>
          </div>
        </section>

        {/* Content Area */}
        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            {/* Tabs */}
            <div className="flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
              {[
                { id: "end_semester", label: "Semester End" },
                { id: "mid_term", label: "Mid-Terms" },
                { id: "internal_lab", label: "Internal / Lab" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === tab.id
                    ? "bg-black text-white shadow-md transform scale-105"
                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-Tabs for Mid Terms */}
            {activeTab === "mid_term" && availableMidInstances.length > 1 && (
              <div className="flex gap-2">
                {availableMidInstances.map((inst) => (
                  <button
                    key={inst}
                    onClick={() => setSelectedMidInstance(inst)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${selectedMidInstance === inst
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    Mid {inst}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Subject</th>

                  {activeTab !== "end_semester" &&
                    Array.from(new Set(currentResults.flatMap(r => r.schedule?.cycle?.component_breakdown?.map(c => c.name) || []))).map(compName => (
                      <th key={compName} className="px-4 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        {compName}
                      </th>
                    ))}

                  {activeTab !== "end_semester" && (
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Score</th>
                  )}

                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 w-32">Grade</th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentResults.length > 0 ? (
                  currentResults.map((res, index) => {
                    const totalCredits = res.schedule?.course?.credits || 3;
                    const earnedCredits = res.grade && !["F", "Ab", "Absent", "MP"].includes(res.grade) ? totalCredits : 0;
                    const scores = res.component_scores || {};
                    const dynamicComponents = Array.from(new Set(currentResults.flatMap(r => r.schedule?.cycle?.component_breakdown?.map(c => c.name) || [])));

                    return (
                      <tr key={res.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-black text-sm group-hover:text-blue-700 transition-colors">{res.schedule?.course?.name}</span>
                            <span className="text-[10px] font-mono text-gray-400 uppercase mt-0.5">{res.schedule?.course?.code || "SUB-XXX"}</span>
                          </div>
                        </td>

                        {activeTab !== "end_semester" && dynamicComponents.map(compName => (
                          <td key={compName} className="px-4 py-5 text-center text-sm font-medium text-gray-600">
                            {scores[compName] ?? "-"}
                          </td>
                        ))}

                        {activeTab !== "end_semester" && (
                          <td className="px-6 py-5 text-center font-bold text-black">
                            {res.marks_obtained}
                          </td>
                        )}

                        <td className="px-6 py-5">
                          <div className={`mx-auto w-fit px-4 py-1.5 rounded-lg border text-xs font-black ${getGradeStyle(res.grade)}`}>
                            {res.grade || "-"}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-center text-sm font-medium text-gray-500">
                          <span className={earnedCredits === totalCredits ? "text-black font-bold" : ""}>{earnedCredits}</span>
                          <span className="text-gray-300 mx-1">/</span>
                          {totalCredits}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                          <Grid className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-black mb-1">No Results Published</h3>
                        <p className="text-sm text-gray-500">Results for {activeTab.replace("_", " ")} will appear here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default StudentResults;
