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
    return <div className="text-center text-lg font-semibold text-indigo-600 py-10">Loading cycle data...</div>;

  return (
    <div className="max-w-[1200px] mx-auto p-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[2rem] text-slate-900 font-bold m-0">
          {isEdit ? "Edit Exam Cycle" : "Create New Exam Cycle"}
        </h1>
        <button
          onClick={() => navigate("/exam-cycles")}
          className="bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold text-base cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
        >
          Back to Cycles
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 border-l-4 border-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg"
      >
        <div className="bg-gradient-to-br from-indigo-500 to-purple-700 text-white p-6 rounded-lg mb-8">
          <label className="block text-sm mb-2 opacity-90 uppercase tracking-wider font-semibold">
            Generated Cycle Name:
          </label>
          <div className="text-xl font-bold font-mono tracking-tight">
            {cycleName || "(Fill the form to generate name)"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">
              Degree *
            </label>
            <select
              name="degree"
              className="p-3 border-2 border-slate-200 rounded-lg text-base transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
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

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">
              Regulation *
            </label>
            <select
              name="regulation_id"
              className="p-3 border-2 border-slate-200 rounded-lg text-base transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
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

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">
              Exam Month *
            </label>
            <select
              name="exam_month"
              className="p-3 border-2 border-slate-200 rounded-lg text-base transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
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

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">
              Course Type *
            </label>
            <select
              name="course_type"
              className="p-3 border-2 border-slate-200 rounded-lg text-base transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:cursor-not-allowed"
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

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">
              Cycle Type *
            </label>
            <select
              name="cycle_type"
              className="p-3 border-2 border-slate-200 rounded-lg text-base transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:cursor-not-allowed"
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

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">
              Batch *
            </label>
            <select
              name="batch"
              className="p-3 border-2 border-slate-200 rounded-lg text-base transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
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

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">
              Semester
            </label>
            <input
              type="number"
              name="semester"
              className="p-3 border-2 border-slate-200 rounded-lg text-base transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-100"
              value={formData.semester}
              readOnly={!isEdit}
              onChange={handleInputChange}
              placeholder="Auto-filled from batch"
            />
          </div>

          <div className="flex flex-row items-center">
            <label className="flex items-center gap-3 cursor-pointer mb-0">
              <input
                type="checkbox"
                name="needs_fee"
                className="w-5 h-5 cursor-pointer accent-indigo-600"
                checked={formData.needs_fee}
                onChange={handleInputChange}
              />
              <span className="text-sm font-semibold text-slate-700">
                Students need to pay fee for this exam
              </span>
            </label>
          </div>

          {isEdit && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-slate-700 text-sm">
                Status
              </label>
              <select
                name="status"
                className="p-3 border-2 border-slate-200 rounded-lg text-base transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
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

        <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-200">
          <button
            type="button"
            onClick={() => navigate("/exam-cycles")}
            className="bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold text-base cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-br from-indigo-500 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold text-base cursor-pointer transition-all border-none hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
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
