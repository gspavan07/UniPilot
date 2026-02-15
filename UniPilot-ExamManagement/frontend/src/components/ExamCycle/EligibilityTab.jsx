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
  ChevronDown,
  Download,
  AlertCircle
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
  // const [statusFilter, setStatusFilter] = useState("all"); // Unused in original, keeping state just in case or removing if unused in logic

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
      // Preserving original API call
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

      return matchesSearch && matchesProgram && matchesSection;
    });

    // Sort by Student ID (alphanumeric)
    return filtered.sort((a, b) => (a.student_id || "").localeCompare(b.student_id || ""));
  }, [students, searchTerm, selectedProgram, selectedSection]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-gray-500 font-medium">Loading eligibility data...</div>
      </div>
    );

  // SYSTEM OFF VIEW
  if (!cycle.publish_eligibility && !showConfig) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full text-center overflow-hidden">
          <div className="bg-gray-50/50 p-10 border-b border-gray-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Eligibility System
            </h2>
            <p className="text-gray-500 leading-relaxed">
              The eligibility rules for <strong className="text-gray-900">{cycle.cycle_name || "this cycle"}</strong> have not been configured yet.
            </p>
          </div>

          <div className="p-8">
            <button
              onClick={() => setShowConfig(true)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Settings size={20} />
              <span>Configure & Publish Rules</span>
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
              <Info size={14} />
              <span>Setup attendance thresholds and fee requirements</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn font-sans text-gray-900 pb-12">
      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-scaleIn">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Eligibility Configuration
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Define the rules for student exam eligibility.
                </p>
              </div>
              <div onClick={() => setShowConfig(false)} className="p-2 cursor-pointer hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                <ChevronDown size={20} />
              </div>
            </div>

            <form onSubmit={handleUpdateConfig} className="p-6 space-y-6">
              {/* Attendance Section */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${configData.check_attendance ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 group-hover:border-blue-400"}`}>
                    {configData.check_attendance && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={configData.check_attendance}
                    onChange={(e) => setConfigData({ ...configData, check_attendance: e.target.checked })}
                  />
                  <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Enforce Attendance Rules
                  </span>
                </label>

                {configData.check_attendance && (
                  <div className="grid grid-cols-2 gap-4 pl-8 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Eligible Threshold (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        value={configData.attendance_threshold_eligible}
                        onChange={(e) => setConfigData({ ...configData, attendance_threshold_eligible: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Condonation Min (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        value={configData.attendance_threshold_condonation}
                        onChange={(e) => setConfigData({ ...configData, attendance_threshold_condonation: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Condonation Fee (₹)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        value={configData.condonation_fee_amount}
                        onChange={(e) => setConfigData({ ...configData, condonation_fee_amount: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* Fee Section */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${configData.check_fee_clearance ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 group-hover:border-blue-400"}`}>
                    {configData.check_fee_clearance && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={configData.check_fee_clearance}
                    onChange={(e) => setConfigData({ ...configData, check_fee_clearance: e.target.checked })}
                  />
                  <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Check Fee Clearance
                  </span>
                </label>
                <p className="pl-8 text-xs text-gray-400 leading-relaxed">
                  If enabled, student's total fee due balance must be zero.
                </p>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {updating ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-colors">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-hover:text-blue-500 transition-colors">Eligible Cutoff</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{cycle.attendance_threshold_eligible}</span>
            <span className="text-sm font-bold text-gray-400 mb-1">%</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-amber-200 transition-colors">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-hover:text-amber-500 transition-colors">Condonation Min</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{cycle.attendance_threshold_condonation}</span>
            <span className="text-sm font-bold text-gray-400 mb-1">%</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-green-200 transition-colors">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-hover:text-green-500 transition-colors">Fee Check</span>
          <div className="flex items-center gap-2 h-full">
            <div className={`w-3 h-3 rounded-full ${cycle.check_fee_clearance ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-xl font-bold text-gray-900">{cycle.check_fee_clearance ? "Active" : "Disabled"}</span>
          </div>
        </div>
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-900 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gray-800 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 ${cycle.publish_eligibility ? "bg-green-500 text-white" : "bg-amber-500 text-white"}`}>
            {cycle.publish_eligibility ? "Published" : "Draft"}
          </span>
          <p className="text-xs text-gray-400 font-medium z-10">System Status</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full lg:w-auto flex-1">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-32 md:w-40 hidden sm:block">
            <select
              className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-semibold text-gray-800 appearance-none focus:bg-white focus:border-blue-500 cursor-pointer"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">Programs</option>
              {programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          <div className="relative w-28 md:w-32 hidden sm:block">
            <select
              className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-semibold text-gray-800 appearance-none focus:bg-white focus:border-blue-500 cursor-pointer"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="">Sections</option>
              {sections.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50"
            onClick={handleSyncAll}
            disabled={updating}
          >
            <RefreshCw size={16} className={updating ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Recalculate</span>
          </button>
          <button
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
            onClick={() => setShowConfig(true)}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Student Info</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Compliance</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const el = student.student_eligibilities?.[0] || {};
                  const statuses = getDisplayStatus(el);
                  const isFeeDue = el.fee_balance > 0;

                  return (
                    <tr key={student.id} className="group hover:bg-blue-50/20 transition-colors">
                      <td className="py-4 px-6 align-top">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs uppercase border border-gray-200">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5 font-mono">
                              {student.student_id}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                {student.program?.code || "N/A"}
                              </span>
                              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                Sec {student.section || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 align-top">
                        <div className="space-y-3">
                          {/* Attendance Display */}
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Attd:</span>
                            <span className={`text-sm font-bold ${parseFloat(el.attendance_percentage) < parseFloat(cycle.attendance_threshold_condonation) ? "text-red-500" :
                                parseFloat(el.attendance_percentage) < parseFloat(cycle.attendance_threshold_eligible) ? "text-amber-500" :
                                  "text-green-600"
                              }`}>
                              {el.attendance_percentage ? `${el.attendance_percentage}%` : "0.00%"}
                            </span>
                          </div>
                          {/* Fee Display */}
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fee:</span>
                            <span className={`text-sm font-bold ${el.fee_clear_permission ? 'text-green-600' : 'text-red-500'}`}>
                              {el.fee_clear_permission ? "Cleared" : `Due ₹${(el.fee_balance || 0).toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {statuses.map((status, idx) => {
                            const styles = {
                              eligible: "bg-green-100 text-green-800 border-green-200",
                              "hod-block": "bg-red-50 text-red-700 border-red-100",
                              "fee-block": "bg-orange-50 text-orange-700 border-orange-100",
                              condonation: "bg-amber-100 text-amber-800 border-amber-200",
                              bypassed: "bg-blue-100 text-blue-800 border-blue-200",
                              pending: "bg-gray-100 text-gray-500 border-gray-200"
                            };
                            return (
                              <span
                                key={idx}
                                className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${styles[status.type] || styles.pending}`}
                              >
                                {status.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-6 align-top text-right">
                        <div className="flex flex-col items-end gap-2">
                          {!el.hod_permission ? (
                            <button
                              onClick={() => handlePermission(student.id, "hod", true)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100 w-fit"
                              disabled={updating === student.id}
                            >
                              Allow HOD
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePermission(student.id, "hod", false)}
                              className="text-[10px] font-bold text-gray-400 hover:text-red-600 hover:underline transition-colors decoration-2 underline-offset-2"
                              disabled={updating === student.id}
                            >
                              Revoke HOD
                            </button>
                          )}

                          {!el.fee_clear_permission ? (
                            <button
                              onClick={() => handlePermission(student.id, "fee", true)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100 w-fit"
                              disabled={updating === student.id}
                            >
                              Waive Fee
                            </button>
                          ) : el.fee_balance > 0 && (
                            <button
                              onClick={() => handlePermission(student.id, "fee", false)}
                              className="text-[10px] font-bold text-gray-400 hover:text-red-600 hover:underline transition-colors decoration-2 underline-offset-2"
                              disabled={updating === student.id}
                            >
                              Revoke Waiver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Search size={24} />
                      </div>
                      <p className="font-medium text-sm">No students match your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
