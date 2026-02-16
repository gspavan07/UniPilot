import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, MapPin, Clock, User, Info, Coffee } from "lucide-react";
import { fetchMyTimetable } from "../../store/slices/timetableSlice";
import api from "../../utils/api";

const MyTimetable = () => {
  const dispatch = useDispatch();
  const { currentTimetable, status } = useSelector((state) => state.timetable);
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

  // Helper to get date for the current week based on day name
  const getDateForDay = (dayName) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sun) to 6 (Sat)
    const dayIndex = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ].indexOf(dayName);

    // Calculate difference (handling Sunday as 0, but Monday is start of our logical week)
    const diff = dayIndex - (currentDay === 0 ? 7 : currentDay);
    const targetDate = new Date(today);
    targetDate.setDate(
      today.getDate() + (currentDay === 0 && dayIndex !== 0 ? diff + 7 : diff),
    );

    return targetDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-12">
        {/* Modern Header Section */}
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>

            <div className="space-y-2 relative z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
                Academic Schedule
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                Weekly <span className="text-blue-600">Timetable.</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Your structured learning journey for the current academic
                session.
              </p>
            </div>

            {holidays.length > 0 && (
              <div className="relative z-10 group flex items-center gap-6 px-8 py-6 bg-white border border-gray-100 rounded-[2rem] shadow-md shadow-black/[0.02] w-full lg:w-auto transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                    Upcoming Recess
                  </p>
                  <div className="flex flex-col">
                    <h4 className="text-lg font-black text-black leading-none mb-1">
                      {holidays[0].name}
                    </h4>
                    <span className="text-xs font-bold text-blue-600/60 font-mono">
                      {new Date(holidays[0].date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {!currentTimetable ? (
          <div className="py-40 flex flex-col items-center justify-center bg-gray-50/30 border-2 border-dashed border-gray-100 rounded-[3rem]">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/[0.02] mb-8 group transition-transform hover:rotate-6">
              <Calendar className="w-10 h-10 text-gray-200 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-black mb-3">
              Syncing Unavailable
            </h3>
            <p className="text-gray-400 font-medium text-center max-w-sm px-6">
              We couldn't locate your published schedule. Please verify with the
              academic department or try again later.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto pb-12 mt-6 custom-scrollbar">
            <div
              className={`min-w-[1200px] lg:min-w-0 grid gap-8`}
              style={{
                gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
              }}
            >
              {days.map((day) => {
                const daySlots =
                  currentTimetable.slots?.filter(
                    (s) => s.day_of_week === day,
                  ) || [];

                daySlots.sort((a, b) =>
                  a.start_time.localeCompare(b.start_time),
                );

                return (
                  <div key={day} className="flex flex-col gap-6">
                    {/* Day Header - Premium Floating Style */}
                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-blue-200 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 bg-blue-50 px-4 py-1.5 rounded-full">
                        {getDateForDay(day)}
                      </span>
                      <h3 className="text-xl font-black text-black">{day}</h3>
                      <div className="mt-2 h-1 w-8 bg-blue-600/20 rounded-full"></div>
                    </div>

                    {/* Slots Container */}
                    <div className="flex-1 space-y-4">
                      {daySlots.length === 0 ? (
                        <div className="h-[200px] flex flex-col items-center justify-center bg-gray-50/30 border-2 border-dashed border-gray-100 rounded-[2rem] opacity-60">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4">
                            <Coffee className="w-5 h-5 text-gray-200" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">
                            Quiet Day
                          </span>
                        </div>
                      ) : (
                        daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="group relative bg-white p-6 rounded-[2rem] border border-gray-300 shadow-md shadow-black/[0.02] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-100 cursor-default overflow-hidden"
                          >
                            {/* Accent Bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Time Badge - Striking Design */}
                            <div className="flex items-center justify-between mb-5">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[1rem] bg-gray-50 group-hover:bg-blue-600 transition-all duration-500">
                                <Clock className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                                <span className="text-xs font-black text-black group-hover:text-white transition-colors">
                                  {slot.start_time.slice(0, 5)}
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-blue-600">
                                <Info className="w-4 h-4" />
                              </div>
                            </div>

                            {/* Main Content */}
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <h4 className="text-base font-black text-black leading-tight group-hover:text-blue-600 transition-colors">
                                  {slot.activity_name || slot.course?.name}
                                </h4>
                                {slot.course?.code && (
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {slot.course.code}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-2 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                  </div>
                                  <span className="text-xs font-bold text-gray-600">
                                    Room{" "}
                                    {slot.room?.room_number ||
                                      slot.room_number ||
                                      "TBA"}
                                  </span>
                                </div>

                                {(slot.faculty?.name || slot.faculty_id) && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                      <User className="w-3.5 h-3.5 text-gray-400" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500 truncate">
                                      {slot.faculty?.name || "Academic Staff"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTimetable;
