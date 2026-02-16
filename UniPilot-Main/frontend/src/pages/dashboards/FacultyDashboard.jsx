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
  LayoutGrid
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

  return (
    <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-blue-100 pb-12">
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
        `}
      </style>
      {/* Decorative background accent */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100/80 border border-gray-200 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wide uppercase text-gray-600">Faculty Portal</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-6xl font-light tracking-tighter text-gray-900 mb-2">
                Hello, <span className="font-semibold block lg:inline">{user?.last_name || "Professor"}</span>
              </h1>
              <p className="text-lg text-gray-500 font-medium max-w-xl">
                Department of <span className="text-gray-900">{user?.department?.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="h-30 w-30 rounded-full bg-white border-4 border-gray-50 shadow-xl shadow-gray-200 overflow-hidden transition-transform duration-300 group-hover:scale-105 active:scale-95">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.first_name || "F"}+${user?.last_name || "U"}&background=0f172a&color=fff&size=128&bold=true`}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left Column: Schedule & Tasks (7 Cols) */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-10">

            {/* Context Widget: Date */}
            <div className="flex items-baseline justify-between border-b-2 border-gray-100 pb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Today's Agenda</h2>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              {myClasses.length > 0 ? (
                myClasses.map((cls, idx) => (
                  <div key={cls.id} className="group relative pl-8 border-l-2 border-gray-100 hover:border-blue-200 transition-colors duration-300">
                    {/* Active State Dot */}
                    <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-white ${idx === 0 ? 'bg-blue-600' : 'bg-gray-200 group-hover:bg-blue-400'} transition-colors`}></div>

                    <div className="bg-gray-50/50 hover:bg-white p-6 rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 transform group-hover:-translate-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md shadow-sm">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-sm font-bold font-mono text-gray-900">{cls.start_time?.slice(0, 5)}</span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{cls.room_number || "TBD"}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {cls.course?.name}
                          </h3>
                        </div>

                        <Link
                          to="/attendance"
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                          title="Mark Attendance"
                        >
                          <CheckSquare className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No classes scheduled</h3>
                  <p className="text-gray-500">Enjoy your free time today.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Stats & Notifications (5 Cols) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-10 flex flex-col">

            {/* Stats Grid */}
            <section>
              <h3 className="sr-only">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-gray-900 rounded-2xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-16 h-16" />
                  </div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Classes Today</p>
                  <p className="text-5xl font-bold tracking-tight">{myClasses.length}</p>
                </div>

                <div className="p-6 bg-blue-600 rounded-2xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserCheck className="w-16 h-16" />
                  </div>
                  <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Total Proctees</p>
                  <p className="text-5xl font-bold tracking-tight">{myProctees.length}</p>
                </div>

                <div className="col-span-2 p-6 bg-white border border-gray-200 rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-colors">
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Pending Requests</p>
                    <p className="text-3xl font-bold tracking-tight text-gray-900">0</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </div>
              </div>
            </section>

            {/* Notifications Widget */}
            <section className="bg-white rounded-3xl border border-gray-200 p-1 shadow-sm h-full max-h-[500px] flex flex-col">
              <div className="p-5 pb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Bell className="w-4 h-4 text-gray-900" />
                  </div>
                  <h3 className="font-bold text-gray-900">Inbox</h3>
                </div>
                <button
                  onClick={() => setShowAllNotifications(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                >
                  View All
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 scrollbar-hide space-y-1">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                      <div className="flex gap-3 items-start">
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.is_read ? 'bg-gray-300' : 'bg-blue-600'}`}></span>
                        <div className="space-y-1">
                          <p className={`text-sm leading-snug ${notif.is_read ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}
              </div>
            </section>

          </div>

        </main>
        
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
