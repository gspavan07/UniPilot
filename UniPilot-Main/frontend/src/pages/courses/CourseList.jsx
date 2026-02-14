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
  Building,
  GraduationCap,
  ArrowLeft,
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department_id: "",
    program_id: "",
    regulation_id: "",
    semester: "",
    course_type: "",
  });

  useEffect(() => {
    dispatch(fetchCourses(filters));
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
    dispatch(fetchRegulations());
  }, [dispatch, filters]);

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      department_id: "",
      program_id: "",
      regulation_id: "",
      semester: "",
      course_type: "",
    });
    setSearchTerm("");
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
        >
          <ArrowLeft
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            strokeWidth={2.5}
          />
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Course Catalog
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage subject specifications, credits, and syllabus across
                departments
              </p>
            </div>
          </div>
          <button
            onClick={openAddForm}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code, or department..."
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showFilters
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Filters"}
          </button>
          {(filters.department_id ||
            filters.program_id ||
            filters.regulation_id ||
            filters.semester ||
            filters.course_type ||
            searchTerm) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Department
                </label>
                <select
                  name="department_id"
                  value={filters.department_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Program
                </label>
                <select
                  name="program_id"
                  value={filters.program_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                >
                  <option value="">All Programs</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Regulation
                </label>
                <select
                  name="regulation_id"
                  value={filters.regulation_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                >
                  <option value="">All Regulations</option>
                  {regulations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Semester
                </label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Course Type
                </label>
                <select
                  name="course_type"
                  value={filters.course_type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="theory">Theory</option>
                  <option value="lab">Lab</option>
                  <option value="project">Project</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content States */}
        {courseStatus === "loading" && courses.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Fetching course catalog...
            </p>
          </div>
        ) : courseError ? (
          <div className="py-24 text-center">
            <p className="text-red-600 dark:text-red-400 font-bold mb-2">
              Sync Error
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              {courseError}
            </p>
            <button
              onClick={() => dispatch(fetchCourses())}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-24 text-center bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-black dark:text-white font-bold mb-1">
              No courses found
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Start building your curriculum today
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white leading-tight">
                        {course.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                        {course.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditForm(course)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {course.credits} Credits
                  </span>
                  <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Sem {course.semester}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                    {course.course_type}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 mb-4 min-h-[60px]">
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {course.description ||
                      "No description provided for this course."}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    <Building className="w-3.5 h-3.5 mr-1" />
                    {course.department?.name || "GENERIC"}
                  </div>
                  {course.program && (
                    <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
                      <GraduationCap className="w-3.5 h-3.5 mr-1" />
                      {course.program.code}
                    </div>
                  )}
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
    </div>
  );
};

export default CourseList;
