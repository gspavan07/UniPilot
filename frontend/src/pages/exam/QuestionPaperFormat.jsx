import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Save,
    Plus,
    Trash2,
    Book,
    GraduationCap,
    AlertCircle,
    Loader2,
    FileText,
    Target,
    Check,
    Edit,
    Trash,
} from "lucide-react";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchCourses } from "../../store/slices/courseSlice";
import { fetchRegulations } from "../../store/slices/regulationSlice";
import api from "../../utils/api";

const QuestionPaperFormat = ({ currentCycle }) => {
    const dispatch = useDispatch();
    const { programs, status: programStatus } = useSelector(
        (state) => state.programs
    );
    const { courses, status: courseStatus } = useSelector(
        (state) => state.courses
    );
    const { regulations, status: regulationStatus } = useSelector(
        (state) => state.regulations
    );

    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [questions, setQuestions] = useState([]);
    const [courseCos, setCourseCos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [fetchingTemplates, setFetchingTemplates] = useState(false);

    // Initial Fetch
    // Initial Fetch
    useEffect(() => {
        if (programStatus === "idle") dispatch(fetchPrograms());
        if (courseStatus === "idle") dispatch(fetchCourses());
        if (regulationStatus === "idle") dispatch(fetchRegulations());
    }, [dispatch, programStatus, courseStatus, regulationStatus]);

    // Fetch COs and Template when Course changes
    useEffect(() => {
        if (selectedCourse) {
            setLoading(true);
            setError(null);
            setSuccessMsg("");

            const fetchData = async () => {
                try {
                    // 1. Fetch COs
                    const coRes = await api.get(`/course-outcomes?course_id=${selectedCourse}`);
                    if (coRes.data.success) {
                        setCourseCos(coRes.data.data);
                    }

                    // 2. Fetch Existing Template
                    const tmplRes = await api.get(`/question-paper-templates?course_id=${selectedCourse}&program_id=${selectedProgram}`);
                    if (tmplRes.data.success && tmplRes.data.data) {
                        setQuestions(tmplRes.data.data.questions || []);
                    } else {
                        setQuestions([]); // Reset if no template found
                    }
                } catch (err) {
                    console.error("Error fetching data:", err);
                    setError("Failed to fetch course data. Ensure backend is running and routes are configured.");
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        } else {
            setCourseCos([]);
            setQuestions([]);
        }
    }, [selectedCourse, selectedProgram]);

    const handleAddQuestion = () => {
        const nextQNo = `Q${questions.length + 1}`;
        setQuestions([
            ...questions,
            { q_no: nextQNo, marks: "", co_id: "" },
        ]);
    };

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const handleRemoveQuestion = (index) => {
        const updated = questions.filter((_, i) => i !== index);
        // Re-number questions to keep sequence Q1, Q2, etc. logic consistent
        const reordered = updated.map((q, i) => ({ ...q, q_no: `Q${i + 1}` }));
        setQuestions(reordered);
    };

    const handleSave = async () => {
        if (!selectedCourse) {
            setError("Please select a course.");
            return;
        }
        if (questions.length === 0) {
            setError("Please add at least one question.");
            return;
        }

        // Validate
        const invalid = questions.find(q => !q.marks || !q.co_id);
        if (invalid) {
            setError("Please ensure all questions have marks and a selected CO.");
            return;
        }

        setSaving(true);
        setError(null);
        setSuccessMsg("");
        try {
            const payload = {
                course_id: selectedCourse,
                program_id: selectedProgram || null,
                questions: questions,
                total_marks: totalMarks,
            };

            await api.post("/question-paper-templates", payload);
            setSuccessMsg("Question paper format saved successfully!");

            // Clear success msg after 3s
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("Save error:", err);
            setError(err.response?.data?.error || "Failed to save template.");
        } finally {
            setSaving(false);
        }
    };

    // Derived Data from Regulation
    const currentRegulation = useMemo(() => {
        if (!currentCycle?.regulation_id || !regulations) return null;
        return regulations.find(r => r.id === currentCycle.regulation_id);
    }, [currentCycle, regulations]);

    // Filter Programs based on Regulation's course_list for current semester
    const availablePrograms = useMemo(() => {
        if (!currentRegulation?.courses_list || !programs || !currentCycle?.semester) return [];

        return programs.filter(p => {
            const semCourses = currentRegulation.courses_list[p.id]?.[currentCycle.semester];
            return semCourses && semCourses.length > 0;
        });
    }, [currentRegulation, programs, currentCycle]);

    // Filter courses based on program and regulation
    const filteredCourses = useMemo(() => {
        if (!selectedProgram || !currentRegulation || !currentCycle?.semester) return [];

        const validCourseIds = currentRegulation.courses_list[selectedProgram]?.[currentCycle.semester] || [];

        return courses.filter(c => validCourseIds.includes(c.id));
    }, [selectedProgram, currentRegulation, currentCycle, courses]);

    // Filter Saved Templates for Current Cycle (Regulation + Semester)
    const displayedTemplates = useMemo(() => {
        if (!process.env.NODE_ENV || !savedTemplates.length || !currentRegulation || !currentCycle?.semester) return [];

        // Get all valid course IDs for this semester across all programs
        const validCourseIds = new Set();
        if (currentRegulation.courses_list) {
            Object.values(currentRegulation.courses_list).forEach(semMap => {
                const semCourses = semMap[currentCycle.semester];
                if (semCourses) {
                    semCourses.forEach(cId => validCourseIds.add(cId));
                }
            });
        }

        return savedTemplates.filter(t => validCourseIds.has(t.course_id));
    }, [savedTemplates, currentRegulation, currentCycle]);

    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary-600" />
                    Define Question Paper Format
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Select Program</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                className="input pl-10"
                                value={selectedProgram}
                                onChange={(e) => {
                                    setSelectedProgram(e.target.value);
                                    setSelectedCourse(""); // Reset course when program changes
                                }}
                            >
                                <option value="">Select Program</option>
                                {availablePrograms.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Select Course</label>
                        <div className="relative">
                            <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                className="input pl-10"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                disabled={!selectedProgram}
                            >
                                <option value="">Select Course</option>
                                {filteredCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {
                selectedCourse && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Questions Structure</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span>Total Questions: <strong>{questions.length}</strong></span>
                                    <span>Total Marks: <strong className="text-primary-600 text-base">{totalMarks}</strong></span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddQuestion}
                                    className="btn btn-outline flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Question
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || questions.length === 0}
                                    className="btn btn-primary flex items-center px-6"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Format
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {questions.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-gray-500 mb-4">No questions defined for this paper yet.</p>
                                        <button onClick={handleAddQuestion} className="btn btn-sm btn-primary">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add First Question
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500 font-semibold border-b dark:border-gray-700">
                                                <tr>
                                                    <th className="px-6 py-4 w-24">Q No</th>
                                                    <th className="px-6 py-4 w-32">Marks</th>
                                                    <th className="px-6 py-4">Course Outcome (CO)</th>
                                                    <th className="px-6 py-4 w-20 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
                                                {questions.map((q, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                                        <td className="px-6 py-3">
                                                            <input
                                                                type="text"
                                                                value={q.q_no}
                                                                onChange={(e) => handleQuestionChange(idx, "q_no", e.target.value)}
                                                                className="input input-sm w-full font-bold text-center bg-gray-50 focus:bg-white border-transparent focus:border-primary-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={q.marks}
                                                                onChange={(e) => handleQuestionChange(idx, "marks", e.target.value)}
                                                                className="input input-sm w-full"
                                                                placeholder="0"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <select
                                                                value={q.co_id}
                                                                onChange={(e) => handleQuestionChange(idx, "co_id", e.target.value)}
                                                                className={`input input-sm w-full ${!q.co_id ? "text-gray-400" : ""}`}
                                                            >
                                                                <option value="">Select mapped CO...</option>
                                                                {courseCos.map(co => (
                                                                    <option key={co.id} value={co.id} className="text-gray-900 dark:text-white">
                                                                        {co.co_code} {co.description ? `- ${co.description.substring(0, 50)}...` : ""} ({co.target_attainment}%)
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {courseCos.length === 0 && (
                                                                <p className="text-xs text-error-500 mt-1">No COs found for this course.</p>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3 text-center">
                                                            <button
                                                                onClick={() => handleRemoveQuestion(idx)}
                                                                className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Remove Question"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Messages */}
                                {error && (
                                    <div className="p-4 bg-error-50 dark:bg-error-900/20 text-error-600 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}
                                {successMsg && (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                                        <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                                        {successMsg}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            }
            {/* Saved Templates List */}
            {displayedTemplates.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Saved Formats</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500 font-semibold border-b dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Program</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4">Total Marks</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
                                {displayedTemplates.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {template.program?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">{template.course?.name}</span>
                                                <span className="text-xs text-gray-500">{template.course?.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                                {template.total_marks}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${template.status === 'active'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {template.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditTemplate(template)}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                    className="p-2 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
        </div >
    );
};

export default QuestionPaperFormat;
