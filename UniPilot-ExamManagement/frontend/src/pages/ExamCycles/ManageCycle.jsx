import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCycleById, deleteCycle } from "../../services/examCycleService.js";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  GraduationCap
} from "lucide-react";
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

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduling": return "bg-amber-100 text-amber-800 border-amber-200";
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "active": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="font-medium text-gray-500">Retrieving cycle configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <div className="text-3xl font-bold">!</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Cycle</h2>
          <p className="text-gray-500 mb-8">{error || "The requested exam cycle could not be found."}</p>
          <button
            onClick={() => navigate("/exam-cycles")}
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "faculty", label: "Faculty", icon: Users },
    ...(cycle.needs_fee ? [{ id: "fee", label: "Fee Config", icon: CreditCard }] : []),
    { id: "eligibility", label: "Eligibility", icon: ShieldCheck },
    { id: "students", label: "Students", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate("/exam-cycles")}
                className="mt-1 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
                aria-label="Go Back"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                    {cycle.cycle_name}
                  </h1>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${getStatusColor(cycle.status)}`}>
                    {cycle.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-gray-500">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} />
                    <span>{cycle.degree} (Sem {cycle.semester})</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                  <span>{cycle.batch}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <button
                onClick={() => navigate(`/exam-cycles/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                <Edit size={16} />
                <span>Edit Config</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-100 hover:border-red-200 transition-all"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation - Integrated into Header */}
          <div className="flex items-center gap-1 mt-8 overflow-x-auto scrollbar-hide -mb-6 pb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${isActive
                    ? "bg-gray-900 text-white border-gray-900 shadow-md transform -translate-y-0.5"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                >
                  <Icon size={16} className={isActive ? "text-blue-300" : "text-gray-400"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="animate-slideUp fade-in-up">
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
      </main>
    </div>
  );
}
