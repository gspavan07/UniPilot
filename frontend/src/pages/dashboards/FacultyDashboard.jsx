import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Calendar,
  Clock,
  CheckSquare,
  FileText,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchMyProctees } from "../../store/slices/proctorSlice";
import { fetchTimetable } from "../../store/slices/timetableSlice";

const FacultyDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myProctees } = useSelector((state) => state.proctor);
  const { currentTimetable } = useSelector((state) => state.timetable);

  useEffect(() => {
    dispatch(fetchMyProctees());
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

        {/* Right Sidebar - Proctees / Notifications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center">
              <UserCheck className="w-4 h-4 mr-2" /> My Proctees
            </h3>
            <Link
              to="/proctoring"
              className="text-xs font-bold text-gray-400 hover:text-primary-500"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {myProctees.length > 0 ? (
              myProctees.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold">
                    {student.first_name[0]}
                    {student.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-[10px] text-gray-400 capitalize">
                      {student.id.slice(0, 8)}... • Sem{" "}
                      {student.current_semester}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No students assigned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
