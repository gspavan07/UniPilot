import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../utils/api";
import {
  X,
  Save,
  AlertCircle,
  Loader2,
  Book,
  Building,
  Award,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  List,
} from "lucide-react";

// Schema for validation
const schema = yup.object().shape({
  name: yup.string().min(3).required("Course title is required"),
  code: yup.string().uppercase().required("Course code is required"),
  department_id: yup.string().required("Department is required"),
  regulation_id: yup.string().nullable().notRequired(),
  program_id: yup
    .string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  credits: yup
    .number()
    .typeError("Credits must be a number")
    .min(0)
    .max(20)
    .required("Credits are required"),
  course_type: yup.string().required("Course type is required"),
  semester: yup
    .number()
    .typeError("Semester must be a number")
    .min(1)
    .max(12)
    .required("Semester is required"),
  prerequisites: yup
    .string()
    .nullable()
    .transform((v) =>
      v === "" || (Array.isArray(v) && v.length === 0) ? null : v,
    )
    .notRequired(),
  description: yup
    .string()
    .nullable()
    .transform((v) =>
      v === "" || (Array.isArray(v) && v.length === 0) ? null : v,
    )
    .notRequired(),
  syllabus_data: yup
    .array()
    .of(
      yup.object().shape({
        unit: yup.number().required(),
        title: yup.string().required("Unit title is required"),
        topics: yup
          .array()
          .of(yup.string())
          .min(1, "At least one topic required"),
      }),
    )
    .default([]),
  is_active: yup.boolean().default(true),
});

// Syllabus Builder Component
const SyllabusBuilder = ({ value = [], onChange }) => {
  const units = value || [];

  const addUnit = () => {
    onChange([...units, { unit: units.length + 1, title: "", topics: [""] }]);
  };

  const removeUnit = (idx) => {
    const newUnits = units
      .filter((_, i) => i !== idx)
      .map((u, i) => ({ ...u, unit: i + 1 }));
    onChange(newUnits);
  };

  const updateUnitTitle = (idx, title) => {
    const newUnits = [...units];
    newUnits[idx] = { ...newUnits[idx], title };
    onChange(newUnits);
  };

  const addTopic = (unitIdx) => {
    const newUnits = [...units];
    newUnits[unitIdx] = {
      ...newUnits[unitIdx],
      topics: [...newUnits[unitIdx].topics, ""],
    };
    onChange(newUnits);
  };

  const updateTopic = (unitIdx, topicIdx, val) => {
    const newUnits = [...units];
    const newTopics = [...newUnits[unitIdx].topics];
    newTopics[topicIdx] = val;
    newUnits[unitIdx] = { ...newUnits[unitIdx], topics: newTopics };
    onChange(newUnits);
  };

  const removeTopic = (unitIdx, topicIdx) => {
    const newUnits = [...units];
    newUnits[unitIdx] = {
      ...newUnits[unitIdx],
      topics: newUnits[unitIdx].topics.filter((_, i) => i !== topicIdx),
    };
    onChange(newUnits);
  };

  return (
    <div className="space-y-4">
      {units.map((unit, uIdx) => (
        <div
          key={uIdx}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          {/* Unit Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-sm">
              {unit.unit}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Unit Title
              </label>
              <input
                placeholder="e.g., Introduction to Algorithms"
                value={unit.title}
                onChange={(e) => updateUnitTitle(uIdx, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => removeUnit(uIdx)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Topics List */}
          <div className="pl-11 space-y-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Topics Covered
            </label>
            {unit.topics.map((topic, tIdx) => (
              <div key={tIdx} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                <input
                  placeholder="Enter topic..."
                  value={topic}
                  onChange={(e) => updateTopic(uIdx, tIdx, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => removeTopic(uIdx, tIdx)}
                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTopic(uIdx)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Topic
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addUnit}
        className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all flex flex-col items-center justify-center gap-2"
      >
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </div>
        <span className="font-medium">Add New Unit</span>
      </button>
    </div>
  );
};

const CourseForm = ({
  isOpen,
  onClose,
  onSave,
  course = null,
  departmentList = [],
  programList = [],
  regulationList = [],
}) => {
  const [step, setStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [existingCoIds, setExistingCoIds] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      department_id: "",
      regulation_id: "",
      program_id: "",
      credits: 3,
      course_type: "theory",
      semester: 1,
      prerequisites: "",
      description: "",
      syllabus_data: [],
      is_active: true,
    },
  });

  const syllabusData = watch("syllabus_data");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      if (course) {
        reset({
          name: course.name || "",
          code: course.code || "",
          department_id: course.department_id || "",
          regulation_id: course.regulation_id || "",
          program_id: course.program_id || "",
          credits: course.credits ?? 3,
          course_type: course.course_type || "theory",
          semester: course.semester ?? 1,
          prerequisites: course.prerequisites || "",
          description: course.description || "",
          syllabus_data: course.syllabus_data || [],
          is_active: course.is_active ?? true,
        });
      } else {
        reset({
          name: "",
          code: "",
          department_id: "",
          regulation_id: "",
          program_id: "",
          credits: 3,
          course_type: "theory",
          semester: 1,
          prerequisites: "",
          description: "",
          syllabus_data: [],
          is_active: true,
        });
      }
    }
  }, [course, isOpen, reset]);

  // Fetch existing COs when editing a course
  useEffect(() => {
    const fetchCourseOutcomes = async () => {
      if (course?.id) {
        try {
          const response = await api.get(
            `/course-outcomes?course_id=${course.id}`,
          );
          if (response.data.success && response.data.data) {
            setCourseOutcomes(response.data.data);
            setExistingCoIds(response.data.data.map((co) => co.id));
          }
        } catch (err) {
          console.error("Failed to fetch course outcomes:", err);
        }
      } else {
        setCourseOutcomes([]);
        setExistingCoIds([]);
      }
    };

    if (isOpen) {
      fetchCourseOutcomes();
    }
  }, [course, isOpen]);

  // CO Management Functions
  const addCourseOutcome = () => {
    setCourseOutcomes([
      ...courseOutcomes,
      { co_code: "", description: "", target_attainment: 60 },
    ]);
  };

  const removeCourseOutcome = (index) => {
    setCourseOutcomes(courseOutcomes.filter((_, i) => i !== index));
  };

  const updateCourseOutcome = (index, field, value) => {
    const updated = [...courseOutcomes];
    updated[index] = { ...updated[index], [field]: value };
    setCourseOutcomes(updated);
  };

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ["name", "code", "department_id", "regulation_id"];
    } else if (step === 2) {
      fieldsToValidate = ["credits", "course_type", "semester"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((p) => p + 1);
    }
  };

  const handlePrev = () => setStep((p) => p - 1);

  const onError = (errors) => {
    console.error("Validation Errors:", errors);
    const step1Fields = [
      "name",
      "code",
      "department_id",
      "credits",
      "course_type",
    ];

    if (step1Fields.some((f) => errors[f])) {
      setStep(1);
      setError("Please fix errors in the Course Identity step.");
      setError("Please fix errors in the Course Identity step.");
    } else if (errors.syllabus_data) {
      setStep(2);
      setError("Please fix errors in the Structure step.");
    } else {
      setError(
        `Please check the form for errors: ${Object.keys(errors).join(", ")}`,
      );
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const savedCourse = await onSave(data);
      const courseId = savedCourse?.id || course?.id;

      // Save Course Outcomes
      if (courseId) {
        // Delete existing COs if we had any before
        if (existingCoIds.length > 0) {
          await api.delete(`/course-outcomes/course/${courseId}`);
        }

        // Create new COs if we have any now
        if (courseOutcomes.length > 0) {
          const coData = courseOutcomes.map((co) => ({
            co_code: co.co_code,
            description: co.description,
            target_attainment: co.target_attainment || 60,
          }));

          await api.post("/course-outcomes/bulk", {
            course_id: courseId,
            outcomes: coData,
          });
        }
      }

      onClose();
    } catch (err) {
      setError(err.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  // SyllabusBuilder component moved outside to prevent re-renders

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 w-full max-w-2xl transform transition ease-in-out duration-500 flex flex-col bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex-none px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                {course ? "Edit Course" : "Create New Course"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Design curriculum and course structure
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper */}
          <div className="relative flex items-center justify-between px-4">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-8">
              <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
              </div>
            </div>

            {[
              { num: 1, label: "Identity", icon: Book },
              { num: 2, label: "Syllabus", icon: List },
              { num: 3, label: "Outcomes", icon: Award },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.num;
              const isCurrent = step === s.num;

              return (
                <div
                  key={s.num}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ring-4 ring-white dark:ring-gray-900 ${isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${isCurrent
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400"
                      }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-gray-50 dark:bg-gray-900">
          <form
            id="wizard-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 max-w-2xl mx-auto"
          >
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* STEP 1: Identity */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name")}
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white placeholder-gray-400"
                      placeholder="e.g. Advanced Data Structures"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Course Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("code")}
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white font-mono placeholder-gray-400"
                        placeholder="e.g. CS301"
                      />
                      {errors.code && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium">
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("department_id")}
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                      >
                        <option value="">Select...</option>
                        {departmentList
                          .filter((d) => d.type === "academic")
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                      </select>
                      {errors.department_id && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium">
                          {errors.department_id.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Credits <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          {...register("credits")}
                          className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white font-semibold text-center"
                        />
                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                          pts
                        </span>
                      </div>
                      {errors.credits && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium">
                          {errors.credits.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("course_type")}
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                      >
                        {["theory", "lab", "project"].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {errors.course_type && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium">
                          {errors.course_type.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Syllabus */}
            {step === 2 && (
              <div className="space-y-5">
                <SyllabusBuilder
                  value={watch("syllabus_data")}
                  onChange={(val) =>
                    setValue("syllabus_data", val, { shouldDirty: true })
                  }
                />

                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-black dark:text-white">
                      Publication Status
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Make this course visible to students immediately upon
                      saving?
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("is_active")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: Outcomes */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-black dark:text-white">
                        Course Outcomes (COs)
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Define learning outcomes for this course
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCourseOutcome}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add CO
                    </button>
                  </div>

                  {courseOutcomes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <Book className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        No course outcomes defined yet
                      </p>
                      <button
                        type="button"
                        onClick={addCourseOutcome}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4 inline mr-2" />
                        Add First CO
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {courseOutcomes.map((co, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                CO Code
                              </label>
                              <input
                                type="text"
                                value={co.co_code || ""}
                                onChange={(e) =>
                                  updateCourseOutcome(
                                    index,
                                    "co_code",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g., CO1"
                                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                              />
                            </div>
                            <div className="col-span-6">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                Description
                              </label>
                              <textarea
                                value={co.description || ""}
                                onChange={(e) =>
                                  updateCourseOutcome(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Describe the learning outcome..."
                                rows="2"
                                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white resize-none"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                Target %
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={co.target_attainment || 60}
                                onChange={(e) =>
                                  updateCourseOutcome(
                                    index,
                                    "target_attainment",
                                    parseFloat(e.target.value),
                                  )
                                }
                                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                              />
                            </div>
                            <div className="col-span-1 flex items-end">
                              <button
                                type="button"
                                onClick={() => removeCourseOutcome(index)}
                                className="w-full p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex-none p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            {step > 1 ? (
              <button
                onClick={handlePrev}
                type="button"
                className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {step < 4 ? (
            <button
              onClick={handleNext}
              type="button"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit(onSubmit, onError)}
              disabled={loading}
              type="button"
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" /> Complete & Save
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseForm;
