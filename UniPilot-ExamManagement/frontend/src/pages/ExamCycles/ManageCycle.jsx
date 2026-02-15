import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCycleById, deleteCycle } from "../../services/examCycleService";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import TimetableTab from "../../components/ExamCycle/TimetableTab";
import FeeConfigTab from "../../components/ExamCycle/FeeConfigTab";
import EligibilityTab from "../../components/ExamCycle/EligibilityTab";
import FacultyAssignmentTab from "../../components/ExamCycle/FacultyAssignmentTab";
import StudentsTab from "../../components/ExamCycle/StudentsTab";

export default function ManageCycle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("timetable");

  useEffect(() => {
    loadCycle();
  }, [id]);

  const loadCycle = async () => {
    setLoading(true);
    try {
      const response = await getCycleById(id);
      setCycle(response.data.data);
    } catch (err) {
      setError("Failed to load cycle details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${cycle.cycle_name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteCycle(id);
        navigate("/exam-cycles");
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete cycle");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse text-indigo-600 font-bold">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        Loading cycle details...
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <div className="text-center py-20 px-8 bg-white rounded-2xl shadow-lg shadow-rose-100 max-w-lg mx-auto mt-12 border border-rose-50 animate-fadeIn">
        <div className="text-5xl mb-6">⚠️</div>
        <p className="text-rose-600 mb-8 font-bold text-lg">
          {error || "Cycle not found"}
        </p>
        <button
          onClick={() => navigate("/exam-cycles")}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-95"
        >
          Back to Cycles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-wrap gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/exam-cycles")}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 cursor-pointer transition-all hover:-translate-x-1 hover:text-indigo-600 hover:border-indigo-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl text-slate-900 font-bold m-0 leading-tight">
              {cycle.cycle_name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${cycle.status === "scheduling"
                    ? "bg-amber-100 text-amber-700"
                    : cycle.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : cycle.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
              >
                {cycle.status}
              </span>
              <span className="font-semibold text-slate-400">
                {cycle.degree} • Semester {cycle.semester} • {cycle.batch}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/exam-cycles/${id}/edit`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 hover:-translate-y-0.5"
          >
            <Edit size={16} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 hover:-translate-y-0.5"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex bg-slate-50/50 border-b border-slate-200 overflow-x-auto scrollbar-hide">
          <button
            className={`px-8 py-5 bg-transparent border-none text-sm font-bold cursor-pointer border-b-2 transition-all hover:bg-white/50 whitespace-nowrap ${activeTab === "timetable"
                ? "text-indigo-600 border-b-indigo-600 bg-white shadow-[0_4px_10px_-4px_rgba(79,70,229,0.1)]"
                : "text-slate-500 border-b-transparent hover:text-slate-700"
              }`}
            onClick={() => setActiveTab("timetable")}
          >
            📅 Timetable
          </button>
          <button
            className={`px-8 py-5 bg-transparent border-none text-sm font-bold cursor-pointer border-b-2 transition-all hover:bg-white/50 whitespace-nowrap ${activeTab === "faculty"
                ? "text-indigo-600 border-b-indigo-600 bg-white shadow-[0_4px_10px_-4px_rgba(79,70,229,0.1)]"
                : "text-slate-500 border-b-transparent hover:text-slate-700"
              }`}
            onClick={() => setActiveTab("faculty")}
          >
            👨‍🏫 Faculty Assignment
          </button>
          {cycle.needs_fee && (
            <button
              className={`px-8 py-5 bg-transparent border-none text-sm font-bold cursor-pointer border-b-2 transition-all hover:bg-white/50 whitespace-nowrap ${activeTab === "fee"
                  ? "text-indigo-600 border-b-indigo-600 bg-white shadow-[0_4px_10px_-4px_rgba(79,70,229,0.1)]"
                  : "text-slate-500 border-b-transparent hover:text-slate-700"
                }`}
              onClick={() => setActiveTab("fee")}
            >
              💰 Fee Configuration
            </button>
          )}
          <button
            className={`px-8 py-5 bg-transparent border-none text-sm font-bold cursor-pointer border-b-2 transition-all hover:bg-white/50 whitespace-nowrap ${activeTab === "eligibility"
                ? "text-indigo-600 border-b-indigo-600 bg-white shadow-[0_4px_10px_-4px_rgba(79,70,229,0.1)]"
                : "text-slate-500 border-b-transparent hover:text-slate-700"
              }`}
            onClick={() => setActiveTab("eligibility")}
          >
            🛡️ Eligibility
          </button>
          <button
            className={`px-8 py-5 bg-transparent border-none text-sm font-bold cursor-pointer border-b-2 transition-all hover:bg-white/50 whitespace-nowrap ${activeTab === "students"
                ? "text-indigo-600 border-b-indigo-600 bg-white shadow-[0_4px_10px_-4px_rgba(79,70,229,0.1)]"
                : "text-slate-500 border-b-transparent hover:text-slate-700"
              }`}
            onClick={() => setActiveTab("students")}
          >
            👥 Students
          </button>
        </div>

        <div className="p-8 min-h-[500px]">
          {activeTab === "timetable" && (
            <TimetableTab cycleId={id} cycle={cycle} onUpdate={loadCycle} />
          )}
          {activeTab === "faculty" && <FacultyAssignmentTab cycleId={id} />}
          {activeTab === "fee" && cycle.needs_fee && (
            <FeeConfigTab cycleId={id} cycle={cycle} />
          )}
          {activeTab === "eligibility" && (
            <EligibilityTab cycleId={id} cycle={cycle} onUpdate={loadCycle} />
          )}
          {activeTab === "students" && <StudentsTab cycleId={id} />}
        </div>
      </div>
    </div>
  );
}
