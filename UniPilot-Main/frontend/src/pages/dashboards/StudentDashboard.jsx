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
    dispatch(fetchMyTimetable());
    if (user?.id) {
      // fetchPerformance(); // Endpoint /exam/results/:id not implemented
    }
  }, [dispatch, user?.id]);

  const [updates, setUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const handleMarkAllRead = async () => {
    // Optimistic: Mark all updates as read visually if possible, or trigger refetch
    // In student dashboard, updates are mixed exam/notifs. We only clear notifications via API.
    try {
      await api.put('/notifications/read-all');
      fetchUpdates(); // Refresh 
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications/delete-all');
      setUpdates([]); // Clear for now
      setShowAllNotifications(false);
    } catch (e) {
      console.error("Failed to clear notifications", e);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [user]);

  const fetchUpdates = async () => {
    try {
      setLoadingUpdates(true);
      const [examsRes, notifRes] = await Promise.all([
        api.get("/exam/cycles/my/exams"),
        api.get("/notifications"),
      ]);

      const examUpdates = examsRes.data.data.map(exam => ({
        id: `exam-${exam.id}`,
        type: "EXAM_NOTICE",
        title: exam.cycle_name.replace(/_/g, " "),
        description: "Exam Schedule Released",
        date: exam.created_at || new Date().toISOString(),
        link: "/my-exams",
        icon: BookOpen,
        color: "text-blue-600",
        bg: "bg-blue-50",
      }));

      const notificationUpdates = notifRes.data.data.map(notif => ({
        id: `notif-${notif.id}`,
        type: notif.type || "INFO",
        title: notif.title,
        description: notif.message,
        date: notif.createdAt || notif.created_at || new Date().toISOString(),
        link: null,
        icon: notif.type === "WARNING" ? AlertCircle : Bell,
        color: notif.type === "WARNING" ? "text-red-600" : "text-gray-600",
        bg: notif.type === "WARNING" ? "bg-red-50" : "bg-gray-50",
      }));

      const allUpdates = [...examUpdates, ...notificationUpdates].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setUpdates(allUpdates);
    } catch (err) {
      console.error("Failed to fetch updates:", err);
    } finally {
      setLoadingUpdates(false);
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
              className={`group p-8 rounded-[2rem] border border-blue-300 transition-all duration-500 shadow-md shadow-black/[0.03] hover:shadow-xl hover:-translate-y-1 ${stat.isAlert
                ? "border-blue-600 bg-white"
                : "border-gray-100 bg-white hover:border-blue-200"
                }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`p-3 rounded-2xl ${stat.isAlert
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
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.03] overflow-hidden sticky top-8 flex flex-col max-h-[600px]">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div>
                  <h2 className="text-xl font-black text-black">Latest Updates</h2>
                </div>
                <button
                  onClick={() => setShowAllNotifications(true)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="divide-y divide-gray-50 flex-1 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {updates.length > 0 ? (
                  updates.slice(0, 5).map((update) => (
                    <div
                      key={update.id}
                      className={`group p-6 hover:bg-gray-50/50 transition-colors ${update.link ? "cursor-pointer" : ""}`}
                      onClick={() => update.link ? (window.location.href = update.link) : setShowAllNotifications(true)}
                    >
                      <div className="flex gap-4">
                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${update.type === "WARNING" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"}`}></div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${update.bg} ${update.color}`}>
                              {update.type.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">
                              {new Date(update.date).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-black leading-snug group-hover:text-blue-600 transition-colors">
                            {update.title}
                          </h4>

                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {update.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <Bell className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">All caught up!</p>
                    <p className="text-xs text-gray-400 mt-1">No new updates to show.</p>
                  </div>
                )}
              </div>

              {updates.length > 0 && (
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
                  <button
                    onClick={() => setShowAllNotifications(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider hover:underline"
                  >
                    View All Archive
                  </button>
                </div>
              )}
            </div>

            {/* Hostel Services */}
            {user?.is_hosteller && (
              <div className="p-8  rounded-[2rem] text-white border border-gray-200 shadow-2xl shadow-gray-200 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all duration-700"></div>
                <h2 className="text-xl font-black text-black mb-6 relative z-10 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Hostel Life
                </h2>
                <div className="space-y-3 relative z-10">
                  <Link
                    to="/hostel/gate-pass"
                    className="flex items-center justify-between p-4 bg-blue-600/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all group/btn"
                  >
                    <span className="flex items-center text-black font-bold text-sm">
                      <Ticket className="w-4 h-4 mr-3 text-blue-400" />
                      Digital Gate Pass
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/hostel/complaints"
                    className="flex items-center justify-between p-4 bg-red-600/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all group/btn"
                  >
                    <span className="flex items-center text-black font-bold text-sm">
                      <AlertCircle className="w-4 h-4 mr-3 text-red-400" />
                      Report Issue
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Modern Notification Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setShowAllNotifications(false)}
          ></div>

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-gray-900/5 animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">All Updates</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{updates.length} Total</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllNotifications(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
              >
                <span className="text-gray-400 group-hover:text-gray-900 font-bold">Close</span>
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-end gap-3">
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                Mark all read
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                Clear all
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4 space-y-2 bg-gray-50/30">
              {updates.length > 0 ? (
                updates.map((update, idx) => (
                  <div key={idx} className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                    <div className="flex gap-4 items-start">
                      <div className={`mt-1.5 w-2 h-2 rounded-full ring-2 ring-white flex-shrink-0 ${update.type === "WARNING" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"}`}></div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-gray-900">
                            {update.title}
                          </h4>
                          <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                            {new Date(update.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {update.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <Bell className="w-12 h-12 mb-4 text-gray-200" />
                  <p>Inboxes zero.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
