import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchExamCycles,
  fetchRegistrations,
  updateRegistrationStatus,
  waiveExamFine,
} from "../../store/slices/examSlice";
import {
  Calendar,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const ExamHallTickets = () => {
  const dispatch = useDispatch();
  const { cycles, registrations, activeCycleConfig, status } = useSelector(
    (state) => state.exam,
  );

  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ program: "", status: "" });
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [activeReg, setActiveReg] = useState(null);
  const [overrideData, setOverrideData] = useState({
    status: "approved",
    is_condoned: false,
    override_status: false,
    override_remarks: "",
  });

  useEffect(() => {
    dispatch(fetchExamCycles());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCycleId) {
      dispatch(fetchRegistrations(selectedCycleId));
    }
  }, [dispatch, selectedCycleId]);

  const handleOverride = async () => {
    if (!overrideData.override_remarks) {
      toast.error("Please provide remarks for this action");
      return;
    }
    try {
      await dispatch(
        updateRegistrationStatus({
          id: activeReg.id,
          data: overrideData,
        }),
      ).unwrap();
      toast.success("Registration status updated successfully");
      setShowOverrideModal(false);
      setActiveReg(null);
    } catch (err) {
      toast.error(err || "Failed to update status");
    }
  };

  const handleWaiveFine = async (reg) => {
    if (
      window.confirm(
        "Are you sure you want to waive the late fee for this student?",
      )
    ) {
      try {
        await dispatch(waiveExamFine(reg.id)).unwrap();
        toast.success("Fine waived successfully");
        dispatch(fetchRegistrations(selectedCycleId));
      } catch (err) {
        toast.error(err || "Failed to waive fine");
      }
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      `${reg.student?.first_name} ${reg.student?.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reg.student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || reg.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
              Exam Hall Tickets
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Manage registrations, condonations and generate tickets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="bg-white dark:bg-gray-800 border-none rounded-2xl text-sm font-black px-6 py-3 shadow-sm focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">Select Exam Cycle</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
            Bulk Generate
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Table Filters */}
        <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-indigo-600 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!filters.status ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              onClick={() => setFilters({ ...filters, status: "" })}
            >
              All
            </button>
            {["submitted", "approved", "blocked"].map((s) => (
              <button
                key={s}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filters.status === s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                onClick={() => setFilters({ ...filters, status: s })}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Student
                </th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Type
                </th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Attendance
                </th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Fee Status
                </th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Eligibility
                </th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {status === "loading" ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="font-bold text-gray-400">
                      Loading registrations...
                    </p>
                  </td>
                </tr>
              ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white leading-none mb-1">
                            {reg.student?.first_name} {reg.student?.last_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {reg.student?.program?.name} • Sec{" "}
                            {reg.student?.section}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`text-[10px] px-2.5 py-1 font-black rounded-full uppercase tracking-wider ${
                          reg.status === "not_registered"
                            ? "bg-gray-100 text-gray-500"
                            : reg.registration_type === "regular"
                              ? "bg-blue-100 text-blue-700"
                              : reg.registration_type === "supply"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {reg.status === "not_registered"
                          ? "None"
                          : reg.registration_type}
                      </span>
                    </td>
                    <td
                      className={`px-8 py-6 ${activeCycleConfig && !activeCycleConfig.is_attendance_checked ? "opacity-30 grayscale" : ""}`}
                    >
                      <div className="flex flex-col">
                        <span
                          className={`font-black text-sm ${reg.attendance_status === "low" ? "text-red-500" : "text-green-500"}`}
                        >
                          {reg.attendance_percentage}%
                        </span>
                        {reg.is_condoned && (
                          <span className="text-[9px] text-green-600 font-black uppercase tracking-tighter">
                            Condoned
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className={`px-8 py-6 ${activeCycleConfig && !activeCycleConfig.is_fee_checked ? "opacity-30 grayscale" : ""}`}
                    >
                      <div className="flex flex-col">
                        <span
                          className={`text-[10px] px-2.5 py-1 font-black rounded-full uppercase tracking-wider inline-block text-center ${
                            reg.fee_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {reg.status === "not_registered"
                            ? "N/A"
                            : reg.fee_status}
                        </span>
                        {reg.late_fee > 0 && !reg.is_fine_waived && (
                          <button
                            onClick={() => handleWaiveFine(reg)}
                            className="text-[9px] text-red-600 font-black uppercase tracking-tighter hover:underline text-left mt-1"
                          >
                            Waive ₹{reg.late_fee} Fine
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {reg.status === "blocked" ||
                        (activeCycleConfig?.is_fee_checked &&
                          reg.fee_status !== "paid" &&
                          !reg.override_status) ||
                        (activeCycleConfig?.is_attendance_checked &&
                          reg.attendance_status === "low" &&
                          !reg.is_condoned &&
                          !reg.override_status) ? (
                          <div className="flex items-center text-red-500 gap-1.5">
                            <XCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Locked
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-500 gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Cleared
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => {
                          setActiveReg(reg);
                          setOverrideData({
                            status: reg.status,
                            is_condoned: reg.is_condoned,
                            override_status: reg.override_status,
                            override_remarks: reg.override_remarks || "",
                          });
                          setShowOverrideModal(true);
                        }}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <ShieldCheck
                          className={`w-5 h-5 ${reg.status === "not_registered" ? "opacity-30" : ""}`}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <Search className="w-12 h-12 text-gray-100 dark:text-gray-800 mx-auto mb-4" />
                    <p className="font-bold text-gray-400 italic">
                      No registrations found matching your filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">Manual Override</h3>
                <p className="text-sm font-medium text-indigo-300">
                  Update eligibility for {activeReg?.student?.first_name}{" "}
                  {activeReg?.student?.last_name}
                </p>
              </div>
              <ShieldCheck className="w-10 h-10 text-indigo-400 opacity-50" />
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setOverrideData({
                      ...overrideData,
                      is_condoned: !overrideData.is_condoned,
                    })
                  }
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${overrideData.is_condoned ? "bg-indigo-50 border-indigo-600 text-indigo-900 dark:bg-indigo-900/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400"}`}
                >
                  <ShieldCheck
                    className={`w-8 h-8 ${overrideData.is_condoned ? "text-indigo-600" : ""}`}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                    Condone Attendance
                  </span>
                </button>

                <button
                  onClick={() =>
                    setOverrideData({
                      ...overrideData,
                      override_status: !overrideData.override_status,
                    })
                  }
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${overrideData.override_status ? "bg-purple-50 border-purple-600 text-purple-900 dark:bg-purple-900/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400"}`}
                >
                  <ShieldAlert
                    className={`w-8 h-8 ${overrideData.override_status ? "text-purple-600" : ""}`}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                    Override Fee Block
                  </span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">
                    Registration Status
                  </label>
                  <div className="flex gap-2">
                    {["submitted", "approved", "blocked"].map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setOverrideData({ ...overrideData, status: s })
                        }
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${overrideData.status === s ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">
                    Remarks (Mandatory)
                  </label>
                  <textarea
                    value={overrideData.override_remarks}
                    onChange={(e) =>
                      setOverrideData({
                        ...overrideData,
                        override_remarks: e.target.value,
                      })
                    }
                    placeholder="Enter reason for this override..."
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowOverrideModal(false);
                    setActiveReg(null);
                  }}
                  className="flex-1 py-4 text-gray-500 font-black text-sm uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverride}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamHallTickets;
