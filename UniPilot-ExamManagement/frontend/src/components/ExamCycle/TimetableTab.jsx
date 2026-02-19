import { useState, useEffect } from "react";
import {
  getTimetablesByCycle,
  getProgramsByDegree,
  autoGenerateTimetable,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteAllTimetables,
} from "../../services/examCycleService.js";
import {
  Calendar,
  Clock,
  BookOpen,
  Zap,
  Trash2,
  Filter,
  Save,
  X,
  Edit2,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";

export default function TimetableTab({ cycleId, cycle, onUpdate }) {
  const [timetables, setTimetables] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Auto-generate form state
  const [autoGenForm, setAutoGenForm] = useState({
    start_date: "",
    gap: 0,
    morning_start: "09:00",
    morning_end: "12:00",
    afternoon_start: "14:00",
    afternoon_end: "17:00",
    allow_both_sessions: false,
  });

  useEffect(() => {
    loadPrograms();
    loadTimetables();
  }, [cycleId]);

  useEffect(() => {
    loadTimetables();
  }, [selectedProgram]);

  const loadPrograms = async () => {
    try {
      const response = await getProgramsByDegree(cycle.degree);
      setPrograms(response.data.data || []);
    } catch (err) {
      console.error("Error loading programs:", err);
    }
  };

  const loadTimetables = async () => {
    setLoading(true);
    try {
      const response = await getTimetablesByCycle(
        cycleId,
        selectedProgram || null,
      );
      setTimetables(response.data.data || []);
    } catch (err) {
      console.error("Error loading timetables:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await autoGenerateTimetable(cycleId, autoGenForm);
      await loadTimetables();
      setShowAutoGenerate(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(
        "Failed to generate timetable: " +
        (err.response?.data?.error || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        'Are you sure you want to delete all timetables? This will reset the cycle to "scheduling" status.',
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await deleteAllTimetables(cycleId);
      await loadTimetables();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Failed to delete timetables");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm("Delete this timetable entry?")) return;

    try {
      await deleteTimetableEntry(id);
      await loadTimetables();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Failed to delete entry");
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry.id);
    setEditForm({
      exam_date: entry.exam_date,
      start_time: entry.start_time,
      end_time: entry.end_time,
      session: entry.session,
    });
  };

  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    try {
      await updateTimetableEntry(editingEntry, editForm);
      await loadTimetables();
      setEditingEntry(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert("Failed to update entry");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans text-gray-900">
      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
          <div className="relative group w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Filter size={16} />
            </div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="pl-10 pr-10 py-2.5 w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer hover:bg-gray-100"
            >
              <option value="">All Programs</option>
              {programs.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600" size={16} />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 self-start sm:self-auto">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Count:</span>
            <span className="text-sm font-bold text-blue-600">{timetables.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {timetables.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex-1 lg:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 hover:text-gray-900 transition-all flex"
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={() => setShowAutoGenerate(!showAutoGenerate)}
            className="flex-1 lg:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95 flex"
          >
            {showAutoGenerate ? (
              <>
                <X size={16} />
                <span>Cancel Generation</span>
              </>
            ) : (
              <>
                <Zap size={16} className="fill-current" />
                <span>Auto Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto Generation Panel */}
      {showAutoGenerate && (
        <div className="bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 overflow-hidden transition-all duration-300">
          <div className="bg-blue-50/50 px-8 py-6 border-b border-blue-100 flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <Zap size={24} className="fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Auto-Generate Timetable</h3>
              <p className="text-sm text-gray-500 mt-1">Configure the parameters below to automatically schedule exams. This will overwrite conflicting entries.</p>
            </div>
          </div>

          <form onSubmit={handleAutoGenerate} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Start Date <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    value={autoGenForm.start_date}
                    onChange={(e) =>
                      setAutoGenForm({
                        ...autoGenForm,
                        start_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Gap (Days)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  min="0"
                  value={autoGenForm.gap}
                  onChange={(e) =>
                    setAutoGenForm({
                      ...autoGenForm,
                      gap: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="col-span-full h-px bg-gray-100 my-2"></div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Morning Session
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="time"
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-500 outline-none"
                      value={autoGenForm.morning_start}
                      onChange={(e) => setAutoGenForm({ ...autoGenForm, morning_start: e.target.value })}
                    />
                  </div>
                  <span className="text-gray-300 font-bold">-</span>
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="time"
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-500 outline-none"
                      value={autoGenForm.morning_end}
                      onChange={(e) => setAutoGenForm({ ...autoGenForm, morning_end: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors" onClick={() => setAutoGenForm({ ...autoGenForm, allow_both_sessions: !autoGenForm.allow_both_sessions })}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${autoGenForm.allow_both_sessions ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                    {autoGenForm.allow_both_sessions && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-bold text-gray-700 select-none">Enable Afternoon Session</span>
                </div>

                {autoGenForm.allow_both_sessions && (
                  <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="time"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none"
                        value={autoGenForm.afternoon_start}
                        onChange={(e) => setAutoGenForm({ ...autoGenForm, afternoon_start: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="time"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none"
                        value={autoGenForm.afternoon_end}
                        onChange={(e) => setAutoGenForm({ ...autoGenForm, afternoon_end: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
              <div className="flex items-start gap-2 text-xs text-gray-500 max-w-md">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-500" />
                <p>System automatically handles academic holidays and Sundays. Courses with identical codes are synchronized across programs.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:bg-black transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Run Generator"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-60 space-y-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Retrieving schedule...</p>
        </div>
      ) : timetables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Calendar className="text-gray-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No Exams Scheduled</h3>
          <p className="text-gray-500 max-w-xs mt-2 mx-auto">
            The timetable for this cycle is currently empty. Use the Auto Generator to populate it.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 w-48">Date</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Course Details</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 w-48">Timing</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 w-32 text-center">Session</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {timetables.map((tt) => (
                <tr key={tt.id} className="group hover:bg-blue-50/30 transition-colors">
                  {/* Date Column */}
                  <td className="py-4 px-6 align-top">
                    {editingEntry === tt.id ? (
                      <input
                        type="date"
                        className="w-full p-2 bg-white border border-blue-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                        value={editForm.exam_date}
                        onChange={(e) => setEditForm({ ...editForm, exam_date: e.target.value })}
                      />
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">
                          {new Date(tt.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(tt.exam_date).getFullYear()}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Course Column */}
                  <td className="py-4 px-6 align-top">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 font-mono tracking-tight">
                          {tt.course?.course_code}
                        </span>
                        <span className="text-sm font-bold text-gray-900 line-clamp-1">
                          {tt.course?.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium pl-1 flex items-center gap-1.5">
                        <BookOpen size={12} className="text-gray-400" />
                        {tt.programs && tt.programs.length > 0
                          ? tt.programs.map((p) => p.code).join(", ")
                          : "All Programs"}
                      </div>
                    </div>
                  </td>

                  {/* Timing Column */}
                  <td className="py-4 px-6 align-top">
                    {editingEntry === tt.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="time"
                          className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-medium outline-none"
                          value={editForm.start_time}
                          onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                        />
                        <span className="text-gray-300">-</span>
                        <input
                          type="time"
                          className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-medium outline-none"
                          value={editForm.end_time}
                          onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium font-mono bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                        <Clock size={14} className="text-gray-400" />
                        {tt.start_time.slice(0, 5)} - {tt.end_time.slice(0, 5)}
                      </div>
                    )}
                  </td>

                  {/* Session Column */}
                  <td className="py-4 px-6 align-top text-center">
                    {editingEntry === tt.id ? (
                      <select
                        className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-medium outline-none"
                        value={editForm.session}
                        onChange={(e) => setEditForm({ ...editForm, session: e.target.value })}
                      >
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-extrabold tracking-in ${tt.session === 'morning' ? 'bg-amber-100 text-amber-700 border border-amber-200/50' :
                        tt.session === 'afternoon' ? 'bg-blue-100 text-blue-700 border border-blue-200/50' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                        {tt.session === 'morning' ? 'AM' : 'PM'}
                      </span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-6 align-top text-right">
                    {editingEntry === tt.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleUpdateEntry}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all custom-btn"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => setEditingEntry(null)}
                          className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button
                          onClick={() => handleEditEntry(tt)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:cursor-pointer rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(tt.id)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 hover:cursor-pointer rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
