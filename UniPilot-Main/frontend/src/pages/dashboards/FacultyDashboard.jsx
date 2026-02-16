import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Calendar,
  Clock,
  CheckSquare,
  FileText,
  UserCheck,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";
// import { fetchMyProctees } from "../../store/slices/proctorSlice"; // Removed from dashboard view
import { fetchTimetable } from "../../store/slices/timetableSlice";
import api from "../../utils/api";

const FacultyDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myProctees } = useSelector((state) => state.proctor); // Kept if needed for stats, or can remove
  const { currentTimetable } = useSelector((state) => state.timetable);
  const [notifications, setNotifications] = React.useState([]);

  useEffect(() => {
    // dispatch(fetchMyProctees()); // Removed

    // Fetch Notifications
    const loadNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (e) {
        console.error("Failed to load notifications", e);
      }
    };
    loadNotifications();

    // Also fetch timetable context - ideally backend provides "my-schedule" endpoint
    // For now we use the slice if available or placeholder logic
  }, [dispatch]);

  // Filter Today's Classes for this Faculty
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const myClasses =
    currentTimetable?.slots
      ?.filter((s) => s.day_of_week === today && s.faculty_id === user?.id)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)) || [];

  return (
    <div className="space-y-6 text-gray-900 dark:text-white pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">
            Welcome, Prof. {user?.last_name}! 👨‍🏫
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Department of Computer Science
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/attendance"
            className="btn btn-primary flex items-center shadow-lg shadow-primary-500/20"
          >
            <CheckSquare className="w-4 h-4 mr-2" /> Mark Attendance
          </Link>
          <Link
            to="/timetable/manage"
            className="btn bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
          >
            <Calendar className="w-4 h-4 mr-2" /> My Schedule
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats / Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold">{myClasses.length}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase">
                Classes Today
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 mb-3">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold">{myProctees.length}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase">
                Proctees
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold">0</h3>
              <p className="text-xs text-gray-500 font-bold uppercase">
                Leave Requests
              </p>
            </div>
          </div>

          {/* Teaching Schedule */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {myClasses.length > 0 ? (
                myClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <h4 className="font-bold text-sm">
                          {cls.course?.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {cls.start_time?.slice(0, 5)} -{" "}
                          {cls.end_time?.slice(0, 5)} • {cls.room_number}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/attendance"
                      className="text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      Mark Attendance
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">
                  No classes scheduled for today.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Notifications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center">
              <Bell className="w-4 h-4 mr-2 text-yellow-500" /> Notifications
            </h3>
            <Link
              to="/notifications"
              className="text-xs font-bold text-gray-400 hover:text-primary-500"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.slice(0, 10).map((notif) => (
                <div key={notif.id} className={`flex items-start space-x-3 p-3 rounded-lg ${notif.is_read ? 'opacity-70' : 'bg-blue-50 dark:bg-blue-900/10'}`}>
                  <div className={`mt-1 min-w-[8px] h-2 rounded-full ${notif.is_read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 text-right">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-500">No new notifications.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
