import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  Fingerprint,
  Pencil,
  X,
  Search,
  ArrowRight,
  Info,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

const BIOMETRIC_ENABLED = import.meta.env.VITE_ENABLE_BIOMETRIC === "true";

const StaffAttendance = () => {
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA") // Returns YYYY-MM-DD in local time
  );
  const [departmentId, setDepartmentId] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    halfDay: 0,
  });
  const [showBioModal, setShowBioModal] = useState(false);
  const [selectedUserForBio, setSelectedUserForBio] = useState(null);
  const [bioIdInput, setBioIdInput] = useState("");

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
    };
    data.forEach((p) => {
      if (p.status === "present") s.present++;
      else if (p.status === "absent") s.absent++;
      else if (p.status === "leave") s.leave++;
      else if (p.status === "half-day") s.halfDay++;
    });
    setStats(s);
  };

  const handleStatusChange = (userId, newStatus) => {
    const updated = staff.map((p) => {
      if (p.user_id === userId) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    setStaff(updated);
    calculateStats(updated);
  };

  const markAllPresent = () => {
    const updated = staff.map((p) => {
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
            status: p.status === "not_marked" ? "absent" : p.status,
            check_in_time: p.check_in_time || null,
            check_out_time: p.check_out_time || null,
            remarks: p.remarks || "",
          }))
          .filter((p) => p.status !== "not_marked"),
      };

      if (payload.attendance_data.length === 0) {
        return toast.error("No changes to save");
      }

      await api.post("/hr/attendance/mark", payload);
      toast.success("Attendance saved successfully!");
      fetchAttendance();
    } catch (error) {
      toast.error("Failed to save attendance");
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10 animate-fade-in p-4 md:p-8">
      {/* Premium Dashboard Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-8 shadow-2xl shadow-indigo-500/20 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase border border-white/20">
              <UserCheck className="w-3.5 h-3.5" /> Attendance Management
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Staff Attendance Control
            </h1>
            <p className="text-indigo-100 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Real-time tracking and manual
              verification for today's roster.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 flex-grow lg:flex-grow-0 group transition-all focus-within:ring-2 focus-within:ring-white/40">
              <Calendar className="w-5 h-5 text-indigo-200 group-hover:text-white transition-colors" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm font-black text-white cursor-pointer [color-scheme:dark]"
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl hover:shadow-white/20 transition-all active:scale-95 flex-grow lg:flex-grow-0 justify-center"
            >
              <Save className="w-4 h-4" /> Update Records
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - High Contrast */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard
          label="Total Strength"
          value={stats.total}
          icon={Users}
          color="indigo"
          subtitle="On Roster"
        />
        <StatCard
          label="Active & Present"
          value={stats.present}
          icon={CheckCircle}
          color="emerald"
          subtitle={`${((stats.present / stats.total) * 100 || 0).toFixed(0)}% Attendance`}
        />
        <StatCard
          label="Marked Absent"
          value={stats.absent}
          icon={AlertCircle}
          color="rose"
          subtitle="Awaiting Remarks"
        />
        <StatCard
          label="Official Leaves"
          value={stats.leave}
          icon={Briefcase}
          color="amber"
          subtitle="Approved Requests"
        />
        <StatCard
          label="Short Shifts"
          value={stats.halfDay}
          icon={Clock}
          color="blue"
          subtitle="Half-Day Records"
        />
      </div>

      {/* Data Section */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Advanced Toolbar */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl pl-11 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-bold min-w-[150px]"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="all">All Sections</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={markAllPresent}
              className="group text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all"
            >
              Mark All Unmarked Present{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="overflow-x-auto min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-[400px] gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent shadow-lg shadow-indigo-500/10"></div>
              <span className="text-gray-500 font-black animate-pulse">
                Syncing Database...
              </span>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-900/50 text-xs font-black text-gray-400 uppercase tracking-widest px-6 py-4">
                  <th className="text-left py-4 px-8">Staff Member</th>
                  <th className="text-left py-4 px-6">Organization</th>
                  <th className="text-center py-4 px-6">Status Toggle</th>
                  <th className="text-center py-4 px-6">Shift Times</th>
                  {BIOMETRIC_ENABLED && (
                    <th className="text-center py-4 px-6">Hardware Link</th>
                  )}
                  <th className="text-left py-4 px-8">Activity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                        <Users className="w-16 h-16" />
                        <p className="font-black text-xl">Roster Empty</p>
                        <p className="text-sm">
                          Try adjusting your filters or search terms.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((person) => (
                    <tr
                      key={person.user_id}
                      className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-300"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-black text-indigo-600 overflow-hidden shadow-sm group-hover:shadow-indigo-500/20 transition-all">
                            {person.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 dark:text-gray-100">
                              {person.name}
                            </span>
                            <span className="text-xs font-bold text-gray-400 leading-tight">
                              {person.employee_id}
                            </span>
                            {person.is_leave && (
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full w-fit">
                                <Briefcase className="w-2.5 h-2.5" /> Out of
                                Office
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase text-gray-400 tracking-tighter">
                            {person.department}
                          </span>
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                            {person.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <div className="relative group/pill">
                            <select
                              className={`appearance-none cursor-pointer pl-4 pr-10 py-2 rounded-2xl text-xs font-black uppercase transition-all border-none ring-1 outline-none ${
                                person.status === "present"
                                  ? "bg-emerald-50 text-emerald-600 ring-emerald-200"
                                  : person.status === "absent"
                                    ? "bg-rose-50 text-rose-600 ring-rose-200"
                                    : person.status === "leave" ||
                                        person.status === "half-day"
                                      ? "bg-amber-50 text-amber-600 ring-amber-200"
                                      : "bg-gray-50 text-gray-500 ring-gray-200"
                              }`}
                              value={person.status || "not_marked"}
                              onChange={(e) =>
                                handleStatusChange(
                                  person.user_id,
                                  e.target.value
                                )
                              }
                              disabled={person.is_leave}
                            >
                              <option value="not_marked">Select Status</option>
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="half-day">Half Day</option>
                              <option value="leave" disabled={!person.is_leave}>
                                Leave
                              </option>
                              <option value="holiday">Holiday</option>
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 rotate-90" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${person.check_in_time ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-300"}`}
                            ></span>
                            <span className="text-xs font-black tabular-nums">
                              {person.check_in_time || "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${person.check_out_time ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-gray-300"}`}
                            ></span>
                            <span className="text-xs font-black tabular-nums">
                              {person.check_out_time || "Active"}
                            </span>
                          </div>
                        </div>
                      </td>
                      {BIOMETRIC_ENABLED && (
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            {person.biometric_device_id ? (
                              <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 pl-3 pr-1 py-1 rounded-2xl group/bio">
                                <span className="text-xs font-black font-mono text-gray-500 mr-2">
                                  {person.biometric_device_id}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedUserForBio(person);
                                    setBioIdInput(
                                      person.biometric_device_id || ""
                                    );
                                    setShowBioModal(true);
                                  }}
                                  className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-indigo-500 transition-all opacity-0 group-hover/bio:opacity-100"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUserForBio(person);
                                  setBioIdInput("");
                                  setShowBioModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-gray-300 hover:border-indigo-400 hover:text-indigo-500 text-[10px] font-black uppercase text-gray-400 transition-all"
                              >
                                <Fingerprint className="w-3.5 h-3.5" /> Setup
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 group/info">
                          <Info className="w-3.5 h-3.5 text-gray-300 group-hover/info:text-indigo-400 transition-colors" />
                          <span className="text-xs font-bold text-gray-500 truncate max-w-[200px]">
                            {person.remarks || "No additional logs"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Biometric Portal Modal */}
      {showBioModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md p-10 shadow-3xl relative animate-scale-in border border-white/10">
              <button
                onClick={() => setShowBioModal(false)}
                className="absolute top-8 right-8 p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shadow-inner">
                  <Fingerprint className="w-10 h-10 text-indigo-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    Hardware Linkage
                  </h3>
                  <p className="text-gray-500 font-bold px-4">
                    Define the device terminal ID for{" "}
                    <span className="text-indigo-600">
                      {selectedUserForBio?.name}
                    </span>
                    .
                  </p>
                </div>

                <div className="w-full space-y-6 pt-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Pencil className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Physical Device ID (e.g. 101)"
                      className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[1.5rem] py-4 pl-12 pr-4 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={bioIdInput}
                      onChange={(e) => setBioIdInput(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowBioModal(false)}
                      className="flex-1 px-6 py-4 rounded-[1.5rem] font-black text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!bioIdInput)
                          return toast.error("Hardware ID Required");
                        try {
                          await api.post("/biometric/map-user", {
                            user_id: selectedUserForBio.user_id,
                            biometric_device_id: bioIdInput,
                          });
                          toast.success("Identity Mapped Successfully");
                          setShowBioModal(false);
                          fetchAttendance();
                        } catch (err) {
                          toast.error("Cloud Mapping Failed");
                        }
                      }}
                      className="flex-[1.5] px-6 py-4 rounded-[1.5rem] font-black text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                    >
                      Assign Identity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, subtitle }) => {
  const colorMap = {
    indigo:
      "from-indigo-500/10 to-indigo-600/10 text-indigo-600 ring-indigo-500/20",
    emerald:
      "from-emerald-500/10 to-emerald-600/10 text-emerald-600 ring-emerald-500/20",
    rose: "from-rose-500/10 to-rose-600/10 text-rose-600 ring-rose-500/20",
    amber: "from-amber-500/10 to-amber-600/10 text-amber-600 ring-amber-500/20",
    blue: "from-blue-500/10 to-blue-600/10 text-blue-600 ring-blue-500/20",
  };

  return (
    <div
      className={`relative overflow-hidden group p-6 rounded-[2rem] bg-gradient-to-br ${colorMap[color]} ring-1 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-full h-full rotate-12" />
      </div>
      <div className="relative flex flex-col gap-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="space-y-0.5">
          <div className="text-3xl font-black tabular-nums">{value}</div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">
            {label}
          </div>
          <div className="text-[11px] font-bold opacity-40">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

export default StaffAttendance;
