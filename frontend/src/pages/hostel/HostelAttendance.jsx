import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ClipboardCheck,
  Calendar,
  Building,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Loader2,
  Save,
  Moon,
  Sun,
} from "lucide-react";
import {
  fetchBuildings,
  fetchAllocations,
  markAttendance,
  fetchAttendance,
  resetOperationStatus,
} from "../../store/slices/hostelSlice";
import toast from "react-hot-toast";

const HostelAttendance = () => {
  const dispatch = useDispatch();
  const {
    buildings,
    allocations,
    attendance,
    status,
    operationStatus,
    operationError,
  } = useSelector((state) => state.hostel);

  const [filter, setFilter] = useState({
    building_id: "",
    date: new Date().toISOString().split("T")[0],
    is_night_roll_call: true,
  });

  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    dispatch(fetchBuildings());
    if (filter.building_id) {
      dispatch(
        fetchAllocations({ building_id: filter.building_id, status: "active" }),
      );
      dispatch(fetchAttendance(filter));
    }
  }, [dispatch, filter.building_id, filter.date, filter.is_night_roll_call]);

  useEffect(() => {
    // Sync UI state with existing attendance records
    if (attendance && attendance.length > 0) {
      const map = {};
      attendance.forEach((record) => {
        map[record.student_id] = record.is_present
          ? "present"
          : record.remarks === "On Leave"
            ? "leave"
            : "absent";
      });
      setAttendanceData(map);
    } else {
      setAttendanceData({});
    }
  }, [attendance]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success("Attendance records updated!");
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Failed to save attendance");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch, operationError]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    if (!filter.building_id) {
      toast.error("Please select a building first");
      return;
    }

    const marks = Object.entries(attendanceData).map(
      ([student_id, status]) => ({
        student_id,
        status,
        date: filter.date,
        is_night_roll_call: filter.is_night_roll_call,
        building_id: filter.building_id,
      }),
    );

    if (marks.length === 0) {
      toast.error("No attendance marks to save");
      return;
    }

    dispatch(markAttendance({ attendance_records: marks }));
  };

  const handleMarkAll = (status) => {
    const map = {};
    allocations.forEach((a) => {
      map[a.student_id] = status;
    });
    setAttendanceData(map);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-primary-50 dark:bg-primary-900/40 rounded-3xl">
              <ClipboardCheck className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                Roll Call Register
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium font-display uppercase tracking-widest text-[10px] mt-1">
                Daily Presence & Night Audit
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={operationStatus === "loading" || !filter.building_id}
            className="flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary-600/30 active:scale-95 disabled:opacity-50"
          >
            {operationStatus === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
            ) : (
              <Save className="w-5 h-5 mr-3" />
            )}
            Commit Records
          </button>
        </div>

        {/* Selection Bar */}
        <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-2xl flex items-center col-span-1">
            <button
              onClick={() =>
                setFilter({ ...filter, is_night_roll_call: false })
              }
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filter.is_night_roll_call ? "bg-white shadow-sm text-primary-600" : "text-gray-400 font-bold"}`}
            >
              <Sun className="w-3.5 h-3.5 mr-2" /> Day Call
            </button>
            <button
              onClick={() => setFilter({ ...filter, is_night_roll_call: true })}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter.is_night_roll_call ? "bg-gray-900 text-white shadow-md" : "text-gray-400 font-bold"}`}
            >
              <Moon className="w-3.5 h-3.5 mr-2" /> Night Audit
            </button>
          </div>

          <select
            className="bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl py-3 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
            value={filter.building_id}
            onChange={(e) =>
              setFilter({ ...filter, building_id: e.target.value })
            }
          >
            <option value="">Select Building</option>
            {buildings?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              className="w-full pl-11 pr-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
              value={filter.date}
              onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleMarkAll("present")}
              className="flex-1 text-[10px] font-black uppercase tracking-widest bg-success-50 text-success-700 rounded-xl hover:bg-success-100 transition-all"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll("absent")}
              className="flex-1 text-[10px] font-black uppercase tracking-widest bg-error-50 text-error-700 rounded-xl hover:bg-error-100 transition-all"
            >
              All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Register Listing */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-h-[500px]">
        {!filter.building_id ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="p-8 bg-gray-50 dark:bg-gray-700/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-600 mb-6 group hover:scale-110 transition-transform duration-500">
              <Building className="w-16 h-16 text-gray-300 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-display">
              Select Structure
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm italic font-medium">
              Please select a hostel building to load the student registry for
              this date.
            </p>
          </div>
        ) : status === "loading" ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              Accessing building data...
            </p>
          </div>
        ) : allocations?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                  <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Student
                  </th>
                  <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Room / Bed
                  </th>
                  <th className="px-10 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Deployment Selection
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {allocations.map((a) => (
                  <tr
                    key={a.id}
                    className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4 text-xs font-black text-gray-500">
                          {a.student?.first_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            {a.student?.first_name} {a.student?.last_name}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {a.student?.student_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-black text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                        Room {a.room?.room_number} • Bed{" "}
                        {a.bed?.bed_number.split("-B")[1]}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-center space-x-1 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl w-fit mx-auto border border-gray-100 dark:border-gray-700 shadow-inner">
                        {[
                          {
                            val: "present",
                            label: "Present",
                            color: "bg-success-500",
                            icon: CheckCircle2,
                          },
                          {
                            val: "absent",
                            label: "Absent",
                            color: "bg-error-500",
                            icon: XCircle,
                          },
                          {
                            val: "leave",
                            label: "On Leave",
                            color: "bg-warning-500",
                            icon: AlertCircle,
                          },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() =>
                              handleStatusChange(a.student_id, opt.val)
                            }
                            className={`flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              attendanceData[a.student_id] === opt.val
                                ? `${opt.color} text-white shadow-lg scale-105 z-10`
                                : "text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-700"
                            }`}
                          >
                            <opt.icon
                              className={`w-3.5 h-3.5 mr-1.5 ${attendanceData[a.student_id] === opt.val ? "text-white" : ""}`}
                            />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No Assigned Students
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm italic">
              This building currently has no students allocated to any rooms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelAttendance;
