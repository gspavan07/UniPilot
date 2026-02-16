import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
    Network,
    Save,
    Download,
    AlertCircle,
    Loader2,
    GraduationCap,
    Book,
    CheckCircle,
    Info,
    ArrowLeft,
} from "lucide-react";
import {
    fetchCoPoMatrix,
    setLocalMapping,
    bulkUpdateCoPoMappings,
    clearMappings,
} from "../../store/slices/coPoMapSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchCourses } from "../../store/slices/courseSlice";
import { fetchRegulations } from "../../store/slices/regulationSlice";

const CoPoMapping = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: regulationId } = useParams();
    const [searchParams] = useSearchParams();

    const { departments } = useSelector((state) => state.departments);
    const { programs } = useSelector((state) => state.programs);
    const { courses } = useSelector((state) => state.courses);
    const { regulations } = useSelector((state) => state.regulations);
    const { programOutcomes, courseOutcomes, matrix, status, updateStatus, error } = useSelector(
        (state) => state.coPoMap
    );

    const programIdFromQuery = searchParams.get('program_id');
    const regulation = regulations.find((r) => r.id === regulationId);

    const [selectedProgram, setSelectedProgram] = useState(programIdFromQuery || "");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Fetch initial data
    useEffect(() => {
        dispatch(fetchDepartments());
        dispatch(fetchPrograms());
        dispatch(fetchCourses());
        dispatch(fetchRegulations());
    }, [dispatch]);

    // Set program from query param
    useEffect(() => {
        if (programIdFromQuery && !selectedProgram) {
            setSelectedProgram(programIdFromQuery);
        }
    }, [programIdFromQuery, selectedProgram]);

    // Fetch matrix when course and program are selected
    useEffect(() => {
        if (selectedCourse && selectedProgram) {
            dispatch(
                fetchCoPoMatrix({
                    courseId: selectedCourse,
                    programId: selectedProgram,
                })
            );
            setHasUnsavedChanges(false);
            setSaveSuccess(false);
        } else {
            dispatch(clearMappings());
        }
    }, [selectedCourse, selectedProgram, dispatch]);

    // Filter courses by regulation
    const coursesInRegulation = regulation?.courses_list || {};
    const allCoursesInRegulation = new Set();
    Object.values(coursesInRegulation).forEach(programCourses => {
        if (typeof programCourses === 'object') {
            // New structure: Program -> Batch -> Semester -> Courses
            Object.values(programCourses).forEach(batchData => {
                if (typeof batchData === 'object') {
                    Object.values(batchData).forEach(semesterCourses => {
                        if (Array.isArray(semesterCourses)) {
                            semesterCourses.forEach(courseId => allCoursesInRegulation.add(courseId));
                        }
                    });
                }
            });
        }
    });

    const filteredCourses = courses.filter((c) => {
        return allCoursesInRegulation.has(c.id);
    });

    const getWeightage = (coId, poId) => {
        return matrix[coId]?.[poId] || 0;
    };

    const handleMappingChange = (coId, poId, weightage) => {
        dispatch(setLocalMapping({ courseOutcomeId: coId, programOutcomeId: poId, weightage: parseInt(weightage) }));
        setHasUnsavedChanges(true);
        setSaveSuccess(false);
    };

    const handleSaveAll = async () => {
        try {
            await dispatch(
                bulkUpdateCoPoMappings({
                    courseId: selectedCourse,
                    programId: selectedProgram,
                    mappings: matrix,
                })
            ).unwrap();
            setHasUnsavedChanges(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Error saving mappings:", err);
        }
    };

    const getWeightageColor = (weightage) => {
        switch (weightage) {
            case 0:
                return "bg-gray-100 dark:bg-gray-700 text-gray-400";
            case 1:
                return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
            case 2:
                return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
            case 3:
                return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
            default:
                return "bg-gray-100 dark:bg-gray-700 text-gray-400";
        }
    };

    const getWeightageLabel = (weightage) => {
        switch (weightage) {
            case 0:
                return "-";
            case 1:
                return "L";
            case 2:
                return "M";
            case 3:
                return "H";
            default:
                return "-";
        }
    };

    const exportToCSV = () => {
        if (!selectedCourse || !selectedProgram) return;

        let csv = "CO / PO," + programOutcomes.map((po) => po.po_code).join(",") + "\n";

        courseOutcomes.forEach((co) => {
            let row = co.co_code;
            programOutcomes.forEach((po) => {
                const weightage = getWeightage(co.id, po.id);
                row += "," + getWeightageLabel(weightage);
            });
            csv += row + "\n";
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CO-PO-Matrix-${selectedCourse}.csv`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate(`/regulations/${regulationId}/curriculum`)}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg shadow-teal-500/30">
                                <Network className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
                                    CO-PO Mapping
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {regulation?.name} - Map Course Outcomes to Program Outcomes
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-6">
                    {/* Program Info - Read Only */}
                    {selectedProgram && (
                        <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                            <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-300">
                                <GraduationCap className="w-5 h-5" />
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider">Selected Program</span>
                                    <p className="text-base font-bold mt-1">
                                        {programs.find((p) => p.id === selectedProgram)?.name}
                                        <span className="ml-2 text-sm font-normal">
                                            ({programs.find((p) => p.id === selectedProgram)?.code})
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Course Selection */}
                    <div>
                        <label className="label">
                            <Book className="w-4 h-4 mr-2" />
                            Select Course to Map
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="input"
                            disabled={!selectedProgram}
                        >
                            <option value="">Select a course from this regulation...</option>
                            {filteredCourses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.name}
                                </option>
                            ))}
                        </select>
                        {filteredCourses.length === 0 && selectedProgram && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                No courses found in this regulation for the selected program.
                            </p>
                        )}
                    </div>

                    {/* Info Box */}
                    {selectedProgram && selectedCourse && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start space-x-3">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800 dark:text-blue-300">
                                <p className="font-semibold mb-1">Weightage Legend:</p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="inline-flex items-center space-x-1">
                                        <span className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">
                                            -
                                        </span>
                                        <span>No Mapping</span>
                                    </span>
                                    <span className="inline-flex items-center space-x-1">
                                        <span className="w-6 h-6 rounded bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xs font-semibold">
                                            L
                                        </span>
                                        <span>Low</span>
                                    </span>
                                    <span className="inline-flex items-center space-x-1">
                                        <span className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-semibold">
                                            M
                                        </span>
                                        <span>Medium</span>
                                    </span>
                                    <span className="inline-flex items-center space-x-1">
                                        <span className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-semibold">
                                            H
                                        </span>
                                        <span>High</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/30 border border-error-500/30 rounded-2xl flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {saveSuccess && (
                    <div className="mb-6 p-4 bg-success-50 dark:bg-success-900/30 border border-success-500/30 rounded-2xl flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-success-700 dark:text-success-300">
                            Mappings saved successfully!
                        </p>
                    </div>
                )}

                {/* Matrix */}
                {status === "loading" ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading matrix...</p>
                    </div>
                ) : selectedCourse && selectedProgram ? (
                    courseOutcomes.length === 0 || programOutcomes.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center">
                            <AlertCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {courseOutcomes.length === 0
                                    ? "No Course Outcomes Defined"
                                    : "No Program Outcomes Defined"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {courseOutcomes.length === 0
                                    ? "Please add course outcomes to the selected course first."
                                    : "Please add program outcomes to the selected program first."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-200 dark:border-gray-700">
                                                    CO / PO
                                                </th>
                                                {programOutcomes.map((po) => (
                                                    <th
                                                        key={po.id}
                                                        className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase border-b border-gray-200 dark:border-gray-700 min-w-[80px]"
                                                        title={po.description}
                                                    >
                                                        {po.po_code}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {courseOutcomes.map((co, coIndex) => (
                                                <tr
                                                    key={co.id}
                                                    className={coIndex % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"}
                                                >
                                                    <td
                                                        className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 bg-inherit"
                                                        title={co.description}
                                                    >
                                                        {co.co_code}
                                                    </td>
                                                    {programOutcomes.map((po) => {
                                                        const weightage = getWeightage(co.id, po.id);
                                                        return (
                                                            <td key={po.id} className="px-2 py-2 text-center">
                                                                <select
                                                                    value={weightage}
                                                                    onChange={(e) =>
                                                                        handleMappingChange(co.id, po.id, e.target.value)
                                                                    }
                                                                    className={`w-14 h-10 text-center font-bold text-sm rounded-lg border-2 cursor-pointer transition-all focus:ring-2 focus:ring-primary-500 ${getWeightageColor(weightage)} border-transparent hover:border-primary-300`}
                                                                >
                                                                    <option value="0">-</option>
                                                                    <option value="1">L</option>
                                                                    <option value="2">M</option>
                                                                    <option value="3">H</option>
                                                                </select>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center">
                                <div>
                                    {hasUnsavedChanges && (
                                        <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            You have unsaved changes
                                        </p>
                                    )}
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={exportToCSV}
                                        className="btn btn-secondary flex items-center space-x-2"
                                        disabled={courseOutcomes.length === 0 || programOutcomes.length === 0}
                                    >
                                        <Download className="w-5 h-5" />
                                        <span>Export CSV</span>
                                    </button>
                                    <button
                                        onClick={handleSaveAll}
                                        disabled={!hasUnsavedChanges || updateStatus === "loading"}
                                        className="btn btn-primary flex items-center space-x-2 shadow-lg shadow-primary-500/30"
                                    >
                                        {updateStatus === "loading" ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5" />
                                        )}
                                        <span>Save All Mappings</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center">
                        <Network className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Select Program and Course
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Choose a program and course from the filters above to view and edit CO-PO mappings
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoPoMapping;
