import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCycleById, deleteCycle } from "../../services/examCycleService";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import TimetableTab from "../../components/ExamCycle/TimetableTab";
import FeeConfigTab from "../../components/ExamCycle/FeeConfigTab";
import EligibilityTab from "../../components/ExamCycle/EligibilityTab";
import StudentsTab from "../../components/ExamCycle/StudentsTab";
import "./ManageCycle.css";

export default function ManageCycle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("timetable");

  useEffect(() => {
    loadCycle();
  }, [id]);

  const loadCycle = async () => {
    setLoading(true);
    try {
      const response = await getCycleById(id);
      setCycle(response.data.data);
    } catch (err) {
      setError("Failed to load cycle details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${cycle.cycle_name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteCycle(id);
        navigate("/exam-cycles");
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete cycle");
      }
    }
  };

  if (loading) {
    return <div className="loading-page">Loading cycle...</div>;
  }

  if (error || !cycle) {
    return (
      <div className="error-page">
        <p>{error || "Cycle not found"}</p>
        <button
          onClick={() => navigate("/exam-cycles")}
          className="btn-primary"
        >
          Back to Cycles
        </button>
      </div>
    );
  }

  return (
    <div className="manage-cycle-page">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate("/exam-cycles")} className="btn-back">
            <ArrowLeft size={18} />
          </button>
          <div className="header-titles">
            <h1>{cycle.cycle_name}</h1>
            <div className="cycle-meta">
              <span className={`status-badge ${cycle.status}`}>
                {cycle.status}
              </span>
              <span>
                {cycle.degree} • Semester {cycle.semester} • {cycle.batch}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => navigate(`/exam-cycles/${id}/edit`)}
            className="btn-edit-header"
          >
            <Edit size={16} /> Edit
          </button>
          <button onClick={handleDelete} className="btn-delete-header">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "timetable" ? "active" : ""}`}
            onClick={() => setActiveTab("timetable")}
          >
            📅 Timetable
          </button>
          {cycle.needs_fee && (
            <button
              className={`tab ${activeTab === "fee" ? "active" : ""}`}
              onClick={() => setActiveTab("fee")}
            >
              💰 Fee Configuration
            </button>
          )}
          <button
            className={`tab ${activeTab === "eligibility" ? "active" : ""}`}
            onClick={() => setActiveTab("eligibility")}
          >
            🛡️ Eligibility
          </button>
          <button
            className={`tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            👥 Students
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "timetable" && (
            <TimetableTab cycleId={id} cycle={cycle} onUpdate={loadCycle} />
          )}
          {activeTab === "fee" && cycle.needs_fee && (
            <FeeConfigTab cycleId={id} cycle={cycle} />
          )}
          {activeTab === "eligibility" && (
            <EligibilityTab cycleId={id} cycle={cycle} onUpdate={loadCycle} />
          )}
          {activeTab === "students" && <StudentsTab cycleId={id} />}
        </div>
      </div>
    </div>
  );
}
