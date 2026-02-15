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
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchMyFeeStatus } from "../../store/slices/feeSlice";
import { fetchTimetable } from "../../store/slices/timetableSlice";
import { fetchMyAttendance } from "../../store/slices/attendanceSlice";

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
  }, [dispatch]);

  const [exams, setExams] = useState([]);
  const fetchExams = async () => {
    try {
      const response = await api.get("/exam/cycles/my/exams");
      setExams(response.data.data);
    } catch (err) {
      console.error("Failed to fetch exam notices:", err);
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
      label: "Overall Attendance",
      value: `${attendanceSummary?.percentage || 0}%`,
      icon: CheckCircle,
      color:
        (attendanceSummary?.percentage || 0) < 75
          ? "text-orange-500"
          : "text-emerald-500",
      bg:
        (attendanceSummary?.percentage || 0) < 75
          ? "bg-orange-100 dark:bg-orange-900/30"
          : "bg-emerald-100 dark:bg-emerald-900/30",
    },

    {
      label: "Pending Fees",
      value: `₹${totalDue.toLocaleString()}`,
      icon: AlertCircle,
      color: totalDue > 0 ? "text-red-500" : "text-blue-500",
      bg:
        totalDue > 0
          ? "bg-red-100 dark:bg-red-900/30"
          : "bg-blue-100 dark:bg-blue-900/30",
    },
  ];

  return (
    <div className="space-y-6 text-gray-900 dark:text-white pb-20">
      {/* Welcome */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-display">
            Hello, {user?.first_name}! 🎓
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user?.program?.name || "Student"} • Batch{" "}
            {user?.batch_year || "N/A"} • {user?.regulation?.name || "N/A"} •
            Semester {user?.current_semester || 1}
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-bold text-gray-400 uppercase">Today</p>
          <p className="text-xl font-bold">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Timetable Widget */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> Today's
              Classes
            </h3>
            <Link
              to="/timetable/my"
              className="text-sm text-indigo-600 font-bold hover:underline"
            >
              View Full Schedule
            </Link>
          </div>
          <div className="space-y-4">
            {todaysClasses.length > 0 ? (
              todaysClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-16 text-center border-r border-gray-200 dark:border-gray-700 pr-4 mr-4">
                    <span className="block font-bold text-lg">
                      {cls.start_time.slice(0, 5)}
                    </span>
                    <span className="text-xs text-gray-400">AM</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{cls.course?.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] mr-2 text-gray-600 dark:text-gray-300 font-bold">
                        {cls.room_number}
                      </span>
                      Lecture • {cls.faculty?.last_name}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p>No classes scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Notices */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Academic Notices</h3>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {exams.length > 0 ? (
                exams.map((cycle) => (
                  <Link
                    key={cycle.id}
                    to="/my-exams"
                    className="block p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-400 rounded-lg text-amber-900 group-hover:scale-110 transition-transform">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">
                          Exam Notice
                        </p>
                        <p className="text-sm font-medium text-indigo-50/90 line-clamp-2">
                          {cycle.cycle_name.replace(/_/g, " ")} is scheduled
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                  <p className="text-sm text-indigo-100/50">No new notices</p>
                </div>
              )}
            </div>
          </div>

          {/* Hostel Quick Action - Only for Hostellers */}
          {user?.is_hosteller && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-cyan-500" /> Hostel
                  Services
                </h3>
              </div>
              <div className="space-y-3">
                <Link
                  to="/hostel/gate-pass"
                  className="flex items-center p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 transition-colors"
                >
                  <Ticket className="w-5 h-5 mr-3" />
                  <span className="text-sm font-bold">Request Gate Pass</span>
                </Link>
                <Link
                  to="/hostel/complaints"
                  className="flex items-center p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 transition-colors"
                >
                  <AlertCircle className="w-5 h-5 mr-3" />
                  <span className="text-sm font-bold">Hostel Complaint</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
