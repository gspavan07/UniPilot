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
import { fetchRegulations } from "../../store/slices/regulationSlice";
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
} from "lucide-react";

/**
 * RegulationViewer - A full-page curriculum management interface for a specific regulation.
 */
const RegulationViewer = () => {
  const { id: regulationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courses: allCourses, status } = useSelector((state) => state.courses);
  const { regulations } = useSelector((state) => state.regulations);
  const { departments } = useSelector((state) => state.departments);
  const { programs } = useSelector((state) => state.programs);

  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [targetSemester, setTargetSemester] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const regulation = regulations.find((r) => r.id === regulationId);

  useEffect(() => {
    if (regulationId) {
      // Fetch all courses to derive both regulation-specific and selector lists
      dispatch(fetchCourses({}));
      dispatch(fetchDepartments());
      dispatch(fetchPrograms());
      dispatch(fetchRegulations());
    }
  }, [dispatch, regulationId]);

  // Derive regulation-specific courses filtered by program (including common courses)
  const regulationCourses = (
    Array.isArray(allCourses) ? allCourses : []
  ).filter(
    (c) =>
      c.regulation_id === regulationId &&
      (!selectedProgramId ||
        c.program_id === selectedProgramId ||
        c.program_id === null),
  );

  const availablePrograms = programs.filter(
    (p) => !selectedDeptId || p.department_id === selectedDeptId,
  );

  const academicDepartments = departments.filter((d) => d.type === "academic");

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this course from this regulation?",
      )
    ) {
      // Unlink the course instead of deleting it globally
      await dispatch(
        updateCourse({ id, data: { regulation_id: null, semester: null } }),
      ).unwrap();
      dispatch(fetchCourses({}));
    }
  };

  const handleSave = async (formData) => {
    if (selectedCourse) {
      await dispatch(
        updateCourse({ id: selectedCourse.id, data: formData }),
      ).unwrap();
    } else {
      await dispatch(
        createCourse({
          ...formData,
          department_id: selectedDeptId,
          program_id: selectedProgramId,
          regulation_id: regulationId,
        }),
      ).unwrap();
    }
    dispatch(fetchCourses({}));
    setIsFormOpen(false);
  };

  const handleSelectExisting = async (courseId) => {
    await dispatch(
      updateCourse({
        id: courseId,
        data: {
          regulation_id: regulationId,
          semester: targetSemester,
          department_id: selectedDeptId,
          program_id: selectedProgramId,
        },
      }),
    ).unwrap();
    dispatch(fetchCourses({}));
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
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  // Group regulation courses by semester
  const semesterGroups = regulationCourses.reduce((acc, course) => {
    const sem = course.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(course);
    return acc;
  }, {});

  // Determine max semesters (usually 8 for engineering, but flexible)
  const maxSem = Math.max(8, ...Object.keys(semesterGroups).map(Number));
  const semesters = Array.from({ length: maxSem }, (_, i) => i + 1);

  if (!regulation && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
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
          className="mt-6 text-primary-600 font-bold hover:underline"
        >
          Back to Regulations
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-20">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Regulation Top Bar */}
          <div className="py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/regulations")}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                title="Back to Regulations"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display tracking-tight leading-none">
                  {regulation.name}{" "}
                  <span className="text-gray-400 font-medium mx-1">/</span>{" "}
                  Curriculum
                </h1>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />{" "}
                    {regulation.academic_year}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-bold uppercase">
                    {regulation.grading_system}
                  </span>
                </div>
              </div>
            </div>

            {selectedProgramId && (
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                    {regulationCourses.length} Courses
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">
                    Total in View
                  </p>
                </div>
                <div className="h-8 w-px bg-gray-100 dark:bg-gray-700 mx-2 hidden md:block" />
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 text-primary-600 dark:text-primary-400">
                  <Book className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {programs.find((p) => p.id === selectedProgramId)?.code}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Context Selection Bar */}
          <div className="py-4 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                Curriculum Context:
              </span>
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    setSelectedProgramId("");
                  }}
                  className="bg-transparent border-none text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer min-w-[200px]"
                >
                  <option value="">All Academic Departments</option>
                  {academicDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer min-w-[200px]"
                >
                  <option value="">Select Program to View Curriculum</option>
                  {availablePrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!selectedProgramId ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
            <div className="w-32 h-32 rounded-[3rem] bg-white dark:bg-gray-800 flex items-center justify-center text-primary-600 shadow-2xl shadow-primary-600/10 border border-gray-100 dark:border-gray-700 animate-in zoom-in duration-500">
              <BookOpen className="w-16 h-16" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight leading-none">
                Curriculum Workspace
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
                Regulations are collective, but curricula are unique. Please
                select a{" "}
                <span className="text-gray-900 dark:text-white font-bold underline decoration-primary-500 decoration-2">
                  Department
                </span>{" "}
                and{" "}
                <span className="text-gray-900 dark:text-white font-bold underline decoration-primary-500 decoration-2">
                  Program
                </span>{" "}
                to view its specific set of courses.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-primary-600 font-bold bg-primary-50 dark:bg-primary-900/20 px-6 py-3 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                <div className="w-2 h-2 rounded-full bg-primary-600 animate-ping" />
                Select Program Above to Begin
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                UniPilot Curriculum Engine
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
            {semesters.map((sem) => (
              <section
                key={sem}
                className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${sem * 50}ms` }}
              >
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center font-bold text-sm">
                      {sem}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Semester {sem}
                    </h3>
                    <span className="text-sm text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {semesterGroups[sem]?.length || 0} Courses
                    </span>
                  </div>
                  <button
                    onClick={() => openAddChoice(sem)}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Plus className="w-4 h-4" /> Add Course
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {semesterGroups[sem]?.length > 0 ? (
                    semesterGroups[sem].map((course) => (
                      <div
                        key={course.id}
                        className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-primary-100 dark:hover:border-primary-900/30 transition-all relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                              {course.name}
                            </h4>
                            <p className="text-xs text-gray-400 font-mono mt-1 tracking-wider uppercase">
                              {course.code}
                            </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditForm(course)}
                              className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                              title="Edit Course"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Remove from Curriculum"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100/50 dark:border-primary-900/20">
                            <Award className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-widest leading-none">
                              {course.credits} Credits
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                            <Book className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-widest leading-none">
                              {course.course_type}
                            </span>
                          </div>
                        </div>

                        {/* Hover background effect */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-white/50 dark:bg-gray-800/30">
                      <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-400">
                        No courses assigned to Semester {sem}
                      </p>
                      <button
                        onClick={() => openAddChoice(sem)}
                        className="mt-4 text-xs font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4"
                      >
                        Start building curriculum
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
                }
          }
          departmentList={departments}
          programList={programs}
          regulationList={regulations}
        />
      )}

      {/* Choice Modal */}
      {isChoiceModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Add Course
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={openAddForm}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900 dark:text-white">
                    Create New
                  </span>
                  <span className="text-xs text-gray-500">
                    Design a fresh course subject
                  </span>
                </div>
              </button>

              <button
                onClick={openSelector}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                  <Book className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900 dark:text-white">
                    Add Existing
                  </span>
                  <span className="text-xs text-gray-500">
                    Pick from universal catalog
                  </span>
                </div>
              </button>
            </div>
            <button
              onClick={() => setIsChoiceModalOpen(false)}
              className="mt-6 w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Selector Modal */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select Existing Course
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Linking to Semester {targetSemester}
                </p>
              </div>
              <button
                onClick={() => setIsSelectorOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin opacity-0 group-focus-within:opacity-0" />
                  <Book className="w-4 h-4 absolute" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(Array.isArray(allCourses) ? allCourses : [])
                .filter((c) => c.regulation_id !== regulationId) // Don't show courses already in this regulation
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.code.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectExisting(c.id)}
                    className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-500 hover:shadow-md transition-all flex items-center justify-between text-left group"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {c.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {c.code} • {c.credits} Credits • {c.course_type}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              {allCourses.length === 0 && (
                <div className="py-12 text-center text-gray-500 italic">
                  No courses available in catalog.
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
