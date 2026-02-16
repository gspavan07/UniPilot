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
  User,
  Bell,
  Book,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchMyFeeStatus } from "../../store/slices/feeSlice";
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
    dispatch(fetchMyFeeStatus());
    dispatch(fetchMyAttendance());
    fetchExams();
    dispatch(fetchMyTimetable());
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

  const totalDue = myStatus?.grandTotals?.due || 0;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysClasses =
    currentTimetable?.slots
      ?.filter((s) => s.day_of_week === today)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)) || [];

  const stats = [
    {
      label: "Attendance",
      value: `${attendanceSummary?.percentage || 0}%`,
      icon: CheckCircle,
      // status: (attendanceSummary?.percentage || 0) < 75 ? "Warning" : "😁",
    },
    {
      label: "Fee Dues",
      value: `₹${totalDue.toLocaleString()}`,
      icon: AlertCircle,
      // isAlert: totalDue > 0,
    },
    {
      label: "Overall CGPA",
      value: performance?.summary?.cgpa || "N/A",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-blue-100 selection:text-blue-900 pb-20 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-md shadow-black/[0.03]">
            <div className="space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                Current Semester:{" "}
                {user?.current_semester
                  ? `Sem ${user.current_semester}`
                  : "N/A"}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-black leading-tight">
                Welcome back,
                <br />
                <span className="text-blue-600 truncate">
                  {user?.first_name} {user?.last_name}
                </span>
              </h1>
              <p className="text-gray-500 text-md font-medium max-w-md truncate">
                {user?.program?.name || "Academic Program"}
                <br />
                Student ID: {user?.student_id?.toUpperCase()}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <img
                src={
                  user?.profile_picture ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt=""
                className="w-32 h-32 rounded-full"
              />
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`group p-8 rounded-[2rem] border border-blue-300 transition-all duration-500 shadow-md shadow-black/[0.03] hover:shadow-xl hover:-translate-y-1 ${
                stat.isAlert
                  ? "border-blue-600 bg-white"
                  : "border-gray-100 bg-white hover:border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`p-3 rounded-2xl ${
                    stat.isAlert
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 text-blue-600 group-hover:bg-blue-50"
                  } transition-colors`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>

                {/* <span className="flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-600 text-3xl font-bold uppercase">
                  {stat.status}
                </span> */}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
                  {stat.label}
                </h3>
                <p className="text-4xl font-black text-black tracking-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left Column: Schedule */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-black flex items-center gap-4">
                <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                Today's Timeline
              </h2>
              <Link
                to="/timetable/my"
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
              >
                View Full Calendar
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-6">
              {todaysClasses.length > 0 ? (
                todaysClasses.map((cls, idx) => (
                  <div
                    key={idx}
                    className="group relative flex gap-6 md:gap-10 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-blue-600/[0.02] hover:border-blue-600/20 p-6 rounded-[1.5rem] border border-gray-100 hover:shadow-xl"
                  >
                    <div className="w-20 md:w-28 flex-shrink-0 flex flex-col justify-center border-r border-gray-100 pr-4">
                      <span className="text-2xl font-black text-black group-hover:text-blue-600 transition-colors">
                        {cls.start_time.slice(0, 5)}
                      </span>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                        {parseInt(cls.start_time.slice(0, 2)) >= 12
                          ? "PM"
                          : "AM"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-xl font-bold text-black truncate group-hover:text-blue-600 transition-colors">
                          {cls.course?.name}
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border border-gray-100">
                          Room {cls.room_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-500" />
                          </div>
                          <span className="text-sm font-semibold text-gray-600 leading-none">
                            {cls.faculty?.first_name} {cls.faculty?.last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-tight">
                            1 Hour
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center border-2  border-gray-200 rounded-[2rem] bg-gray-50/30">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-50">
                    <Calendar className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                    A quiet day ahead
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    No classes scheduled for today.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Widgets */}
          <aside className="lg:col-span-4 space-y-12">
            {/* Notices Widget */}
            <div className="space-y-6">
              <h2 className="text-lg font-black flex items-center justify-between">
                Latest Updates
                <Link
                  to="/my-exams"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  See All
                </Link>
              </h2>

              <div className="space-y-4">
                {exams.length > 0 ? (
                  exams.map((cycle) => (
                    <Link key={cycle.id} to="/my-exams" className="block group">
                      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-md shadow-black/[0.03] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-blue-600/[0.02] hover:border-blue-600/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-[2rem] flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-blue-50 text-[9px] font-black text-blue-600 uppercase tracking-tighter mb-4">
                          Exam Notice
                        </span>
                        <h4 className="font-bold text-black text-base leading-tight group-hover:text-blue-600 transition-colors">
                          {cycle.cycle_name.replace(/_/g, " ")}
                        </h4>
                        <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase">
                          <span>Active Now</span>
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center bg-gray-50/50 border border-gray-100 rounded-3xl">
                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Everything is up to date
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hostel Services */}
            {user?.is_hosteller && (
              <div className="p-8 bg-black rounded-[2rem] text-white shadow-2xl shadow-gray-200 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
                <h2 className="text-xl font-black mb-6 relative z-10 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Hostel Life
                </h2>
                <div className="space-y-3 relative z-10">
                  <Link
                    to="/hostel/gate-pass"
                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all group/btn"
                  >
                    <span className="flex items-center font-bold text-sm">
                      <Ticket className="w-4 h-4 mr-3 text-blue-400" />
                      Digital Gate Pass
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/hostel/complaints"
                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all group/btn"
                  >
                    <span className="flex items-center font-bold text-sm">
                      <AlertCircle className="w-4 h-4 mr-3 text-red-400" />
                      Report Issue
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}

            {/* Quote/Motivation Card */}
            <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
              <div className="absolute bottom-[-20px] right-[-20px] opacity-10">
                <BookOpen className="w-40 h-40" />
              </div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">
                Focus of the week
              </p>
              <p className="text-xl font-black leading-snug mb-2">
                Consistency is key.
              </p>
              <p className="text-sm font-medium text-blue-100/70 leading-relaxed italic">
                "Success is the sum of small efforts, repeated day in and day
                out."
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
