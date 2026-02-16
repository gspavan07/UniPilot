import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCourses } from "../../store/slices/courseSlice";
import {
  BookOpen,
  Search,
  Award,
  Calendar,
  Building,
  Loader2,
  FileText,
  Clock,
  X,
  List,
  Target,
  Grid,
  ArrowRight,
  ChevronRight,
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
    <div className="min-h-screen bg-white text-black font-sans pb-24 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        {/* Header: Typographic & Minimal */}
        <header className="mb-16 border-b border-black pb-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <span className="block text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">
                Academic Curriculum
              </span>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-black leading-none">
                My Courses.
              </h1>
            </div>

            {/* Search - Minimal Underline style */}
            <div className="w-full md:w-auto">
              <div className="relative group min-w-[300px]">
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  className="w-full py-3 px-5 bg-transparent border-b border-gray-300 rounded-2xl focus:border-blue-600 text-lg font-medium outline-none transition-colors placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
            </div>
          </div>
        </header>

        {status === "loading" ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Curriculum...</p>
          </div>
        ) : error ? (
          <div className="py-24 border border-red-200 bg-red-50 p-8 rounded-none">
            <p className="text-red-600 font-bold mb-2 uppercase tracking-wide">Sync Error</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-32 text-center border-y border-gray-100">
            <h3 className="text-2xl font-bold mb-2">No Courses Found</h3>
            <p className="text-gray-400">
              Your search did not match any enrolled courses.
            </p>
          </div>
        ) : (
          /* Grid Layout - Swiss Style */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group relative flex flex-col h-full cursor-pointer rounded-md"
                onClick={() => handleViewSyllabus(course)}
              >
                {/* Course Meta Top */}
                <div className="flex justify-between items-baseline mb-4">
                  <span className="font-mono text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                    {course.code}
                  </span>
                  <span className="px-2 py-0.5 border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Sem {course.semester}
                  </span>
                </div>

                {/* Course Name */}
                <h3 className="text-2xl font-bold leading-tight mb-6 group-hover:text-blue-600 transition-colors">
                  {course.name}
                </h3>

                {/* Divider */}
                <div className="w-12 h-1 bg-black mb-6 group-hover:w-full group-hover:bg-blue-600 transition-all duration-500 ease-out"></div>

                {/* Details Footer */}
                <div className="mt-auto pt-4 flex items-center justify-between text-sm font-medium text-gray-500 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      {course.course_type === "LAB" ? <Clock className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      {course.course_type === "LAB" ? "Lab" : "Theory"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      {course.credits} Credits
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Syllabus Drawer - Clean & High Contrast */}
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedCourse(null)}
            />
            <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300">

              {/* Drawer Header */}
              <div className="px-8 py-6 border-b border-black flex justify-between items-start bg-white z-10">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 mb-2 block">
                    {selectedCourse.code}
                  </span>
                  <h2 className="text-3xl font-bold text-black leading-tight">
                    {selectedCourse.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 hover:bg-black hover:text-white transition-colors rounded-full border border-transparent hover:border-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-12">

                {/* Description */}
                {selectedCourse.description && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                      Overview
                    </h3>
                    <p className="text-lg text-gray-800 leading-relaxed font-light">
                      {selectedCourse.description}
                    </p>
                  </section>
                )}

                {/* Syllabus */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <List className="w-4 h-4" /> Syllabus
                  </h3>

                  {selectedCourse.syllabus_data && selectedCourse.syllabus_data.length > 0 ? (
                    <div className="border-l-2 border-black pl-6 space-y-8">
                      {selectedCourse.syllabus_data.map((unit, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[33px] top-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                          </span>
                          <h4 className="text-xl font-bold text-black mb-3">Unit {unit.unit}: {unit.title}</h4>
                          <ul className="space-y-2">
                            {unit.topics.map((topic, tIdx) => (
                              <li key={tIdx} className="text-sm text-gray-600 leading-relaxed flex items-start">
                                <span className="mr-3 mt-1.5 h-1 w-1 bg-black rounded-full shrink-0"></span>
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 border border-dashed border-gray-300 text-center text-gray-500">
                      Syllabus not available.
                    </div>
                  )}
                </section>

                {/* Outcomes */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Outcomes
                  </h3>
                  {loadingOutcomes ? (
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                  ) : courseOutcomes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {courseOutcomes.map((co, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 hover:border-black transition-colors">
                          <div className="flex gap-4">
                            <span className="font-mono text-xs font-bold text-blue-600 shrink-0 mt-1">
                              {co.co_code || `CO${idx + 1}`}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-black leading-relaxed mb-3">
                                {co.description}
                              </p>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1 bg-gray-100">
                                  <div className="h-full bg-blue-600" style={{ width: `${co.target_attainment || 60}%` }}></div>
                                </div>
                                <span className="font-mono text-[10px] text-gray-400">Target: {co.target_attainment}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No outcomes defined.</p>
                  )}
                </section>

                {/* Matrix */}
                {matrixData && matrixData.programOutcomes.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                      <Grid className="w-4 h-4" /> CO-PO Mapping
                    </h3>

                    {loadingMatrix ? (
                      <Loader2 className="w-6 h-6 animate-spin text-black" />
                    ) : (
                      <div className="overflow-x-auto border border-gray-200">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-gray-50 border-b border-gray-200 uppercase font-bold text-gray-500">
                            <tr>
                              <th className="px-3 py-2 border-r border-gray-200 sticky left-0 bg-gray-50">CO</th>
                              {matrixData.programOutcomes.map((po) => (
                                <th key={po.id} className="px-2 py-2 text-center border-r border-gray-200 min-w-[30px]">
                                  {po.po_code}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {matrixData.courseOutcomes.map((co) => (
                              <tr key={co.id} className="hover:bg-blue-50/20">
                                <td className="px-3 py-2 font-bold text-black border-r border-gray-200 sticky left-0 bg-white">
                                  {co.co_code}
                                </td>
                                {matrixData.programOutcomes.map((po) => {
                                  const weightage = matrixData.matrix[co.id]?.[po.id] || 0;
                                  return (
                                    <td key={po.id} className={`px-2 py-2 text-center border-r border-gray-100 ${weightage === 3 ? "bg-black text-white font-bold" :
                                      weightage === 2 ? "bg-gray-200 text-black font-bold" :
                                        weightage === 1 ? "bg-gray-100 text-gray-500" :
                                          "text-gray-200"
                                      }`}>
                                      {weightage > 0 ? weightage : "·"}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-[10px] text-gray-400 mt-2 text-right p-2">
                          3: High, 2: Medium, 1: Low
                        </p>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
