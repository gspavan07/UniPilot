import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Info,
  Settings,
  RefreshCw,
  Filter,
} from "lucide-react";

export default function EligibilityTab({
  cycleId,
  cycle: initialCycle,
  onUpdate,
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(false);
  const [cycle, setCycle] = useState(initialCycle || {});

  // Filters State
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Rule Config Modal State
  const [showConfig, setShowConfig] = useState(false);
  const [configData, setConfigData] = useState({
    check_attendance: cycle.check_attendance || false,
    check_fee_clearance: cycle.check_fee_clearance || false,
    attendance_threshold_eligible: cycle.attendance_threshold_eligible || 75,
    attendance_threshold_condonation:
      cycle.attendance_threshold_condonation || 65,
    condonation_fee_amount: cycle.condonation_fee_amount || 0,
  });

  useEffect(() => {
    if (initialCycle) {
      setCycle(initialCycle);
      setConfigData({
        check_attendance: initialCycle.check_attendance,
        check_fee_clearance: initialCycle.check_fee_clearance,
        attendance_threshold_eligible:
          initialCycle.attendance_threshold_eligible,
        attendance_threshold_condonation:
          initialCycle.attendance_threshold_condonation,
        condonation_fee_amount: initialCycle.condonation_fee_amount,
        publish_eligibility: initialCycle.publish_eligibility,
      });
    }
  }, [initialCycle]);

  useEffect(() => {
    fetchStudents();
  }, [cycleId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/exam/cycles/${cycleId}/eligibilities`);
      setStudents(response.data.data);
    } catch (err) {
      console.error("Failed to fetch eligibilities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      // Automatically publish when rules are saved
      const payload = { ...configData, publish_eligibility: true };
      const response = await api.put(`/exam/cycles/${cycleId}`, payload);
      setCycle(response.data.data);
      setShowConfig(false);

      // Trigger full recalculate
      await handleSyncAll();

      // Notify parent to refresh
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error("Failed to update configuration:", err);
      alert("Failed to update configuration");
    } finally {
      setUpdating(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setUpdating(true);
      const response = await api.post(
        `/exam/cycles/${cycleId}/recalculate-all`,
      );
      alert(response.data.message);
      await fetchStudents();
    } catch (err) {
      console.error("Sync failed:", err);
      alert("Eligibility sync failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleBypass = async (studentId, isBypassed) => {
    try {
      setUpdating(studentId);
      await api.post("/exam/cycles/eligibility/bypass", {
        student_id: studentId,
        cycle_id: cycleId,
        bypass: isBypassed,
      });

      await fetchStudents();
    } catch (err) {
      alert("Failed to update bypass status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePermission = async (studentId, type, value) => {
    try {
      setUpdating(studentId);
      const payload = {
        student_id: studentId,
        cycle_id: cycleId,
      };
      if (type === "hod") payload.hod_permission = value;
      if (type === "fee") payload.fee_clear_permission = value; // Updated name

      await api.post("/exam/cycles/eligibility/bypass", payload);
      await fetchStudents();
    } catch (err) {
      alert("Failed to update permission");
    } finally {
      setUpdating(false);
    }
  };

  // Derive unique filter options
  const programs = useMemo(() => {
    const progs = new Set(
      students.map((s) => s.program?.code || s.program_id || "Unknown"),
    );
    return Array.from(progs).filter(Boolean).sort();
  }, [students]);

  const sections = useMemo(() => {
    const secs = new Set(students.map((s) => s.section || "N/A"));
    return Array.from(secs).filter(Boolean).sort();
  }, [students]);

  // Determine Display Status - returns ALL applicable blocks
  const getDisplayStatus = (el) => {
    const statuses = [];

    if (!el) return [{ label: "Pending", type: "pending" }];

    // Check all conditions and add all that apply
    if (el.bypassed_by) {
      statuses.push({ label: "Bypassed", type: "bypassed" });
    }
    if (!el.hod_permission) {
      statuses.push({ label: "HOD Block", type: "hod-block" });
    }
    if (!el.fee_clear_permission) {
      statuses.push({ label: "Fee Block", type: "fee-block" });
    }
    if (el.has_condonation) {
      statuses.push({ label: "Condonation", type: "condonation" });
    }

    // If no blocks, show eligible
    if (statuses.length === 0) {
      statuses.push({ label: "Eligible", type: "eligible" });
    }

    return statuses;
  };

  const filteredStudents = useMemo(() => {
    let filtered = students.filter((s) => {
      const matchesSearch =
        (s.student_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${s.first_name || ""} ${s.last_name || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesProgram =
        !selectedProgram ||
        (s.program?.code || s.program_id) === selectedProgram;
      const matchesSection = !selectedSection || s.section === selectedSection;

      // Status Filter logic could be added here if needed

      return matchesSearch && matchesProgram && matchesSection;
    });

    // Sort by Student ID (alphanumeric)
    return filtered.sort((a, b) => (a.student_id || "").localeCompare(b.student_id || ""));
  }, [students, searchTerm, selectedProgram, selectedSection]);

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500">
        Loading eligibility status...
      </div>
    );

  // SYSTEM OFF VIEW
  if (!cycle.publish_eligibility && !showConfig) {
    return (
      <div className="flex items-center justify-center py-20 px-5 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200">
        <div className="bg-white p-10 rounded-[24px] shadow-xl w-full max-w-[500px] text-center border border-slate-100">
          <div className="w-[70px] h-[70px] bg-rose-50 text-rose-600 rounded-[20px] flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-[24px] text-slate-900 mb-3 font-extrabold">
              Eligibility Control Center
            </h2>
            <p className="text-slate-500 leading-relaxed text-[15px] mb-8">
              The eligibility system for{" "}
              <strong className="text-slate-700 font-bold">
                {cycle.cycle_name || "this cycle"}
              </strong>{" "}
              is currently in draft mode. Rules are not enforced and student
              data is hidden.
            </p>

            <div className="mb-6">
              <div
                className="bg-slate-50 border-[1.5px] border-slate-200 p-5 rounded-[16px] flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-white hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5 group"
                onClick={() => setShowConfig(true)}
              >
                <div className="text-left">
                  <span className="block text-[15px] font-bold text-slate-800 mb-0.5">
                    Enable & Publish System
                  </span>
                  <p className="text-[12px] text-slate-400 m-0">
                    Set thresholds and sync student records
                  </p>
                </div>
                <div>
                  <div className="relative inline-block w-11 h-[22px]">
                    <span className="absolute inset-0 bg-slate-200 rounded-full after:content-[''] after:absolute after:h-4 after:w-4 after:left-[3px] after:bottom-[3px] after:bg-white after:rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-[12px] font-medium">
              <Info size={14} />
              <span>Requires 75%/65% attendance thresholds and fee rules.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Configure Eligibility Rules
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Saving these rules will automatically trigger a recalculation.
            </p>
            <form onSubmit={handleUpdateConfig}>
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    checked={configData.check_attendance}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        check_attendance: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Check Attendance
                  </span>
                </label>
              </div>

              {configData.check_attendance && (
                <div className="grid grid-cols-1 gap-4 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Eligible Threshold (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={configData.attendance_threshold_eligible}
                      onChange={(e) =>
                        setConfigData({
                          ...configData,
                          attendance_threshold_eligible: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Condonation Min (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={configData.attendance_threshold_condonation}
                      onChange={(e) =>
                        setConfigData({
                          ...configData,
                          attendance_threshold_condonation: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Condonation Fee (₹)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={configData.condonation_fee_amount}
                      onChange={(e) =>
                        setConfigData({
                          ...configData,
                          condonation_fee_amount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    checked={configData.check_fee_clearance}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        check_fee_clearance: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Check Fee Clearance (Cumulative)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {updating ? "Processing..." : "Save & Sync Students"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="bg-slate-50 py-3 px-5 rounded-xl border border-slate-200 min-w-[140px]">
              <span className="block text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                Eligible Threshold
              </span>
              <span className="text-xl font-bold text-slate-800">
                {cycle.attendance_threshold_eligible}%
              </span>
            </div>
            <div className="bg-slate-50 py-3 px-5 rounded-xl border border-slate-200 min-w-[140px]">
              <span className="block text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                Condonation Min
              </span>
              <span className="text-xl font-bold text-slate-800">
                {cycle.attendance_threshold_condonation}%
              </span>
            </div>
            <div className="bg-slate-50 py-3 px-5 rounded-xl border border-slate-200 min-w-[140px]">
              <span className="block text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                Check Fees
              </span>
              <span className="text-xl font-bold text-slate-800">
                {cycle.check_fee_clearance ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 mr-3 pr-4 border-r-[1.5px] border-slate-200">
              <span
                className={`text-[11px] font-extrabold uppercase tracking-widest ${cycle.publish_eligibility ? "text-emerald-500" : "text-slate-400"
                  }`}
              >
                {cycle.publish_eligibility ? "Published" : "Draft"}
              </span>
              <label className="relative inline-block w-11 h-[22px]">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0 peer"
                  checked={cycle.publish_eligibility}
                  onChange={() => setShowConfig(true)}
                />
                <span className="absolute inset-0 cursor-pointer bg-slate-300 transition-all duration-400 rounded-full after:content-[''] after:absolute after:h-4 after:w-4 after:left-[3px] after:bottom-[3px] after:bg-white after:transition-all after:duration-400 after:rounded-full peer-checked:bg-emerald-500 peer-checked:after:translate-x-[22px]"></span>
              </label>
            </div>
            <button
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              onClick={handleSyncAll}
              disabled={updating}
            >
              <RefreshCw
                size={18}
                className={updating ? "animate-spin" : ""}
              />{" "}
              Refresh All
            </button>
            <button
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 shadow-lg shadow-slate-200 transition-all active:scale-95"
              onClick={() => setShowConfig(true)}
            >
              <Settings size={18} /> Edit Rules
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-wrap pt-6 border-t border-slate-100">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-white border-[1.5px] border-slate-200 rounded-[12px] outline-none text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
              placeholder="Search by Roll No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative min-w-[180px]">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              className="w-full py-2 pl-9 pr-10 bg-white border-[1.5px] border-slate-200 rounded-[12px] outline-none text-sm text-slate-800 appearance-none cursor-pointer focus:border-blue-500 transition-all"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3f%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "16px",
              }}
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">All Programs</option>
              {programs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[180px]">
            <select
              className="w-full py-2 pl-4 pr-10 bg-white border-[1.5px] border-slate-200 rounded-[12px] outline-none text-sm text-slate-800 appearance-none cursor-pointer focus:border-blue-500 transition-all"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3f%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "16px",
              }}
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <table className="w-full border-separate border-spacing-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <thead>
            <tr>
              <th className="bg-slate-50 px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                Student Details
              </th>
              <th className="bg-slate-50 px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                Attendance %
              </th>
              <th className="bg-slate-50 px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                Fee Status
              </th>
              <th className="bg-slate-50 px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                Status
              </th>
              <th className="bg-slate-50 px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const el = student.student_eligibilities?.[0] || {};
                const statuses = getDisplayStatus(el);

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 align-middle">
                      <div>
                        <span className="block font-bold text-slate-800 text-[15px]">
                          {student.first_name} {student.last_name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 font-medium">
                            {student.student_id}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600 uppercase">
                            {student.program?.code || student.program_id} -{" "}
                            {student.section}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-bold ${parseFloat(el.attendance_percentage) <
                            parseFloat(cycle.attendance_threshold_condonation)
                            ? "text-red-500"
                            : parseFloat(el.attendance_percentage) <
                              parseFloat(
                                cycle.attendance_threshold_eligible,
                              )
                              ? "text-amber-500"
                              : "text-emerald-500"
                            }`}
                        >
                          {el.attendance_percentage
                            ? `${el.attendance_percentage}%`
                            : "0.00%"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${el.fee_clear_permission
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-orange-50 text-orange-700 border-orange-100"
                          }`}
                      >
                        {el.fee_clear_permission
                          ? "Cleared"
                          : `Due: ₹${(el.fee_balance || 0).toLocaleString()}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex flex-col gap-1 items-start">
                        {statuses.map((status, idx) => {
                          const statusClasses = {
                            eligible: "bg-green-100 text-green-800 border-green-200",
                            "hod-block": "bg-red-100 text-red-800 border-red-200",
                            "fee-block":
                              "bg-orange-100 text-orange-700 border-orange-200",
                            condonation:
                              "bg-yellow-100 text-yellow-800 border-yellow-300",
                            bypassed: "bg-blue-100 text-blue-700 border-blue-200",
                            pending: "bg-slate-100 text-slate-700 border-slate-200",
                          };
                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusClasses[status.type] ||
                                "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                            >
                              {status.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        {!el.hod_permission && (
                          <button
                            onClick={() =>
                              handlePermission(student.id, "hod", true)
                            }
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-bold hover:bg-rose-100 transition-colors active:scale-95 disabled:opacity-50"
                            disabled={updating === student.id}
                          >
                            Clear HOD
                          </button>
                        )}

                        {!el.fee_clear_permission && (
                          <button
                            onClick={() =>
                              handlePermission(student.id, "fee", true)
                            }
                            className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-[11px] font-bold hover:bg-orange-100 transition-colors active:scale-95 disabled:opacity-50"
                            disabled={updating === student.id}
                          >
                            Clear Fee
                          </button>
                        )}

                        {(el.hod_permission ||
                          (el.fee_clear_permission && el.fee_balance > 0)) && (
                            <div className="flex flex-col gap-0.5">
                              {el.hod_permission && (
                                <button
                                  onClick={() =>
                                    handlePermission(student.id, "hod", false)
                                  }
                                  className="text-[10px] text-slate-400 underline hover:text-blue-600 transition-colors text-left"
                                  title="Revert HOD"
                                >
                                  Revert HOD
                                </button>
                              )}
                              {el.fee_clear_permission && el.fee_balance > 0 && (
                                <button
                                  onClick={() =>
                                    handlePermission(student.id, "fee", false)
                                  }
                                  className="text-[10px] text-slate-400 underline hover:text-blue-600 transition-colors text-left"
                                  title="Revert Fee"
                                >
                                  Revert Fee
                                </button>
                              )}
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-slate-500 italic text-sm"
                >
                  No students found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
