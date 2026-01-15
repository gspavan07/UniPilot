import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  BookOpen,
  Gift,
  Info,
} from "lucide-react";
import { fetchMyTimetable } from "../../store/slices/timetableSlice";
import api from "../../utils/api";

const MyTimetable = () => {
  const dispatch = useDispatch();
  const { currentTimetable, status } = useSelector((state) => state.timetable);
  // In a real app, we'd fetch based on the student's enrolled program/section
  // For demo, we'll fetch a known ID or the first one available

  const { user } = useSelector((state) => state.auth);
  const [holidays, setHolidays] = React.useState([]);
  const [isSatWorking, setIsSatWorking] = React.useState(false);

  useEffect(() => {
    dispatch(fetchMyTimetable());
    fetchHolidays();
    fetchSettings();
  }, [dispatch]);

  const fetchSettings = async () => {
    try {
      const settingKey =
        user?.role === "student"
          ? "student_saturday_working"
          : "staff_saturday_working";
      const res = await api.get(`/settings?keys=${settingKey}`);
      setIsSatWorking(res.data.data[settingKey] === "true");
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const target = user?.role === "student" ? "student" : "staff";
      const res = await api.get(`/holidays?target=${target}`);
      setHolidays(res.data.data);
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  if (isSatWorking) days.push("Saturday");

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Weekly Schedule</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Classes and venues
            </p>
          </div>
        </div>

        {holidays.length > 0 && (
          <div className="flex bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-4 items-center gap-4 animate-fade-in max-w-md w-full ml-auto">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600">
              <Gift className="w-5 h-5 transition-bounce" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 leading-none mb-1">
                Upcoming Institutional Break
              </p>
              <h4 className="text-sm font-black text-amber-900 dark:text-amber-100">
                {holidays[0].name}
              </h4>
              <p className="text-[10px] font-bold text-amber-700/60">
                {new Date(holidays[0].date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </header>

      {!currentTimetable ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            No timetable assigned to your profile yet.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
          <div
            className={`grid grid-cols-1 gap-6 min-w-[1000px] md:min-w-0 ${
              days.length === 6
                ? "md:grid-cols-6"
                : days.length === 7
                  ? "md:grid-cols-7"
                  : "md:grid-cols-5"
            }`}
          >
            {days.map((day) => {
              const daySlots =
                currentTimetable.slots?.filter((s) => s.day_of_week === day) ||
                [];

              return (
                <div key={day} className="flex flex-col space-y-4">
                  <div className="text-center py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-gray-600 dark:text-gray-300">
                    {day}
                  </div>
                  {daySlots.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      No Classes
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-l-4 border-l-purple-500 border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center text-xs font-bold text-gray-400 mb-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {slot.start_time.slice(0, 5)} -{" "}
                          {slot.end_time.slice(0, 5)}
                        </div>
                        <h4 className="font-bold text-lg mb-1">
                          {slot.course?.code}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-1">
                          {slot.course?.name}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
                            <MapPin className="w-3 h-3 mr-1" />{" "}
                            {slot.room_number}
                          </span>
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />{" "}
                            {slot.faculty?.name.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTimetable;
