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
  const [selectedSemester, setSelectedSemester] = useState("All");

  const semesters = ["All", ...new Set(courses.map((c) => c.semester))].sort(
    (a, b) => (a === "All" ? -1 : b === "All" ? 1 : a - b),
  );

  const handleViewSyllabus = async (course) => {
    setSelectedCourse(course);
    setLoadingOutcomes(true);
    setLoadingMatrix(true);

    try {
      // Fetch outcomes
      const outcomesResponse = await api.get(
        `/course-outcomes?course_id=${course.id}`,
      );
      if (outcomesResponse.data.success) {
        setCourseOutcomes(outcomesResponse.data.data);
      } else {
        setCourseOutcomes([]);
      }

      // Fetch CO-PO Matrix if program_id exists
      if (course.program_id) {
        const matrixResponse = await api.get(
          `/co-po-maps/matrix?course_id=${course.id}&program_id=${course.program_id}`,
        );
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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      selectedSemester === "All" || course.semester === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-12">
        {/* Modern Header Section */}
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                Academic Portal
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                My <span className="text-blue-600">Courses.</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Manage your curriculum and track your academic progress.
              </p>
            </div>

            {/* Search - Refined Pill Style */}
            <div className="w-full lg:w-auto flex flex-col md:flex-row gap-6">
              <div className="relative group min-w-[320px]">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full py-4 pl-14 pr-6 bg-white border border-gray-300 rounded-2xl focus:border-blue-600 text-sm font-semibold outline-none transition-all shadow-md shadow-black/[0.02] focus:shadow-blue-500/10 placeholder:text-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
              </div>
            </div>
          </div>

          {/* Semester Filter Tabs */}
          <div className="mt-8 flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`
                  px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300
                  ${
                    selectedSemester === sem
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-gray-50 text-gray-400 border border-gray-100 hover:bg-white hover:text-black hover:shadow-md"
                  }
                `}
              >
                {sem === "All" ? "All Semesters" : `Semester ${sem}`}
              </button>
            ))}
          </div>
        </header>

        {status === "loading" ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-50 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Syncing Curriculum
            </p>
          </div>
        ) : error ? (
          <div className="py-12 px-8 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-red-600">
              <X className="w-6 h-6" />
            </div>
            <div>
              <p className="text-red-600 font-black uppercase tracking-widest text-xs mb-1">
                Service Error
              </p>
              <p className="text-gray-600 text-sm font-medium">{error}</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-40 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-black mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-400 font-medium max-w-sm mx-auto">
              We couldn't find any courses matching your current search
              criteria.
            </p>
          </div>
        ) : (
          /* Premium Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group relative bg-white p-8 rounded-[2.5rem] border border-blue-300 shadow-md shadow-black/[0.03] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-100 cursor-pointer overflow-hidden"
                onClick={() => handleViewSyllabus(course)}
              >
                {/* Background Accent */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50/50 rounded-full group-hover:bg-blue-600/5 transition-all duration-700 blur-3xl"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1 rounded-lg bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-tighter group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {course.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        SEM {course.semester}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-black leading-[1.1] mb-2 group-hover:text-blue-600 transition-colors min-h-[3.3rem] line-clamp-2">
                    {course.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="p-4 bg-gray-100/60 rounded-2xl group-hover:bg-white transition-colors">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Type
                      </p>
                      <div className="flex items-center gap-2 text-black">
                        {course.course_type === "LAB" ? (
                          <Clock className="w-3 h-3 text-blue-600" />
                        ) : (
                          <BookOpen className="w-3 h-3 text-blue-600" />
                        )}
                        <span className="text-xs font-bold">
                          {course.course_type === "LAB"
                            ? "Practical"
                            : "Theory"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-100/60 rounded-2xl group-hover:bg-white transition-colors">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Credits
                      </p>
                      <div className="flex items-center gap-2 text-black">
                        <Award className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-bold">
                          {course.credits} Unit
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500">
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-white group-hover:-rotate-45 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Premium Syllabus Panel */}
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="absolute inset-0 bg-black/5 backdrop-blur-md transition-opacity duration-500"
              onClick={() => setSelectedCourse(null)}
            />
            <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-500 rounded-l-[3rem]">
              {/* Drawer Header */}
              <div className="px-10 py-10 border-b border-gray-50 flex justify-between items-start bg-white z-10 rounded-tl-[3rem]">
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                    {selectedCourse.code}
                  </span>
                  <h2 className="text-4xl font-black text-black leading-tight max-w-lg">
                    {selectedCourse.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-4 bg-gray-50 hover:bg-black text-gray-400 hover:text-white transition-all duration-300 rounded-[1.5rem] shadow-sm active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-10 py-12 space-y-16">
                {/* Description */}
                {selectedCourse.description && (
                  <section>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      <h3 className="text-lg font-black tracking-tight">
                        Executive Summary
                      </h3>
                    </div>
                    <p className="text-xl text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-8 rounded-[2rem] border border-gray-50">
                      {selectedCourse.description}
                    </p>
                  </section>
                )}

                {/* Syllabus Modules */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      <h3 className="text-lg font-black tracking-tight">
                        Learning Modules
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <List className="w-3 h-3" />{" "}
                      {selectedCourse.syllabus_data?.length || 0} Units
                    </span>
                  </div>

                  {selectedCourse.syllabus_data &&
                  selectedCourse.syllabus_data.length > 0 ? (
                    <div className="space-y-4">
                      {selectedCourse.syllabus_data.map((unit, idx) => (
                        <div
                          key={idx}
                          className="group bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-300"
                        >
                          <div className="flex items-start gap-6">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                              <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1 group-hover:text-blue-600">
                                Unit
                              </span>
                              <span className="text-xl font-black text-black group-hover:text-blue-600">
                                {unit.unit}
                              </span>
                            </div>
                            <div className="flex-1 space-y-4">
                              <h4 className="text-xl font-bold text-black border-b border-gray-50 pb-4">
                                {unit.title}
                              </h4>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                {unit.topics.map((topic, tIdx) => (
                                  <li
                                    key={tIdx}
                                    className="text-sm text-gray-500 font-medium flex items-start gap-3"
                                  >
                                    <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {topic}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem] text-center">
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                        Curriculum Pending
                      </p>
                    </div>
                  )}
                </section>

                {/* Performance Analytics / Outcomes */}
                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-black tracking-tight">
                      Competency Outcomes
                    </h3>
                  </div>

                  {loadingOutcomes ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : courseOutcomes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {courseOutcomes.map((co, idx) => (
                        <div
                          key={idx}
                          className="p-6 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className="font-black text-blue-600 text-xs">
                              {co.co_code || `CO${idx + 1}`}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Target: {co.target_attainment}%
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-black leading-relaxed mb-6 line-clamp-3">
                            {co.description}
                          </p>
                          <div className="relative h-2 bg-gray-50 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                              style={{
                                width: `${co.target_attainment || 60}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 bg-gray-50 rounded-[2rem] text-center">
                      <p className="text-gray-400 italic font-medium">
                        No outcomes specified for this course.
                      </p>
                    </div>
                  )}
                </section>

                {/* Advanced Mapping Matrix */}
                {matrixData && matrixData.programOutcomes.length > 0 && (
                  <section className="pb-10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      <h3 className="text-lg font-black tracking-tight">
                        CO-PO Alignment Matrix
                      </h3>
                    </div>

                    {loadingMatrix ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl shadow-black/[0.02]">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 border-r border-gray-100 sticky left-0 bg-gray-50/50 z-20 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                  CO Code
                                </th>
                                {matrixData.programOutcomes.map((po) => (
                                  <th
                                    key={po.id}
                                    className="px-4 py-5 text-center border-r border-gray-100 min-w-[60px] text-[10px] font-black text-gray-500 uppercase tracking-tight"
                                  >
                                    {po.po_code}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {matrixData.courseOutcomes.map((co) => (
                                <tr
                                  key={co.id}
                                  className="group hover:bg-blue-50/20 transition-colors"
                                >
                                  <td className="px-6 py-4 font-black text-black border-r border-gray-100 sticky left-0 bg-white group-hover:bg-blue-50 transition-colors z-10 text-xs">
                                    {co.co_code}
                                  </td>
                                  {matrixData.programOutcomes.map((po) => {
                                    const weightage =
                                      matrixData.matrix[co.id]?.[po.id] || 0;
                                    return (
                                      <td
                                        key={po.id}
                                        className="px-4 py-4 text-center border-r border-gray-50 last:border-r-0"
                                      >
                                        <div
                                          className={`
                                          w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-black transition-all
                                          ${
                                            weightage === 3
                                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                              : weightage === 2
                                                ? "bg-blue-100 text-blue-600"
                                                : weightage === 1
                                                  ? "bg-gray-100 text-gray-400"
                                                  : "text-gray-200"
                                          }
                                        `}
                                        >
                                          {weightage > 0 ? weightage : "·"}
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center whitespace-nowrap overflow-x-auto gap-10">
                          <div className="flex items-center gap-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>{" "}
                              3: High Impact
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-100"></span>{" "}
                              2: Medium Impact
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-gray-100"></span>{" "}
                              1: Low Impact
                            </span>
                          </div>
                          <span className="text-[10px] italic font-medium text-gray-400">
                            Direct academic correlation matrix
                          </span>
                        </div>
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
