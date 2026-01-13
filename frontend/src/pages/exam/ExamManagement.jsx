import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Calendar,
  Plus,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  Clock,
  MapPin,
  ClipboardList,
  Download,
  ShieldCheck,
  RefreshCw,
  X,
  ArrowLeft,
  Edit,
  Trash2,
  Zap,
} from "lucide-react";
import {
  fetchExamCycles,
  enterBulkMarks,
  createExamCycle,
  updateExamCycle,
  deleteExamCycle,
  fetchExamSchedules,
  addExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  autoGenerateTimetable,
} from "../../store/slices/examSlice";
import { fetchCourses } from "../../store/slices/courseSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import api from "../../utils/api";

const ExamManagement = () => {
  const dispatch = useDispatch();
  const {
    cycles,
    schedules,
    status: examStatus,
  } = useSelector((state) => state.exam);
  const { courses } = useSelector((state) => state.courses);
  const { programs } = useSelector((state) => state.programs);
  const { user } = useSelector((state) => state.auth);

  const [viewMode, setViewMode] = useState("list"); // list, details
  const [activeTab, setActiveTab] = useState("timetable"); // timetable, marks, tickets
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Create Cycle Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cycleForm, setCycleForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    batch_year: 2025,
    semester: 1,
    exam_type: "semester_end",
  });
  const [editingCycle, setEditingCycle] = useState(null);

  const [viewingCycle, setViewingCycle] = useState(null);

  // Timetable/Schedule State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    exam_cycle_id: "",
    course_id: "",
    exam_date: "",
    start_time: "",
    end_time: "",
    venue: "",
    max_marks: 100,
    passing_marks: 35,
    branches: [],
  });
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Auto-generation State
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [autoForm, setAutoForm] = useState({
    program_id: "",
    start_date: "",
    gap_days: 1,
    start_time: "09:00",
    end_time: "12:00",
    venue: "Main Block",
    max_marks: 100,
    passing_marks: 35,
    semester: "", // Added to allow override
  });

  // Marks Entry State
  const [studentList, setStudentList] = useState([]);
  const [marksData, setMarksData] = useState({}); // { studentId: marks }
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modal Specific Filters (to avoid crosstalk)
  const [modalFilters, setModalFilters] = useState({
    program_id: "",
    semester: "",
  });
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchExamCycles());
    dispatch(fetchCourses());
    dispatch(fetchPrograms());
  }, [dispatch]);

  useEffect(() => {
    if (viewMode === "details" && selectedCycle) {
      dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle }));
    }
  }, [viewMode, selectedCycle, dispatch]);

  const fetchStudentsForMarks = async (courseId) => {
    if (!courseId) return;
    setLoadingStudents(true);
    try {
      const response = await api.get(
        `/users?role=student&department_id=${user.department_id}`
      );
      setStudentList(response.data.data);
      const initial = {};
      response.data.data.forEach((s) => (initial[s.id] = ""));
      setMarksData(initial);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (editingCycle) {
      dispatch(
        updateExamCycle({ id: editingCycle.id, cycleData: cycleForm })
      ).then((res) => {
        if (!res.error) {
          setShowCreateModal(false);
          setEditingCycle(null);
          setViewingCycle(res.payload); // Update active view if needed
          alert("Exam cycle updated successfully!");
        }
      });
    } else {
      dispatch(createExamCycle(cycleForm)).then((res) => {
        if (!res.error) {
          setShowCreateModal(false);
          setCycleForm({
            name: "",
            start_date: "",
            end_date: "",
            batch_year: 2025,
            semester: 1,
            exam_type: "semester_end",
          });
          alert("Exam cycle created successfully!");
        }
      });
    }
  };

  const handleDeleteCycle = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this exam cycle? This will also delete all associated exam schedules and marks."
      )
    ) {
      dispatch(deleteExamCycle(id)).then((res) => {
        if (!res.error) {
          alert("Exam cycle deleted successfully!");
        }
      });
    }
  };

  const handleAddScheduleBtn = () => {
    setEditingSchedule(null);
    setModalFilters({
      program_id: selectedProgram || "",
      semester: viewingCycle?.semester || "",
    });
    setScheduleForm({
      exam_cycle_id: selectedCycle,
      course_id: "",
      exam_date: "",
      start_time: "",
      end_time: "",
      venue: "",
      max_marks: 100,
      passing_marks: 35,
      branches: [],
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (editingSchedule) {
      dispatch(
        updateExamSchedule({
          id: editingSchedule.id,
          scheduleData: scheduleForm,
        })
      ).then((res) => {
        if (!res.error) {
          setShowScheduleModal(false);
          setEditingSchedule(null);
          alert("Schedule updated successfully!");
        }
      });
    } else {
      dispatch(addExamSchedule(scheduleForm)).then((res) => {
        if (!res.error) {
          setShowScheduleModal(false);
          setScheduleForm({
            ...scheduleForm,
            course_id: "",
            exam_date: "",
            start_time: "",
            end_time: "",
          });
          alert("Exam schedule added successfully!");
        }
      });
    }
  };

  const handleDeleteSchedule = (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      dispatch(deleteExamSchedule(id));
    }
  };

  const handleAutoGenerate = (e) => {
    e.preventDefault();
    dispatch(
      autoGenerateTimetable({ ...autoForm, exam_cycle_id: selectedCycle })
    ).then((res) => {
      if (!res.error) {
        setShowAutoModal(false);
        // Display the specific message from backend (e.g., "Successfully generated 5 schedules" or "Already exist")
        alert(res.payload?.message || "Timetable generated successfully!");
      }
    });
  };

  const handleMarksSubmit = () => {
    const marks_data = Object.keys(marksData).map((sid) => ({
      student_id: sid,
      marks_obtained: parseFloat(marksData[sid]) || 0,
      status: "present",
    }));

    dispatch(
      enterBulkMarks({
        exam_schedule_id: "PLACEHOLDER_SCHEDULE_ID", // In a real app, this would be selected
        marks_data,
      })
    ).then(() => {
      alert("Marks entered successfully");
    });
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Examination Control</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Schedule exams, enter marks, and manage hall tickets
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {viewMode === "details" && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCycle(viewingCycle);
                  setCycleForm({
                    name: viewingCycle.name,
                    start_date: viewingCycle.start_date,
                    end_date: viewingCycle.end_date,
                    batch_year: viewingCycle.batch_year,
                    semester: viewingCycle.semester,
                    exam_type: viewingCycle.exam_type,
                  });
                  setShowCreateModal(true);
                }}
                className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit Cycle
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cycles
              </button>
            </div>
          )}
          {viewMode === "details" && activeTab === "timetable" && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAutoModal(true)}
                className="flex items-center px-4 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                <Zap className="w-4 h-4 mr-2" /> Auto-Generate
              </button>
              <button
                onClick={handleAddScheduleBtn}
                className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Schedule
              </button>
            </div>
          )}
          {viewMode === "list" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Exam Cycle
            </button>
          )}
        </div>
      </header>

      {/* View Mode Switching */}
      {viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cycles?.map((cycle) => (
            <div
              key={cycle.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg text-indigo-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCycle(cycle);
                      setCycleForm({
                        name: cycle.name,
                        start_date: cycle.start_date,
                        end_date: cycle.end_date,
                        batch_year: cycle.batch_year,
                        semester: cycle.semester,
                        exam_type: cycle.exam_type,
                      });
                      setShowCreateModal(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      cycle.status === "scheduled"
                        ? "bg-blue-100 text-blue-600"
                        : cycle.status === "ongoing"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {cycle.status}
                  </span>
                  <button
                    onClick={() => handleDeleteCycle(cycle.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{cycle.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                  Batch {cycle.batch_year}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                  Sem {cycle.semester}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600">
                  {cycle.exam_type?.replace("_", " ")}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                {cycle.start_date} to {cycle.end_date}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => {
                    setViewingCycle(cycle);
                    setSelectedCycle(cycle.id);
                    setViewMode("details");
                  }}
                  className="text-indigo-600 text-sm font-bold flex items-center group-hover:underline"
                >
                  Manage Cycle <ChevronRight className="w-4 h-4 ml-1" />
                </button>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {cycles?.length === 0 && (
            <div className="col-span-full p-12 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200">
              <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-10 animate-spin-slow" />
              <p>No active exam cycles found.</p>
            </div>
          )}
        </div>
      ) : (
        /* Details View Mode */
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{viewingCycle?.name}</h2>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                      Batch {viewingCycle?.batch_year}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                      Sem {viewingCycle?.semester}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 rounded text-indigo-600">
                      {viewingCycle?.exam_type?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                {[
                  { id: "timetable", label: "Timetable", icon: Clock },
                  { id: "marks", label: "Mark Entry", icon: FileText },
                  {
                    id: "tickets",
                    label: "Hall Tickets",
                    icon: ShieldCheck,
                    show: viewingCycle?.exam_type === "semester_end",
                  },
                ]
                  .filter((t) => t.show !== false)
                  .map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === tab.id
                          ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
              </div>
            </div>

            {activeTab === "timetable" && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase">
                      Branch Filter:
                    </span>
                  </div>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="bg-white dark:bg-gray-700 border-none rounded-xl py-2 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Branches</option>
                    {programs?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">Target Branches</th>
                        <th className="px-6 py-4">Course Name</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Venue</th>
                        <th className="px-6 py-4">Max Marks</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {schedules
                        ?.filter(
                          (s) =>
                            !selectedProgram ||
                            s.branches?.includes(selectedProgram) ||
                            s.course?.program_id === selectedProgram
                        )
                        ?.map((s) => {
                          const prog = programs.find(
                            (p) => p.id === s.course?.program_id
                          );
                          return (
                            <tr
                              key={s.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                  {s.branches && s.branches.length > 0 ? (
                                    s.branches.map((bId) => {
                                      const bProg = programs.find(
                                        (p) => p.id === bId
                                      );
                                      return (
                                        <span
                                          key={bId}
                                          className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-md uppercase"
                                        >
                                          {bProg?.code ||
                                            bProg?.name ||
                                            "Unknown"}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-500 font-bold rounded-md uppercase">
                                      {prog?.code || prog?.name || "Common"}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-sm">
                                  {s.course?.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {s.course?.code}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                {new Date(s.exam_date).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                {s.start_time.substring(0, 5)} -{" "}
                                {s.end_time.substring(0, 5)}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                {s.venue}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                                {s.max_marks}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingSchedule(s);
                                      setScheduleForm({
                                        exam_cycle_id: s.exam_cycle_id,
                                        course_id: s.course_id,
                                        exam_date: s.exam_date,
                                        start_time: s.start_time,
                                        end_time: s.end_time,
                                        venue: s.venue,
                                        max_marks: s.max_marks,
                                        passing_marks: s.passing_marks,
                                        branches: s.branches || [],
                                      });
                                      const course = courses.find(
                                        (c) => c.id === s.course_id
                                      );
                                      setModalFilters({
                                        program_id: course?.program_id || "",
                                        semester: course?.semester || "",
                                      });
                                      setShowScheduleModal(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(s.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {schedules?.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-12 text-center text-gray-400"
                          >
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-10" />
                            <p>No schedules found for this selection.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "marks" && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                      Select Course / Subject
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        fetchStudentsForMarks(e.target.value);
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    >
                      <option value="">Choose Course</option>
                      {courses?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button className="flex items-center px-6 py-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm border border-gray-100 dark:border-gray-600 hover:bg-gray-50 transition-all">
                      <Download className="w-4 h-4 mr-2" /> Import Excel
                      Template
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Roll No</th>
                        <th className="px-6 py-4 w-40">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {studentList?.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold text-sm">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {student.student_id}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              value={marksData[student.id] || ""}
                              onChange={(e) =>
                                setMarksData({
                                  ...marksData,
                                  [student.id]: e.target.value,
                                })
                              }
                              className="w-24 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold"
                              placeholder="0.0"
                            />
                          </td>
                        </tr>
                      ))}
                      {studentList.length === 0 && !loadingStudents && (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-12 text-center text-gray-400"
                          >
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-10" />
                            Please select a course to load marks entry sheet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <button
                    onClick={handleMarksSubmit}
                    disabled={!selectedCourse || studentList.length === 0}
                    className="px-12 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/20"
                  >
                    Post Results
                  </button>
                </div>
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <ShieldCheck className="w-16 h-16 text-indigo-300 mb-4" />
                <h3 className="text-lg font-bold">Hall Ticket Generation</h3>
                <p className="text-gray-500 mb-8 max-w-sm text-center">
                  Generate and distribute hall tickets for all eligible students
                  for the {viewingCycle?.name}.
                </p>
                <div className="flex gap-4">
                  <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                    Generate All Tickets
                  </button>
                  <button className="px-6 py-2.5 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold hover:bg-indigo-50 transition-all">
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingCycle ? "Edit Exam Cycle" : "New Exam Cycle"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                  Cycle Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Odd Semester 2026"
                  value={cycleForm.name}
                  onChange={(e) =>
                    setCycleForm({ ...cycleForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={cycleForm.start_date}
                    onChange={(e) =>
                      setCycleForm({ ...cycleForm, start_date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={cycleForm.end_date}
                    onChange={(e) =>
                      setCycleForm({ ...cycleForm, end_date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Batch Year
                  </label>
                  <input
                    type="number"
                    required
                    value={cycleForm.batch_year}
                    onChange={(e) =>
                      setCycleForm({
                        ...cycleForm,
                        batch_year: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Semester
                  </label>
                  <select
                    value={cycleForm.semester}
                    onChange={(e) =>
                      setCycleForm({
                        ...cycleForm,
                        semester: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                  Exam Type
                </label>
                <select
                  value={cycleForm.exam_type}
                  onChange={(e) =>
                    setCycleForm({ ...cycleForm, exam_type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="mid_term">Mid Term</option>
                  <option value="semester_end">Semester End</option>
                  <option value="re_exam">Re-Exam</option>
                  <option value="internal">Internal</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {editingCycle ? "Update Cycle" : "Create Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Details (removed, since it's now a view mode) */}

      {/* Add Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden transition-all">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingSchedule ? "Edit Exam Schedule" : "Add Exam Schedule"}
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Filter Program
                  </label>
                  <select
                    value={modalFilters.program_id}
                    onChange={(e) =>
                      setModalFilters({
                        ...modalFilters,
                        program_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">All Programs</option>
                    {programs?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Filter Semester
                  </label>
                  <select
                    value={modalFilters.semester}
                    onChange={(e) =>
                      setModalFilters({
                        ...modalFilters,
                        semester: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Any Sem</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Course / Subject
                  </label>
                  <select
                    required
                    value={scheduleForm.course_id}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        course_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Course</option>
                    {courses
                      ?.filter((c) => {
                        const programMatch =
                          !modalFilters.program_id ||
                          c.program_id === modalFilters.program_id;
                        const semesterMatch =
                          !modalFilters.semester ||
                          c.semester == modalFilters.semester;
                        return programMatch && semesterMatch;
                      })
                      ?.map((c) => {
                        const prog = programs.find(
                          (p) => p.id === c.program_id
                        );
                        return (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code}) {prog ? ` - ${prog.name}` : ""}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-2 uppercase tracking-wider text-gray-400">
                  Target Branches (Programs)
                </label>

                {/* Custom Multi-Select Trigger */}
                <div
                  onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer min-h-[50px] flex flex-wrap gap-2 items-center border border-transparent hover:border-indigo-500 transition-all"
                >
                  {scheduleForm.branches && scheduleForm.branches.length > 0 ? (
                    scheduleForm.branches.map((bId) => {
                      const prog = programs.find((p) => p.id === bId);
                      return (
                        <span
                          key={bId}
                          className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          {prog?.code || prog?.name}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const branches = scheduleForm.branches.filter(
                                (id) => id !== bId
                              );
                              setScheduleForm({ ...scheduleForm, branches });
                            }}
                            className="hover:text-indigo-900 dark:hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-400">Select branches...</span>
                  )}
                  <div className="ml-auto">
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${showBranchDropdown ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>

                {/* Dropdown Options */}
                {showBranchDropdown && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto p-2">
                    {programs?.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={scheduleForm.branches?.includes(p.id)}
                          onChange={(e) => {
                            const branches = [...(scheduleForm.branches || [])];
                            if (e.target.checked) {
                              branches.push(p.id);
                            } else {
                              const index = branches.indexOf(p.id);
                              if (index > -1) branches.splice(index, 1);
                            }
                            setScheduleForm({ ...scheduleForm, branches });
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium">
                          {p.name} ({p.code})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.exam_date}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        exam_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.start_time}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        start_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.end_time}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        end_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Venue (Room/Block)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 1, Block A"
                    value={scheduleForm.venue}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        venue: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.max_marks}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        max_marks: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.passing_marks}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        passing_marks: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {editingSchedule ? "Update Schedule" : "Add Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Generate Modal */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Auto-Generate Timetable</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Based on courses in the selected program
                </p>
              </div>
              <button
                onClick={() => setShowAutoModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAutoGenerate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Select Program
                  </label>
                  <select
                    required
                    value={autoForm.program_id}
                    onChange={(e) =>
                      setAutoForm({ ...autoForm, program_id: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  >
                    <option value="">Choose Program</option>
                    {programs?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Target Semester
                  </label>
                  <select
                    required
                    value={autoForm.semester || viewingCycle?.semester || ""}
                    onChange={(e) =>
                      setAutoForm({ ...autoForm, semester: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  >
                    <option value="">Cycle's Sem</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={autoForm.start_date}
                    onChange={(e) =>
                      setAutoForm({ ...autoForm, start_date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Gap Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={autoForm.gap_days}
                    onChange={(e) =>
                      setAutoForm({
                        ...autoForm,
                        gap_days: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={autoForm.start_time}
                    onChange={(e) =>
                      setAutoForm({ ...autoForm, start_time: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={autoForm.end_time}
                    onChange={(e) =>
                      setAutoForm({ ...autoForm, end_time: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                  Venue
                </label>
                <input
                  type="text"
                  required
                  value={autoForm.venue}
                  onChange={(e) =>
                    setAutoForm({ ...autoForm, venue: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    required
                    value={autoForm.max_marks}
                    onChange={(e) =>
                      setAutoForm({
                        ...autoForm,
                        max_marks: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    required
                    value={autoForm.passing_marks}
                    onChange={(e) =>
                      setAutoForm({
                        ...autoForm,
                        passing_marks: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAutoModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all"
                >
                  Generate All
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
