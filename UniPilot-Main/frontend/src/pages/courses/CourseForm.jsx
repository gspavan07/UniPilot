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

// Schema for Step 1
const schema = yup.object().shape({
  name: yup.string().min(3).required("Course title is required"),
  code: yup.string().uppercase().required("Course code is required"),
  department_id: yup.string().required("Department is required"),
  regulation_id: yup.string().nullable().notRequired(),
  program_id: yup
    .string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),

  // Step 2
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

  // Step 3 (Syllabus)
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

const CourseForm = ({
  isOpen,
  onClose,
  onSave,
  course = null,
  departmentList = [],
  programList = [],
  regulationList = [],
}) => {
  const [step, setStep] = useState(1);
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

  // Watch syllabus for manual management if needed, but Step 3 component handles it better
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
          const response = await api.get(`/ course - outcomes ? course_id = ${course.id} `);
          if (response.data.success && response.data.data) {
            setCourseOutcomes(response.data.data);
            setExistingCoIds(response.data.data.map(co => co.id));
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
    setCourseOutcomes([...courseOutcomes, { co_code: "", description: "", target_attainment: 60 }]);
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
      "regulation_id",
      "program_id",
    ];
    const step2Fields = [
      "credits",
      "course_type",
      "semester",
      "prerequisites",
      "description",
    ];

    if (step1Fields.some((f) => errors[f])) {
      setStep(1);
      setError("Please fix errors in the Course Identity step.");
    } else if (step2Fields.some((f) => errors[f])) {
      setStep(2);
      setError("Please fix errors in the Structure step.");
    } else {
      setError(
        `Please check the form for errors: ${Object.keys(errors).join(", ")} `,
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
          const coData = courseOutcomes.map(co => ({
            co_code: co.co_code,
            description: co.description,
            target_attainment: co.target_attainment || 60,
          }));

          await api.post("/course-outcomes/bulk", {
            course_id: courseId,
            outcomes: coData
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

  // ... (SyllabusBuilder remains same)

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
      <div className="space-y-6">
        {units.map((unit, uIdx) => (
          <div
            key={uIdx}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            {/* Unit Header */}
            <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                {unit.unit}
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Unit Title
                </label>
                <input
                  placeholder="e.g., Introduction to Algorithms"
                  value={unit.title}
                  onChange={(e) => updateUnitTitle(uIdx, e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-base font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-300 focus:ring-0"
                />
              </div>
              <button
                type="button"
                onClick={() => removeUnit(uIdx)}
                className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Topics List */}
            <div className="p-5 space-y-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Topics Covered
              </label>
              <div className="space-y-2">
                {unit.topics.map((topic, tIdx) => (
                  <div key={tIdx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                    <input
                      placeholder="Enter topic..."
                      value={topic}
                      onChange={(e) => updateTopic(uIdx, tIdx, e.target.value)}
                      className="flex-1 text-sm bg-gray-50 dark:bg-gray-900/50 border-0 rounded-lg py-2 px-3 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeTopic(uIdx, tIdx)}
                      className="text-gray-300 hover:text-error-400 transition-colors p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addTopic(uIdx)}
                className="mt-3 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors w-fit"
              >
                <Plus className="w-3 h-3" /> Add Topic
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addUnit}
          className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50/10 transition-all group flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
            <Plus className="w-5 h-5 group-hover:text-primary-600" />
          </div>
          <span className="font-medium">Add New Unit</span>
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden isolate">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 w-full max-w-2xl transform transition ease-in-out duration-500 flex flex-col bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex-none px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
                {course ? "Edit Course" : "Create New Course"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Design curriculum and course structure
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modern Stepper */}
          <div className="relative flex items-center justify-between px-4">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-8">
              <div className="w-full h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
              </div>
            </div>

            {[
              { num: 1, label: "Identity", icon: Book },
              { num: 2, label: "Structure", icon: Building },
              { num: 3, label: "Syllabus", icon: List },
              { num: 4, label: "Outcomes", icon: Award },
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
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4 ring-white dark:ring-gray-900
                      ${isActive
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`
                      text-xs font-semibold tracking-wide transition-colors duration-300
                      ${isCurrent ? "text-primary-600 dark:text-primary-400" : "text-gray-400"}
                    `}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-gray-50/50 dark:bg-black/20">
          <form
            id="wizard-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl mx-auto"
          >
            {error && (
              <div className="p-4 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-300 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                      Academic Regulation{" "}
                      <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <select
                      {...register("regulation_id")}
                      className="form-select w-full rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                      <option value="">Select Regulation...</option>
                      {regulationList.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.academic_year})
                        </option>
                      ))}
                    </select>
                    {errors.regulation_id && (
                      <p className="text-xs text-error-500 mt-1.5 ml-1 font-medium">
                        {errors.regulation_id.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                        Course Title <span className="text-error-500">*</span>
                      </label>
                      <input
                        {...register("name")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400"
                        placeholder="e.g. Advanced Data Structures"
                      />
                      {errors.name && (
                        <p className="text-xs text-error-500 mt-1.5 ml-1 font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                        Course Code <span className="text-error-500">*</span>
                      </label>
                      <input
                        {...register("code")}
                        className="form-input w-full rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono placeholder-gray-400"
                        placeholder="e.g. CS301"
                      />
                      {errors.code && (
                        <p className="text-xs text-error-500 mt-1.5 ml-1 font-medium">
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                        Department <span className="text-error-500">*</span>
                      </label>
                      <select
                        {...register("department_id")}
                        className="form-select w-full rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        <option value="">Select...</option>
                        {departmentList.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                      {errors.department_id && (
                        <p className="text-xs text-error-500 mt-1.5 ml-1 font-medium">
                          {errors.department_id.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                        Program Restriction (Optional)
                      </label>
                      <select
                        {...register("program_id")}
                        className="form-select w-full rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-gray-600"
                      >
                        <option value="">Open to All Programs</option>
                        {programList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} only
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                        Leave blank if this is a common course for multiple
                        programs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                        Credits
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          {...register("credits")}
                          className={`form - input w - full rounded - xl bg - gray - 50 border - gray - 200 focus: bg - white focus: border - primary - 500 focus: ring - 4 focus: ring - primary - 500 / 10 transition - all dark: bg - gray - 800 dark: border - gray - 700 dark: text - white font - semibold text - center ${errors.credits ? "border-error-500 focus:border-error-500 focus:ring-error-500/10" : ""} `}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                          pts
                        </span>
                      </div>
                      {errors.credits && (
                        <p className="text-xs text-error-500 mt-1.5 ml-1 font-medium">
                          {errors.credits.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                        Semester
                      </label>
                      <input
                        type="number"
                        {...register("semester")}
                        className={`form - input w - full rounded - xl bg - gray - 50 border - gray - 200 focus: bg - white focus: border - primary - 500 focus: ring - 4 focus: ring - primary - 500 / 10 transition - all dark: bg - gray - 800 dark: border - gray - 700 dark: text - white font - semibold text - center ${errors.semester ? "border-error-500 focus:border-error-500 focus:ring-error-500/10" : ""} `}
                      />
                      {errors.semester && (
                        <p className="text-xs text-error-500 mt-1.5 ml-1 font-medium">
                          {errors.semester.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                        Type
                      </label>
                      <select
                        {...register("course_type")}
                        className={`form - select w - full rounded - xl bg - gray - 50 border - gray - 200 focus: bg - white focus: border - primary - 500 focus: ring - 4 focus: ring - primary - 500 / 10 transition - all dark: bg - gray - 800 dark: border - gray - 700 dark: text - white ${errors.course_type ? "border-error-500 focus:border-error-500 focus:ring-error-500/10" : ""} `}
                      >
                        {["theory", "lab", "project"].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {errors.course_type && (
                        <p className="text-xs text-error-500 mt-1.5 ml-1 font-medium">
                          {errors.course_type.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                      Prerequisites
                    </label>
                    <input
                      {...register("prerequisites")}
                      className={`form - input w - full rounded - xl bg - gray - 50 border - gray - 200 focus: bg - white focus: border - primary - 500 focus: ring - 4 focus: ring - primary - 500 / 10 transition - all dark: bg - gray - 800 dark: border - gray - 700 dark: text - white ${errors.prerequisites ? "border-error-500 focus:border-error-500 focus:ring-error-500/10" : ""} `}
                      placeholder="e.g. CS101, MA101"
                    />
                    {errors.prerequisites && (
                      <p className="text-xs text-error-500 mt-1.5 ml-1 font-medium">
                        {errors.prerequisites.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                      Description & Objectives
                    </label>
                    <textarea
                      {...register("description")}
                      rows="4"
                      className={`form - textarea w - full rounded - xl bg - gray - 50 border - gray - 200 focus: bg - white focus: border - primary - 500 focus: ring - 4 focus: ring - primary - 500 / 10 transition - all dark: bg - gray - 800 dark: border - gray - 700 dark: text - white resize - none ${errors.description ? "border-error-500 focus:border-error-500 focus:ring-error-500/10" : ""} `}
                      placeholder="Enter course description, objectives and outcomes..."
                    ></textarea>
                    {errors.description && (
                      <p className="text-xs text-error-500 mt-1.5 ml-1 font-medium">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <SyllabusBuilder
                  value={watch("syllabus_data")}
                  onChange={(val) =>
                    setValue("syllabus_data", val, { shouldDirty: true })
                  }
                />

                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Publication Status
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        Course Outcomes (COs)
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Define learning outcomes for this course
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCourseOutcome}
                      className="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add CO
                    </button>
                  </div>

                  {courseOutcomes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <Book className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        No course outcomes defined yet
                      </p>
                      <button
                        type="button"
                        onClick={addCourseOutcome}
                        className="btn btn-primary btn-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First CO
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {courseOutcomes.map((co, index) => (
                        <div
                          key={index}
                          className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-3">
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                CO Code
                              </label>
                              <input
                                type="text"
                                value={co.co_code || ""}
                                onChange={(e) =>
                                  updateCourseOutcome(index, "co_code", e.target.value)
                                }
                                placeholder="e.g., CO1"
                                className="input input-sm"
                              />
                            </div>
                            <div className="md:col-span-6">
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                Description
                              </label>
                              <textarea
                                value={co.description || ""}
                                onChange={(e) =>
                                  updateCourseOutcome(index, "description", e.target.value)
                                }
                                placeholder="Describe the learning outcome..."
                                rows="2"
                                className="input input-sm resize-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
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
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="input input-sm"
                              />
                            </div>
                            <div className="md:col-span-1 flex items-end">
                              <button
                                type="button"
                                onClick={() => removeCourseOutcome(index)}
                                className="btn btn-sm bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-900/20 dark:text-error-400 dark:hover:bg-error-900/40 w-full h-9"
                              >
                                <Trash2 className="w-4 h-4" />
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
        <div className="flex-none p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center z-10">
          <div>
            {step > 1 ? (
              <button
                onClick={handlePrev}
                type="button"
                className="btn bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1.5" /> Back
              </button>
            ) : (
              <button
                onClick={onClose}
                type="button"
                className="btn text-gray-400 hover:text-gray-600 px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {step < 4 ? (
            <button
              onClick={handleNext}
              type="button"
              className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all flex items-center"
            >
              Next Step <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit(onSubmit, onError)}
              disabled={loading}
              type="button"
              className="btn bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transform hover:-translate-y-0.5 transition-all flex items-center disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" /> Complete & Save
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
