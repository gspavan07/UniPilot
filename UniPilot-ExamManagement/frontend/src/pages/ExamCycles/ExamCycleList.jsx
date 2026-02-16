import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCycles, deleteCycle } from "../../services/examCycleService";
import {
  Edit,
  Trash2,
  Calendar,
  Layout,
  Info,
  ChevronDown,
  Filter,
  Plus,
  Search,
  MoreHorizontal
} from "lucide-react";

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
        `Are you sure you want to delete the exam cycle "${name}"? This will also delete all associated timetables and configurations.`
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

  const getStatusBadgeStyles = (status) => {
    const styles = {
      scheduling: "bg-amber-100 text-amber-800 border-amber-200",
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
      active: "bg-emerald-100 text-emerald-800 border-emerald-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 sm:px-10 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">
              Exam Cycles
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Manage examination schedules, regulatory compliance, and academic timelines.
            </p>
          </div>
          <button
            onClick={() => navigate("/exam-cycles/create")}
            className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={18} className="stroke-3" />
            <span>New Cycle</span>
          </button>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-3 text-gray-400 px-2">
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Filter View</span>
          </div>

          <div className="relative group flex-1 md:flex-none">
            <select
              value={filters.degree}
              onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
              className="appearance-none w-full md:w-48 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 pl-4 pr-10 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer hover:bg-gray-100"
            >
              <option value="">All Degrees</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MBA">MBA</option>
              <option value="MCA">MCA</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600" size={16} />
          </div>

          <div className="relative group flex-1 md:flex-none">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="appearance-none w-full md:w-48 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 pl-4 pr-10 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer hover:bg-gray-100"
            >
              <option value="">All Statuses</option>
              <option value="scheduling">Scheduling</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600" size={16} />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 animate-fadeIn">
            <Info size={20} />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-75">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm">Synchronizing data...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && cycles.length === 0 && (
          <div className="bg-white border border-gray-200 border-dashed rounded-3xl p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Cycles Found</h3>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
              We couldn't find any exam cycles matching your filters. Try adjusting them or create a new one.
            </p>
            <button
              onClick={() => navigate("/exam-cycles/create")}
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline underline-offset-4"
            >
              Create New Cycle &rarr;
            </button>
          </div>
        )}

        {/* Main Data Table */}
        {!loading && cycles.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Cycle Name
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Context
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Details
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cycles.map((cycle) => (
                    <tr
                      key={cycle.id}
                      className="group hover:bg-gray-50 transition-colors duration-200 cursor-default"
                    >
                      {/* Name Column */}
                      <td className="py-5 px-6 align-top">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm leading-snug">
                            {cycle.cycle_name}
                          </span>
                          <span className="text-xs text-gray-500 mt-1 font-mono">
                            ID: {cycle.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Context Column */}
                      <td className="py-5 px-6 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                              {cycle.degree}
                            </span>
                            <span className="text-xs text-gray-500">&bull;</span>
                            <span className="text-sm font-medium text-gray-700">
                              {cycle.batch}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            Sem {cycle.semester}
                          </span>
                        </div>
                      </td>

                      {/* Details Column */}
                      <td className="py-5 px-6 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-700 font-medium">
                              {cycle.cycle_type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 pl-3.5">
                            {cycle.course_type}
                          </div>
                          {cycle.timetables?.length > 0 && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 ml-3.5">
                              <Calendar size={10} />
                              {cycle.timetables.length} Timetables
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-5 px-6 align-top">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyles(cycle.status)}`}
                        >
                          {getStatusLabel(cycle.status)}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-5 px-6 text-right align-top">
                        <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">

                          <button
                            onClick={() => navigate(`/exam-cycles/${cycle.id}/manage`)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-transform active:scale-95 shadow-sm"
                            title="Manage Cycle"
                          >
                            <Layout size={14} />
                            <span>Manage</span>
                          </button>

                          <div className="w-px h-6 bg-gray-200 mx-1"></div>

                          <button
                            onClick={() => navigate(`/exam-cycles/${cycle.id}/edit`)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={(e) => handleDelete(e, cycle.id, cycle.cycle_name)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
