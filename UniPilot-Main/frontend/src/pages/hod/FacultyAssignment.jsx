import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    Users,
    Search,
    BookOpen,
    Calendar,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    UserPlus
} from "lucide-react";
import api from "../../utils/api";
import { fetchBatchYears, fetchBatchDetails } from "../../store/slices/userSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchRegulations } from "../../store/slices/regulationSlice";

const FacultyAssignment = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { batchYears } = useSelector((state) => state.users);
    const { programs } = useSelector((state) => state.programs);
    const { regulations } = useSelector((state) => state.regulations);

    // Filters
    const [selectedRegulation, setSelectedRegulation] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    // selectedSection removed

    // Dynamic Options
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);

    // Data
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingFaculty, setLoadingFaculty] = useState(false);

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [activeCourseId, setActiveCourseId] = useState(null);
    const [selectedFacultyId, setSelectedFacultyId] = useState("");
    const [selectedSections, setSelectedSections] = useState([]); // Multi-select
    const [assignLoading, setAssignLoading] = useState(false);

    useEffect(() => {
        if (user?.department_id) {
            dispatch(fetchBatchYears({ department_id: user.department_id }));
            dispatch(fetchPrograms({ department_id: user.department_id }));
            dispatch(fetchRegulations());
            fetchFaculty();
        }
    }, [dispatch, user]);

    // Fetch Batch Details (Semesters & Sections)
    useEffect(() => {
        if (selectedBatch && selectedProgram) {
            const loadBatchMetadata = async () => {
                const res = await dispatch(fetchBatchDetails({
                    department_id: user?.department_id,
                    batch_year: selectedBatch,
                    program_id: selectedProgram
                })).unwrap();

                if (res) {
                    setAvailableSemesters(res.semesters || []);
                    setAvailableSections(res.sections || []);

                    // Auto-select if only one option
                    if (res.semesters?.length === 1) setSelectedSemester(res.semesters[0]);
                }
            };
            loadBatchMetadata();
        } else {
            setAvailableSemesters([]);
            setAvailableSections([]);
        }
    }, [dispatch, selectedBatch, selectedProgram, user?.department_id]);

    useEffect(() => {
        if (selectedBatch && selectedProgram && selectedSemester && selectedRegulation) {
            fetchAssignments();
        }
    }, [selectedBatch, selectedProgram, selectedSemester, selectedRegulation]); // Removed selectedSection dependency

    const fetchFaculty = async () => {
        try {
            setLoadingFaculty(true);
            // Fetch faculty of this department
            const res = await api.get(`/users?role=faculty&department_id=${user?.department_id}`);
            if (res.data.success) {
                setFacultyList(res.data.data);
            }
            setLoadingFaculty(false);
        } catch (error) {
            console.error("Error fetching faculty:", error);
            setLoadingFaculty(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);

            // Fetch Assignments
            const res = await api.get(`/academic/faculty-assignments`, {
                params: {
                    batch_year: selectedBatch,
                    semester: selectedSemester,
                    program_id: selectedProgram,
                    // section removed
                }
            });

            setAssignments(res.data.data);

            // Fetch Courses
            const courseRes = await api.get(`/courses`, {
                params: {
                    program_id: selectedProgram,
                    semester: selectedSemester,
                    regulation_id: selectedRegulation,
                    department_id: user?.department_id,
                    batch_year: selectedBatch
                }
            });
            setCourses(courseRes.data.data || []);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const handleAssignFaculty = async () => {
        if (!selectedFacultyId || !activeCourseId || selectedSections.length === 0) return;

        try {
            setAssignLoading(true);
            const payload = {
                course_id: activeCourseId,
                faculty_id: selectedFacultyId,
                batch_year: selectedBatch,
                semester: selectedSemester,
                sections: selectedSections, // Send array
                academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
            };

            await api.post('/academic/faculty-assignments', payload);

            setShowModal(false);
            setSelectedFacultyId("");
            setActiveCourseId(null);
            setSelectedSections([]);
            fetchAssignments(); // Refresh
            setAssignLoading(false);
        } catch (error) {
            alert(error.response?.data?.error || "Failed to assign faculty");
            setAssignLoading(false);
        }
    };

    const handleRemoveAssignment = async (id) => {
        if (!window.confirm("Are you sure you want to remove this assignment?")) return;
        try {
            await api.delete(`/academic/faculty-assignments/${id}`);
            fetchAssignments();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSection = (section) => {
        if (selectedSections.includes(section)) {
            setSelectedSections(selectedSections.filter(s => s !== section));
        } else {
            setSelectedSections([...selectedSections, section]);
        }
    };

    // derived state
    // Filter out courses that are fully assigned?
    // For now, simpler to just show what's assigned.
    // Ideally we check if all sections are assigned.
    // Let's just assume availableCourses are those not assigned to *any* section?
    // Or just show all available courses and let user assign sections.
    // Current logic: const availableCourses = courses.filter(c => !assignedCourseIds.has(c.id));
    // This hides the course if ANY assignment exists for it.
    // This might be annoying if they want to assign Section A to Fac1 and Section B to Fac2.
    // Better logic: Show course if there are unassigned sections.
    // For now, let's keep it simple and just show courses.
    const assignedCourseIds = new Set(assignments.map(a => a.course_id));
    // If we want to allow assigning other sections, we shouldn't filter by assignedCourseIds purely.
    // But let's stick to user request: "remove section filter... assign to multiple sections".
    // If I keep `availableCourses` filter, once I assign Section A, the course disappears, preventing setting Section B.

    // FIX: Show course in "Available" unless ALL sections are assigned?
    // That requires knowing default sections for all.
    // Let's just show all courses that are NOT fully fully assigned.
    // Or just show them if they are not in the assigned list?
    // Actually, `assignments` returns a list of rows.
    // If I have 3 sections A, B, C, and only A is assigned, I have 1 row.
    // I should probably still show the course in "Available".

    // User request: "remove the section filter... a faculty can be assigned to a multiple sections."
    // I'll leave the `availableCourses` logic as is for now, but realizing it might need tweak.
    // Wait, if I assign Section A, `assignedCourseIds` has the ID. The course disappears.
    // This prevents assigning Section B.
    // I'll remove the filter for now so they remain available?
    // Or better: Filter only if `assignments` count for this course >= `availableSections.length`.
    const assignmentsByCourse = assignments.reduce((acc, curr) => {
        acc[curr.course_id] = (acc[curr.course_id] || 0) + 1;
        return acc;
    }, {});

    // If availableSections is empty (no sections defined), maybe 1 assignment max?
    // Assuming sections exist.
    const availableCourses = courses.filter(c => {
        const count = assignmentsByCourse[c.id] || 0;
        return count < (availableSections.length || 1);
    });

    return (
        <div className="animate-fade-in p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
                        Faculty Assignment 📚
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Assign instructors to courses for specific batches.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Regulation */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Regulation</label>
                    <select
                        className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                        value={selectedRegulation}
                        onChange={(e) => setSelectedRegulation(e.target.value)}
                    >
                        <option value="">Select Regulation</option>
                        {regulations.map(r => <option key={r.id} value={r.id}>{r.name} ({r.academic_year})</option>)}
                    </select>
                </div>

                {/* Program */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Program</label>
                    <select
                        className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                    >
                        <option value="">Select Program</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                {/* Batch */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Batch Year</label>
                    <select
                        className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                        <option value="">Select Batch</option>
                        {batchYears.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                {/* Semester */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Semester</label>
                    <select
                        className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        disabled={!selectedBatch}
                    >
                        <option value="">Select Semester</option>
                        {availableSemesters.length > 0 ? (
                            availableSemesters.map(s => <option key={s} value={s}>{s}</option>)
                        ) : (
                            [1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)
                        )}
                    </select>
                </div>

                {/* Section Removed from Grid */}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Assigned List */}
                <div className="lg:col-span-2">
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Assigned Courses
                    </h3>

                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : assignments.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500">
                            No assignments found for this selection.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments.map(a => (
                                <div key={a.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{a.course?.name}</h4>
                                        <p className="text-xs text-gray-500">{a.course?.code} • Section: {a.section || 'All'}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="mr-4 text-right">
                                            <p className="text-sm font-medium text-primary-600">{a.faculty?.first_name} {a.faculty?.last_name}</p>
                                            <p className="text-xs text-gray-400">{a.faculty?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveAssignment(a.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-xs"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Unassigned List / Add */}
                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-blue-500" /> Available Courses
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {availableCourses.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                No unassigned courses found via search.
                            </div>
                        ) : (
                            availableCourses.map(c => (
                                <div key={c.id} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">{c.name}</p>
                                        <p className="text-xs text-gray-500">{c.code}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setActiveCourseId(c.id);
                                            // Pre-select ALL valid sections for this course that are NOT already assigned?
                                            // The user said "by default all are checked".
                                            // For simplicity, default to ALL sections.
                                            setSelectedSections(availableSections);
                                            setShowModal(true);
                                        }}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Assign Faculty</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Faculty</label>
                            <select
                                className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600"
                                value={selectedFacultyId}
                                onChange={(e) => setSelectedFacultyId(e.target.value)}
                            >
                                <option value="">Choose Instructor...</option>
                                {facultyList.map(f => (
                                    <option key={f.id} value={f.id}>
                                        {f.first_name} {f.last_name} ({f.employee_id || 'No ID'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Section Selection (Multi) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sections</label>
                            <div className="grid grid-cols-3 gap-2">
                                {availableSections.map(sec => (
                                    <label key={sec} className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={selectedSections.includes(sec)}
                                            onChange={() => toggleSection(sec)}
                                            className="rounded text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-medium">{sec}</span>
                                    </label>
                                ))}
                            </div>
                            {selectedSections.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one section.</p>}
                        </div>

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignFaculty}
                                disabled={assignLoading || !selectedFacultyId}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                                {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FacultyAssignment;
