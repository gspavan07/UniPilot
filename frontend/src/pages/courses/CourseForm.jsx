import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  Save,
  AlertCircle,
  Loader2,
  Book,
  Building,
  Hash,
  Award,
  Clock,
  FileText,
} from "lucide-react";

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Title must be at least 3 characters")
    .required("Course title is required"),
  code: yup.string().uppercase().required("Course code is required"),
  description: yup.string().optional(),
  department_id: yup.string().required("Department is required"),
  program_id: yup
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  credits: yup.number().min(0).max(20).required("Credits are required"),
  course_type: yup.string().required("Course type is required"),
  semester: yup
    .number()
    .min(1)
    .max(12)
    .required("Recommended semester is required"),
  prerequisites: yup.string().optional(),
  is_active: yup.boolean().default(true),
});

const CourseForm = ({
  isOpen,
  onClose,
  onSave,
  course = null,
  departmentList = [],
  programList = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      department_id: "",
      program_id: "",
      credits: 3,
      course_type: "Core",
      semester: 1,
      prerequisites: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (course && isOpen) {
      reset({
        name: course.name || "",
        code: course.code || "",
        description: course.description || "",
        department_id: course.department_id || "",
        program_id: course.program_id || "",
        credits: course.credits || 3,
        course_type: course.course_type || "Core",
        semester: course.semester || 1,
        prerequisites: course.prerequisites || "",
        is_active: course.is_active ?? true,
      });
    } else if (isOpen) {
      reset({
        name: "",
        code: "",
        description: "",
        department_id: "",
        program_id: "",
        credits: 3,
        course_type: "Core",
        semester: 1,
        prerequisites: "",
        is_active: true,
      });
    }
    setError(null);
  }, [course, isOpen, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const courseTypes = [
    "Core",
    "Elective",
    "Lab",
    "Seminar",
    "Project",
    "Internship",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700">
          <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl rounded-l-3xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                  {course ? "Edit Course" : "Create Course"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {course
                    ? "Modify existing course details and syllabus."
                    : "Add a new subject to the university catalog."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {error && (
                <div className="p-4 rounded-2xl bg-error-50 dark:bg-error-900/30 border border-error-500/30 text-error-700 dark:text-error-300 text-sm flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form
                id="course-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <Book className="w-4 h-4 text-primary-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Course Identity
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Course Title</label>
                      <input
                        {...register("name")}
                        className={`input ${errors.name ? "border-error-500 focus:ring-error-500" : ""}`}
                        placeholder="e.g. Advanced Data Structures"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Course Code</label>
                      <input
                        {...register("code")}
                        className={`input ${errors.code ? "border-error-500 focus:ring-error-500" : ""}`}
                        placeholder="e.g. CS301"
                      />
                      {errors.code && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.code.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Credits</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Award className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          {...register("credits")}
                          type="number"
                          className={`input pl-10 ${errors.credits ? "border-error-500 focus:ring-error-500" : ""}`}
                        />
                      </div>
                      {errors.credits && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.credits.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Academic Alignment */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <Building className="w-4 h-4 text-secondary-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Academic Alignment
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Offering Department</label>
                      <select
                        {...register("department_id")}
                        className={`input ${errors.department_id ? "border-error-500 focus:ring-error-500" : ""}`}
                      >
                        <option value="">Select Department...</option>
                        {departmentList.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                      {errors.department_id && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.department_id.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="label">
                        Primary Program (Optional)
                      </label>
                      <select {...register("program_id")} className="input">
                        <option value="">Cross-disciplinary / Multiple</option>
                        {programList.map((prog) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.name} ({prog.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Course Type</label>
                      <select {...register("course_type")} className="input">
                        {courseTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Recommended Semester</label>
                      <input
                        {...register("semester")}
                        type="number"
                        className={`input ${errors.semester ? "border-error-500 focus:ring-error-500" : ""}`}
                      />
                      {errors.semester && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.semester.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <FileText className="w-4 h-4 text-info-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Content & Syllabus
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label">Prerequisites</label>
                      <input
                        {...register("prerequisites")}
                        className="input"
                        placeholder="e.g. CS101, Discrete Math"
                      />
                    </div>
                    <div>
                      <label className="label">Course Description</label>
                      <textarea
                        {...register("description")}
                        rows="4"
                        className="input resize-none"
                        placeholder="Overview of course modules and learning outcomes..."
                      />
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Is Published?
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Published courses are visible in the catalog.
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
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="course-form"
                  disabled={loading}
                  className="flex-1 btn btn-primary flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/30"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{course ? "Update" : "Create"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;
