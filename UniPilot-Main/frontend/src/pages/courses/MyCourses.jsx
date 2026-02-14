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
  X,
  CheckCircle2,
  List,
  Target,
  Grid,
} from "lucide-react";
import api from "../../utils/api";

const MyCourses = () => {
  const dispatch = useDispatch();
  const { courses, status, error } = useSelector((state) => state.courses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [loadingOutcomes, setLoadingOutcomes] = useState(false);
  const [matrixData, setMatrixData] = useState(null);
  const [loadingMatrix, setLoadingMatrix] = useState(false);

  const handleViewSyllabus = async (course) => {
    setSelectedCourse(course);
    setLoadingOutcomes(true);
    setLoadingMatrix(true);

    try {
      // Fetch outcomes
      const outcomesResponse = await api.get(`/course-outcomes?course_id=${course.id}`);
      if (outcomesResponse.data.success) {
        setCourseOutcomes(outcomesResponse.data.data);
      } else {
        setCourseOutcomes([]);
      }

      // Fetch CO-PO Matrix if program_id exists
      if (course.program_id) {
        const matrixResponse = await api.get(`/co-po-maps/matrix?course_id=${course.id}&program_id=${course.program_id}`);
        if (matrixResponse.data.success) {
          setMatrixData(matrixResponse.data.data);
        } else {
          setMatrixData(null);
        }
      } else {
        setMatrixData(null);
      }

    } catch (err) {
      console.error("Failed to fetch course details", err);
      setCourseOutcomes([]);
      setMatrixData(null);
    } finally {
      setLoadingOutcomes(false);
      setLoadingMatrix(false);
    }
  };

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
                <button
                  onClick={() => handleViewSyllabus(course)}
                  className="flex items-center text-primary-600 font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
                >
                  View Syllabus <FileText className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Syllabus & Outcomes Drawer */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCourse(null)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 sticky top-0">
              <div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  {selectedCourse.code}
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mt-0.5">
                  {selectedCourse.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">

              {/* Course Description */}
              {selectedCourse.description && (
                <div className="bg-primary-50/50 dark:bg-primary-900/10 p-4 rounded-2xl border border-primary-100 dark:border-primary-900/20">
                  <h3 className="text-sm font-bold text-primary-700 dark:text-primary-300 mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" /> Course Overview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>
              )}

              {/* Syllabus Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <List className="w-5 h-5 mr-2 text-indigo-500" /> Syllabus
                </h3>

                {selectedCourse.syllabus_data && selectedCourse.syllabus_data.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCourse.syllabus_data.map((unit, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Unit {unit.unit}</span>
                          {/* <span className="text-xs font-medium bg-white dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 shadow-sm border border-gray-100 dark:border-gray-600">8 Hours</span> */}
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-base">{unit.title}</h4>
                          <ul className="space-y-2">
                            {unit.topics.map((topic, tIdx) => (
                              <li key={tIdx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-2.5 flex-shrink-0"></span>
                                <span className="leading-relaxed">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 italic">No syllabus details available.</p>
                  </div>
                )}
              </div>

              {/* Course Outcomes Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-emerald-500" /> Course Outcomes (COs)
                </h3>

                {loadingOutcomes ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  </div>
                ) : courseOutcomes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {courseOutcomes.map((co, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-900/20">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-emerald-600 font-bold text-sm">
                            {co.co_code || `CO${idx + 1}`}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                            {co.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${co.target_attainment || 60}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Target: {co.target_attainment}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 italic">No course outcomes defined.</p>
                  </div>
                )}
              </div>

              {/* CO-PO Mapping Matrix Section */}
              {matrixData && matrixData.programOutcomes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Grid className="w-5 h-5 mr-2 text-blue-500" /> CO-PO Mapping
                  </h3>

                  {loadingMatrix ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                          <tr>
                            <th className="px-4 py-3 border-b border-r border-gray-100 dark:border-gray-700 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 w-20">CO / PO</th>
                            {matrixData.programOutcomes.map((po) => (
                              <th key={po.id} className="px-2 py-3 border-b border-gray-100 dark:border-gray-700 text-center min-w-[3rem]" title={po.description}>
                                {po.po_code}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
                          {matrixData.courseOutcomes.map((co) => (
                            <tr key={co.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white border-r border-gray-100 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-900 z-10">
                                {co.co_code}
                              </td>
                              {matrixData.programOutcomes.map((po) => {
                                const weightage = matrixData.matrix[co.id]?.[po.id] || 0;
                                let cellClass = "text-gray-300 dark:text-gray-700"; // Default empty
                                if (weightage === 3) cellClass = "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20";
                                if (weightage === 2) cellClass = "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/10";
                                if (weightage === 1) cellClass = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10";

                                return (
                                  <td key={po.id} className={`px-2 py-3 text-center border-r border-gray-50 dark:border-gray-800 last:border-r-0 ${cellClass}`}>
                                    {weightage > 0 ? weightage : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 text-right italic">
                    Correlation levels: 3 (High), 2 (Medium), 1 (Low)
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-center">
              <button
                onClick={() => setSelectedCourse(null)}
                className="w-full py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
