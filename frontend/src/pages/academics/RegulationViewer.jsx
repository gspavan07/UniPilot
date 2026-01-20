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
  Settings,
  Filter,
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
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Header matching RegulationManager style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/regulations")}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors bg-gray-50 dark:bg-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">
                <BookOpen className="w-3 h-3" />
                <span>Curriculum Management</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                {regulation.name}{" "}
                <span className="text-gray-300 dark:text-gray-600 font-light">
                  /
                </span>{" "}
                <span className="text-blue-600">Curriculum</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate(`/regulations/${regulationId}/exams`)}
              className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all border border-transparent"
            >
              Configure Exams
            </button>
            {selectedProgramId && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">
                <Book className="w-3.5 h-3.5" />
                {programs.find((p) => p.id === selectedProgramId)?.code}
              </div>
            )}
          </div>
        </div>

        {/* Global Context Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl mb-10 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedProgramId("");
                }}
                className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-black text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[220px] py-2.5 px-4 uppercase tracking-wider"
              >
                <option value="">All Departments</option>
                {academicDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-gray-300 hidden md:block" />
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-black text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[220px] py-2.5 px-4 uppercase tracking-wider"
              >
                <option value="">Select Specialization</option>
                {availablePrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProgramId && (
            <div className="ml-auto hidden lg:flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Total Courses
                </p>
                <p className="text-lg font-black text-blue-600">
                  {regulationCourses.length}
                </p>
              </div>
              <div className="w-px h-8 bg-gray-100 dark:bg-gray-700" />
              <div className="text-right">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Grading
                </p>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {regulation.grading_system}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Workspace Content */}
        {!selectedProgramId ? (
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm p-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-32 h-32 rounded-[3.5rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mx-auto mb-10 shadow-xl shadow-blue-500/10">
              <Settings className="w-16 h-16 animate-spin-slow" />
            </div>
            <div className="max-w-xl mx-auto space-y-6">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Curriculum Studio
              </h2>
              <p className="text-lg text-gray-400 font-medium leading-relaxed">
                Before designing the curriculum, please select a specialized
                program. This allows you to build a focused set of courses for
                the selected regulation.
              </p>
              <div className="inline-flex items-center gap-3 text-blue-600 font-black text-sm bg-blue-50 dark:bg-blue-900/20 px-8 py-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10">
                <Filter className="w-4 h-4" />
                Select Context to Begin
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {semesters.map((sem) => (
              <section key={sem} className="group">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center font-black text-xl shadow-lg shadow-gray-500/20">
                      {sem}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        Semester {sem}
                      </h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        {semesterGroups[sem]?.length || 0} Academic Engagements
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openAddChoice(sem)}
                    className="px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-black flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-1 active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Add Subject
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {semesterGroups[sem]?.length > 0 ? (
                    semesterGroups[sem].map((course) => (
                      <div
                        key={course.id}
                        className="group/card bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900/30 transition-all relative overflow-hidden flex flex-col min-h-[220px]"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/20">
                            {course.code}
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-all translate-y-2 group-hover/card:translate-y-0 duration-300">
                            <button
                              onClick={() => openEditForm(course)}
                              className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors bg-gray-50 dark:bg-gray-900"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors bg-gray-50 dark:bg-gray-900"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xl font-black text-gray-900 dark:text-white line-clamp-2 leading-tight mb-auto group-hover/card:text-blue-600 transition-colors">
                          {course.name}
                        </h4>

                        <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-black text-sm text-gray-900 dark:text-white">
                            <Award className="w-4 h-4 text-blue-500" />
                            <span>{course.credits} Unit(s)</span>
                          </div>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg">
                            {course.course_type}
                          </div>
                        </div>

                        {/* Visual accent blur */}
                        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] bg-white/30 dark:bg-gray-800/20 hover:border-blue-100 dark:hover:border-blue-900/20 transition-colors group/empty">
                      <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-6 group-hover/empty:scale-110 group-hover/empty:bg-blue-50 duration-300">
                        <Plus className="w-8 h-8 text-gray-300 group-hover/empty:text-blue-600" />
                      </div>
                      <h5 className="text-lg font-black text-gray-400 mb-2 uppercase tracking-widest">
                        Semester Empty
                      </h5>
                      <p className="text-sm font-medium text-gray-400 mb-6">
                        Start building the academic path for this semester
                      </p>
                      <button
                        onClick={() => openAddChoice(sem)}
                        className="text-xs font-black text-blue-600 hover:text-blue-700 underline underline-offset-8 uppercase tracking-[0.2em]"
                      >
                        Initiate Curriculum
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-in zoom-in duration-300 border border-gray-100 dark:border-gray-700">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center tracking-tight">
              Expand Catalog
            </h3>
            <p className="text-center text-gray-400 text-sm font-medium mb-10">
              Choose how you want to add this course
            </p>

            <div className="grid grid-cols-1 gap-6">
              <button
                onClick={openAddForm}
                className="flex items-center gap-6 p-6 rounded-[2rem] border-2 border-gray-50 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group text-left"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <span className="block font-black text-gray-900 dark:text-white text-lg leading-tight uppercase tracking-tight">
                    Author New
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Design a bespoke subject entry
                  </span>
                </div>
              </button>

              <button
                onClick={openSelector}
                className="flex items-center gap-6 p-6 rounded-[2rem] border-2 border-gray-50 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group text-left"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all shadow-lg shadow-gray-500/5">
                  <Book className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <span className="block font-black text-gray-900 dark:text-white text-lg leading-tight uppercase tracking-tight">
                    Link Existing
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Select from primary subject vault
                  </span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setIsChoiceModalOpen(false)}
              className="mt-10 w-full py-4 text-xs font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-[0.2em]"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* Selector Modal */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-gray-100 dark:border-gray-700">
            <div className="p-10 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/10">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">
                  <Book className="w-3 h-3" />
                  <span>Subject Repository</span>
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Universal Selection
                </h3>
              </div>
              <button
                onClick={() => setIsSelectorOpen(false)}
                className="p-3 rounded-2xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl text-gray-400 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 bg-white dark:bg-gray-800">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin opacity-0 group-focus-within:opacity-0" />
                  <Book className="w-4 h-4 absolute" />
                </div>
                <input
                  type="text"
                  placeholder="Master Search Subject or Code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl border-none bg-gray-50 dark:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 shadow-sm font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {(Array.isArray(allCourses) ? allCourses : [])
                .filter((c) => c.regulation_id !== regulationId)
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.code.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectExisting(c.id)}
                    className="w-full p-6 rounded-[2rem] border border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 hover:shadow-2xl transition-all flex items-center justify-between text-left group/item"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover/item:text-blue-600 group-hover/item:bg-blue-50 transition-all font-black text-lg">
                        {c.credits}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 dark:text-white group-hover/item:text-blue-600 transition-colors text-lg tracking-tight">
                          {c.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <span>{c.code}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{c.course_type}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-200 group-hover/item:text-blue-500 group-hover/item:translate-x-2 transition-all" />
                  </button>
                ))}
              {allCourses.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-black uppercase tracking-widest">
                    Vault is currently empty
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
