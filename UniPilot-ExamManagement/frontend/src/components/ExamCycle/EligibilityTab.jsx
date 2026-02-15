import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import "./EligibilityTab.css";
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
        s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${s.first_name} ${s.last_name}`
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
    return filtered.sort((a, b) => a.student_id.localeCompare(b.student_id));
  }, [students, searchTerm, selectedProgram, selectedSection]);

  if (loading)
    return <div className="loading-state">Loading eligibility status...</div>;

  // SYSTEM OFF VIEW
  if (!cycle.publish_eligibility && !showConfig) {
    return (
      <div className="system-off-view">
        <div className="welcome-card">
          <div className="icon-badge">
            <ShieldAlert size={32} />
          </div>
          <div className="card-content">
            <h2>Eligibility Control Center</h2>
            <p>
              The eligibility system for{" "}
              <strong>{cycle.cycle_name || "this cycle"}</strong> is currently
              in draft mode. Rules are not enforced and student data is hidden.
            </p>

            <div className="setup-actions">
              <div className="setup-link" onClick={() => setShowConfig(true)}>
                <div className="text">
                  <span>Enable & Publish System</span>
                  <p>Set thresholds and sync student records</p>
                </div>
                <div className="toggle-placeholder">
                  <div className="switch-static">
                    <span className="slider-static round"></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-bar">
              <Info size={14} />
              <span>Requires 75%/65% attendance thresholds and fee rules.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="eligibility-tab">
      {/* Config Modal */}
      {showConfig && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Configure Eligibility Rules</h3>
            <p className="modal-hint">
              Saving these rules will automatically trigger a recalculation.
            </p>
            <form onSubmit={handleUpdateConfig}>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={configData.check_attendance}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        check_attendance: e.target.checked,
                      })
                    }
                  />
                  Check Attendance
                </label>
              </div>

              {configData.check_attendance && (
                <div className="thresholds">
                  <div className="form-group">
                    <label>Eligible Threshold (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={configData.attendance_threshold_eligible}
                      onChange={(e) =>
                        setConfigData({
                          ...configData,
                          attendance_threshold_eligible: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Condonation Min (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={configData.attendance_threshold_condonation}
                      onChange={(e) =>
                        setConfigData({
                          ...configData,
                          attendance_threshold_condonation: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Condonation Fee (₹)</label>
                    <input
                      type="number"
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

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={configData.check_fee_clearance}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        check_fee_clearance: e.target.checked,
                      })
                    }
                  />
                  Check Fee Clearance (Cumulative)
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary"
                >
                  {updating ? "Processing..." : "Save & Sync Students"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tab-header">
        <div className="header-top">
          <div className="stats-row">
            <div className="stat-card">
              <span className="label">Eligible Threshold</span>
              <span className="value">
                {cycle.attendance_threshold_eligible}%
              </span>
            </div>
            <div className="stat-card">
              <span className="label">Condonation Min</span>
              <span className="value">
                {cycle.attendance_threshold_condonation}%
              </span>
            </div>
            <div className="stat-card">
              <span className="label">Check Fees</span>
              <span className="value">
                {cycle.check_fee_clearance ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <div className="publish-toggle">
              <span
                className={`label ${cycle.publish_eligibility ? "active" : ""}`}
              >
                {cycle.publish_eligibility ? "Published" : "Draft"}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={cycle.publish_eligibility}
                  onChange={() => setShowConfig(true)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <button
              className="btn-sync"
              onClick={handleSyncAll}
              disabled={updating}
            >
              <RefreshCw size={18} className={updating ? "spin" : ""} /> Refresh
              All
            </button>
            <button className="btn-config" onClick={() => setShowConfig(true)}>
              <Settings size={18} /> Edit Rules
            </button>
          </div>
        </div>

        <div className="filters-row">
          <div className="search-box">
            <Search className="icon" size={20} />
            <input
              type="text"
              placeholder="Search by Roll No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="select-filter">
            <Filter size={16} className="filter-icon" />
            <select
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

          <div className="select-filter">
            <select
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

      <div className="students-list">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Attendance %</th>
              <th>Fee Status</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const el = student.student_eligibilities?.[0] || {};
                const statuses = getDisplayStatus(el); // Returns array of all applicable statuses

                return (
                  <tr key={student.id}>
                    <td>
                      <div className="std-info">
                        <span className="name">
                          {student.first_name} {student.last_name}
                        </span>
                        <div className="sub-info">
                          <span className="roll">{student.student_id}</span>
                          <span className="meta">
                            {student.program?.code || student.program_id} -{" "}
                            {student.section}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="metric">
                        <span
                          className={`value ${
                            parseFloat(el.attendance_percentage) <
                            parseFloat(cycle.attendance_threshold_condonation)
                              ? "text-danger"
                              : parseFloat(el.attendance_percentage) <
                                  parseFloat(
                                    cycle.attendance_threshold_eligible,
                                  )
                                ? "text-warning"
                                : "text-success"
                          }`}
                        >
                          {el.attendance_percentage
                            ? `${el.attendance_percentage}%`
                            : "0.00%"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`status-tag ${
                          el.fee_clear_permission ? "cleared" : "pending"
                        }`}
                      >
                        {el.fee_clear_permission
                          ? "Cleared"
                          : `Due: ₹${(el.fee_balance || 0).toLocaleString()}`}
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        {statuses.map((status, idx) => (
                          <span
                            key={idx}
                            className={`status-badge ${status.type}`}
                          >
                            {status.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        {/* Show clear buttons for active blocks */}
                        {!el.hod_permission && (
                          <button
                            onClick={() =>
                              handlePermission(student.id, "hod", true)
                            }
                            className="btn-action clear-hod"
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
                            className="btn-action clear-fee"
                            disabled={updating === student.id}
                          >
                            Clear Fee
                          </button>
                        )}

                        {/* Show revert links for manually cleared permissions */}
                        {(el.hod_permission ||
                          (el.fee_clear_permission && el.fee_balance > 0)) && (
                          <div className="revert-actions">
                            {el.hod_permission && (
                              <button
                                onClick={() =>
                                  handlePermission(student.id, "hod", false)
                                }
                                className="btn-link"
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
                                className="btn-link"
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
                <td colSpan="5" className="empty-state">
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
