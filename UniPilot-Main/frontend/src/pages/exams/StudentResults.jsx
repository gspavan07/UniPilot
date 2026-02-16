import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trophy,
  Award,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Target,
  Grid,
  ChevronDown,
  ChevronRight,
  BookOpen,
  PieChart,
  Layers,
} from "lucide-react";
import { fetchMyResults } from "../../store/slices/examSlice";

const StudentResults = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [selectedSemester, setSelectedSemester] = useState(
    user?.current_semester || 1,
  );

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
    totalPossibleCredits: 0,
  });

  useEffect(() => {
    dispatch(fetchMyResults({ semester: selectedSemester }));
  }, [dispatch, selectedSemester]);

  const [activeTab, setActiveTab] = useState("end_semester");
  const [selectedMidInstance, setSelectedMidInstance] = useState(1);

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

  const getGradeStyle = (grade) => {
    const g = grade?.toUpperCase();
    if (["O", "A+", "A"].includes(g))
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (["B+", "B", "C"].includes(g))
      return "bg-blue-50 text-blue-600 border-blue-100";
    if (["D", "P"].includes(g))
      return "bg-gray-50 text-gray-500 border-gray-100";
    if (["F", "AB", "ABSENT", "FAIL"].includes(g))
      return "bg-red-50 text-red-600 border-red-100";
    return "bg-gray-50 text-gray-400 border-gray-100";
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-24">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-blue-50/30 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        {/* Header Section */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                  Academic Integrity
                </span>
                <div className="h-px w-8 bg-gray-100"></div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-gray-100">
                  Performance Hub
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-none">
                Academic <span className="text-blue-600">Report.</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
                Comprehensive breakdown of your modular performance, credits
                earned, and standardized grading analysis.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Semester Dropdown */}
              <div className="relative group">
                <select
                  value={selectedSemester}
                  onChange={(e) =>
                    setSelectedSemester(parseInt(e.target.value))
                  }
                  className="appearance-none pl-6 pr-12 py-4 bg-gray-50 border border-gray-100 hover:border-blue-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-black outline-none focus:ring-4 focus:ring-blue-50/50 transition-all cursor-pointer shadow-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                {/* <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors pointer-events-none" /> */}
              </div>

              <button className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95">
                <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                Export PDF
              </button>
            </div>
          </div>
        </header>

        {/* KPI Ribbon */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {/* GPA Card */}
          <div className="group relative p-8 rounded-[2.5rem] bg-white border border-blue-400 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Current GPA
              </p>
              <h2 className="text-4xl font-black text-black tracking-tighter">
                {calculateGPA()}
              </h2>
            </div>
          </div>

          {/* CGPA Card */}
          <div className="group relative p-8 rounded-[2.5rem] border-blue-400 text-black shadow-2xl shadow-blue-900/10 overflow-hidden border border-white/5  transition-all duration-70">
            <div className="absolute top-0 right-0 p-8 opacity-[0.3] group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
              <Trophy className="w-24 h-24 text-blue-600" />
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100/60 rounded-2xl flex items-center justify-center border border-blue-500/30 mb-6 font-black text-blue-400">
                <Trophy className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Overall CGPA
              </p>
              <h2 className="text-4xl font-black tracking-tighter">
                {myResults?.overall || "0.00"}
              </h2>
            </div>
          </div>

          {/* Credits Card */}
          <div className="group relative p-8 rounded-[2.5rem] bg-white border border-blue-400 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-100/50 transition-colors"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Sem Credits
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-black text-black tracking-tighter">
                  {myResults?.semesterGainedCredits || 0}
                </h2>
                <span className="text-sm font-bold text-gray-300">
                  / {myResults?.semesterPossibleCredits || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Total Scale */}
          <div className="group relative p-8 rounded-[2.5rem] bg-white border border-blue-400 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Total Progress
                </p>
                <div className="flex items-baseline gap-2 mb-6">
                  <h2 className="text-4xl font-black text-black tracking-tighter">
                    {myResults?.totalGainedCredits || 0}
                  </h2>
                  <span className="text-sm font-bold text-gray-300">
                    / {myResults?.totalPossibleCredits || 0}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Completion</span>
                  <span>
                    {Math.round(
                      (myResults?.totalGainedCredits /
                        myResults?.totalPossibleCredits) *
                        100 || 0,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100/50">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{
                      width: `${(myResults?.totalGainedCredits / myResults?.totalPossibleCredits) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <section className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden min-h-[600px] flex flex-col">
          {/* Main Toolbar */}
          <div className="px-10 py-6 border-b border-gray-50 flex flex-col lg:flex-row items-center justify-between gap-8 bg-gray-50/30">
            {/* Type Selector */}
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-[1.5rem] border border-gray-100 shadow-sm">
              {[
                { id: "end_semester", label: "Semester End", icon: Layers },
                { id: "mid_term", label: "Mid-Terms", icon: Target },
                {
                  id: "internal_lab",
                  label: "Assessment & Lab",
                  icon: PieChart,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-black/10"
                      : "text-gray-400 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contextual Sub-Filters */}
            {activeTab === "mid_term" && availableMidInstances.length > 1 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-2">
                  Cycle:
                </span>
                {availableMidInstances.map((inst) => (
                  <button
                    key={inst}
                    onClick={() => setSelectedMidInstance(inst)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedMidInstance === inst
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    Mid {inst}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Table Interface */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Subject Intelligence
                  </th>

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
                      <th
                        key={compName}
                        className="px-6 py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                      >
                        {compName}
                      </th>
                    ))}

                  {activeTab !== "end_semester" && (
                    <th className="px-8 py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Agg. Score
                    </th>
                  )}

                  <th className="px-8 py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-40">
                    Classification
                  </th>
                  <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Credits Matrix
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentResults.length > 0 ? (
                  currentResults.map((res) => {
                    const totalCredits = res.schedule?.course?.credits || 3;
                    const earnedCredits =
                      res.grade &&
                      !["F", "Ab", "Absent", "MP", "NA"].includes(
                        res.grade.toUpperCase(),
                      )
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
                        className="group hover:bg-gray-50/50 transition-all duration-300"
                      >
                        <td className="px-12 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                              <BookOpen className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div>
                              <span className="block font-black text-black text-sm tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
                                {res.schedule?.course?.name}
                              </span>
                              <span className="inline-block px-2 py-0.5 rounded-md bg-gray-50 text-[9px] font-mono text-gray-400 uppercase border border-gray-100">
                                {res.schedule?.course?.code || "SUB-00"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {activeTab !== "end_semester" &&
                          dynamicComponents.map((compName) => (
                            <td
                              key={compName}
                              className="px-6 py-8 text-center text-sm font-bold text-gray-600"
                            >
                              {scores[compName] ?? "—"}
                            </td>
                          ))}

                        {activeTab !== "end_semester" && (
                          <td className="px-8 py-8 text-center">
                            <span className="text-sm font-black text-black">
                              {res.marks_obtained || "—"}
                            </span>
                          </td>
                        )}

                        <td className="px-8 py-8">
                          <div
                            className={`mx-auto w-fit px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm transition-transform group-hover:scale-105 ${getGradeStyle(res.grade)}`}
                          >
                            {res.grade || "Processing"}
                          </div>
                        </td>

                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-2 text-sm">
                            <span
                              className={
                                earnedCredits === totalCredits
                                  ? "font-black text-black"
                                  : "font-bold text-gray-300"
                              }
                            >
                              {earnedCredits}
                            </span>
                            <div className="w-px h-3 bg-gray-200"></div>
                            <span className="font-bold text-gray-400">
                              {totalCredits}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-12 py-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center mb-8 shadow-sm">
                          <Grid className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-black tracking-tight mb-2">
                          No data transmissions found.
                        </h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium leading-relaxed">
                          Official results for {activeTab.replace("_", " ")}{" "}
                          have not reached your academic profile yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Accountability Message */}
        <footer className="mt-12 text-center pb-24">
          <p className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Clock className="w-3 h-3 text-blue-400" />
            Data synchronized in real-time with university records.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default StudentResults;
