import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Shield,
  Ticket,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchMyFeeStatus } from "../../store/slices/feeSlice";
import { fetchTimetable } from "../../store/slices/timetableSlice";
import { fetchMyAttendance } from "../../store/slices/attendanceSlice";
import { fetchMyTimetable } from "../../store/slices/timetableSlice";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myStatus } = useSelector((state) => state.fee);
  const { currentTimetable } = useSelector((state) => state.timetable);
  const { summary: attendanceSummary } = useSelector(
    (state) => state.attendance,
  );

  useEffect(() => {
    // 1. Fetch Fees
    dispatch(fetchMyFeeStatus());
    // 2. Fetch Attendance
    dispatch(fetchMyAttendance());
    // 3. Fetch Exam Notices
    fetchExams();
    // 4. Fetch Timetable
    dispatch(fetchMyTimetable());
    // 5. Fetch Performance
    if (user?.id) {
      fetchPerformance();
    }
  }, [dispatch, user?.id]);

  const [exams, setExams] = useState([]);
  const fetchExams = async () => {
    try {
      const response = await api.get("/exam/cycles/my/exams");
      setExams(response.data.data);
    } catch (err) {
      console.error("Failed to fetch exam notices:", err);
    }
  };

  const [performance, setPerformance] = useState(null);
  const fetchPerformance = async () => {
    try {
      const response = await api.get(`/exam/results/${user.id}`);
      setPerformance(response.data.data);
    } catch (err) {
      console.error("Failed to fetch performance:", err);
    }
  };

  // Calculate Real Stats
  const totalDue = myStatus?.grandTotals?.due || 0;

  // Filter Today's Classes
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysClasses =
    currentTimetable?.slots
      ?.filter((s) => s.day_of_week === today)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)) || [];

  const stats = [
    {
      label: "Attendance",
      value: `${attendanceSummary?.percentage || 0}%`,
      subLabel: "Current Semester",
      icon: CheckCircle,
      // Minimalist: Use blue scale for status or just neutral
      border:
        (attendanceSummary?.percentage || 0) < 75
          ? "border-gray-200"
          : "border-blue-100",
    },
    {
      label: "Fee Dues",
      value: `₹${totalDue.toLocaleString()}`,
      subLabel: totalDue > 0 ? "Action Required" : "No Pending Dues",
      icon: AlertCircle,
      isAlert: totalDue > 0,
    },
    {
      label: "Overall CGPA",
      value: performance?.summary?.cgpa || "N/A",
      subLabel: "Academic Performance",
      icon: TrendingUp,
      border: "border-gray-200",
    },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-fit bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        {/* Header Section: Minimal & Bold */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-100 pb-6 mb-6">
          <div className="space-y-2">
            <span className="text-sm font-semibold tracking-widest text-blue-600 uppercase">
              Student Dashboard
            </span>
            <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-black">
              Hello, {user?.first_name}
            </h1>
            <p className="text-gray-500 text-lg">
              {user?.program?.name || "Student"} • {user?.current_semester ? `Sem ${user.current_semester}` : "N/A"}
            </p>
          </div>
          <div className="mt-6 md:mt-0 text-left md:text-right">
            <p className="text-6xl font-light text-gray-200 leading-none select-none">
              {new Date().getDate()}
            </p>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
              {new Date().toLocaleDateString("en-US", { month: "long", weekday: "long" })}
            </p>
          </div>
        </header>

        {/* Overview Section - Moved to Top */}
        <section className="mb-10">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`group p-5 rounded-2xl border ${stat.isAlert ? "border-blue-600 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                  } transition-all duration-300 flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between mb-4">
                  <stat.icon
                    className={`w-4 h-4 ${stat.isAlert ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"
                      } transition-colors`}
                  />
                  {stat.isAlert && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                </div>
                {/* <p className="mt-4 text-xs font-medium text-gray-400 border-t border-gray-200/50 pt-3">
                  {stat.subLabel}
                </p> */}
              </div>
            ))}
          </div>
        </section>

        {/* Main Content Grid: Schedule (Left) & Notices/Hostel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Center Column: Daily Schedule (8 cols) */}
          <main className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-black tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-black block display-block"></span>
                Today's Schedule
              </h2>
              <Link
                to="/timetable/my"
                className="text-sm font-bold text-blue-600 hover:text-black transition-colors flex items-center gap-1 group"
              >
                Full Timetable
                <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="relative border-l border-gray-200 ml-3 md:ml-0 md:border-none space-y-0">
              {todaysClasses.length > 0 ? (
                todaysClasses.map((cls, idx) => (
                  <div key={idx} className="group relative pl-8 md:pl-0 md:flex md:gap-8 pb-12 last:pb-0">
                    {/* Timeline Line (Mobile) */}
                    <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-white border-2 border-blue-600 md:hidden z-10"></div>

                    {/* Time Column */}
                    <div className="md:w-32 flex-shrink-0 pt-1">
                      <span className="block text-xl font-bold text-black group-hover:text-blue-600 transition-colors">
                        {cls.start_time.slice(0, 5)}
                      </span>
                      <span className="text-sm text-gray-400 font-medium">
                        {parseInt(cls.start_time.slice(0, 2)) >= 12 ? "PM" : "AM"}
                      </span>
                    </div>

                    {/* Divider details (Desktop) */}
                    <div className="hidden md:block w-px bg-gray-200 relative group-hover:bg-blue-200 transition-colors">
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black group-hover:bg-blue-600 transition-colors"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white pt-1 md:pb-6 border-b border-gray-100 group-last:border-none group-hover:pl-4 transition-all duration-300">
                      <h3 className="text-lg font-bold text-gray-900 leading-snug">
                        {cls.course?.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-sm bg-blue-500"></span>
                          Room {cls.room_number}
                        </span>
                        <span className="h-4 w-px bg-gray-200"></span>
                        <span className="font-medium text-gray-700">
                          {cls.faculty?.first_name} {cls.faculty?.last_name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                  <p className="text-gray-400 font-medium">No classes scheduled for today.</p>
                </div>
              )}
            </div>
          </main>

          {/* Right Column: Notices & Hostel (4 cols) */}
          <aside className="lg:col-span-4 space-y-12">

            {/* Notices Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Notices
                </h2>
                <Link to="/my-exams" className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>

              <div className="space-y-4">
                {exams.length > 0 ? (
                  exams.map((cycle) => (
                    <Link
                      key={cycle.id}
                      to="/my-exams"
                      className="block group"
                    >
                      <article className="p-5 bg-gray-50 rounded-2xl border border-transparent group-hover:border-blue-200 group-hover:bg-white border-l-2 border-l-blue-600 transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-bold uppercase text-gray-400">New</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm leading-relaxed group-hover:text-blue-600 transition-colors">
                          {cycle.cycle_name.replace(/_/g, " ")}
                        </h4>
                        <p className="mt-2 text-xs text-gray-500">
                          Registration active
                        </p>
                      </article>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 border border-gray-100 rounded-2xl">
                    <p className="text-sm text-gray-400">No active notices.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hostel Section (If Hosteller) - Moved Here */}
            {user?.is_hosteller && (
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Hostel Services
                </h2>
                <nav className="flex flex-col space-y-2">
                  <Link
                    to="/hostel/gate-pass"
                    className="flex items-center justify-between p-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <span className="flex items-center">
                      <Ticket className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                      Gate Pass
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500" />
                  </Link>
                  <Link
                    to="/hostel/complaints"
                    className="flex items-center justify-between p-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <span className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                      Complaints
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500" />
                  </Link>
                </nav>
              </div>
            )}

            {/* Quick Tip or Decorative Element - Preserved Comment */}
            {/* <div className="p-6 bg-blue-900 text-white">
                <div className="mb-4">
                   <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-lg font-bold leading-snug mb-2">
                   Stay Consistent.
                </p>
                <p className="text-xs text-blue-200/80 leading-relaxed opacity-80">
                   "Success is the sum of small efforts, repeated day in and day out."
                </p>
             </div> */}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
