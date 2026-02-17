import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  UserCheck,
  FileText,
  AlertCircle,
  Users,
  TrendingUp,
  BarChart3,
  Layout,
  MoreVertical,
  Check,
  RotateCcw,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import {
  fetchMyAttendance,
  markAttendance,
  fetchTodayClasses,
  fetchAttendanceStats,
} from "../../store/slices/attendanceSlice";
import api from "../../utils/api";
import toast from "react-hot-toast";

const AttendanceTracker = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { records, summary, courseWise, todayClasses, stats, status } =
    useSelector((state) => state.attendance);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [activeSession, setActiveSession] = useState(null); // The timetable slot being marked
  const [studentTab, setStudentTab] = useState("overview"); // "overview" or "coursewise"
  const [facultyTab, setFacultyTab] = useState(
    ["admin", "super_admin", "hod"].includes(user?.role)
      ? "analytics"
      : "schedule",
  ); // "schedule" or "analytics"
  const [selectedSemester, setSelectedSemester] = useState(
    user?.current_semester || 1,
  );

  // Faculty Marking State
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [markingData, setMarkingData] = useState({}); // { studentId: status }

  // Oversight Filters (for HOD/Admin)
  const [oversightFilters, setOversightFilters] = useState({
    department_id: ["admin", "super_admin"].includes(user?.role)
      ? ""
      : user?.department_id || "",
    semester: "",
    section: "",
  });

  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (user?.role === "student") {
      dispatch(
        fetchMyAttendance({
          semester: selectedSemester,
        }),
      );
    } else {
      const isAdminByRole = ["admin", "super_admin"].includes(user?.role);
      const isHOD = user?.role === "hod";

      if (isHOD || isAdminByRole) {
        dispatch(fetchTodayClasses(oversightFilters));
        dispatch(fetchAttendanceStats(oversightFilters));
      } else {
        dispatch(fetchTodayClasses());
      }

      // Fetch metadata for filters if admin/hod
      if (isAdminByRole || isHOD) {
        if (isAdminByRole) {
          api
            .get("/departments?type=academic")
            .then((res) => setDepartments(res.data.data));
        }
        api
          .get(
            `/users/sections?department_id=${oversightFilters.department_id}&semester=${oversightFilters.semester}`,
          )
          .then((res) => setSections(res.data.data));
      }
    }
  }, [dispatch, user, selectedSemester, oversightFilters]);

  const startMarking = async (session) => {
    setActiveSession(session);
    setLoadingStudents(true);
    try {
      // Build fetch URL based on session criteria
      const params = new URLSearchParams({ role: "student" });
      if (session?.program_id) params.append("program_id", session.program_id);
      if (session?.section) params.append("section", session.section);
      if (session?.semester) params.append("semester", session.semester);

      // Only add department if no specific program is selected (fallback)
      if (!session?.program_id && user.department_id) {
        params.append("department_id", user.department_id);
      }

      const response = await api.get(`/users?${params.toString()}`);
      setStudentList(response.data.data);

      setStudentList(response.data.data);

      // Initialize marking data
      const initial = {};
      if (session.is_marked) {
        // Fetch existing attendance
        try {
          // Format date as YYYY-MM-DD for query
          const dateStr = new Date(selectedDate).toISOString().split("T")[0];
          const attRes = await api.get(
            `/attendance/session/${session.id}?date=${dateStr}`,
          );
          const existingRecords = attRes.data.data;

          // Hydrate with existing status
          response.data.data.forEach((s) => {
            const record = existingRecords.find(
              (r) => String(r.student_id) === String(s.id),
            );
            initial[s.id] = record ? record.status : "present";
          });
          toast.success("Loaded existing attendance records", { icon: "ℹ️" });
        } catch (err) {
          console.error("Error fetching existing records", err);
          toast.error("Could not load existing attendance");
          // Fallback to present
          response.data.data.forEach((s) => (initial[s.id] = "present"));
        }
      } else {
        // Default all to present for new session
        response.data.data.forEach((s) => (initial[s.id] = "present"));
      }
      setMarkingData(initial);
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const markAllPresent = () => {
    const allPresent = {};
    studentList.forEach((s) => (allPresent[s.id] = "present"));
    setMarkingData(allPresent);
    toast.success("Ready to submit: All students marked present");
  };

  const handleMarkSubmit = async () => {
    const attendance_data = Object.keys(markingData).map((sid) => ({
      student_id: sid,
      status: markingData[sid],
    }));

    try {
      await dispatch(
        markAttendance({
          course_id: activeSession.course_id,
          timetable_slot_id: activeSession.id,
          date: selectedDate,
          attendance_data,
        }),
      ).unwrap();

      toast.success("Attendance recorded successfully");
      setActiveSession(null);
      dispatch(fetchTodayClasses()); // Refresh schedule status
    } catch (error) {
      toast.error(error || "Submission failed");
    }
  };

  // --- Components ---

  const StatCard = ({ label, value, icon: Icon, color, isAlert }) => (
    <div
      className={`p-8 rounded-[2rem] border transition-all duration-500 shadow-md shadow-black/[0.02] ${isAlert
        ? "border-red-200 bg-red-50/30"
        : "border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1"}`}
    >
      <Icon
        className={`w-6 h-6 mb-6 ${isAlert ? "text-red-500" : "text-blue-600"}`}
      />
      <p className="text-4xl font-black text-black mb-1">
        {value}
      </p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );

  const StudentView = () => (
    <div className="space-y-12">
      {/* Filtering Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        {/* Tabs */}
        <div className="flex gap-8">
          {["overview", "coursewise"].map((t) => (
            <button
              key={t}
              onClick={() => setStudentTab(t)}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${studentTab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-300 hover:text-gray-500"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative group">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-300 shadow-sm">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
              className="appearance-none bg-transparent font-black text-blue-600 border-none outline-none pr-6 cursor-pointer text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          label="Total Classes"
          value={summary?.total || 0}
          icon={Calendar}
        />
        <StatCard
          label="Classes Attended"
          value={summary?.present || 0}
          icon={UserCheck}
        />
        <StatCard
          label="Attendance Rate"
          value={`${summary?.percentage || 0}%`}
          icon={TrendingUp}
          isAlert={(summary?.percentage || 0) < 75}
        />
      </div>

      {studentTab === "overview" ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Session Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Course Module
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                  Faculty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records?.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50/30 transition-colors"
                >
                  <td className="px-8 py-5 text-sm font-bold text-gray-900">
                    {new Date(record.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-black">
                    {record.course?.name || "Academic Session"}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${record.status === "present" ? "bg-green-50 text-green-600" : record.status === "absent" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-500 text-right">
                    {record.instructor
                      ? `${record.instructor.first_name} ${record.instructor.last_name}`
                      : "System"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courseWise?.map((course) => (
            <div
              key={course.course_id}
              className="p-8 rounded-[2.5rem] bg-white border border-gray-300 shadow-md shadow-black/[0.02] hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                  {course.course_code}
                </span>
                <span
                  className={`text-2xl font-black ${parseFloat(course.percentage) < 75 ? "text-red-500" : "text-blue-600"}`}
                >
                  {course.percentage}%
                </span>
              </div>
              <h4 className="text-xl font-black text-black mb-8 leading-tight group-hover:text-blue-600 transition-colors relative z-10 line-clamp-2">
                {course.course_name}
              </h4>

              <div className="h-2 bg-gray-50 rounded-full overflow-hidden mb-8 relative z-10">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${parseFloat(course.percentage) < 75 ? "bg-red-500" : "bg-blue-600"}`}
                  style={{ width: `${course.percentage}%` }}
                />
              </div>
              <div className="flex justify-between border-t border-gray-50 pt-6 relative z-10">
                <div className="text-center">
                  <p className="text-[9px] font-black text-gray-300 uppercase mb-1">
                    Total
                  </p>
                  <p className="font-black text-black">{course.total}</p>
                </div>
                <div className="text-center border-l border-gray-50 pl-4">
                  <p className="text-[9px] font-black  uppercase mb-1 text-green-600">
                    Present
                  </p>
                  <p className="font-black text-green-600">
                    {course.present}
                  </p>
                </div>
                <div className="text-center border-l border-gray-50 pl-4">
                  <p className="text-[9px] font-black uppercase mb-1 text-red-500">
                    Absent
                  </p>
                  <p className="font-black text-red-500">{course.absent}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const FacultyView = () => (
    <div className="space-y-12">
      {/* Faculty Tabs & Global Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex space-x-8">
          <button
            onClick={() => setFacultyTab("schedule")}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${facultyTab === "schedule" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-300 hover:text-gray-500"}`}
          >
            Today's Schedule
          </button>
          {(user?.role === "hod" ||
            ["admin", "super_admin"].includes(user?.role)) && (
              <button
                onClick={() => setFacultyTab("analytics")}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${facultyTab === "analytics" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-300 hover:text-gray-500"}`}
              >
                Analytics
              </button>
            )}
        </div>

        {/* Oversight Filters */}
        {(user?.role === "hod" ||
          ["admin", "super_admin"].includes(user?.role)) &&
          !activeSession && (
            <div className="flex flex-wrap items-center gap-3">
              {["admin", "super_admin"].includes(user?.role) && (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-300 shadow-sm">
                  <Filter className="w-3 h-3 text-gray-400" />
                  <select
                    className="appearance-none bg-transparent font-black text-xs text-gray-600 border-none outline-none cursor-pointer uppercase tracking-wider"
                    value={oversightFilters.department_id}
                    onChange={(e) =>
                      setOversightFilters({
                        department_id: e.target.value,
                        semester: "",
                        section: "",
                      })
                    }
                  >
                    <option value="">All Depts</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-300 shadow-sm">
                <Layout className="w-3 h-3 text-gray-400" />
                <select
                  className="appearance-none bg-transparent font-black text-xs text-gray-600 border-none outline-none cursor-pointer uppercase tracking-wider"
                  value={oversightFilters.semester}
                  onChange={(e) =>
                    setOversightFilters({
                      ...oversightFilters,
                      semester: e.target.value,
                      section: "",
                    })
                  }
                >
                  <option value="">All Sems</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>

              {oversightFilters.department_id && oversightFilters.semester && (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-300 shadow-sm animate-in fade-in slide-in-from-left-2">
                  <Users className="w-3 h-3 text-gray-400" />
                  <select
                    className="appearance-none bg-transparent font-black text-xs text-gray-600 border-none outline-none cursor-pointer uppercase tracking-wider"
                    value={oversightFilters.section}
                    onChange={(e) =>
                      setOversightFilters({
                        ...oversightFilters,
                        section: e.target.value,
                      })
                    }
                  >
                    <option value="">All Secs</option>
                    {sections.map((s) => (
                      <option key={s} value={s}>
                        Sec {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
      </div>

      {facultyTab === "schedule" ? (
        activeSession ? (
          <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-xl shadow-blue-900/5">
            <div className="p-10 bg-gray-900 text-white flex justify-between items-center sm:flex-row flex-col gap-8 relative overflow-hidden">
              {/* Pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="relative z-10">
                <button
                  onClick={() => setActiveSession(null)}
                  className="text-gray-400 hover:text-white mb-4 text-[10px] uppercase font-black tracking-widest flex items-center transition-colors"
                >
                  <RotateCcw className="w-3 h-3 mr-2" /> Back to Schedule
                </button>
                <h2 className="text-3xl font-black tracking-tight mb-2">
                  {activeSession.course_name}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="bg-white/10 px-3 py-1 rounded-lg text-white font-mono text-xs font-bold border border-white/10">
                    {activeSession.start_time} - {activeSession.end_time}
                  </span>
                  <span className="text-gray-400 font-bold text-xs">ID: {activeSession.id}</span>
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <button
                  onClick={markAllPresent}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all"
                >
                  Mark All Present
                </button>
                <button
                  onClick={handleMarkSubmit}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  Save & Submit <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-2 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-left">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Student Details
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                      Mark Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {studentList.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm mr-4 border border-blue-100">
                            {student.first_name[0]}
                            {student.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-[10px] font-mono text-gray-400 uppercase">
                              {student.student_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2">
                          {["present", "absent", "late"].map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setMarkingData({
                                  ...markingData,
                                  [student.id]: s,
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${markingData[student.id] === s
                                ? s === "present"
                                  ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20 scale-105"
                                  : s === "absent"
                                    ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20 scale-105"
                                    : "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20 scale-105"
                                : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600"
                                }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {todayClasses?.length > 0 ? (
              todayClasses.map((session, idx) => (
                <div
                  key={session.id}
                  className="group relative md:flex md:gap-10 pb-12 last:pb-0 cursor-pointer"
                  onClick={() => !session.is_marked && startMarking(session)}
                >
                  {/* Timeline */}
                  <div className="hidden md:flex flex-col items-center mr-4">
                    <div className={`w-4 h-4 rounded-full border-4 ${session.is_marked ? 'border-green-500 bg-white' : 'border-blue-600 bg-white'} relative z-10 box-content`}></div>
                    <div className="w-0.5 bg-gray-100 h-full -mt-2 group-last:hidden"></div>
                  </div>

                  <div className="md:w-32 flex-shrink-0 pt-1 mb-4 md:mb-0">
                    <span className="block text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                      {session.start_time.slice(0, 5)}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                      {parseInt(session.start_time.slice(0, 2)) >= 12
                        ? "PM"
                        : "AM"}
                    </span>
                  </div>

                  <div
                    className={`flex-1 p-8 rounded-[2rem] border transition-all duration-300 ${session.is_marked
                      ? "border-green-100 bg-green-50/20 opacity-90"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black text-black leading-tight">
                        {session.course_name}
                      </h3>
                      {session.is_marked ? (
                        <span className="flex items-center text-[10px] font-black text-green-700 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                          <CheckCircle className="w-3 h-3 mr-1.5" /> Marked
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                      <span className="font-mono bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-500 text-xs font-bold">
                        {session.course_code || "N/A"}
                      </span>
                      {["admin", "super_admin", "hod"].includes(user?.role) && (
                        <span className="font-bold text-xs text-gray-500 flex items-center">
                          <Users className="w-3 h-3 inline mr-1.5 text-gray-400" />
                          {session.faculty_name}
                        </span>
                      )}
                    </div>

                    {!session.is_marked ? (
                      <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Mark Attendance
                      </button>
                    ) : (
                      (user.role === "hod" ||
                        ["admin", "super_admin"].includes(user.role)) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startMarking(session);
                          }}
                          className="w-full py-4 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:border-blue-200 hover:text-blue-600 transition-all"
                        >
                          Review / Edit
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/20">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-50">
                  <Calendar className="w-8 h-8 text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  No Classes Today
                </h3>
                <p className="text-gray-400 text-sm font-bold mt-2">
                  No scheduled sessions found for {new Date().toLocaleDateString("en-US", { weekday: "long" })}.
                </p>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-lg shadow-black/[0.02] flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-blue-600">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-black tracking-tight leading-none">
                  Overview
                </h3>
                <p className="text-sm font-bold text-gray-400 mt-1">
                  Monitoring {stats.total_students} students
                </p>
              </div>
            </div>
            {stats.at_risk_count > 0 && (
              <div className="bg-red-50 text-red-600 pl-4 pr-6 py-3 rounded-2xl border border-red-100 flex items-center self-start md:self-auto">
                <AlertCircle className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-black text-lg leading-none">{stats.at_risk_count}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider opacity-70">Students At Risk</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Student
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Registration No
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Batch info
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Health
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.students?.map((student) => (
                    <tr
                      key={student.id}
                      className="group hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black mr-4 text-xs ${student.is_low
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                              }`}
                          >
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                              {student.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <p className="text-sm text-gray-500 font-mono uppercase tracking-tight font-bold">
                          {student.student_id}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                          Batch {student.batch_year} • {student.section}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span
                            className={`text-sm font-black ${student.is_low
                              ? "text-red-600"
                              : "text-green-600"
                              }`}
                          >
                            {student.percentage}%
                          </span>
                          <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${student.is_low ? "bg-red-500" : "bg-green-500"
                                }`}
                              style={{ width: `${student.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-12">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">

            {/* Decorative Elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>

            <div className="space-y-2 relative z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
                {user?.role === "student" ? "Academic Portal" : "Faculty Console"}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                Attendance <span className="text-blue-600">Tracker.</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                {user?.role === "student"
                  ? "Track your daily attendance and maintain academic compliance."
                  : "Manage class sessions, mark attendance, and monitor performance."}
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-end">
              <p className="text-6xl font-black text-gray-200 leading-none select-none tracking-tighter">
                {new Date().getDate()}
              </p>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1 bg-white px-2 py-1 rounded-lg border border-blue-50">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  weekday: "long",
                })}
              </p>
            </div>
          </div>
        </header>

        {status === "loading" &&
          todayClasses.length === 0 &&
          records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">
              Loading Records...
            </p>
          </div>
        ) : user?.role === "student" ? (
          <StudentView />
        ) : (
          <FacultyView />
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
