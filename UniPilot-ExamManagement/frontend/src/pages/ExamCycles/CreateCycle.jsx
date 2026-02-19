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
} from "../../services/examCycleService.js";

import { DEGREE_LABELS } from "../../utils/degreeLabels.js";

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

      const selectedReg = regulations.find((r) => r.id === data.regulation_id);

      const formUpdate = {
        degree: data.degree,
        regulation_id: data.regulation_id,
        regulation_code: data.regulation_code || selectedReg?.name || "",
        exam_month: data.exam_month,
        course_type: data.course_type,
        cycle_type: data.cycle_type,
        batch: data.batch,
        semester: data.semester,
        needs_fee: data.needs_fee,
        status: data.status,
      };

      setFormData(formUpdate);
      setCycleName(calculateCycleName(formUpdate));

      // Trigger regulation dependencies
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
    setCycleName(calculateCycleName(formData));
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

  const calculateCycleName = (data) => {
    const { degree, regulation_code, semester, cycle_type, exam_month } = data;
    if (
      !degree ||
      !regulation_code ||
      !semester ||
      !cycle_type ||
      !exam_month
    )
      return "";

    const romanSemester = toRoman(semester);
    const year = new Date().getFullYear();
    const degreeLabel = DEGREE_LABELS[degree.toLowerCase()];

    if (!degreeLabel) return ""; // Guard against invalid degree

    return `${degreeLabel}_${regulation_code}_${romanSemester}_${cycle_type}_Examination_${exam_month}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Ensure cycle name is generated from the latest form data
      const finalCycleName = calculateCycleName(formData);
      if (!finalCycleName) {
        throw new Error("Could not generate cycle name. Please check all fields.");
      }

      const payload = { ...formData, cycle_name: finalCycleName };

      if (isEdit) {
        await updateCycle(id, payload);
      } else {
        await createCycle(payload);
      }
      navigate("/exam-cycles");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        `Failed to ${isEdit ? "update" : "create"} exam cycle`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-900 font-medium text-lg animate-pulse">
            Retrieving cycle configuration...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-950">
              {isEdit ? "Edit Exam Cycle" : "Create New Exam Cycle"}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
              Define the examination parameters below. This configuration drives
              scheduling, hall tickets, and result processing.
            </p>
          </div>
          <button
            onClick={() => navigate("/exam-cycles")}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            Cancel
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-5 flex items-start gap-4 animate-fadeIn">
            <div className="text-red-600 font-bold text-xl">!</div>
            <div className="text-red-800 font-medium">{error}</div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* Main Form Fields */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              {/* Degree */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Degree Qualification <span className="text-blue-600">*</span>
                </label>
                <select
                  name="degree"
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3.5 px-4 text-gray-900 font-medium focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.degree}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Degree...</option>
                  {degrees.map((deg) => (
                    <option key={deg} value={deg}>
                      {DEGREE_LABELS[deg.toLowerCase()] || deg.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Regulation */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Regulation Schema <span className="text-blue-600">*</span>
                </label>
                <select
                  name="regulation_id"
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3.5 px-4 text-gray-900 font-medium focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.regulation_id}
                  onChange={handleRegulationChange}
                  required
                >
                  <option value="">Select Regulation...</option>
                  {regulations.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Month */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Target Month <span className="text-blue-600">*</span>
                </label>
                <select
                  name="exam_month"
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3.5 px-4 text-gray-900 font-medium focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.exam_month}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Month...</option>
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Course Category <span className="text-blue-600">*</span>
                </label>
                <select
                  name="course_type"
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3.5 px-4 text-gray-900 font-medium focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={formData.course_type}
                  onChange={handleCourseTypeChange}
                  required
                  disabled={!formData.regulation_id}
                >
                  <option value="">Select Type...</option>
                  {courseTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cycle Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Examination Type <span className="text-blue-600">*</span>
                </label>
                <select
                  name="cycle_type"
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3.5 px-4 text-gray-900 font-medium focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={formData.cycle_type}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.course_type}
                >
                  <option value="">Select Exam Type...</option>
                  {cycleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Student Batch <span className="text-blue-600">*</span>
                </label>
                <select
                  name="batch"
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3.5 px-4 text-gray-900 font-medium focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.batch}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Batch...</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester - Auto filled */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Active Semester
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="semester"
                    className="block w-full rounded-xl border-gray-200 bg-gray-100 py-3.5 px-4 text-gray-500 font-bold outline-none cursor-not-allowed"
                    value={formData.semester}
                    readOnly={!isEdit}
                    onChange={handleInputChange}
                    placeholder="Auto-calculating..."
                  />
                  {!isEdit && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-xs text-gray-400 font-medium">
                        AUTO
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fee Section - Distinct Block */}
            <div className="pt-6 mt-6 border-t border-gray-100">
              <label className="relative flex items-start gap-4 p-5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-blue-50/30 hover:border-blue-200 cursor-pointer transition-all group">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    name="needs_fee"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 transition duration-150 ease-in-out"
                    checked={formData.needs_fee}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <span className="block font-bold text-gray-900">
                    Enable Examination Fee Collection
                  </span>
                  <span className="block text-sm text-gray-500 mt-1 group-hover:text-gray-600">
                    If enabled, students will be required to clear fee dues
                    before they can access their hall tickets.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Sidebar Info & Action */}
          <div className="lg:col-span-4 space-y-6">
            {/* Generated ID Card */}
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <h3 className="relative text-blue-100 text-xs font-bold uppercase tracking-widest mb-6 border-b border-blue-500/30 pb-2">
                Cycle Identifier
              </h3>

              <div className="relative font-mono text-2xl font-bold wrap-break-word leading-snug min-h-16">
                {cycleName ? (
                  cycleName
                ) : (
                  <span className="text-blue-300/60 text-lg font-normal italic">
                    Complete the form to generate ID...
                  </span>
                )}
              </div>

              <p className="relative mt-6 text-xs text-blue-100/80 leading-relaxed max-w-[90%]">
                System generated unique ID based on Degree, Regulation, Semester,
                Type and Month.
              </p>
            </div>

            {/* Status Field (Conditional) */}
            {isEdit && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Current Status
                </label>
                <select
                  name="status"
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="scheduling">Scheduling Phase</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active (Ongoing)</option>
                  <option value="completed">Archived / Completed</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : isEdit ? (
                "Update Configuration"
              ) : (
                "Initialize Cycle"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
