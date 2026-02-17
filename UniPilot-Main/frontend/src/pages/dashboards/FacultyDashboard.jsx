import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Calendar,
  Clock,
  CheckSquare,
  FileText,
  UserCheck,
  Bell,
  X,
  CheckCheck,
  Trash2,
  ArrowRight,
  LayoutGrid,
  BookOpen,
  ChevronRight,
  ArrowUpRight
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
  const [showAllNotifications, setShowAllNotifications] = React.useState(false);

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

  const handleMarkAllRead = async () => {
    // Optimistic update
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updated);
    try {
      await api.put('/notifications/read-all');
    } catch (e) {
      console.error("Failed to mark all as read", e);
      // Revert if needed, or just let it fail silently as it's a UI preference
    }
  };

  const handleClearAll = async () => {
    // Optimistic update
    const previous = [...notifications];
    setNotifications([]);
    setShowAllNotifications(false); // Close modal on clear
    try {
      await api.delete('/notifications/delete-all');
    } catch (e) {
      console.error("Failed to clear notifications", e);
      setNotifications(previous); // Revert on failure
    }
  };

  const stats = [
    {
      label: "Classes Today",
      value: myClasses.length,
      icon: Users,
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "group-hover:border-blue-200"
    },
    {
      label: "Total Proctees",
      value: myProctees.length,
      icon: UserCheck,
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "group-hover:border-purple-200"
    },
    {
      label: "Pending Requests",
      value: "0",
      icon: FileText,
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "group-hover:border-orange-200"
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
                Faculty Portal
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-black leading-tight">
                Welcome back,
                <br />
                <span className="text-blue-600 truncate">
                  Professor {user?.last_name || "User"}
                </span>
              </h1>
              <p className="text-gray-500 text-md font-medium max-w-md truncate">
                Department of {user?.department?.name || "General"}
                <br />
                ID: {user?.employee_id || "FAC-001"}
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
              className={`group p-8 rounded-[2rem] border border-gray-100 bg-white transition-all duration-500 shadow-md shadow-black/[0.03] hover:shadow-xl hover:-translate-y-1 ${stat.border}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.text} transition-colors`}>
                  <stat.icon className="w-6 h-6" />
                </div>
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
              <div className="flex gap-2">
                <Link
                  to="/attendance"
                  className="group flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  Mark Attendance
                </Link>
                <Link
                  to="/timetable/my"
                  className="group flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                >
                  Full Schedule
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              {myClasses.length > 0 ? (
                myClasses.map((cls, idx) => (
                  <div
                    key={idx}
                    className="group relative flex gap-6 md:gap-10 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-blue-600/[0.02] hover:border-blue-600/20 p-6 rounded-[1.5rem] border border-gray-100 hover:shadow-xl"
                  >
                    <div className="w-20 md:w-28 flex-shrink-0 flex flex-col justify-center border-r border-gray-100 pr-4">
                      <span className="text-2xl font-black text-black group-hover:text-blue-600 transition-colors">
                        {cls.start_time.slice(0, 5)}
                      </span>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                        {parseInt(cls.start_time.slice(0, 2)) >= 12 ? "PM" : "AM"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-xl font-bold text-black truncate group-hover:text-blue-600 transition-colors">
                          {cls.course?.name}
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border border-gray-100">
                          {cls.room_number || "Room TBD"}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <Clock className="w-3 h-3 text-gray-500" />
                          </div>
                          <span className="text-sm font-semibold text-gray-600 leading-none">
                            1 Hour Session
                          </span>
                        </div>
                        <Link
                          to="/attendance"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <span className="text-xs font-bold uppercase tracking-tight">
                            Take Attendance
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center border-2 border-gray-200 rounded-[2rem] bg-gray-50/30">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-50">
                    <Calendar className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                    No classes today
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Enjoy your free time, Professor.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Widgets */}
          <aside className="lg:col-span-4 space-y-12">

            {/* Notifications Widget */}
            <div className="space-y-6">
              <h2 className="text-lg font-black flex items-center justify-between">
                Notifications
                <button
                  onClick={() => setShowAllNotifications(true)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  See All
                </button>
              </h2>

              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.slice(0, 4).map((notif) => (
                    <div key={notif.id} className="block group">
                      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-md shadow-black/[0.03] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-blue-600/[0.02] hover:border-blue-600/20 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-16 h-16 ${notif.is_read ? 'bg-gray-50' : 'bg-blue-50/50'} rounded-bl-[2rem] flex items-center justify-center`}>
                          <Bell className={`w-6 h-6 ${notif.is_read ? 'text-gray-300' : 'text-blue-600'}`} />
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-lg ${notif.is_read ? 'bg-gray-50 text-gray-400' : 'bg-blue-50 text-blue-600'} text-[9px] font-black uppercase tracking-tighter mb-4`}>
                          {notif.is_read ? 'Read' : 'New Message'}
                        </span>
                        <h4 className={`font-bold text-base leading-tight transition-colors ${notif.is_read ? 'text-gray-500' : 'text-black group-hover:text-blue-600'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase">
                          <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-gray-50/50 border border-gray-100 rounded-3xl">
                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Inbox Zero
                    </p>
                  </div>
                )}
              </div>
            </div>



          </aside>
        </div>
      </div>

      {/* Modern Modal Overlay */}
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
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{notifications.length} Total</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllNotifications(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-end gap-3">
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4 space-y-2 bg-gray-50/30">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                    <div className="flex gap-4 items-start">
                      <div className={`mt-1.5 w-2 h-2 rounded-full ring-2 ring-white flex-shrink-0 ${notif.is_read ? 'bg-gray-200' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]'}`}></div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-sm ${notif.is_read ? 'font-medium text-gray-600' : 'font-bold text-gray-900'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                            {new Date(notif.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {notif.message}
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

export default FacultyDashboard;
