import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCycles, deleteCycle } from "../../services/examCycleService";
import { Edit, Trash2, Calendar, Layout, Info } from "lucide-react";

export default function ExamCycleList() {
  const navigate = useNavigate();

  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    degree: "",
    status: "",
    batch: "",
  });

  useEffect(() => {
    loadCycles();
  }, [filters]);

  const loadCycles = async () => {
    setLoading(true);
    try {
      const response = await getAllCycles(filters);
      setCycles(response.data.data || []);
    } catch (err) {
      setError("Failed to load exam cycles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete the exam cycle "${name}"? This will also delete all associated timetables and configurations.`,
      )
    ) {
      try {
        await deleteCycle(id);
        loadCycles();
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete exam cycle");
      }
    }
  };

  const getStatusClasses = (status) => {
    const classes = {
      scheduling: "bg-amber-500 shadow-amber-100",
      scheduled: "bg-blue-500 shadow-blue-100",
      active: "bg-emerald-500 shadow-emerald-100",
      completed: "bg-slate-500 shadow-slate-100",
    };
    return classes[status] || "bg-slate-500 shadow-slate-100";
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-[2rem] text-slate-900 font-bold m-0 flex-1">
          Exam Cycles
        </h1>
        <button
          onClick={() => navigate("/exam-cycles/create")}
          className="bg-gradient-to-br from-indigo-500 to-purple-700 text-white px-6 py-3 rounded-lg font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <Calendar size={18} />
          <span>Create New Cycle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <select
          value={filters.degree}
          onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
          className="p-3 border-2 border-slate-200 rounded-lg text-[0.925rem] bg-white cursor-pointer min-w-[180px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 shadow-sm"
        >
          <option value="">All Degrees</option>
          <option value="B.Tech">B.Tech</option>
          <option value="M.Tech">M.Tech</option>
          <option value="MBA">MBA</option>
          <option value="MCA">MCA</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="p-3 border-2 border-slate-200 rounded-lg text-[0.925rem] bg-white cursor-pointer min-w-[180px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 shadow-sm"
        >
          <option value="">All Status</option>
          <option value="scheduling">Scheduling</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-lg mb-8 flex items-center gap-3">
          <Info size={18} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
          Loading exam cycles...
        </div>
      ) : cycles.length === 0 ? (
        <div className="text-center py-20 px-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto flex flex-col items-center">
          <div className="text-[5rem] mb-6 leading-none">📅</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            No Exam Cycles Found
          </h3>
          <p className="text-slate-500 mb-8 max-w-sm">
            You haven't created any exam cycles yet. Create your first cycle to
            start managing examinations.
          </p>
          <button
            onClick={() => navigate("/exam-cycles/create")}
            className="bg-gradient-to-br from-indigo-500 to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            Create Your First Cycle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {cycles.map((cycle) => (
            <div
              key={cycle.id}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-900 m-0 flex-1 break-words leading-tight mr-4">
                  {cycle.cycle_name}
                </h3>
                <span
                  className={`px-3 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-lg shadow-current/20 ${getStatusClasses(
                    cycle.status,
                  )}`}
                >
                  {cycle.status}
                </span>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-400">Degree</span>
                  <span className="font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                    {cycle.degree}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-400">Batch</span>
                  <span className="font-bold text-slate-700">
                    {cycle.batch}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-400">Semester</span>
                  <span className="font-bold text-slate-700">
                    {cycle.semester}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-400">Type</span>
                  <span className="font-bold text-slate-700">
                    {cycle.cycle_type} - {cycle.course_type}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-400">
                    Timetables
                  </span>
                  <span className="font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs">
                    {cycle.timetables?.length || 0} exams scheduled
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 flex gap-3 items-center">
                <button
                  onClick={() => navigate(`/exam-cycles/${cycle.id}/manage`)}
                  className="flex-1 py-3 bg-gradient-to-br from-indigo-500 to-purple-700 text-white rounded-xl font-bold cursor-pointer transition-all text-sm hover:-translate-y-0.5 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <Layout size={16} />
                  <span>Manage Cycle</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/exam-cycles/${cycle.id}/edit`)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 cursor-pointer transition-all hover:-translate-y-1 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                    title="Edit Cycle"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, cycle.id, cycle.cycle_name)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 cursor-pointer transition-all hover:-translate-y-1 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                    title="Delete Cycle"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
