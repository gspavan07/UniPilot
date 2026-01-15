import React, { useState, useMemo, useEffect } from "react";
import api from "../../utils/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AttendanceCalendar = ({
  attendance = [],
  leaves = [],
  target = "staff",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [isSatWorking, setIsSatWorking] = useState(false);

  useEffect(() => {
    fetchHolidays();
    fetchSettings();
  }, [currentDate, target]);

  const fetchHolidays = async () => {
    try {
      const res = await api.get(`/holidays?target=${target}`);
      setHolidays(res.data.data);
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const settingKey =
        target === "student"
          ? "student_saturday_working"
          : "staff_saturday_working";
      const res = await api.get(`/settings?keys=${settingKey}`);
      setIsSatWorking(res.data.data[settingKey] === "true");
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const daysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const prevMonth = () =>
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  // Merge Data into a Lookup Map
  const statusMap = useMemo(() => {
    const map = {};

    // 1. Plot Approved Leaves
    leaves.forEach((leave) => {
      if (leave.status === "approved") {
        let start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        while (start <= end) {
          const dateStr = start.toISOString().split("T")[0];
          map[dateStr] = {
            status: "leave",
            type: leave.leave_type,
            isHalfDay: leave.is_half_day,
          };
          start.setDate(start.getDate() + 1);
        }
      }
    });

    // 2. Plot Attendance (Overrides Leave if present manually marked, though rare)
    attendance.forEach((record) => {
      const dateStr = record.date; // YYYY-MM-DD
      map[dateStr] = {
        ...map[dateStr],
        status: record.status.toLowerCase(),
      };
    });

    // 3. Plot Holidays
    holidays.forEach((h) => {
      map[h.date] = { status: "holiday", name: h.name };
    });

    return map;
  }, [attendance, leaves, holidays]);

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-24 bg-gray-50/30 dark:bg-gray-800/30 border-b border-r border-gray-100 dark:border-gray-700"
        ></div>
      );
    }

    // Days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = new Date(dateStr).getDay();
      const isWeekend = dayOfWeek === 0 || (dayOfWeek === 6 && !isSatWorking); // Sun, or Non-working Sat

      const data = statusMap[dateStr];
      let status = data?.status || (isWeekend ? "weekend" : "unknown");

      // Colors
      const bgColors = {
        present: "bg-green-50 dark:bg-green-900/20 hover:bg-green-100",
        absent: "bg-red-50 dark:bg-red-900/20 hover:bg-red-100",
        leave: "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100",
        holiday: "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100",
        weekend: "bg-gray-50 dark:bg-gray-800/50",
        unknown: "bg-white dark:bg-gray-800",
      };

      const textColors = {
        present: "text-green-700 dark:text-green-400",
        absent: "text-red-700 dark:text-red-400",
        leave: "text-yellow-700 dark:text-yellow-400",
        holiday: "text-blue-700 dark:text-blue-400",
        weekend: "text-gray-400",
        unknown: "text-gray-900 dark:text-gray-300",
      };

      // Day Cell
      days.push(
        <div
          key={d}
          className={`h-24 p-2 border-b border-r border-gray-100 dark:border-gray-700 relative transition-colors ${bgColors[status] || bgColors.unknown}`}
        >
          <span
            className={`text-sm font-semibold ${textColors[status] || textColors.unknown}`}
          >
            {d}
          </span>

          {data && (
            <div className="mt-2">
              {status === "present" && (
                <span className="badge badge-xs badge-success gap-1">
                  Present
                </span>
              )}
              {status === "absent" && (
                <span className="badge badge-xs badge-error gap-1">Absent</span>
              )}
              {status === "leave" && (
                <div className="flex flex-col gap-1">
                  <span className="badge badge-xs badge-warning">
                    {data.isHalfDay ? "Half Day" : "Leave"}
                  </span>
                  <span className="text-[10px] truncate text-yellow-600 dark:text-yellow-300">
                    {data.type}
                  </span>
                </div>
              )}
              {status === "holiday" && (
                <div className="flex flex-col gap-1">
                  <span className="badge badge-xs badge-info">Holiday</span>
                  <span className="text-[10px] truncate text-blue-600 dark:text-blue-300">
                    {data.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {monthName} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="btn btn-sm btn-ghost btn-circle"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="btn btn-sm btn-ghost btn-circle"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-xs font-medium uppercase tracking-wider ${i === 0 || i === 6 ? "text-red-400" : "text-gray-500"}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7">{renderDays()}</div>

      {/* Legend */}
      <div className="p-4 flex gap-4 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 rounded-sm"></div> Present
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 rounded-sm"></div> Absent
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-100 rounded-sm"></div> Leave
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div> Weekend
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 rounded-sm"></div> Holiday
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
