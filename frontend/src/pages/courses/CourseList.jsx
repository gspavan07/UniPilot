import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourses,
  deleteCourse,
  createCourse,
  updateCourse,
} from "../../store/slices/courseSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchRegulations } from "../../store/slices/regulationSlice";
import CourseForm from "./CourseForm";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Book,
  Loader2,
  Award,
  BookOpen,
  Calendar,
  MoreVertical,
  Building,
  GraduationCap,
} from "lucide-react";

const CourseList = () => {
  const dispatch = useDispatch();
  const {
    courses,
    status: courseStatus,
    error: courseError,
  } = useSelector((state) => state.courses);
  const { departments } = useSelector((state) => state.departments);
  const { programs } = useSelector((state) => state.programs);
  const { regulations } = useSelector((state) => state.regulations);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
    dispatch(fetchRegulations());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course from the catalog?",
      )
    ) {
      await dispatch(deleteCourse(id));
    }
  };

  const handleSave = async (formData) => {
    if (selectedCourse) {
      await dispatch(
        updateCourse({ id: selectedCourse.id, data: formData }),
      ).unwrap();
    } else {
      await dispatch(createCourse(formData)).unwrap();
    }
  };

  const openAddForm = () => {
    setSelectedCourse(null);
    setIsFormOpen(true);
  };

  const openEditForm = (course) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Course Catalog
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage subject specifications, credits, and syllabus across
            departments.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="btn btn-primary flex items-center shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Course
        </button>
      </div>

      {/* Grid of Course Cards */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, code, or department..."
            className="input pl-10 w-full focus:ring-2 focus:ring-primary-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {courseStatus === "loading" && courses.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">
            Fetching course catalog...
          </p>
        </div>
      ) : courseError ? (
        <div className="py-24 text-center">
          <p className="text-error-500 font-bold mb-2">Sync Error</p>
          <p className="text-gray-500 text-sm mb-6">{courseError}</p>
          <button
            onClick={() => dispatch(fetchCourses())}
            className="btn btn-secondary"
          >
            Retry
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-24 text-center card border-dashed">
          <Book className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-bold mb-1">
            No courses found
          </p>
          <p className="text-gray-500 text-sm">
            Start building your curriculum today.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="card p-6 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-bl-[100px] -mr-12 -mt-12 transition-all group-hover:bg-primary-500 group-hover:w-full group-hover:h-full group-hover:rounded-none group-hover:m-0 group-hover:opacity-10 z-0"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display leading-tight">
                        {course.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono tracking-wider">
                        {course.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditForm(course)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    {course.credits} Credits
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 text-[10px] font-bold text-secondary-700 dark:text-secondary-400 uppercase tracking-wide flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Sem {course.semester}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-info-100 dark:bg-info-900/30 text-[10px] font-bold text-info-700 dark:text-info-400 uppercase tracking-wide">
                    {course.course_type}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 mb-4 h-24 overflow-hidden">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">
                    {course.description ||
                      "No description provided for this course."}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-[11px] font-bold text-gray-400">
                    <Building className="w-3 h-3 mr-1" />
                    {course.department?.name || "GENERIC"}
                  </div>
                  {course.program && (
                    <div className="flex items-center text-[11px] font-bold text-primary-500">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {course.program.code}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Slide-over */}
      <CourseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        course={selectedCourse}
        departmentList={departments}
        programList={programs}
        regulationList={regulations}
      />
    </div>
  );
};

export default CourseList;
