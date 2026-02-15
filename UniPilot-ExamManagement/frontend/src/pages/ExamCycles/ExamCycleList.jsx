import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCycles, deleteCycle } from "../../services/examCycleService";
import { Edit, Trash2, Calendar, Layout, Info } from "lucide-react";
import "./ExamCycleList.css";

export default function ExamCycleList() {
  const navigate = useNavigate();

  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    degree: "",
    status: "",
    batch: "",
  });

  useEffect(() => {
    loadCycles();
  }, [filters]);

  const loadCycles = async () => {
    setLoading(true);
    try {
      const response = await getAllCycles(filters);
      setCycles(response.data.data || []);
    } catch (err) {
      setError("Failed to load exam cycles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete the exam cycle "${name}"? This will also delete all associated timetables and configurations.`,
      )
    ) {
      try {
        await deleteCycle(id);
        loadCycles();
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete exam cycle");
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduling: "#f59e0b",
      scheduled: "#3b82f6",
      active: "#10b981",
      completed: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  return (
    <div className="cycle-list-page">
      <div className="page-header">
        <h1>Exam Cycles</h1>
        <button
          onClick={() => navigate("/exam-cycles/create")}
          className="btn-primary"
        >
          + Create New Cycle
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select
          value={filters.degree}
          onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
        >
          <option value="">All Degrees</option>
          <option value="B.Tech">B.Tech</option>
          <option value="M.Tech">M.Tech</option>
          <option value="MBA">MBA</option>
          <option value="MCA">MCA</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="scheduling">Scheduling</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading cycles...</div>
      ) : cycles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No Exam Cycles Found</h3>
          <p>Create your first exam cycle to get started</p>
          <button
            onClick={() => navigate("/exam-cycles/create")}
            className="btn-primary"
          >
            Create Exam Cycle
          </button>
        </div>
      ) : (
        <div className="cycles-grid">
          {cycles.map((cycle) => (
            <div key={cycle.id} className="cycle-card">
              <div className="cycle-header">
                <h3>{cycle.cycle_name}</h3>
                <span
                  className="status-badge"
                  style={{ background: getStatusColor(cycle.status) }}
                >
                  {cycle.status}
                </span>
              </div>

              <div className="cycle-info">
                <div className="info-row">
                  <span className="label">Degree:</span>
                  <span>{cycle.degree}</span>
                </div>
                <div className="info-row">
                  <span className="label">Batch:</span>
                  <span>{cycle.batch}</span>
                </div>
                <div className="info-row">
                  <span className="label">Semester:</span>
                  <span>{cycle.semester}</span>
                </div>
                <div className="info-row">
                  <span className="label">Type:</span>
                  <span>
                    {cycle.cycle_type} - {cycle.course_type}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Timetables:</span>
                  <span>{cycle.timetables?.length || 0} exams scheduled</span>
                </div>
              </div>

              <div className="cycle-actions">
                <button
                  onClick={() => navigate(`/exam-cycles/${cycle.id}/manage`)}
                  className="btn-manage"
                >
                  Manage Cycle
                </button>
                <div className="tool-actions">
                  <button
                    onClick={() => navigate(`/exam-cycles/${cycle.id}/edit`)}
                    className="btn-icon edit"
                    title="Edit Cycle"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, cycle.id, cycle.cycle_name)}
                    className="btn-icon delete"
                    title="Delete Cycle"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
