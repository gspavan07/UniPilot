import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Info,
  Coffee,
} from "lucide-react";
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

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-end pb-8 gap-8">
          <div>
            <span className="block text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">
              Weekly Schedule
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-black leading-none">
              Timetable.
            </h1>
          </div>

          {holidays.length > 0 && (
            <div className="flex items-center gap-4 px-6 py-4 border border-blue-600 bg-blue-50/50 rounded-none w-full md:w-auto">
              <div className="p-2 bg-blue-600 text-white rounded-full">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-0.5">
                  Upcoming Break
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-sm font-bold text-black">
                    {holidays[0].name}
                  </h4>
                  <span className="text-xs font-mono text-gray-500">
                    {new Date(holidays[0].date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>

        {!currentTimetable ? (
          <div className="mt-8 flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 rounded-3xl bg-gray-50/30">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mb-6 transform rotate-3">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Timetable Synced</h3>
            <p className="text-gray-400 mt-2 text-sm text-center max-w-xs font-medium">
              Your weekly schedule hasn't been published yet. Check back later.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto pb-12 mt-6">
            <div
              className="min-w-[1000px] lg:min-w-0 grid gap-px bg-gray-200 border border-gray-200 rounded-3xl overflow-hidden shadow-sm"
              style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
            >
              {days.map((day, index) => {
                const daySlots =
                  currentTimetable.slots?.filter((s) => s.day_of_week === day) ||
                  [];

                // Sort slots by time
                daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));

                return (
                  <div key={day} className="flex flex-col bg-white h-full min-h-[500px]">
                    {/* Day Header */}
                    <div className="py-6 px-4 border-b border-gray-100 bg-white sticky top-0 z-10 text-center">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-full">{day.substring(0, 3)}</span>
                      <h3 className="text-lg font-black text-gray-900 mt-3">{day}</h3>
                      <p className="text-xs font-medium text-gray-400 mt-1">{daySlots.length} Sessions</p>
                    </div>

                    {/* Slots Container */}
                    <div className="flex-1 p-3 space-y-3 bg-gray-50/30">
                      {daySlots.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 py-12 opacity-60">
                          <Coffee className="w-6 h-6 mb-2 text-gray-200" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">No Classes</span>
                        </div>
                      ) : (
                        daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="group relative bg-white p-4 rounded-xl border border-blue-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[4px_5px_2px_0.5px_rgba(37,99,235,0.2)] hover:border-blue-300 transition-all duration-300"
                          >

                            <div className="absolute left-0 t op-3 bottom-3 w-1 bg-blue-600 rounded-r-md transition-opacity"></div>

                            {/* Time Badge */}
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border  mb-3 bg-blue-50 order-blue-100 transition-colors">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] font-bold text-blue-700">
                                {slot.start_time.slice(0, 5)}
                              </span>
                            </div>

                            {/* Content */}
                            <div>
                              <h4 className="text-sm font-extrabold leading-snug mb-1   text-blue-700 transition-colors">
                                {slot.activity_name || slot.course?.name}
                              </h4>

                              {slot.course?.code && (
                                <div className="text-[10px] font-mono font-bold text-gray-400 mb-3">
                                  {slot.course.code}
                                </div>
                              )}

                              <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-50">
                                <div className="flex items-center text-[10px] font-bold text-gray-500">
                                  <MapPin className="w-3 h-3 mr-1.5 text-blue-500" />
                                  {slot.room?.room_number || slot.room_number || "TBD"}
                                </div>

                                {(slot.faculty?.name || slot.faculty_id) && (
                                  <div className="flex items-center text-[10px] font-medium text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                                    <User className="w-3 h-3 mr-1.5 text-gray-300" />
                                    {slot.faculty?.name || "Faculty Member"}
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
