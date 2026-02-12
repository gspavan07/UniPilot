import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../utils/api";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
  Coffee,
} from "lucide-react";
import { toast } from "react-hot-toast";

const AcademicCalendar = ({ target = "staff" }) => {
  const isStudent = target === "student";
  const themeColor = isStudent ? "indigo" : "emerald";
  const darkThemeColor = isStudent ? "indigo" : "emerald";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSatWorking, setIsSatWorking] = useState(false);
  const [settingLoading, setSettingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "Public Holiday",
    description: "",
    duration: 1,
  });

  useEffect(() => {
    fetchHolidays();
    fetchSettings();
  }, [currentDate, target]);

  const fetchSettings = async () => {
    try {
      const settingKey = isStudent
        ? "student_saturday_working"
        : "staff_saturday_working";
      const res = await api.get(`/settings?keys=${settingKey}`);
      setIsSatWorking(res.data.data[settingKey] === "true");
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const toggleSatWorking = async () => {
    setSettingLoading(true);
    try {
      const settingKey = isStudent
        ? "student_saturday_working"
        : "staff_saturday_working";
      const newValue = !isSatWorking;
      await api.post("/settings", {
        settings: { [settingKey]: String(newValue) },
      });
      setIsSatWorking(newValue);
      toast.success(
        `Saturday is now marked as ${newValue ? "WORKING" : "NON-WORKING"}`
      );
    } catch (error) {
      toast.error("Failed to update setting");
    } finally {
      setSettingLoading(false);
    }
  };

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/holidays?target=${target}`);
      setHolidays(res.data.data);
    } catch (error) {
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        await api.put(`/holidays/${editingHoliday.id}`, {
          ...formData,
          target,
        });
        toast.success("Holiday updated successfully");
      } else {
        await api.post("/holidays", { ...formData, target });
        toast.success("Holiday added successfully");
      }
      setShowModal(false);
      fetchHolidays();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save holiday");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?"))
      return;
    try {
      await api.delete(`/holidays/${id}`);
      toast.success("Holiday deleted successfully");
      fetchHolidays();
    } catch (error) {
      toast.error("Failed to delete holiday");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      type: "Public Holiday",
      description: "",
      duration: 1,
    });
    setEditingHoliday(null);
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= days; i++) {
    calendarDays.push(i);
  }

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getHolidaysForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return holidays.filter((h) => h.date === dateStr);
  };

  const groupHolidays = () => {
    if (holidays.length === 0) return [];

    // Sort by date just in case
    const sorted = [...holidays].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const groups = [];

    if (sorted.length > 0) {
      let currentGroup = {
        ...sorted[0],
        startDate: sorted[0].date,
        endDate: sorted[0].date,
        count: 1,
        ids: [sorted[0].id],
      };

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const current = sorted[i];

        const prevDate = new Date(prev.date);
        const currDate = new Date(current.date);
        const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        if (current.name === prev.name && dayDiff === 1) {
          currentGroup.endDate = current.date;
          currentGroup.count++;
          currentGroup.ids.push(current.id);
        } else {
          groups.push(currentGroup);
          currentGroup = {
            ...current,
            startDate: current.date,
            endDate: current.date,
            count: 1,
            ids: [current.id],
          };
        }
      }
      groups.push(currentGroup);
    }

    return groups;
  };

  const groupedHolidays = groupHolidays();

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10 animate-fade-in p-4 md:p-8">
      {/* Header Section */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${isStudent ? "from-indigo-600 via-indigo-700 to-violet-800" : "from-emerald-600 via-emerald-700 to-teal-800"} rounded-3xl p-8 shadow-2xl ${isStudent ? "shadow-indigo-500/20" : "shadow-emerald-500/20"} text-white`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div
          className={`absolute bottom-0 left-0 w-48 h-48 ${isStudent ? "bg-indigo-400/10" : "bg-emerald-400/10"} rounded-full -ml-24 -mb-24 blur-2xl`}
        ></div>

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase border border-white/20">
              <CalendarIcon className="w-3.5 h-3.5" /> University Scheduling
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              {isStudent
                ? "Student Academic Calendar"
                : "Staff Academic Calendar"}
            </h1>
            <p
              className={`${isStudent ? "text-indigo-100" : "text-emerald-100"} flex items-center gap-2 text-lg`}
            >
              Manage{" "}
              {isStudent
                ? "student breaks, semester exams, and cultural events."
                : "institutional holidays, staff breaks, and training sessions."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div
              className={`bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center gap-4 group/toggle transition-all hover:bg-white/20`}
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">
                  Weekly Config
                </span>
                <span className="text-sm font-black text-white whitespace-nowrap">
                  Saturday Working?
                </span>
              </div>
              <button
                disabled={settingLoading}
                onClick={toggleSatWorking}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isSatWorking ? "bg-white" : "bg-white/30"} ${settingLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 shadow-md ${isSatWorking ? "bg-emerald-600" : "bg-white"} ${isSatWorking ? "translate-x-6" : "translate-x-1"}`}
                ></div>
              </button>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className={`bg-white ${isStudent ? "text-indigo-700 hover:bg-indigo-50" : "text-emerald-700 hover:bg-emerald-50"} px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl hover:shadow-white/20 transition-all active:scale-95 group`}
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Establish Event
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              {currentDate.toLocaleString("default", { month: "long" })} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className={`p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${isStudent ? "hover:bg-indigo-50 hover:text-indigo-600" : "hover:bg-emerald-50 hover:text-emerald-600"} transition-all shadow-sm`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className={`p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${isStudent ? "hover:bg-indigo-50 hover:text-indigo-600" : "hover:bg-emerald-50 hover:text-emerald-600"} transition-all shadow-sm`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-8 grid grid-cols-7 gap-3">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-black text-gray-400 tracking-widest pb-4"
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              const dayHolidays = getHolidaysForDay(day);
              return (
                <div
                  key={idx}
                  className={`min-h-[100px] rounded-3xl p-3 border transition-all flex flex-col gap-2 ${
                    !day
                      ? "bg-gray-50/30 border-transparent dark:bg-gray-900/10"
                      : isToday(day)
                        ? `${isStudent ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"} ring-2 ${isStudent ? "ring-indigo-500/20" : "ring-emerald-500/20"} shadow-lg ${isStudent ? "shadow-indigo-500/5" : "shadow-emerald-500/5"}`
                        : `bg-white border-gray-50 dark:bg-gray-800 dark:border-gray-700 ${isStudent ? "hover:border-indigo-200 dark:hover:border-indigo-800" : "hover:border-emerald-200 dark:hover:border-emerald-800"} hover:shadow-md`
                  }`}
                >
                  <span
                    className={`text-sm font-black ${isToday(day) ? (isStudent ? "text-indigo-600" : "text-emerald-600") : "text-gray-400"}`}
                  >
                    {day}
                  </span>
                  <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[80px] scrollbar-hide">
                    {dayHolidays.map((h) => (
                      <div
                        key={h.id}
                        className="text-[9px] font-black p-1.5 rounded-xl truncate leading-none uppercase tracking-tighter shadow-sm border"
                        style={{
                          backgroundColor:
                            h.type === "Public Holiday"
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(99, 102, 241, 0.1)",
                          color:
                            h.type === "Public Holiday" ? "#059669" : "#4f46e5",
                          borderColor:
                            h.type === "Public Holiday"
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(99, 102, 241, 0.1)",
                        }}
                      >
                        {h.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Holiday Sidebar / Timeline */}
        <div className="space-y-8 flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex-1">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <CalendarDays
                className={`w-5 h-5 ${isStudent ? "text-indigo-600" : "text-emerald-600"}`}
              />
              Annual Roster
            </h3>

            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {loading ? (
                <div className="py-10 text-center animate-pulse text-gray-400 font-bold">
                  Loading records...
                </div>
              ) : groupedHolidays.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-4 grayscale opacity-40">
                  <Info className="w-12 h-12" />
                  <p className="font-black">No events planned</p>
                </div>
              ) : (
                groupedHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className={`group bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-3xl border border-transparent ${isStudent ? "hover:border-indigo-100 dark:hover:border-indigo-900" : "hover:border-emerald-100 dark:hover:border-emerald-900"} transition-all`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span
                          className={`text-xs font-black ${isStudent ? "text-indigo-600" : "text-emerald-600"} uppercase tracking-widest leading-none`}
                        >
                          {holiday.count > 1 ? (
                            <>
                              {new Date(holiday.startDate).toLocaleDateString(
                                "default",
                                { month: "short", day: "numeric" }
                              )}{" "}
                              -{" "}
                              {new Date(holiday.endDate).toLocaleDateString(
                                "default",
                                { month: "short", day: "numeric" }
                              )}
                              <span
                                className={`ml-2 ${isStudent ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"} px-2 py-0.5 rounded-lg text-[9px]`}
                              >
                                {holiday.count} Days
                              </span>
                            </>
                          ) : (
                            new Date(holiday.date).toLocaleDateString(
                              "default",
                              {
                                month: "short",
                                day: "numeric",
                                weekday: "short",
                              }
                            )
                          )}
                        </span>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
                          {holiday.name}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight line-clamp-2">
                          {holiday.description || "No specific details shared."}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingHoliday(holiday);
                            setFormData({
                              name: holiday.name,
                              date: holiday.date,
                              type: holiday.type,
                              description: holiday.description,
                              duration: holiday.count,
                            });
                            setShowModal(true);
                          }}
                          className={`p-2 ${isStudent ? "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600"} rounded-xl transition-all pointer-events-auto`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(holiday.id)}
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl text-rose-600 transition-all pointer-events-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Legend / Tips */}
          <div
            className={`${isStudent ? "bg-indigo-950" : "bg-emerald-950"} rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group`}
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <Trophy
              className={`w-8 h-8 ${isStudent ? "text-indigo-400" : "text-emerald-400"} mb-4`}
            />
            <h4 className="text-lg font-black mb-2">
              {isStudent ? "Academic Milestone" : "Automated Sync"}
            </h4>
            <p
              className={`text-xs font-bold ${isStudent ? "text-indigo-100/60" : "text-emerald-100/60"} leading-relaxed`}
            >
              {isStudent
                ? "Dates defined here reflect on the student timetable and course schedules, ensuring clear communication of breaks."
                : 'Dates established here will automatically mark staff as "HOLIDAY" in the attendance register, preventing manual data entry errors.'}
            </p>
          </div>
        </div>
      </div>

      {/* Modal - Render through Portal */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4 animate-fade-in">
            <div
              className={`bg-white dark:bg-gray-800 rounded-[3rem] w-full max-w-xl shadow-3xl relative animate-scale-in border border-white/10 overflow-hidden`}
            >
              <div
                className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isStudent ? "from-indigo-500 to-violet-500" : "from-emerald-500 to-teal-500"}`}
              ></div>

              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                      {editingHoliday ? "Modify Event" : "Define Event"}
                    </h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Institution Schedule Manager
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">
                        Event Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Independence Day"
                        className={`w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 text-sm font-black focus:ring-4 ${isStudent ? "focus:ring-indigo-500/10" : "focus:ring-emerald-500/10"} transition-all`}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">
                        Occurrence Date
                      </label>
                      <input
                        type="date"
                        className={`w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 text-sm font-black focus:ring-4 ${isStudent ? "focus:ring-indigo-500/10" : "focus:ring-emerald-500/10"} [color-scheme:dark] transition-all`}
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Duration (Number of Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 3"
                      className={`w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 text-sm font-black focus:ring-4 ${isStudent ? "focus:ring-indigo-500/10" : "focus:ring-emerald-500/10"} transition-all`}
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Category
                    </label>
                    <div className="flex gap-4">
                      {["Public Holiday", "Institutional Event", "Other"].map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, type })}
                            className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all ${
                              formData.type === type
                                ? `${isStudent ? "bg-indigo-600" : "bg-emerald-600"} text-white shadow-lg ${isStudent ? "shadow-indigo-500/20" : "shadow-emerald-500/20"}`
                                : "bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-gray-100"
                            }`}
                          >
                            {type}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Context / Description
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Brief details about the occasion..."
                      className={`w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 px-6 text-sm font-black focus:ring-4 ${isStudent ? "focus:ring-indigo-500/10" : "focus:ring-emerald-500/10"} transition-all resize-none`}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-8 py-4 rounded-2xl font-black text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-all"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className={`flex-[2] px-8 py-4 rounded-2xl font-black text-sm ${isStudent ? "bg-indigo-600" : "bg-emerald-600"} text-white ${isStudent ? "hover:bg-indigo-700 shadow-indigo-600/30" : "hover:bg-emerald-700 shadow-emerald-600/30"} shadow-2xl transition-all active:scale-95`}
                    >
                      {editingHoliday
                        ? "Synchronize Changes"
                        : "Establish Entry"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AcademicCalendar;
