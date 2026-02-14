import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Users,
  Save,
  AlertCircle,
  Briefcase,
  Fingerprint,
  Pencil,
  X,
  Search,
  ArrowRight,
  ArrowLeft,
  Info,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";

const BIOMETRIC_ENABLED = import.meta.env.VITE_ENABLE_BIOMETRIC === "true";

const StaffAttendance = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Staff Attendance
              </h1>
            </div>
            <p className="text-sm text-gray-500 pl-9">
              Manage daily attendance records and biometric data.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white text-gray-900 cursor-pointer hover:border-blue-300 transition-colors"
              />
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Total Staff"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Present"
            value={stats.present}
            icon={CheckCircle}
            color="emerald"
            percent={stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}
          />
          <StatCard
            label="Absent"
            value={stats.absent}
            icon={AlertCircle}
            color="rose"
          />
          <StatCard
            label="On Leave"
            value={stats.leave}
            icon={Briefcase}
            color="amber"
          />
          <StatCard
            label="Half Day"
            value={stats.halfDay}
            icon={Clock}
            color="indigo"
          />
        </div>

        {/* Filters & Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 md:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>

              <div className="relative min-w-[160px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 focus:bg-white appearance-none transition-colors cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <button
              onClick={markAllPresent}
              className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <CheckCircle className="-ml-1 mr-2 h-4 w-4 text-blue-600" />
              Mark All Present
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-500 font-medium">Loading records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Check In/Out
                    </th>
                    {BIOMETRIC_ENABLED && (
                      <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Biometric
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={BIOMETRIC_ENABLED ? 6 : 5} className="px-6 py-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No staff found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((person) => (
                      <tr key={person.user_id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {person.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{person.name}</div>
                              <div className="text-sm text-gray-500">{person.employee_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{person.department}</div>
                          <div className="text-xs text-gray-500">{person.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="relative inline-block w-40">
                            <select
                              value={person.status || "not_marked"}
                              onChange={(e) => handleStatusChange(person.user_id, e.target.value)}
                              disabled={person.is_leave}
                              className={`appearance-none block w-full pl-3 pr-8 py-1.5 text-xs font-medium rounded-md border-0 focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 cursor-pointer shadow-sm transition-all
                                ${person.status === "present"
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                  : person.status === "absent"
                                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                    : person.status === "leave"
                                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                      : person.status === "half-day"
                                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                                        : "bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100"
                                }`}
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
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                              <ChevronDown className="h-3 w-3" />
                            </div>
                          </div>
                          {person.is_leave && (
                            <span className="block mt-1 text-[10px] text-amber-600 font-medium">On Approved Leave</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-center space-y-1">
                            <div className="flex items-center text-xs">
                              <span className={`w-2 h-2 rounded-full mr-2 ${person.check_in_time ? "bg-emerald-500" : "bg-gray-300"}`} />
                              <span className="text-gray-600 font-medium">{person.check_in_time || "--:--"}</span>
                            </div>
                            <div className="flex items-center text-xs">
                              <span className={`w-2 h-2 rounded-full mr-2 ${person.check_out_time ? "bg-blue-500" : "bg-gray-300"}`} />
                              <span className="text-gray-600 font-medium">{person.check_out_time || "--:--"}</span>
                            </div>
                          </div>
                        </td>
                        {BIOMETRIC_ENABLED && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {person.biometric_device_id ? (
                              <button
                                onClick={() => {
                                  setSelectedUserForBio(person);
                                  setBioIdInput(person.biometric_device_id || "");
                                  setShowBioModal(true);
                                }}
                                className="group inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                {person.biometric_device_id}
                                <Pencil className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUserForBio(person);
                                  setBioIdInput("");
                                  setShowBioModal(true);
                                }}
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <Fingerprint className="w-3.5 h-3.5 mr-1" />
                                Link ID
                              </button>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center max-w-[200px]" title={person.remarks}>
                            <Info className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                            <span className="truncate">{person.remarks || "-"}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Biometric Modal */}
      {showBioModal &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
                aria-hidden="true"
                onClick={() => setShowBioModal(false)}
              ></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    onClick={() => setShowBioModal(false)}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Fingerprint className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Biometric Hardware ID
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Enter the hardware terminal ID for <span className="font-semibold text-gray-900">{selectedUserForBio?.name}</span>.
                        </p>
                        <div className="mt-4">
                          <label htmlFor="bio-id" className="sr-only">Hardware ID</label>
                          <input
                            type="text"
                            id="bio-id"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-3"
                            placeholder="e.g. TERMINAL-01"
                            value={bioIdInput}
                            onChange={(e) => setBioIdInput(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={async () => {
                      if (!bioIdInput) return toast.error("Hardware ID Required");
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
                  >
                    Save Mapping
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowBioModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, percent }) => {
  const colorStyles = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    rose: "text-rose-600 bg-rose-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorStyles[color] || "bg-gray-100 text-gray-600"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {percent !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <span className="text-emerald-600 font-medium flex items-center">
            {percent}%
          </span>
          <span className="text-gray-400 ml-2">attendance rate</span>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;
