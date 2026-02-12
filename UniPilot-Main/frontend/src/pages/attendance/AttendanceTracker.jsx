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
  BookOpen,
  TrendingUp,
  BarChart3,
  Layout,
  MoreVertical,
  Check,
  RotateCcw,
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

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={`text-3xl font-black ${color}`}>{value}</p>
        </div>
        <div
          className={`p-3 rounded-xl bg-opacity-10 ${color.replace("text-", "bg-")} ${color.replace("text-", "text-")}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const StudentDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl w-fit">
          {["overview", "coursewise"].map((t) => (
            <button
              key={t}
              onClick={() => setStudentTab(t)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                studentTab === t
                  ? "bg-white dark:bg-gray-800 text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm font-bold text-gray-500">
            Academic Term:
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Classes"
          value={summary?.total || 0}
          icon={Calendar}
          color="text-gray-900 dark:text-white"
        />
        <StatCard
          label="Attended"
          value={summary?.present || 0}
          icon={UserCheck}
          color="text-green-500"
        />
        <StatCard
          label="Percentage"
          value={`${summary?.percentage || 0}%`}
          icon={TrendingUp}
          color={
            (summary?.percentage || 0) < 75
              ? "text-red-500"
              : "text-primary-500"
          }
        />
      </div>

      {studentTab === "overview" ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-500" />
              Recent Attendance History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Course / Activity
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Faculty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {records?.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4 text-sm font-medium">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {record.course?.name || "General Activity"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          record.status === "present"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : record.status === "absent"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.instructor
                        ? `${record.instructor.first_name} ${record.instructor.last_name}`
                        : "System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseWise?.map((course) => (
            <div
              key={course.course_id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-primary-500 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{course.course_name}</h4>
                  <p className="text-xs text-gray-500">{course.course_code}</p>
                </div>
                <div
                  className={`text-2xl font-black ${parseFloat(course.percentage) < 75 ? "text-red-500" : "text-primary-600"}`}
                >
                  {course.percentage}%
                </div>
              </div>

              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-6">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${parseFloat(course.percentage) < 75 ? "bg-red-500" : "bg-primary-500"}`}
                  style={{ width: `${course.percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Total
                  </p>
                  <p className="font-bold">{course.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Present
                  </p>
                  <p className="font-bold text-green-500">{course.present}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Absent
                  </p>
                  <p className="font-bold text-red-500">{course.absent}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const FacultyView = () => (
    <div className="space-y-6">
      {/* Faculty Tabs & Global Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setFacultyTab("schedule")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              facultyTab === "schedule"
                ? "bg-white dark:bg-gray-800 text-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Today's Schedule
          </button>
          {(user?.role === "hod" ||
            ["admin", "super_admin"].includes(user?.role)) && (
            <button
              onClick={() => setFacultyTab("analytics")}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                facultyTab === "analytics"
                  ? "bg-white dark:bg-gray-800 text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {user?.role === "hod"
                ? "Department Oversight"
                : "Institutional Oversight"}
            </button>
          )}
        </div>

        {/* Oversight Filters (Visible to Admin/HOD in both tabs, unless marking) */}
        {(user?.role === "hod" ||
          ["admin", "super_admin"].includes(user?.role)) &&
          !activeSession && (
            <div className="flex flex-wrap items-center gap-3">
              {["admin", "super_admin"].includes(user?.role) && (
                <select
                  className="p-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500/20"
                  value={oversightFilters.department_id}
                  onChange={(e) =>
                    setOversightFilters({
                      department_id: e.target.value,
                      semester: "",
                      section: "",
                    })
                  }
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                className="p-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500/20"
                value={oversightFilters.semester}
                onChange={(e) =>
                  setOversightFilters({
                    ...oversightFilters,
                    semester: e.target.value,
                    section: "",
                  })
                }
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>

              {oversightFilters.department_id && oversightFilters.semester && (
                <select
                  className="p-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500/20 animate-in fade-in slide-in-from-left-2 duration-300"
                  value={oversightFilters.section}
                  onChange={(e) =>
                    setOversightFilters({
                      ...oversightFilters,
                      section: e.target.value,
                    })
                  }
                >
                  <option value="">All Sections</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>
                      Section {s}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
      </div>

      {facultyTab === "schedule" ? (
        activeSession ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 bg-primary-600 text-white flex justify-between items-center">
              <div>
                <button
                  onClick={() => setActiveSession(null)}
                  className="text-white/80 hover:text-white mb-2 text-sm flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Change Session
                </button>
                <h2 className="text-2xl font-black">
                  {activeSession.course_name}
                </h2>
                <p className="text-white/80 font-medium">
                  Session marking for {activeSession.start_time} -{" "}
                  {activeSession.end_time}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={markAllPresent}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold backdrop-blur-md transition-all text-sm"
                >
                  Mark All Present
                </button>
                <button
                  onClick={handleMarkSubmit}
                  className="px-4 py-2 bg-white text-primary-600 hover:bg-gray-50 rounded-xl font-bold shadow-lg transition-all text-sm"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/30 text-left">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                      Student Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {studentList.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20"
                    >
                      <td className="px-6 py-4 font-mono text-sm text-gray-500">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          {["present", "absent", "late"].map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                setMarkingData({
                                  ...markingData,
                                  [student.id]: s,
                                })
                              }
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                markingData[student.id] === s
                                  ? s === "present"
                                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                    : s === "absent"
                                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                      : "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayClasses?.length > 0 ? (
              todayClasses.map((session) => (
                <div
                  key={session.id}
                  className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border transition-all ${
                    session.is_marked
                      ? "border-green-100 dark:border-green-900/30 opacity-80"
                      : "border-gray-100 dark:border-gray-700 hover:border-primary-500 hover:shadow-xl cursor-pointer"
                  }`}
                  onClick={() => !session.is_marked && startMarking(session)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-xl ${session.is_marked ? "bg-green-100 text-green-600" : "bg-primary-50 text-primary-600"}`}
                    >
                      <Clock className="w-6 h-6" />
                    </div>
                    {session.is_marked ? (
                      <span className="flex items-center text-xs font-bold text-green-500 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-1" /> Marked
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-primary-500 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-xl mb-1 dark:text-white capitalize">
                    {session.course_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {session.course_code || "Special Session"}
                  </p>
                  {["admin", "super_admin", "hod"].includes(user?.role) && (
                    <p className="text-[10px] font-black text-primary-500 uppercase tracking-tighter mb-4 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Inst: {session.faculty_name}
                    </p>
                  )}
                  {!["admin", "super_admin", "hod"].includes(user?.role) && (
                    <div className="mb-4" />
                  )}

                  <div className="flex items-center text-gray-400 dark:text-gray-500 font-bold text-sm">
                    <Layout className="w-4 h-4 mr-2" />
                    {session.start_time} - {session.end_time}
                  </div>

                  {!session.is_marked ? (
                    <button
                      onClick={() => startMarking(session)}
                      className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20"
                    >
                      Capture Attendance
                    </button>
                  ) : (
                    (user.role === "hod" ||
                      ["admin", "super_admin"].includes(user.role)) && (
                      <button
                        onClick={() => startMarking(session)}
                        className="w-full mt-6 py-3 bg-white border-2 border-primary-100 hover:border-primary-500 text-primary-600 hover:text-primary-700 rounded-xl font-bold transition-all"
                      >
                        Edit Attendance
                      </button>
                    )
                  )}
                </div>
              ))
            ) : (
              <div className="md:col-span-3 py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  No Classes Today
                </h3>
                <p className="text-gray-500 max-w-xs">
                  You don't have any scheduled sessions for today. Enjoy your
                  time!
                </p>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black">
                  {user?.role === "hod"
                    ? "Department Oversight"
                    : "Institutional Oversight"}
                </h3>
                <p className="text-gray-500 text-sm">
                  Monitoring {stats.total_students} students
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl text-red-600 dark:text-red-400 flex items-center shadow-inner">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-bold">
                    {stats.at_risk_count} At Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">
                      Batch / Sec
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {stats.students?.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-3 ${student.is_low ? "bg-red-50 text-red-600" : "bg-primary-50 text-primary-600"}`}
                          >
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold">{student.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono italic">
                              {student.student_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm font-medium">
                          {student.batch_year}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-tighter">
                          {student.section}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <span
                            className={`text-sm font-black w-12 ${student.is_low ? "text-red-600" : "text-primary-600"}`}
                          >
                            {student.percentage}%
                          </span>
                          <div className="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${student.is_low ? "bg-red-500" : "bg-primary-500"}`}
                              style={{ width: `${student.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
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
    <div className="space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto dark:text-white">
      {/* Dynamic Header */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Background Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-500/20">
              <UserCheck className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none mb-2">
                {user?.role === "student"
                  ? "Student Portal"
                  : user?.role === "hod"
                    ? "Departmental Records"
                    : ["admin", "super_admin"].includes(user?.role)
                      ? "Institutional Records"
                      : "Faculty Console"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                {user?.role === "student"
                  ? "Track your academic presence and performance trends"
                  : "Efficiently manage class sessions and student records"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {new Date().toLocaleDateString("en-US", { weekday: "long" })}
              </p>
              <p className="font-black text-gray-900 dark:text-white">
                {new Date().toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="h-10 w-[2px] bg-gray-100 dark:bg-gray-700 mx-2 hidden lg:block" />
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-bold border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm">
              <FileText className="w-4 h-4" />
              Reports
            </button>
          </div>
        </div>
      </div>

      {status === "loading" &&
      todayClasses.length === 0 &&
      records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
            Synchronizing Records...
          </p>
        </div>
      ) : user?.role === "student" ? (
        <StudentDashboard />
      ) : (
        <FacultyView />
      )}
    </div>
  );
};

export default AttendanceTracker;
