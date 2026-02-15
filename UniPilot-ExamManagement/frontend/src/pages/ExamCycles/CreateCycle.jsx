import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCycle,
  updateCycle,
  getCycleById,
  getAllRegulations,
  getAllBatches,
  getCourseTypes,
  getCycleTypes,
  getCurrentSemester,
  getProgramsByDegree,
  getAllDegrees,
} from "../../services/examCycleService";
import "./CreateCycle.css";

const DEGREE_LABELS = {
  btech: "B.Tech",
  mtech: "M.Tech",
  mca: "MCA",
  mba: "MBA",
  diploma: "Diploma",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Helper function to convert number to Roman numerals
function toRoman(num) {
  const romanNumerals = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
  };
  return romanNumerals[num] || String(num);
}

export default function CreateCycle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    degree: "",
    regulation_id: "",
    regulation_code: "",
    exam_month: "",
    course_type: "",
    cycle_type: "",
    batch: "",
    semester: "",
    needs_fee: false,
    status: "scheduling",
  });

  // Dropdown options
  const [degrees, setDegrees] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [cycleTypes, setCycleTypes] = useState([]);

  const [selectedRegulation, setSelectedRegulation] = useState(null);

  // Auto-generated cycle name
  const [cycleName, setCycleName] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  // Load initial data
  useEffect(() => {
    const init = async () => {
      await loadDegrees();
      await loadRegulations();
      await loadBatches();
    };
    init();
  }, []);

  // Fetch existing data if editing
  useEffect(() => {
    if (isEdit && regulations.length > 0) {
      fetchCycleData();
    }
  }, [isEdit, id, regulations]);

  const fetchCycleData = async () => {
    try {
      setFetching(true);
      const response = await getCycleById(id);
      const data = response.data.data;

      setFormData({
        degree: data.degree,
        regulation_id: data.regulation_id,
        regulation_code: data.regulation_code,
        exam_month: data.exam_month,
        course_type: data.course_type,
        cycle_type: data.cycle_type,
        batch: data.batch,
        semester: data.semester,
        needs_fee: data.needs_fee,
        status: data.status,
      });
      setCycleName(data.cycle_name);

      // Trigger regulation dependencies
      const selectedReg = regulations.find((r) => r.id === data.regulation_id);
      if (selectedReg) {
        setSelectedRegulation(selectedReg);
        const ctList = selectedReg.exam_configuration.course_types.map(
          (ct) => ct.name,
        );
        setCourseTypes(ctList);

        // Trigger course type dependencies
        const ctObj = selectedReg.exam_configuration.course_types.find(
          (ct) => ct.name === data.course_type,
        );
        if (ctObj) {
          const examComponents = [];
          const findExamComponents = (components) => {
            components.forEach((component) => {
              if (component.isExam) examComponents.push(component.name);
              if (component.components?.length > 0)
                findExamComponents(component.components);
            });
          };
          findExamComponents(ctObj.structure.components);
          setCycleTypes(examComponents);
        }
      }
    } catch (err) {
      setError("Failed to load cycle data for editing");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  // Load semester when batch is selected (only for new cycles)
  useEffect(() => {
    if (formData.batch && !isEdit) {
      loadCurrentSemester();
    }
  }, [formData.batch]);

  // Generate cycle name whenever relevant fields change
  useEffect(() => {
    if (
      formData.degree &&
      formData.regulation_code &&
      formData.semester &&
      formData.cycle_type &&
      formData.exam_month
    ) {
      generateCycleName();
    }
  }, [
    formData.degree,
    formData.regulation_code,
    formData.semester,
    formData.cycle_type,
    formData.exam_month,
  ]);

  const loadDegrees = async () => {
    try {
      const response = await getAllDegrees();
      setDegrees(response.data.data || []);
    } catch (err) {
      console.error("Error loading degrees:", err);
    }
  };

  const loadRegulations = async () => {
    try {
      const response = await getAllRegulations();
      setRegulations(response.data.data || []);
      return response.data.data;
    } catch (err) {
      console.error("Error loading regulations:", err);
    }
  };

  const loadBatches = async () => {
    try {
      const response = await getAllBatches();
      setBatches(response.data.data || []);
    } catch (err) {
      console.error("Error loading batches:", err);
    }
  };

  const handleRegulationChange = (e) => {
    const regulationId = e.target.value;
    const selectedReg = regulations.find((r) => r.id === regulationId);

    setFormData({
      ...formData,
      regulation_id: regulationId,
      regulation_code: selectedReg?.name || "",
      course_type: "",
      cycle_type: "",
    });

    if (selectedReg && selectedReg.exam_configuration) {
      const courseTypesList = selectedReg.exam_configuration.course_types.map(
        (ct) => ct.name,
      );
      setCourseTypes(courseTypesList);
      setSelectedRegulation(selectedReg);
    } else {
      setCourseTypes([]);
      setCycleTypes([]);
      setSelectedRegulation(null);
    }
  };

  const handleCourseTypeChange = (e) => {
    const courseTypeName = e.target.value;
    setFormData({ ...formData, course_type: courseTypeName, cycle_type: "" });

    if (courseTypeName && selectedRegulation) {
      const courseTypeObj =
        selectedRegulation.exam_configuration.course_types.find(
          (ct) => ct.name === courseTypeName,
        );

      if (
        courseTypeObj &&
        courseTypeObj.structure &&
        courseTypeObj.structure.components
      ) {
        const examComponents = [];
        const findExamComponents = (components) => {
          components.forEach((component) => {
            if (component.isExam) {
              examComponents.push(component.name);
            }
            if (component.components && component.components.length > 0) {
              findExamComponents(component.components);
            }
          });
        };

        findExamComponents(courseTypeObj.structure.components);
        setCycleTypes(examComponents);
      }
    } else {
      setCycleTypes([]);
    }
  };

  const loadCurrentSemester = async () => {
    try {
      const response = await getCurrentSemester(formData.batch);
      setFormData((prev) => ({ ...prev, semester: response.data.data }));
    } catch (err) {
      console.error("Error loading current semester:", err);
    }
  };

  const generateCycleName = () => {
    const { degree, regulation_code, semester, cycle_type, exam_month } =
      formData;
    const romanSemester = toRoman(semester);
    const year = new Date().getFullYear();

    const name = `${degree}_${regulation_code}_${romanSemester}_${cycle_type}_Examination_${exam_month}-${year}`;
    setCycleName(name);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "regulation_id") {
      const selectedReg = regulations.find((r) => r.id === value);
      setFormData((prev) => ({
        ...prev,
        regulation_id: value,
        regulation_code: selectedReg?.name || "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { ...formData, cycle_name: cycleName };
      if (isEdit) {
        await updateCycle(id, payload);
      } else {
        await createCycle(payload);
      }
      navigate("/exam-cycles");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        `Failed to ${isEdit ? "update" : "create"} exam cycle`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return <div className="loading-page">Loading cycle data...</div>;

  return (
    <div className="create-cycle-page">
      <div className="page-header">
        <h1>{isEdit ? "Edit Exam Cycle" : "Create New Exam Cycle"}</h1>
        <button
          onClick={() => navigate("/exam-cycles")}
          className="btn-secondary"
        >
          Back to Cycles
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="cycle-form">
        <div className="cycle-name-preview">
          <label>Generated Cycle Name:</label>
          <div className="cycle-name">
            {cycleName || "(Fill the form to generate name)"}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Degree *</label>
            <select
              name="degree"
              value={formData.degree}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Degree</option>
              {degrees.map((deg) => (
                <option key={deg} value={deg}>
                  {DEGREE_LABELS[deg.toLowerCase()] || deg.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Regulation *</label>
            <select
              name="regulation_id"
              value={formData.regulation_id}
              onChange={handleRegulationChange}
              required
            >
              <option value="">Select Regulation</option>
              {regulations.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Exam Month *</label>
            <select
              name="exam_month"
              value={formData.exam_month}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Month</option>
              {MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Course Type *</label>
            <select
              name="course_type"
              value={formData.course_type}
              onChange={handleCourseTypeChange}
              required
              disabled={!formData.regulation_id}
            >
              <option value="">Select Course Type</option>
              {courseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Cycle Type *</label>
            <select
              name="cycle_type"
              value={formData.cycle_type}
              onChange={handleInputChange}
              required
              disabled={!formData.course_type}
            >
              <option value="">Select Cycle Type</option>
              {cycleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Batch *</label>
            <select
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Semester</label>
            <input
              type="number"
              name="semester"
              value={formData.semester}
              readOnly={!isEdit}
              onChange={handleInputChange}
              placeholder="Auto-filled from batch"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="needs_fee"
                checked={formData.needs_fee}
                onChange={handleInputChange}
              />
              <span>Students need to pay fee for this exam</span>
            </label>
          </div>

          {isEdit && (
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="scheduling">Scheduling</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/exam-cycles")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Exam Cycle"
                : "Create Exam Cycle"}
          </button>
        </div>
      </form>
    </div>
  );
}
