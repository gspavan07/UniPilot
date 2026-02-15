import { useState, useEffect } from "react";
import {
    getTimetablesByCycle,
    getFacultyList,
    bulkUpdateTimetables,
} from "../../services/examCycleService";
import { Loader2, Save, UserCheck, AlertCircle } from "lucide-react";

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
        <div className="w-full animate-fadeIn">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Faculty Assignment</h2>
                    <p className="text-sm text-slate-500">
                        Assign faculty invigilators to scheduled exams based on department.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Assignments
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-lg mb-6 border border-rose-100">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-lg mb-6 border border-emerald-100">
                    <UserCheck size={16} /> {success}
                </div>
            )}

            {timetables.length === 0 ? (
                <div className="text-center py-16 px-8">
                    <div className="text-[4rem] mb-4">📅</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Exams Scheduled</h3>
                    <p className="text-slate-500">Schedule exams in the Timetable tab first.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Date & Time</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Course</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Department</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Assigned Faculty</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timetables.map((tt) => {
                                const departmentId = tt.course?.department_id;
                                const availableFaculty = getFilteredFaculty(departmentId);
                                const isAssigned = !!assignments[tt.id];

                                return (
                                    <tr key={tt.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 border-b border-slate-100">
                                            <div className="font-semibold text-slate-700">{new Date(tt.exam_date).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {tt.start_time} - {tt.end_time} ({tt.session})
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-slate-100">
                                            <div className="font-bold text-slate-900">{tt.course?.name}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-1">
                                                {tt.course?.course_code || tt.course?.code}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-slate-100 text-slate-600 text-sm">
                                            {tt.course?.department_id ? "Matching Dept" : "Unknown Dept"}
                                        </td>
                                        <td className="p-4 border-b border-slate-100">
                                            <select
                                                value={assignments[tt.id] || ""}
                                                onChange={(e) =>
                                                    handleAssignmentChange(tt.id, e.target.value)
                                                }
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                                            >
                                                <option value="">-- Select Faculty --</option>
                                                {availableFaculty.map((f) => (
                                                    <option key={f.id} value={f.id}>
                                                        {f.first_name} {f.last_name} ({f.employee_id})
                                                    </option>
                                                ))}
                                            </select>
                                            {availableFaculty.length === 0 && (
                                                <div className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                                                    <AlertCircle size={10} /> No faculty found for dept
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 border-b border-slate-100">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${!isAssigned
                                                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                                                    : tt.exam_status === "format_submitted"
                                                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                                                        : tt.exam_status === "approved"
                                                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                            : "bg-amber-100 text-amber-700 border border-amber-200"
                                                    }`}
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
