import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCourses } from "../../store/slices/courseSlice";
import {
  BookOpen,
  Search,
  Award,
  Calendar,
  Building,
  GraduationCap,
  Loader2,
  FileText,
  Clock,
} from "lucide-react";

const MyCourses = () => {
  const dispatch = useDispatch();
  const { courses, status, error } = useSelector((state) => state.courses);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/40 rounded-2xl text-primary-600 dark:text-primary-400 shadow-inner">
            <BookOpen className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display tracking-tight">
              My Academic Curriculum
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <Clock className="w-4 h-4 mr-1.5" /> Enrolled Subjects for Current
              Semester
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
        <input
          type="text"
          placeholder="Filter your subjects by name or code..."
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {status === "loading" ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading your syllabus...</p>
        </div>
      ) : error ? (
        <div className="py-24 text-center card bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20">
          <p className="text-red-500 font-bold mb-2">Sync Error</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
          <FileText className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold mb-2">No Courses Enrolled</h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            It looks like your academic profile isn't linked to any courses for
            the current semester yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-300 relative overflow-hidden flex flex-col"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                    {course.code}
                  </span>
                  <h3 className="text-xl font-bold leading-tight group-hover:text-primary-600 transition-colors">
                    {course.name}
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  {course.course_type === "LAB" ? (
                    <Clock className="w-6 h-6 text-indigo-500" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-primary-500" />
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center text-sm text-gray-500">
                  <Award className="w-4 h-4 mr-2 text-amber-500" />
                  <span className="font-bold text-gray-900 dark:text-white mr-1">
                    {course.credits}
                  </span>{" "}
                  Credits Course
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                  Semester{" "}
                  <span className="font-bold text-gray-900 dark:text-white ml-1">
                    {course.semester}
                  </span>
                </div>
                {course.description && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 italic">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {course.department?.code || "DEPT"}
                  </span>
                </div>
                <button className="flex items-center text-primary-600 font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
                  View Syllabus <FileText className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
