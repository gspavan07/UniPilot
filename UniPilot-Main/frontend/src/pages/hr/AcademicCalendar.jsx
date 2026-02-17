import { useState, useEffect } from "react";
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
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

const AcademicCalendar = ({ target = "staff" }) => {
  const isStudent = target === "student";

  // Design Theory:
  // "Student" -> Primary Blue (Royal/Inter)
  // "Staff" -> Cyan/Teal (Professional/Distinct)
  // adhering to "blue or blue-adjacent" rule for accents.
  // Text is always black/gray-900. Background always white.

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
    description: "",
    duration: 1,
  });

  // State for Managing Day Events (Context Menu / Click)
  const [dayMenu, setDayMenu] = useState({
    isOpen: false,
    date: null,
    events: [],
    position: { x: 0, y: 0 }, // For context menu positioning if needed, or just center modal
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

  const handleDayClick = (day, events) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (events.length === 0) {
      // No events: Open New Entry modal with date pre-filled
      setFormData({
        name: "",
        date: dateStr,
        type: "Public Holiday",
        description: "",
        duration: 1,
      });
      setEditingHoliday(null);
      setShowModal(true);
    } else {
      // Has events: Open Management Modal
      setDayMenu({
        isOpen: true,
        date: dateStr,
        events: events,
      });
    }
  };

  const handleDayContextMenu = (e, day, events) => {
    e.preventDefault();
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Always open management modal on right click, even if empty (optional, but consistent with "feature too")
    // Or if empty, open new entry form? User said "implement this right click feature too".
    // "if there already a event... show edit/delete options".
    // I'll stick to: Right click behaves like left click for empty (new entry), but forces management menu for existing?
    // Actually, context menu implies options. Let's show the management modal which can have "Add New" even if empty?
    // User request: "clicking... should also open... new event... implement right click too".
    // I will make right click behave exactly like left click for consistency, or maybe show the menu always.
    // Let's make it consistent:
    handleDayClick(day, events);
  };

  const groupHolidays = () => {
    if (holidays.length === 0) return [];

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

  // ───────────────────────────────────────────────────────────────────────────
  // THEME CONFIGURATION
  // ───────────────────────────────────────────────────────────────────────────
  // Using pure black text, white bg.
  // Accents: Blue (Student) | Cyan (Staff)
  // No gradients. 1px borders.

  const accentColor = isStudent ? "text-blue-600" : "text-cyan-600";
  const bgAccent = isStudent ? "bg-blue-600" : "bg-cyan-600";
  const bgSoft = isStudent ? "bg-blue-50" : "bg-cyan-50";
  const borderAccent = isStudent ? "border-blue-200" : "border-cyan-200";
  const ringFocus = isStudent ? "focus:ring-blue-500" : "focus:ring-cyan-500";
  const buttonClass = `shadow-sm ${isStudent
    ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
    : "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"} text-white transition-all duration-200 ease-in-out`;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100 sticky top-0 z-10 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="group p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
            </button>
            <div className={`p-2.5 rounded-xl ${bgSoft}`}>
              <CalendarIcon className={`w-5 h-5 ${accentColor}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                {isStudent ? "Student Calendar" : "Staff Calendar"}
              </h1>
              <p className="text-xs font-medium text-gray-500">
                {target.charAt(0).toUpperCase() + target.slice(1)} Academic Schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Toggle Saturday */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 mr-2 md:mr-6">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Saturday
              </span>
              <button
                disabled={settingLoading}
                onClick={toggleSatWorking}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${isSatWorking
                  ? (isStudent ? "bg-blue-600" : "bg-cyan-600")
                  : "bg-gray-300"
                  } ${settingLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${isSatWorking ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
              <span className={`text-xs font-bold w-12 text-right ${isSatWorking ? "text-green-600" : "text-gray-400"}`}>
                {isSatWorking ? "ON" : "OFF"}
              </span>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold ${buttonClass}`}
            >
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ─── Left Column: Calendar ─────────────────────────────────────── */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {currentDate.toLocaleString("default", { month: "long" })} <span className="text-gray-300 font-light">{year}</span>
            </h2>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-500 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-px bg-gray-200 my-1"></div>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-500 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-3 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-px">
              {calendarDays.map((day, idx) => {
                const dayHolidays = getHolidaysForDay(day);
                const isCurrent = isToday(day);

                return (
                  <div
                    key={idx}
                    className={`bg-white min-h-[120px] p-2 relative group transition-all hover:z-10 ${!day ? "!bg-gray-50/30" : "hover:shadow-md cursor-pointer"
                      } flex flex-col`}
                    onClick={() => handleDayClick(day, dayHolidays)}
                    onContextMenu={(e) => handleDayContextMenu(e, day, dayHolidays)}
                  >
                    {day && (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`w-7 h-7 flex items-center justify-center text-sm font-semibold rounded-md ${isCurrent
                              ? `${bgAccent} text-white shadow-sm`
                              : "text-gray-700"
                              }`}
                          >
                            {day}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                          {dayHolidays.map((h) => (
                            <div
                              key={h.id}
                              className={`text-[10px] w-full px-2 py-1 rounded border-l-[3px] font-medium truncate leading-tight ${h.type === "Public Holiday"
                                ? "bg-red-50 border-red-500 text-red-700"
                                : `${bgSoft} ${borderAccent} ${accentColor}`
                                }`}
                              title={h.name}
                            >
                              {h.name}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Right Column: List & Stats ────────────────────────────────── */}
        <div className="xl:col-span-4 flex flex-col gap-6">

          {/* Info Card */}
          <div className="p-6 bg-gray-900 rounded-2xl text-white shadow-xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 ${isStudent ? "bg-blue-500" : "bg-cyan-500"} rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-700`}></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-sm tracking-wide uppercase text-gray-300">
                  {isStudent ? "System Sync" : "Attendance Bot"}
                </h4>
              </div>
              <p className="text-2xl font-bold mb-2">
                {isStudent ? "Automatic Schedule" : "Smart Register"}
              </p>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">
                {isStudent
                  ? "All events listed here are automatically reflected in student timetables to prevent scheduling conflicts."
                  : "Teaching and non-teaching staff attendance is automatically marked as 'Holiday' for these dates."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                Upcoming Events
              </h3>
              <span className="text-xs font-bold px-2 py-1 bg-gray-200 text-gray-600 rounded-md">
                {groupedHolidays.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar max-h-[500px] xl:max-h-none">
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading calendar data...</div>
              ) : groupedHolidays.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 min-h-[200px]">
                  <Clock className="w-8 h-8 opacity-20" />
                  <p className="text-sm font-medium">No upcoming events found</p>
                </div>
              ) : (
                groupedHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="group flex flex-col gap-2 p-4 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all cursor-default"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {holiday.type}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {holiday.name}
                        </h4>
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
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(holiday.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded text-[11px] font-bold ${bgSoft} ${accentColor}`}>
                        {holiday.count > 1 ? `${holiday.count} Days` : "1 Day"}
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {new Date(holiday.date).toLocaleDateString("default", {
                          weekday: "short",
                          month: "short",
                          day: "numeric"
                        })}
                        {holiday.count > 1 && ` - ${new Date(holiday.endDate).toLocaleDateString("default", { month: "short", day: "numeric" })}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      {/* ─── Modal ───────────────────────────────────────────────────────── */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 m-4">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingHoliday ? "Modify Event" : "Add New Event"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Event Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 focus:border-transparent focus:ring-2 ${ringFocus} focus:outline-none transition-all`}
                    placeholder="New Year's Day"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 focus:border-transparent focus:ring-2 ${ringFocus} focus:outline-none transition-all`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Duration</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 focus:border-transparent focus:ring-2 ${ringFocus} focus:outline-none transition-all`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                  <div className="flex p-1 bg-gray-100 rounded-lg">
                    {["Public Holiday", "Institutional Event", "Other"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${formData.type === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        {type.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 focus:border-transparent focus:ring-2 ${ringFocus} focus:outline-none transition-all resize-none`}
                    placeholder="Optional details..."
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-[2] py-3 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 ${buttonClass}`}
                >
                  {editingHoliday ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Day Events Management Modal ────────────────────────────────── */}
      {dayMenu.isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 m-4">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {new Date(dayMenu.date).toLocaleDateString("default", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  {dayMenu.events.length} Event{dayMenu.events.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setDayMenu({ ...dayMenu, isOpen: false })}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {dayMenu.events.map((event) => (
                <div key={event.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block mb-0.5">
                        {event.type}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {event.name}
                      </h4>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingHoliday(event);
                        setFormData({
                          name: event.name,
                          date: event.date,
                          type: event.type,
                          description: event.description,
                          duration: event.duration || event.count || 1,
                        });
                        setDayMenu({ ...dayMenu, isOpen: false });
                        setShowModal(true);
                      }}
                      className="flex-1 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this event?")) {
                          handleDelete(event.id);
                          // We might need to close or refresh the menu here.
                          // handleDelete refreshes holidays, which updates props, but this local state 'dayMenu.events' might be stale.
                          // Simpler to close the menu.
                          setDayMenu({ ...dayMenu, isOpen: false });
                        }
                      }}
                      className="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}

              {dayMenu.events.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No events scheduled.</p>
              )}

              <button
                onClick={() => {
                  setFormData({
                    name: "",
                    date: dayMenu.date,
                    type: "Public Holiday",
                    description: "",
                    duration: 1,
                  });
                  setEditingHoliday(null);
                  setDayMenu({ ...dayMenu, isOpen: false });
                  setShowModal(true);
                }}
                className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${buttonClass}`}
              >
                <Plus className="w-4 h-4" />
                Add New Event
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
      }
    </div >
  );
};

export default AcademicCalendar;
