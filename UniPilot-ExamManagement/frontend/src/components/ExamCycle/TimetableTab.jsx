import { useState, useEffect } from "react";
import {
  getTimetablesByCycle,
  getProgramsByDegree,
  autoGenerateTimetable,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteAllTimetables,
} from "../../services/examCycleService";

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
    <div className="w-full animate-fadeIn">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="p-3 border-2 border-slate-200 rounded-lg text-[0.925rem] bg-white min-w-[250px] focus:outline-none focus:border-sky-500"
          >
            <option value="">All Programs</option>
            {programs.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          {timetables.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-6 py-2.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-200"
            >
              Delete All Timetables
            </button>
          )}
          <button
            onClick={() => setShowAutoGenerate(!showAutoGenerate)}
            className="px-6 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-200"
          >
            {showAutoGenerate ? "Cancel" : "⚡ Auto Generate Timetable"}
          </button>
        </div>
      </div>

      {showAutoGenerate && (
        <div className="bg-slate-50 p-8 rounded-xl mb-8 border-2 border-slate-200">
          <h3 className="m-0 mb-6 text-slate-900 text-lg font-bold">
            Auto Generate Timetable
          </h3>
          <form onSubmit={handleAutoGenerate}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Start Date *
                </label>
                <input
                  type="date"
                  className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Gap Between Exams (days)
                </label>
                <input
                  type="number"
                  className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Morning Start Time
                </label>
                <input
                  type="time"
                  className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                  value={autoGenForm.morning_start}
                  onChange={(e) =>
                    setAutoGenForm({
                      ...autoGenForm,
                      morning_start: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Morning End Time
                </label>
                <input
                  type="time"
                  className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                  value={autoGenForm.morning_end}
                  onChange={(e) =>
                    setAutoGenForm({
                      ...autoGenForm,
                      morning_end: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-full">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    checked={autoGenForm.allow_both_sessions}
                    onChange={(e) =>
                      setAutoGenForm({
                        ...autoGenForm,
                        allow_both_sessions: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Allow exams in both morning and afternoon sessions
                  </span>
                </label>
              </div>

              {autoGenForm.allow_both_sessions && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Afternoon Start Time
                    </label>
                    <input
                      type="time"
                      className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                      value={autoGenForm.afternoon_start}
                      onChange={(e) =>
                        setAutoGenForm({
                          ...autoGenForm,
                          afternoon_start: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Afternoon End Time
                    </label>
                    <input
                      type="time"
                      className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                      value={autoGenForm.afternoon_end}
                      onChange={(e) =>
                        setAutoGenForm({
                          ...autoGenForm,
                          afternoon_end: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-sky-50 p-4 rounded-lg my-6">
              <p className="m-2 text-[0.925rem] text-sky-800">
                ℹ️ System will automatically skip Sundays and holidays from the
                academic calendar
              </p>
              <p className="m-2 text-[0.925rem] text-sky-800">
                📚 Courses with the same course code will be scheduled on the
                same date across all programs
              </p>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAutoGenerate(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-200"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Timetable"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">
          Loading timetables...
        </div>
      ) : timetables.length === 0 ? (
        <div className="text-center py-16 px-8">
          <div className="text-[4rem] mb-4">📅</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No Exams Scheduled
          </h3>
          <p className="text-slate-500">
            Use the Auto Generate feature to create the timetable automatically
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                  Date
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                  Program
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                  Course
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                  Time
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                  Session
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {timetables.map((tt) => (
                <tr key={tt.id}>
                  <td className="p-4 border-b border-slate-100 text-slate-700">
                    {new Date(tt.exam_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 border-b border-slate-100 text-slate-700">
                    {tt.programs && tt.programs.length > 0
                      ? tt.programs.map((p) => p.code).join(", ")
                      : "N/A"}
                  </td>
                  <td className="p-4 border-b border-slate-100 text-slate-700">
                    <div className="flex flex-col gap-1">
                      <strong className="text-slate-900 font-bold">
                        {tt.course?.name}
                      </strong>
                      <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                        {tt.course?.course_code}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-100 text-slate-700">
                    {tt.start_time} - {tt.end_time}
                  </td>
                  <td className="p-4 border-b border-slate-100 text-slate-700">
                    <span
                      className={`px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wide ${tt.session === "morning"
                        ? "bg-amber-100 text-amber-800"
                        : tt.session === "afternoon"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-indigo-100 text-indigo-800"
                        }`}
                    >
                      {tt.session}
                    </span>
                  </td>
                  <td className="p-4 border-b border-slate-100 text-slate-700">
                    {editingEntry === tt.id ? (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <form
                          onSubmit={handleUpdateEntry}
                          className="flex flex-col gap-3"
                        >
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="date"
                              className="p-1.5 border border-slate-300 rounded text-sm outline-none focus:border-sky-500"
                              value={editForm.exam_date}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  exam_date: e.target.value,
                                })
                              }
                              required
                            />
                            <input
                              type="time"
                              className="p-1.5 border border-slate-300 rounded text-sm outline-none focus:border-sky-500"
                              value={editForm.start_time}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  start_time: e.target.value,
                                })
                              }
                              required
                            />
                            <input
                              type="time"
                              className="p-1.5 border border-slate-300 rounded text-sm outline-none focus:border-sky-500"
                              value={editForm.end_time}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  end_time: e.target.value,
                                })
                              }
                              required
                            />
                            <select
                              className="p-1.5 border border-slate-300 rounded text-sm outline-none focus:border-sky-500"
                              value={editForm.session}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  session: e.target.value,
                                })
                              }
                            >
                              <option value="morning">Morning</option>
                              <option value="afternoon">Afternoon</option>
                              <option value="full_day">Full Day</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="submit"
                              className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingEntry(null)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEntry(tt)}
                          className="p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(tt.id)}
                          className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-4 bg-slate-50 rounded-lg text-center text-slate-500 text-sm font-medium">
            <p>Total: {timetables.length} exams scheduled</p>
          </div>
        </div>
      )}
    </div>
  );
}
