import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCourses,
  deleteCourse,
  createCourse,
  updateCourse,
} from "../../store/slices/courseSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import {
  fetchRegulations,
  updateRegulation,
} from "../../store/slices/regulationSlice";
import { fetchBatchYears } from "../../store/slices/userSlice";
import CourseForm from "../courses/CourseForm";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Award,
  Calendar,
  Loader2,
  AlertCircle,
  ChevronRight,
  Book,
  ArrowLeft,
  Settings,
  Filter,
  Network,
} from "lucide-react";

/**
 * RegulationViewer - A premium, full-page curriculum management interface for a specific regulation.
 * Styled to match RegulationManager but with a Blue theme.
 */
const RegulationViewer = () => {
  const { id: regulationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courses: allCourses, status } = useSelector((state) => state.courses);
  const { regulations } = useSelector((state) => state.regulations);
  const { departments } = useSelector((state) => state.departments);
  const { programs } = useSelector((state) => state.programs);
  const { batchYears } = useSelector((state) => state.users);

  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedBatchYear, setSelectedBatchYear] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [targetSemester, setTargetSemester] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const regulation = regulations.find((r) => r.id === regulationId);

  useEffect(() => {
    if (regulationId) {
      dispatch(fetchCourses({}));
      dispatch(fetchDepartments());
      dispatch(fetchPrograms());
      dispatch(fetchRegulations());
      dispatch(fetchBatchYears());
    }
  }, [dispatch, regulationId]);

  const availablePrograms = programs.filter(
    (p) => !selectedDeptId || p.department_id === selectedDeptId,
  );

  const academicDepartments = departments.filter((d) => d.type === "academic");

  // Helper to derive context from Regulation's courses_list
  const getCourseContext = (courseId, preferredProgramId = null, preferredBatch = null) => {
    if (!regulation?.courses_list) return { semester: null, program_id: null, batch_year: null };

    // Helper to search within a program's structure
    const searchProgram = (progId) => {
      const progData = regulation.courses_list[progId];
      if (!progData) return null;

      // If batch is preferred, look there first
      if (preferredBatch && progData[preferredBatch]) {
        const semesters = progData[preferredBatch];
        for (const [sem, courses] of Object.entries(semesters)) {
          if (Array.isArray(courses) && courses.includes(courseId)) {
            return { semester: Number(sem), program_id: progId, batch_year: Number(preferredBatch) };
          }
        }
      }

      // Otherwise scan all batches
      for (const [batch, semesters] of Object.entries(progData)) {
        for (const [sem, courses] of Object.entries(semesters)) {
          if (Array.isArray(courses) && courses.includes(courseId)) {
            return { semester: Number(sem), program_id: progId, batch_year: Number(batch) };
          }
        }
      }
      return null;
    };

    // 1. Try preferred program
    if (preferredProgramId) {
      const result = searchProgram(preferredProgramId);
      if (result) return result;
    }

    // 2. Scan all programs
    for (const progId of Object.keys(regulation.courses_list)) {
      // Skip if we already checked preferred
      if (preferredProgramId && progId === preferredProgramId) continue;

      const result = searchProgram(progId);
      if (result) return result;
    }

    return { semester: null, program_id: null, batch_year: null };
  };

  // Helper to sync courses_list in Regulation model
  const syncRegulationCourses = async (
    newCourseId = null,
    context = null,
    action = "add",
  ) => {
    if (!regulation) return;

    const currentList = JSON.parse(
      JSON.stringify(regulation.courses_list || {}),
    );
    const progKey = context?.program_id || selectedProgramId || "common";
    const batchKey = context?.batch_year || selectedBatchYear; // Must have batch
    const semKey = context?.semester || targetSemester;

    if (!batchKey) {
      alert("Please select a Batch Year first.");
      return;
    }

    // Ensure structure exists
    if (!currentList[progKey]) currentList[progKey] = {};
    if (!currentList[progKey][batchKey]) currentList[progKey][batchKey] = {};
    if (!currentList[progKey][batchKey][semKey]) currentList[progKey][batchKey][semKey] = [];

    // Remove ID from CURRENT program/batch (handle moves/deletes)
    if (newCourseId && currentList[progKey][batchKey]) {
      Object.keys(currentList[progKey][batchKey]).forEach((s) => {
        currentList[progKey][batchKey][s] = currentList[progKey][batchKey][s].filter(
          (id) => id !== newCourseId,
        );
      });
    }

    // Add to new location if not delete
    if (action !== "delete" && newCourseId) {
      if (!currentList[progKey][batchKey][semKey].includes(newCourseId)) {
        currentList[progKey][batchKey][semKey].push(newCourseId);
      }
    }

    await dispatch(
      updateRegulation({
        id: regulationId,
        data: { courses_list: currentList },
      }),
    ).unwrap();
  };

  // Derive regulation-specific courses filtered by program (including common courses)
  const regulationCourses = (Array.isArray(allCourses) ? allCourses : [])
    .filter((c) => {
      if (!regulation?.courses_list) return false;

      // Check if course ID exists in the current regulation's list for the SELECTED program
      const context = getCourseContext(c.id, selectedProgramId, selectedBatchYear);

      // If context returns nulls, it's not in this program (or regulation if no prog selected)
      if (context.semester === null) return false;

      // If a program is selected, duplicate check: getCourseContext with arg ensures we found it IN that program
      if (selectedProgramId && context.program_id !== selectedProgramId) {
        return false;
      }

      // If batch is selected, ensure it matches
      if (selectedBatchYear && context.batch_year !== Number(selectedBatchYear)) {
        return false;
      }

      return true;
    })
    .map((c) => {
      const context = getCourseContext(c.id, selectedProgramId, selectedBatchYear);
      return { ...c, ...context }; // Inject derived semester
    });

  const handleDelete = async (courseId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this course from this regulation?",
      )
    ) {
      // 1. Update Regulation courses_list (Remove ID)
      // Look up context to know where to delete from
      const context = getCourseContext(courseId, selectedProgramId, selectedBatchYear);
      await syncRegulationCourses(courseId, context, "delete");

      // No need to update Course model anymore as regulation_id column is gone.

      dispatch(fetchRegulations()); // Refresh regulation to get new courses_list
      // validation: maybe fetchCourses not needed if we rely on list?
      // but we need to trigger re-render of regulationCourses
    }
  };

  const handleSave = async (formData) => {
    let savedCourse;
    // Extract context from form data (passed up from CourseForm or state)
    const context = {
      program_id: formData.program_id,
      semester: formData.semester,
      batch_year: selectedBatchYear || formData.batch_year,
    };

    // Clean up formData to not send regulation_id if backend doesn't support it,
    // though existing backend ignores extra fields usually.
    // CourseForm might still send it, but we can strip it if we want flexibility.

    if (selectedCourse) {
      savedCourse = await dispatch(
        updateCourse({ id: selectedCourse.id, data: formData }),
      ).unwrap();
    } else {
      savedCourse = await dispatch(
        createCourse({
          ...formData,
          // regulation_id: regulationId, // Removed as per new schema
        }),
      ).unwrap();
    }

    // Sync with Regulation.courses_list
    if (savedCourse?.id) {
      await syncRegulationCourses(savedCourse.id, context, "add");
    }

    dispatch(fetchCourses({}));
    dispatch(fetchRegulations());
    setIsFormOpen(false);
  };

  const handleSelectExisting = async (courseId) => {
    // 1. No Course update needed for regulation_id

    // 2. Add to Regulation.courses_list
    const context = {
      program_id: selectedProgramId,
      batch_year: selectedBatchYear,
      semester: targetSemester,
    };
    await syncRegulationCourses(courseId, context, "add");

    dispatch(fetchRegulations());
    setIsSelectorOpen(false);
  };

  const openAddChoice = (sem = 1) => {
    setTargetSemester(sem);
    setIsChoiceModalOpen(true);
  };

  const openAddForm = () => {
    setSelectedCourse(null);
    setIsChoiceModalOpen(false);
    setIsFormOpen(true);
  };

  const openSelector = () => {
    setIsChoiceModalOpen(false);
    setIsSelectorOpen(true);
  };

  const openEditForm = (course) => {
    // Inject context (semester/program) so form knows current state
    const context = getCourseContext(course.id, selectedProgramId, selectedBatchYear);
    setSelectedCourse({ ...course, ...context });
    setIsFormOpen(true);
  };

  // Group regulation courses by semester
  const semesterGroups = regulationCourses.reduce((acc, course) => {
    const sem = course.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(course);
    return acc;
  }, {});

  const maxSem = Math.max(8, ...Object.keys(semesterGroups).map(Number));
  const semesters = Array.from({ length: maxSem }, (_, i) => i + 1);

  if (!regulation && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!regulation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Regulation Not Found
        </h2>
        <button
          onClick={() => navigate("/regulations")}
          className="mt-6 text-blue-600 font-bold hover:underline"
        >
          Back to Regulations
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/regulations")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  {regulation.name} Curriculum
                </h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage courses and academic structure for this regulation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedProgramId && (
              <button
                onClick={() =>
                  navigate(
                    `/regulations/${regulationId}/co-po-mapping?program_id=${selectedProgramId}`,
                  )
                }
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <Network className="w-4 h-4" />
                CO-PO Mapping
              </button>
            )}
          </div>
        </div>

        {/* Context Selection Bar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Filter By
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedProgramId("");
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {academicDepartments.map((d) => (
                  // <option key={d.id} value={d.id}>
                  //   {d.name}
                  // </option>
                  <option key={d.id} value={d.id} title={d.name}>
                    {d.name.length > 40 ? `${d.name.slice(0, 40)}...` : d.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
              <select
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  // Reset batch when program changes? Maybe keep it if applicable.
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Program</option>
                {availablePrograms.map((p) => (
                  // <option key={p.id} value={p.id}>
                  //   {p.name}
                  // </option>
                  <option key={p.id} value={p.id} title={p.name}>
                    {p.name.length > 40 ? `${p.name.slice(0, 40)}...` : p.name}
                  </option>
                ))}
              </select>

              {selectedProgramId && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                  <select
                    value={selectedBatchYear}
                    onChange={(e) => setSelectedBatchYear(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Batch Year</option>
                    {batchYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {selectedProgramId && (
              <div className="flex items-center gap-4 ml-auto">
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Total Courses
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {regulationCourses.length}
                  </p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:border-gray-700" />
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Grading
                  </p>
                  <p className="text-xl font-bold text-black dark:text-white">
                    {regulation.grading_system}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {!selectedProgramId || !selectedBatchYear ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-6">
              <Settings className="w-10 h-10" />
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                Select Program & Batch
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Please select a department, program, and batch year above to view and manage
                courses for this regulation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {semesters.map((sem) => (
              <section key={sem}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                      {sem}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">
                        Semester {sem}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {semesterGroups[sem]?.length || 0} courses
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openAddChoice(sem)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Course
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {semesterGroups[sem]?.length > 0 ? (
                    semesterGroups[sem].map((course) => (
                      <div
                        key={course.id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow relative group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded">
                            {course.code}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditForm(course)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-base font-semibold text-black dark:text-white line-clamp-2 leading-tight mb-4">
                          {course.name}
                        </h4>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
                            <Award className="w-3.5 h-3.5 text-blue-500" />
                            <span>{course.credits} Credits</span>
                          </div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {course.course_type}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-gray-400" />
                      </div>
                      <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        No courses yet
                      </h5>
                      <p className="text-xs text-gray-400 mb-3">
                        Add courses to this semester
                      </p>
                      <button
                        onClick={() => openAddChoice(sem)}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Add First Course
                      </button>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <CourseForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          course={
            selectedCourse
              ? selectedCourse
              : {
                regulation_id: regulationId,
                semester: targetSemester,
                department_id: selectedDeptId,
                program_id: selectedProgramId,
                batch_year: selectedBatchYear,
              }
          }
          departmentList={departments}
          programList={programs}
          regulationList={regulations}
        />
      )}

      {/* Choice Modal */}
      {isChoiceModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-2 text-center">
              Add Course
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-8">
              Choose how you want to add this course
            </p>

            <div className="space-y-3">
              <button
                onClick={openAddForm}
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="block font-semibold text-black dark:text-white text-base">
                    Create New Course
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Design a custom course entry
                  </span>
                </div>
              </button>

              <button
                onClick={openSelector}
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 transition-all">
                  <Book className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="block font-semibold text-black dark:text-white text-base">
                    Link Existing Course
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Select from course library
                  </span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setIsChoiceModalOpen(false)}
              className="mt-6 w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Selector Modal */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-black dark:text-white">
                  Select Course
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Choose from available courses
                </p>
              </div>
              <button
                onClick={() => setIsSelectorOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Book className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-2">
              {(Array.isArray(allCourses) ? allCourses : [])
                .filter((c) => {
                  const ctx = getCourseContext(c.id, selectedProgramId, selectedBatchYear);
                  // Hide if found in the current program/batch context
                  if (
                    ctx.semester !== null &&
                    ctx.program_id === selectedProgramId &&
                    ctx.batch_year === Number(selectedBatchYear)
                  ) {
                    return false;
                  }
                  return true;
                })
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.code.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectExisting(c.id)}
                    className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all font-semibold text-base">
                        {c.credits}
                      </div>
                      <div>
                        <h4 className="font-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base">
                          {c.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{c.code}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{c.course_type}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              {allCourses.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No courses available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulationViewer;
