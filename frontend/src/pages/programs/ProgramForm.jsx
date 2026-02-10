import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  Save,
  AlertCircle,
  Loader2,
  GraduationCap,
  Building,
  Clock,
  Calendar,
  Bookmark,
  BarChart,
  Plus,
  Trash2,
  Target,
} from "lucide-react";
import api from "../../utils/api";


const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .required("Program name is required"),
  code: yup.string().uppercase().required("Program code is required"),
  description: yup.string().optional(),
  department_id: yup.string().required("Department is required"),
  degree_type: yup.string().required("Degree type is required"),
  duration_years: yup.number().min(1).max(10).required("Duration is required"),
  total_semesters: yup
    .number()
    .min(1)
    .max(24)
    .required("Total semesters is required"),
  admission_criteria: yup.string().optional(),
  is_active: yup.boolean().default(true),
});

const ProgramForm = ({
  isOpen,
  onClose,
  onSave,
  program = null,
  departmentList = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [programOutcomes, setProgramOutcomes] = useState([]);


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
      degree_type: "",
      duration_years: 4,
      total_semesters: 8,
      admission_criteria: "",
      is_active: true,
    },
  });

  useEffect(() => {
    const fetchProgramOutcomes = async () => {
      if (program?.id) {
        try {
          const response = await api.get(`/program-outcomes?program_id=${program.id}`);
          if (response.data.success) {
            setProgramOutcomes(response.data.data.map(po => ({
              id: po.id,
              po_code: po.po_code,
              description: po.description,
            })));
          }
        } catch (err) {
          console.error("Error fetching program outcomes:", err);
        }
      }
    };

    if (program && isOpen) {
      reset({
        name: program.name || "",
        code: program.code || "",
        description: program.description || "",
        department_id: program.department_id || "",
        degree_type: program.degree_type || "",
        duration_years: program.duration_years || 4,
        total_semesters: program.total_semesters || 8,
        admission_criteria: program.admission_criteria || "",
        is_active: program.is_active ?? true,
      });
      fetchProgramOutcomes();
    } else if (isOpen) {
      reset({
        name: "",
        code: "",
        description: "",
        department_id: "",
        degree_type: "",
        duration_years: 4,
        total_semesters: 8,
        admission_criteria: "",
        is_active: true,
      });
      setProgramOutcomes([]);
    }
    setError(null);
  }, [program, isOpen, reset]);

  // PO Management Functions
  const addProgramOutcome = () => {
    setProgramOutcomes([...programOutcomes, { po_code: "", description: "" }]);
  };

  const removeProgramOutcome = (index) => {
    setProgramOutcomes(programOutcomes.filter((_, i) => i !== index));
  };

  const updateProgramOutcome = (index, field, value) => {
    const updated = [...programOutcomes];
    updated[index][field] = value;
    setProgramOutcomes(updated);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const savedProgram = await onSave(data);
      const programId = program?.id || savedProgram?.id;

      // Save POs if any are defined
      if (programId && programOutcomes.length > 0) {
        const validPOs = programOutcomes.filter(
          (po) => po.po_code && po.description
        );

        if (validPOs.length > 0) {
          try {
            // Delete existing POs if editing
            if (program?.id) {
              await api.delete(`/program-outcomes/program/${programId}`);
            }

            // Bulk create new POs
            await api.post("/program-outcomes/bulk", {
              program_id: programId,
              outcomes: validPOs,
            });
          } catch (poError) {
            console.error("Error saving program outcomes:", poError);
          }
        }
      }

      onClose();
    } catch (err) {
      setError(err || "Failed to save program");
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  const degreeTypes = ["diploma", "undergraduate", "postgraduate", "doctoral"];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700">
          <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl rounded-l-3xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                  {program ? "Edit Program" : "Add Program"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {program
                    ? "Update academic program details."
                    : "Define a new academic program for a department."}
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
                id="program-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <GraduationCap className="w-4 h-4 text-primary-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Program Definition
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Program Name</label>
                      <input
                        {...register("name")}
                        className={`input ${errors.name ? "border-error-500 focus:ring-error-500" : ""}`}
                        placeholder="e.g. B.Tech in Computer Science"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Program Code</label>
                      <input
                        {...register("code")}
                        className={`input ${errors.code ? "border-error-500 focus:ring-error-500" : ""}`}
                        placeholder="e.g. BTECH-CSE"
                      />
                      {errors.code && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.code.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Degree Type</label>
                      <select {...register("degree_type")} className="input">
                        <option value="">Select Degree Type</option>
                        {degreeTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="label">Department</label>
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
                      <label className="label">Description</label>
                      <textarea
                        {...register("description")}
                        rows="3"
                        className="input resize-none"
                        placeholder="Detailed objectives and overview of the program..."
                      />
                    </div>
                  </div>
                </div>

                {/* Structure Section */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <Calendar className="w-4 h-4 text-secondary-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Curriculum Structure
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Duration (Years)</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          {...register("duration_years")}
                          type="number"
                          className={`input pl-10 ${errors.duration_years ? "border-error-500 focus:ring-error-500" : ""}`}
                        />
                      </div>
                      {errors.duration_years && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.duration_years.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Total Semesters</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BarChart className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          {...register("total_semesters")}
                          type="number"
                          className={`input pl-10 ${errors.total_semesters ? "border-error-500 focus:ring-error-500" : ""}`}
                        />
                      </div>
                      {errors.total_semesters && (
                        <p className="mt-1 text-xs text-error-600 font-medium">
                          {errors.total_semesters.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="label">Admission Criteria</label>
                      <textarea
                        {...register("admission_criteria")}
                        rows="3"
                        className="input resize-none"
                        placeholder="Eligibility requirements, entrance exams, etc..."
                      />
                    </div>
                  </div>
                </div>

                {/* Program Outcomes Section */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-accent-500" />
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Program Outcomes (POs)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={addProgramOutcome}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add PO</span>
                    </button>
                  </div>

                  {programOutcomes.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <Target className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No program outcomes defined yet
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Click "Add PO" to define learning outcomes
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {programOutcomes.map((po, index) => (
                        <div
                          key={index}
                          className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"
                        >
                          <div className="flex-shrink-0 w-24">
                            <label className="label text-xs">PO Code</label>
                            <input
                              type="text"
                              value={po.po_code}
                              onChange={(e) =>
                                updateProgramOutcome(index, "po_code", e.target.value)
                              }
                              className="input text-sm"
                              placeholder={`PO${index + 1}`}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="label text-xs">Description</label>
                            <textarea
                              value={po.description}
                              onChange={(e) =>
                                updateProgramOutcome(index, "description", e.target.value)
                              }
                              rows="2"
                              className="input resize-none text-sm"
                              placeholder="Describe the program outcome..."
                            />
                          </div>
                          <div className="flex-shrink-0 flex items-end">
                            <button
                              type="button"
                              onClick={() => removeProgramOutcome(index)}
                              className="p-2 rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-900/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Toggle */}

                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Active Status
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Determine if new students can enroll.
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
                  form="program-form"
                  disabled={loading}
                  className="flex-1 btn btn-primary flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/30"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{program ? "Update" : "Create"}</span>
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

export default ProgramForm;
