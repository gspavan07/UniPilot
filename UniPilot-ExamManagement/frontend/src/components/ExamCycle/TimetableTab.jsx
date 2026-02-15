import { useState, useEffect } from "react";
import {
  getTimetablesByCycle,
  getProgramsByDegree,
  autoGenerateTimetable,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteAllTimetables,
} from "../../services/examCycleService";
import "./TimetableTab.css";

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
    <div className="timetable-tab">
      <div className="tab-header">
        <div className="filters">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="program-filter"
          >
            <option value="">All Programs</option>
            {programs.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.name}
              </option>
            ))}
          </select>
        </div>

        <div className="actions">
          {timetables.length > 0 && (
            <button onClick={handleDeleteAll} className="btn-danger">
              Delete All Timetables
            </button>
          )}
          <button
            onClick={() => setShowAutoGenerate(!showAutoGenerate)}
            className="btn-primary"
          >
            {showAutoGenerate ? "Cancel" : "⚡ Auto Generate Timetable"}
          </button>
        </div>
      </div>

      {showAutoGenerate && (
        <div className="auto-generate-form">
          <h3>Auto Generate Timetable</h3>
          <form onSubmit={handleAutoGenerate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
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

              <div className="form-group">
                <label>Gap Between Exams (days)</label>
                <input
                  type="number"
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

              <div className="form-group">
                <label>Morning Start Time</label>
                <input
                  type="time"
                  value={autoGenForm.morning_start}
                  onChange={(e) =>
                    setAutoGenForm({
                      ...autoGenForm,
                      morning_start: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Morning End Time</label>
                <input
                  type="time"
                  value={autoGenForm.morning_end}
                  onChange={(e) =>
                    setAutoGenForm({
                      ...autoGenForm,
                      morning_end: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={autoGenForm.allow_both_sessions}
                    onChange={(e) =>
                      setAutoGenForm({
                        ...autoGenForm,
                        allow_both_sessions: e.target.checked,
                      })
                    }
                  />
                  <span>
                    Allow exams in both morning and afternoon sessions
                  </span>
                </label>
              </div>

              {autoGenForm.allow_both_sessions && (
                <>
                  <div className="form-group">
                    <label>Afternoon Start Time</label>
                    <input
                      type="time"
                      value={autoGenForm.afternoon_start}
                      onChange={(e) =>
                        setAutoGenForm({
                          ...autoGenForm,
                          afternoon_start: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Afternoon End Time</label>
                    <input
                      type="time"
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

            <div className="form-note">
              <p>
                ℹ️ System will automatically skip Sundays and holidays from the
                academic calendar
              </p>
              <p>
                📚 Courses with the same course code will be scheduled on the
                same date across all programs
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowAutoGenerate(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Generating..." : "Generate Timetable"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading timetables...</div>
      ) : timetables.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No Exams Scheduled</h3>
          <p>
            Use the Auto Generate feature to create the timetable automatically
          </p>
        </div>
      ) : (
        <div className="timetable-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Program</th>
                <th>Course</th>
                <th>Time</th>
                <th>Session</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {timetables.map((tt) => (
                <tr key={tt.id}>
                  <td>{new Date(tt.exam_date).toLocaleDateString()}</td>
                  <td>
                    {tt.programs && tt.programs.length > 0
                      ? tt.programs.map((p) => p.code).join(", ")
                      : "N/A"}
                  </td>
                  <td>
                    <div className="course-info">
                      <strong>{tt.course?.name}</strong>
                      <span className="course-code">
                        {tt.course?.course_code}
                      </span>
                    </div>
                  </td>
                  <td>
                    {tt.start_time} - {tt.end_time}
                  </td>
                  <td>
                    <span className={`session-badge ${tt.session}`}>
                      {tt.session}
                    </span>
                  </td>
                  <td>
                    {editingEntry === tt.id ? (
                      <div className="inline-edit-form">
                        <form onSubmit={handleUpdateEntry}>
                          <div className="edit-fields">
                            <input
                              type="date"
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
                          <div className="edit-actions">
                            <button
                              type="submit"
                              className="btn-icon-success"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingEntry(null)}
                              className="btn-icon-secondary"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditEntry(tt)}
                          className="btn-icon-primary"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(tt.id)}
                          className="btn-icon-danger"
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
          <div className="table-footer">
            <p>Total: {timetables.length} exams scheduled</p>
          </div>
        </div>
      )}
    </div>
  );
}
