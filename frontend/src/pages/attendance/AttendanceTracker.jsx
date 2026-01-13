import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  UserCheck,
  FileText,
  AlertCircle,
  Users,
  BookOpen,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  fetchMyAttendance,
  markAttendance,
} from "../../store/slices/attendanceSlice";
import { fetchCourses } from "../../store/slices/courseSlice";
import api from "../../utils/api";

const AttendanceTracker = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { records, summary, courseWise, status } = useSelector(
    (state) => state.attendance
  );
  const { courses } = useSelector((state) => state.courses);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedCourse, setSelectedCourse] = useState("");
  const [viewMode, setViewMode] = useState(
    user?.role === "student" ? "view" : "mark"
  );
  const [studentTab, setStudentTab] = useState("overview"); // "overview" or "coursewise"
  const [selectedSemester, setSelectedSemester] = useState(
    user?.current_semester || 1
  );

  // Faculty Marking State
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [markingData, setMarkingData] = useState({}); // { studentId: status }

  useEffect(() => {
    dispatch(fetchCourses());
    if (user?.role === "student") {
      dispatch(
        fetchMyAttendance({
          start_date: "2026-01-01",
          end_date: "2026-12-31",
          semester: selectedSemester,
        })
      );
    }
  }, [dispatch, user, selectedSemester]);

  const fetchCourseStudents = async (courseId) => {
    if (!courseId) return;
    setLoadingStudents(true);
    try {
      let url = `/users?role=student`;
      if (user?.department_id) {
        url += `&department_id=${user.department_id}`;
      }
      const response = await api.get(url);
      setStudentList(response.data.data);
      // Initialize marking data with "present"
      const initial = {};
      response.data.data.forEach((s) => (initial[s.id] = "present"));
      setMarkingData(initial);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedCourse) fetchCourseStudents(selectedCourse);
  }, [selectedCourse]);

  const handleMarkSubmit = () => {
    const attendance_data = Object.keys(markingData).map((sid) => ({
      student_id: sid,
      status: markingData[sid],
    }));

    dispatch(
      markAttendance({
        course_id: selectedCourse,
        date: selectedDate,
        attendance_data,
      })
    ).then(() => {
      alert("Attendance marked successfully");
    });
  };

  // --- Student View ---
  const StudentView = () => (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 w-fit">
          <button
            onClick={() => setStudentTab("overview")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              studentTab === "overview"
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Semester Overview
          </button>
          <button
            onClick={() => setStudentTab("coursewise")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              studentTab === "coursewise"
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Course-Wise
          </button>
        </div>

        {/* Semester Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-bold text-gray-500">Semester:</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {studentTab === "overview" ? (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                Total Classes
              </h3>
              <p className="text-3xl font-bold">{summary?.total || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                Classes Attended
              </h3>
              <p className="text-3xl font-bold text-green-500">
                {summary?.present || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                Attendance Percentage
              </h3>
              <p
                className={`text-3xl font-bold ${(summary?.percentage || 0) < 75 ? "text-error-500" : "text-primary-500"}`}
              >
                {summary?.percentage || 0}%
              </p>
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold">Recent History</h3>
              <button className="text-primary-600 text-sm font-medium hover:underline">
                Download PDF
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {records?.slice(0, 10).map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {record.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {record.course?.name || "General"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            record.status === "present"
                              ? "bg-green-100 text-green-600"
                              : record.status === "absent"
                                ? "bg-error-100 text-error-600"
                                : "bg-warning-100 text-warning-600"
                          }`}
                        >
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 italic">
                        {record.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Course-Wise Tab */
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
                Subject-Wise Attendance Breakdown
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Track your attendance for each individual course
              </p>
            </div>
            <div className="p-6">
              {courseWise && courseWise.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courseWise.map((course) => (
                    <div
                      key={course.course_id}
                      className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">
                            {course.course_name}
                          </h4>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {course.course_code}
                          </p>
                        </div>
                        <div
                          className={`text-2xl font-black ${
                            parseFloat(course.percentage) < 75
                              ? "text-error-500"
                              : "text-primary-500"
                          }`}
                        >
                          {course.percentage}%
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              parseFloat(course.percentage) < 75
                                ? "bg-error-500"
                                : "bg-primary-500"
                            }`}
                            style={{ width: `${course.percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                            Total
                          </p>
                          <p className="text-lg font-bold">{course.total}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                            Present
                          </p>
                          <p className="text-lg font-bold text-green-500">
                            {course.present}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                            Absent
                          </p>
                          <p className="text-lg font-bold text-error-500">
                            {course.absent}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">No course-wise data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- Faculty Mark View ---
  const FacultyMarkView = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-end">
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">-- Choose Course --</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <button
          onClick={handleMarkSubmit}
          disabled={!selectedCourse || studentList.length === 0}
          className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
        >
          <CheckCircle className="w-5 h-5 inline mr-2" />
          Submit Attendance
        </button>
      </div>

      {loadingStudents ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading students...</p>
        </div>
      ) : studentList.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold">Mark Attendance</h3>
            <p className="text-sm text-gray-500 mt-1">
              {studentList.length} students enrolled
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {studentList.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setMarkingData({
                              ...markingData,
                              [student.id]: "present",
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            markingData[student.id] === "present"
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-green-100"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() =>
                            setMarkingData({
                              ...markingData,
                              [student.id]: "absent",
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            markingData[student.id] === "absent"
                              ? "bg-error-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-error-100"
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() =>
                            setMarkingData({
                              ...markingData,
                              [student.id]: "late",
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            markingData[student.id] === "late"
                              ? "bg-warning-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-warning-100"
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">Select a course to view students</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto text-gray-900 dark:text-white">
      {/* Header */}
      {user?.role === "student" ? (
        <></>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/40 rounded-2xl text-primary-600 dark:text-primary-400">
              <Calendar className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">Attendance Tracker</h1>
              <p className="text-gray-500 dark:text-gray-400">
                "Mark and manage student attendance"
              </p>
            </div>
          </div>
        </div>
      )}

      {user?.role === "student" ? <StudentView /> : <FacultyMarkView />}
    </div>
  );
};

export default AttendanceTracker;
