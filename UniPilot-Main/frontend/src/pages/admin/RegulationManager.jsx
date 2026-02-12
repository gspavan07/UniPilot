import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchRegulations,
  getRegulation,
} from "../../store/slices/regulationSlice";
import api from "../../utils/api";
import { toast } from "react-hot-toast";
import {
  Settings,
  BookOpen,
  Award,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";

/**
 * RegulationManager - Standalone configuration page for a specific regulation's exam structure.
 */
const RegulationManager = () => {
  const { id: regulationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { currentRegulation, status } = useSelector(
    (state) => state.regulations,
  );

  // Local state for configuration
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [activeTab, setActiveTab] = useState("structure"); // structure, grades

  // Exam Structure State (Defaults)
  const [examStructure, setExamStructure] = useState({
    theory_courses: {
      mid_terms: {
        count: 2,
        total_marks: 30,
        components: [
          { name: "Assignment", max_marks: 5 },
          { name: "Objective", max_marks: 10 },
          { name: "Descriptive", max_marks: 15 },
        ],
        aggregation_formula: "BEST_80_WORST_20",
      },
      end_semester: {
        total_marks: 70,
        components: [],
        aggregation_formula: "DIRECT",
      },
    },
    lab_courses: {
      internal_lab: {
        total_marks: 50,
        components: [],
        aggregation_formula: "DIRECT",
      },
      external_lab: {
        total_marks: 50,
        components: [],
        aggregation_formula: "DIRECT",
      },
    },
    project_courses: {
      evaluation_type: "review_based",
      total_marks: 100,
      aggregation_formula: "DIRECT",
    },
  });

  // Grade Scale State (Defaults)
  const [gradeScale, setGradeScale] = useState([
    { grade: "O", min: 90, max: 100, points: 10 },
    { grade: "A+", min: 80, max: 89, points: 9 },
    { grade: "A", min: 70, max: 79, points: 8 },
    { grade: "B+", min: 60, max: 69, points: 7 },
    { grade: "B", min: 50, max: 59, points: 6 },
    { grade: "P", min: 40, max: 49, points: 5 },
    { grade: "F", min: 0, max: 39, points: 0 },
  ]);

  const formulaOptions = [
    { value: "BEST_80_WORST_20", label: "Best 80% + Worst 20%" },
    { value: "AVERAGE", label: "Average of All" },
    { value: "DIRECT", label: "Direct (No Calculation)" },
    { value: "BEST_OF_ALL", label: "Best Score Only" },
    { value: "DROP_LOWEST", label: "Drop Lowest, Average Rest" },
  ];

  // Load regulation data on mount
  useEffect(() => {
    if (regulationId) {
      dispatch(getRegulation(regulationId));
    }
  }, [dispatch, regulationId]);

  // Sync with currentRegulation when it changes
  useEffect(() => {
    if (currentRegulation && currentRegulation.id === regulationId) {
      setSelectedRegulation(currentRegulation);

      // Load specific config from backend to ensure we have latest JSONB data
      loadRegulationConfig(currentRegulation.id);
    }
  }, [currentRegulation, regulationId]);

  const loadRegulationConfig = async (id) => {
    try {
      const response = await api.get(`/regulations/${id}/exam-structure`);
      if (response.data.success) {
        const { exam_structure, grade_scale } = response.data.data;
        if (exam_structure && Object.keys(exam_structure).length > 0) {
          setExamStructure(exam_structure);
        }
        if (grade_scale && grade_scale.length > 0) {
          setGradeScale(grade_scale);
        }
      }
    } catch (error) {
      console.error("Error loading exam structure:", error);
      toast.error("Failed to load regulation configuration");
    }
  };

  const saveExamStructure = async () => {
    if (!selectedRegulation) return;

    try {
      const response = await api.put(
        `/regulations/${selectedRegulation.id}/exam-structure`,
        {
          exam_structure: examStructure,
          grade_scale: gradeScale,
        },
      );

      if (response.data.success) {
        toast.success("Exam configuration saved!");
        dispatch(getRegulation(selectedRegulation.id));
      }
    } catch (error) {
      console.error("Error saving exam structure:", error);
      toast.error("Failed to save changes");
    }
  };

  const addComponent = (category, type) => {
    setExamStructure({
      ...examStructure,
      [category]: {
        ...examStructure[category],
        [type]: {
          ...examStructure[category][type],
          components: [
            ...(examStructure[category][type].components || []),
            { name: "", max_marks: 0 },
          ],
        },
      },
    });
  };

  const updateComponent = (category, type, index, field, value) => {
    const newComponents = [...(examStructure[category][type].components || [])];
    newComponents[index][field] =
      field === "max_marks" ? parseInt(value) || 0 : value;
    setExamStructure({
      ...examStructure,
      [category]: {
        ...examStructure[category],
        [type]: {
          ...examStructure[category][type],
          components: newComponents,
        },
      },
    });
  };

  const removeComponent = (category, type, index) => {
    const newComponents = (
      examStructure[category][type].components || []
    ).filter((_, i) => i !== index);
    setExamStructure({
      ...examStructure,
      [category]: {
        ...examStructure[category],
        [type]: {
          ...examStructure[category][type],
          components: newComponents,
        },
      },
    });
  };

  if (status === "loading" && !selectedRegulation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/30 dark:bg-gray-900/10">
      {/* Dynamic Breadcrumb Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/regulations")}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors bg-gray-50 dark:bg-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">
              <Settings className="w-3 h-3" />
              <span>Academic Governance</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              {selectedRegulation?.name || "Regulation"}{" "}
              <span className="text-gray-300 dark:text-gray-600 font-light">
                /
              </span>{" "}
              <span className="text-indigo-600">Exam Setup</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate(`/regulations/${regulationId}/curriculum`)}
            className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all border border-transparent"
          >
            Curriculum
          </button>
          <button
            onClick={saveExamStructure}
            disabled={!selectedRegulation}
            className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-100 dark:border-gray-700 px-8 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex gap-10">
            <button
              onClick={() => setActiveTab("structure")}
              className={`py-5 px-1 font-bold text-sm tracking-tight transition-all relative ${activeTab === "structure"
                ? "text-indigo-600"
                : "text-gray-400 hover:text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Exam Structure
              </div>
              {activeTab === "structure" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-alt" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("grades")}
              className={`py-5 px-1 font-bold text-sm tracking-tight transition-all relative ${activeTab === "grades"
                ? "text-indigo-600"
                : "text-gray-400 hover:text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Grade Mapping
              </div>
              {activeTab === "grades" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-alt" />
              )}
            </button>
          </div>
        </div>

        {/* Configuration Body */}
        <div className="p-8 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
          {!selectedRegulation ? (
            <div className="py-40 text-center">
              <Loader2 className="w-12 h-12 text-gray-200 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 font-medium tracking-tight">
                Syncing Regulation Data...
              </p>
            </div>
          ) : activeTab === "structure" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Theory - Mid Terms */}
              <div className="bg-white dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white">
                      Theory: Continuous Evaluation
                    </h4>
                    <p className="text-xs text-gray-500">
                      Configure mid-term assessments and component weightages
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                      Mid-Term Cycles
                    </label>
                    <input
                      type="number"
                      value={examStructure.theory_courses.mid_terms.count}
                      onChange={(e) =>
                        setExamStructure({
                          ...examStructure,
                          theory_courses: {
                            ...examStructure.theory_courses,
                            mid_terms: {
                              ...examStructure.theory_courses.mid_terms,
                              count: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                      Total Marks per Cycle
                    </label>
                    <input
                      type="number"
                      value={examStructure.theory_courses.mid_terms.total_marks}
                      onChange={(e) =>
                        setExamStructure({
                          ...examStructure,
                          theory_courses: {
                            ...examStructure.theory_courses,
                            mid_terms: {
                              ...examStructure.theory_courses.mid_terms,
                              total_marks: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="mb-10 p-6 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
                  <label className="text-xs font-black text-indigo-600/60 uppercase tracking-widest mb-3 block">
                    Calculation Algorithm
                  </label>
                  <select
                    value={
                      examStructure.theory_courses.mid_terms.aggregation_formula
                    }
                    onChange={(e) =>
                      setExamStructure({
                        ...examStructure,
                        theory_courses: {
                          ...examStructure.theory_courses,
                          mid_terms: {
                            ...examStructure.theory_courses.mid_terms,
                            aggregation_formula: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-5 py-4 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-indigo-600"
                  >
                    {formulaOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-8 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h5 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <span>Evaluation Grid</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${examStructure.theory_courses.mid_terms.components.reduce((sum, c) => sum + (c.max_marks || 0), 0) === examStructure.theory_courses.mid_terms.total_marks ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {examStructure.theory_courses.mid_terms.components.reduce(
                          (sum, c) => sum + (c.max_marks || 0),
                          0,
                        )}{" "}
                        / {examStructure.theory_courses.mid_terms.total_marks}{" "}
                        Marks
                      </span>
                    </h5>
                    <button
                      onClick={() => addComponent("theory_courses", "mid_terms")}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-700 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      + Add Component
                    </button>
                  </div>
                  <div className="space-y-4">
                    {examStructure.theory_courses.mid_terms.components.map(
                      (comp, index) => (
                        <div
                          key={index}
                          className="flex gap-4 animate-in slide-in-from-right-4 duration-300"
                        >
                          <input
                            type="text"
                            placeholder="Component Name (e.g. Assignment)"
                            value={comp.name}
                            onChange={(e) =>
                              updateComponent("theory_courses", "mid_terms", index, "name", e.target.value)
                            }
                            className="flex-1 px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Max"
                              value={comp.max_marks}
                              onChange={(e) =>
                                updateComponent(
                                  "theory_courses",
                                  "mid_terms",
                                  index,
                                  "max_marks",
                                  e.target.value,
                                )
                              }
                              className="w-24 px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-1 focus:ring-indigo-500 outline-none text-center font-bold"
                            />
                          </div>
                          <button
                            onClick={() => removeComponent("theory_courses", "mid_terms", index)}
                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* theory - End Sem */}
                <div className="bg-white dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                  <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">
                    University Final Exam
                  </h4>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    value={
                      examStructure.theory_courses.end_semester.total_marks
                    }
                    onChange={(e) =>
                      setExamStructure({
                        ...examStructure,
                        theory_courses: {
                          ...examStructure.theory_courses,
                          end_semester: {
                            ...examStructure.theory_courses.end_semester,
                            total_marks: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-2xl"
                  />
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Award className="w-20 h-20" />
                  </div>
                </div>

                {/* Labs */}
                <div className="bg-white dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">
                    Practical Evaluation
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                        Internal Lab
                      </label>
                      <input
                        type="number"
                        value={
                          examStructure.lab_courses.internal_lab.total_marks
                        }
                        onChange={(e) =>
                          setExamStructure({
                            ...examStructure,
                            lab_courses: {
                              ...examStructure.lab_courses,
                              internal_lab: {
                                ...examStructure.lab_courses.internal_lab,
                                total_marks: parseInt(e.target.value) || 0,
                              },
                            },
                          })
                        }
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                        External Lab
                      </label>
                      <input
                        type="number"
                        value={
                          examStructure.lab_courses.external_lab.total_marks
                        }
                        onChange={(e) =>
                          setExamStructure({
                            ...examStructure,
                            lab_courses: {
                              ...examStructure.lab_courses,
                              external_lab: {
                                ...examStructure.lab_courses.external_lab,
                                total_marks: parseInt(e.target.value) || 0,
                              },
                            },
                          })
                        }
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 outline-none font-bold"
                      />
                    </div>

                    {/* Lab Components Management */}
                    <div className="space-y-6 pt-6 border-t border-gray-50 dark:border-gray-700">
                      {["internal_lab", "external_lab"].map((type) => (
                        <div key={type} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              {type.replace("_", " ")} components
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full ${(examStructure.lab_courses[type].components || []).reduce(
                                  (sum, c) => sum + (c.max_marks || 0),
                                  0,
                                ) === examStructure.lab_courses[type].total_marks
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                                  }`}
                              >
                                {(examStructure.lab_courses[type].components || []).reduce(
                                  (sum, c) => sum + (c.max_marks || 0),
                                  0,
                                )}{" "}
                                / {examStructure.lab_courses[type].total_marks}
                              </span>
                            </h5>
                            <button
                              onClick={() => addComponent("lab_courses", type)}
                              className="text-[10px] font-black text-indigo-600 hover:underline"
                            >
                              + Add
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(examStructure.lab_courses[type].components || []).map(
                              (comp, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <input
                                    type="text"
                                    placeholder="Component"
                                    value={comp.name}
                                    onChange={(e) =>
                                      updateComponent(
                                        "lab_courses",
                                        type,
                                        idx,
                                        "name",
                                        e.target.value,
                                      )
                                    }
                                    className="flex-1 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Marks"
                                    value={comp.max_marks}
                                    onChange={(e) =>
                                      updateComponent(
                                        "lab_courses",
                                        type,
                                        idx,
                                        "max_marks",
                                        e.target.value,
                                      )
                                    }
                                    className="w-20 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-center font-bold outline-none"
                                  />
                                  <button
                                    onClick={() =>
                                      removeComponent("lab_courses", type, idx)
                                    }
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-10">
                <h4 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">
                  Grade Indexing
                </h4>
                <p className="text-sm text-gray-500">
                  Global grade boundaries for {selectedRegulation?.name}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                        Grade Letter
                      </th>
                      <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                        Range (Min - Max)
                      </th>
                      <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                        GPA Weight
                      </th>
                      <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {gradeScale
                      .sort((a, b) => b.points - a.points)
                      .map((g, index) => (
                        <tr
                          key={index}
                          className="group hover:bg-indigo-50/20 dark:hover:bg-indigo-900/5 transition-colors"
                        >
                          <td className="px-8 py-6">
                            <input
                              type="text"
                              value={g.grade}
                              onChange={(e) => {
                                const newScale = [...gradeScale];
                                newScale[index].grade =
                                  e.target.value.toUpperCase();
                                setGradeScale(newScale);
                              }}
                              className="w-16 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-black text-xl text-center text-indigo-600 shadow-sm"
                            />
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                value={g.min}
                                onChange={(e) => {
                                  const newScale = [...gradeScale];
                                  newScale[index].min =
                                    parseInt(e.target.value) || 0;
                                  setGradeScale(newScale);
                                }}
                                className="w-20 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none font-bold text-center"
                              />
                              <span className="text-gray-300">to</span>
                              <input
                                type="number"
                                value={g.max}
                                onChange={(e) => {
                                  const newScale = [...gradeScale];
                                  newScale[index].max =
                                    parseInt(e.target.value) || 0;
                                  setGradeScale(newScale);
                                }}
                                className="w-20 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none font-bold text-center"
                              />
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <input
                              type="number"
                              step="0.1"
                              value={g.points}
                              onChange={(e) => {
                                const newScale = [...gradeScale];
                                newScale[index].points =
                                  parseFloat(e.target.value) || 0;
                                setGradeScale(newScale);
                              }}
                              className="w-20 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border-none font-black text-indigo-600 text-center"
                            />
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() =>
                                setGradeScale(
                                  gradeScale.filter((_, i) => i !== index),
                                )
                              }
                              className="p-3 text-gray-300 hover:text-red-500 hover:bg-white dark:hover:bg-gray-900 rounded-2xl transition-all shadow-sm hover:shadow-md"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="p-8 bg-gray-50/50 dark:bg-gray-900/20 text-center border-t dark:border-gray-700">
                  <button
                    onClick={() =>
                      setGradeScale([
                        { grade: "", min: 0, max: 0, points: 0 },
                        ...gradeScale,
                      ])
                    }
                    className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]"
                  >
                    <Plus className="w-4 h-4" /> Add Grading Entry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegulationManager;
