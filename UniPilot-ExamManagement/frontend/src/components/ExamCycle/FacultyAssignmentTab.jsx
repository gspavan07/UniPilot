import { useState, useEffect } from "react";
import {
    getTimetablesByCycle,
    getFacultyList,
    bulkUpdateTimetables,
} from "../../services/examCycleService";
import { Loader2, Save, UserCheck, AlertCircle } from "lucide-react";
import "./TimetableTab.css"; // Reuse existing styles for now

export default function FacultyAssignmentTab({ cycleId }) {
    const [timetables, setTimetables] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [assignments, setAssignments] = useState({}); // { timetableId: facultyId }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadData();
    }, [cycleId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [timetablesRes, facultyRes] = await Promise.all([
                getTimetablesByCycle(cycleId),
                getFacultyList(),
            ]);

            const timetablesData = timetablesRes.data.data || [];
            const facultyData = facultyRes.data.data || [];

            setTimetables(timetablesData);
            setFacultyList(facultyData);

            // Initialize assignments state with existing data
            const initialAssignments = {};
            timetablesData.forEach((tt) => {
                if (tt.assigned_faculty_id) {
                    initialAssignments[tt.id] = tt.assigned_faculty_id;
                }
            });
            setAssignments(initialAssignments);
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentChange = (timetableId, facultyId) => {
        setAssignments((prev) => ({
            ...prev,
            [timetableId]: facultyId,
        }));
        // Clear messages on change
        if (error) setError("");
        if (success) setSuccess("");
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            // Prepare updates (only changed items)
            const updates = [];
            Object.keys(assignments).forEach((timetableId) => {
                const original = timetables.find((t) => t.id === timetableId);
                const currentAssigned = assignments[timetableId];
                const originalAssigned = original?.assigned_faculty_id;

                const cVal = currentAssigned || null;
                const oVal = originalAssigned || null;

                if (cVal !== oVal) {
                    updates.push({
                        id: timetableId,
                        assigned_faculty_id: cVal,
                    });
                }
            });

            if (updates.length > 0) {
                await bulkUpdateTimetables(cycleId, updates);
                setSuccess("Faculty assignments saved successfully!");
                await loadData();
            } else {
                setSuccess("No changes to save.");
            }
        } catch (err) {
            console.error("Error saving assignments:", err);
            setError("Failed to save assignments.");
        } finally {
            setSaving(false);
        }
    };

    const getFilteredFaculty = (departmentId) => {
        if (!departmentId) return [];
        return facultyList.filter((f) => f.department_id === departmentId);
    };

    const getStatus = (timetableId) => {
        return assignments[timetableId] ? "Assigned" : "Not Assigned";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin mr-2" /> Loading data...
            </div>
        );
    }

    return (
        <div className="faculty-assignment-tab">
            <div className="tab-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h3>Faculty Assignment</h3>
                    <p className="text-sm text-gray-500">
                        Assign faculty invigilators to scheduled exams based on department.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Assignments
                </button>
            </div>

            {error && (
                <div className="error-message" style={{ padding: "10px", background: "#fee2e2", color: "#ef4444", borderRadius: "4px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {success && (
                <div className="success-message" style={{ padding: "10px", background: "#dcfce7", color: "#16a34a", borderRadius: "4px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserCheck size={16} /> {success}
                </div>
            )}

            {timetables.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No Exams Scheduled</h3>
                    <p>Schedule exams in the Timetable tab first.</p>
                </div>
            ) : (
                <div className="timetable-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Course</th>
                                <th>Department</th>
                                <th>Assigned Faculty</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timetables.map((tt) => {
                                const departmentId = tt.course?.department_id;
                                const availableFaculty = getFilteredFaculty(departmentId);
                                const isAssigned = !!assignments[tt.id];

                                return (
                                    <tr key={tt.id}>
                                        <td>
                                            <div>{new Date(tt.exam_date).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500">
                                                {tt.start_time} - {tt.end_time} ({tt.session})
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-medium">{tt.course?.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {tt.course?.code}
                                            </div>
                                        </td>
                                        <td>
                                            {/* We don't have department name readily available in course object unless populated deeply, 
                          but we can try to guess or just show ID for debug if needed. 
                          Actually faculty filtering works on ID, so maybe just show nothing or "Dept ID: ..." 
                          If course has department name populated, use it. */
                                                tt.course?.department_id ? "Matching Dept" : "Unknown Dept"
                                            }
                                        </td>
                                        <td>
                                            <select
                                                value={assignments[tt.id] || ""}
                                                onChange={(e) =>
                                                    handleAssignmentChange(tt.id, e.target.value)
                                                }
                                                className="form-select"
                                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                                            >
                                                <option value="">-- Select Faculty --</option>
                                                {availableFaculty.map((f) => (
                                                    <option key={f.id} value={f.id}>
                                                        {f.first_name} {f.last_name} ({f.employee_id})
                                                    </option>
                                                ))}
                                            </select>
                                            {availableFaculty.length === 0 && (
                                                <div className="text-xs text-red-500 mt-1">
                                                    No faculty found for this department
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge ${!isAssigned
                                                        ? "pending"
                                                        : tt.exam_status === "format_submitted"
                                                            ? "submitted"
                                                            : tt.exam_status === "approved"
                                                                ? "approved"
                                                                : "assigned"
                                                    }`}
                                                style={{
                                                    padding: "4px 12px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                    backgroundColor: !isAssigned
                                                        ? "#fee2e2" // Red for pending
                                                        : tt.exam_status === "format_submitted"
                                                            ? "#e0e7ff" // Indigo for submitted
                                                            : tt.exam_status === "approved"
                                                                ? "#dcfce7" // Green for approved
                                                                : "#fef3c7", // Yellow for assigned
                                                    color: !isAssigned
                                                        ? "#991b1b"
                                                        : tt.exam_status === "format_submitted"
                                                            ? "#3730a3"
                                                            : tt.exam_status === "approved"
                                                                ? "#166534"
                                                                : "#92400e",
                                                }}
                                            >
                                                {!isAssigned
                                                    ? "Pending Faculty"
                                                    : tt.exam_status === "format_submitted"
                                                        ? "Format Submitted"
                                                        : tt.exam_status === "approved"
                                                            ? "Approved"
                                                            : "Assigned"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
