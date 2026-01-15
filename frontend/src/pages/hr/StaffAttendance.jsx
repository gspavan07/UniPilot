import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Users,
  Save,
  UserCheck,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { toast } from "react-hot-toast";

const StaffAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [departmentId, setDepartmentId] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    halfDay: 0,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [date, departmentId]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch (error) {
      console.error("Failed to fetch departments");
    }
  };

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(
        `/hr/attendance/daily-view?date=${date}&department_id=${departmentId}`
      );
      setStaff(res.data.data);
      calculateStats(res.data.data);
    } catch (error) {
      toast.error("Failed to load attendance data");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const s = {
      total: data.length,
      present: 0,
      absent: 0,
      leave: 0,
      halfDay: 0,
      notMarked: 0,
    };
    data.forEach((p) => {
      if (p.status === "present") s.present++;
      else if (p.status === "absent") s.absent++;
      else if (p.status === "leave") s.leave++;
      else if (p.status === "half-day") s.halfDay++;
      else s.notMarked++;
    });
    setStats(s);
  };

  const handleStatusChange = (userId, newStatus) => {
    const updated = staff.map((p) => {
      if (p.user_id === userId) {
        // Logic: if locked (leave), maybe prevent change? Or warn?
        // For now allow, but usually leave is priority.
        return { ...p, status: newStatus };
      }
      return p;
    });
    setStaff(updated);
    calculateStats(updated);
  };

  const markAllPresent = () => {
    const updated = staff.map((p) => {
      // Only update if not already marked or not on leave
      if (p.status === "not_marked") return { ...p, status: "present" };
      return p;
    });
    setStaff(updated);
    calculateStats(updated);
    toast.success("Marked all unmarked staff as Present");
  };

  const handleSave = async () => {
    try {
      const payload = {
        date,
        attendance_data: staff
          .map((p) => ({
            user_id: p.user_id,
            status: p.status === "not_marked" ? "absent" : p.status, // Default absent or present? Usually absent if not marked is strict, but let's send what UI has.
            // actually backend model enum doesn't have 'not_marked'.
            // So we must ensure valid enum.
            // If 'not_marked', skip or default?
            // Let's default to 'present' or ignore?
            // Better: filter out 'not_marked' or map to 'absent'?
            // Valid enums: present, absent, leave, half-day, holiday.
            // If user leaves it 'not_marked', we can't save it.
            // Strategy: Only save valid statuses.
          }))
          .filter((p) => p.status !== "not_marked"),
      };

      if (payload.attendance_data.length === 0) {
        return toast((display) => <span>No changes to save</span>);
      }

      await api.post("/hr/attendance/mark", payload);
      toast.success("Attendance saved successfully!");
      fetchAttendance(); // Reload
    } catch (error) {
      toast.error("Failed to save attendance");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-indigo-600" /> Staff Attendance
          </h1>
          <p className="text-gray-500">
            Manage daily attendance and leave status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm font-semibold"
            />
          </div>
          <button
            onClick={handleSave}
            className="btn btn-primary gap-2 shadow-lg hover:shadow-indigo-500/20"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Staff"
          value={stats.total}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Present"
          value={stats.present}
          icon={CheckCircle}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Absent"
          value={stats.absent}
          icon={AlertCircle}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          label="On Leave"
          value={stats.leave}
          icon={Briefcase}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          label="Half Day"
          value={stats.halfDay}
          icon={Clock}
          color="bg-yellow-50 text-yellow-600"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="select select-bordered select-sm w-48"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={markAllPresent}
            className="btn btn-sm btn-ghost text-indigo-600 hover:bg-indigo-50"
          >
            Mark All Unmarked Present
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Check In/Out</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400">
                      No staff found
                    </td>
                  </tr>
                ) : (
                  staff.map((person) => (
                    <tr
                      key={person.user_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold">{person.name}</span>
                          <span className="text-xs text-gray-400">
                            {person.employee_id}
                          </span>
                          {person.is_leave && (
                            <span className="badge badge-xs badge-warning mt-1 gap-1">
                              On Leave
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-sm">{person.role}</span>
                          <span className="text-xs text-gray-400">
                            {person.department}
                          </span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`select select-sm w-32 font-bold ${
                            person.status === "present"
                              ? "text-green-600 bg-green-50"
                              : person.status === "absent"
                                ? "text-red-600 bg-red-50"
                                : person.status === "leave" ||
                                    person.status === "half-day"
                                  ? "text-orange-600 bg-orange-50"
                                  : "text-gray-500"
                          }`}
                          value={person.status}
                          onChange={(e) =>
                            handleStatusChange(person.user_id, e.target.value)
                          }
                          disabled={person.is_leave} // Lock if officially on leave
                        >
                          <option value="not_marked">Select...</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="half-day">Half Day</option>
                          <option value="leave" disabled={!person.is_leave}>
                            On Leave
                          </option>
                          <option value="holiday">Holiday</option>
                        </select>
                      </td>
                      <td>
                        {/* Optional Time inputs? For now read-only or simple text */}
                        <div className="text-xs text-gray-400">
                          {person.check_in_time || "--:--"} -{" "}
                          {person.check_out_time || "--:--"}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm truncate max-w-xs block text-gray-500">
                          {person.remarks}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div
    className={`p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2 ${color} bg-opacity-20`}
  >
    <div className={`p-2 rounded-full ${color.split(" ")[0]} bg-opacity-100`}>
      <Icon className={`w-5 h-5 ${color.split(" ")[1]}`} />
    </div>
    <div className="text-2xl font-black">{value}</div>
    <div className="text-xs font-bold uppercase opacity-70">{label}</div>
  </div>
);

export default StaffAttendance;
