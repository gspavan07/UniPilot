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
          const response = await api.get(
            `/program-outcomes?program_id=${program.id}`,
          );
          if (response.data.success) {
            setProgramOutcomes(
              response.data.data.map((po) => ({
                id: po.id,
                po_code: po.po_code,
                description: po.description,
              })),
            );
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
          (po) => po.po_code && po.description,
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700">
          <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black text-black dark:text-white tracking-tight">
                  {program ? "Edit Program" : "New Program"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {program
                    ? "Update academic program details."
                    : "Define a new academic program for a department."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 -mr-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-all"
              >
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
              <form
                id="program-form"
                onSubmit={handleSubmit(onSubmit)}
                className="p-8 space-y-6"
              >
                {/* Error Banner */}
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-start shadow-sm">
                    <AlertCircle
                      className="w-5 h-5 mr-3 mt-0.5 shrink-0"
                      strokeWidth={2.5}
                    />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                {/* Section 1: Program Definition */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border-2 border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                      <GraduationCap
                        className="w-5 h-5 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className="text-lg font-black text-black dark:text-white">
                      Program Definition
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Program Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        {...register("name")}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.name
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 dark:border-gray-800 focus:border-blue-500"
                          }`}
                        placeholder="e.g. B.Tech in Computer Science"
                      />
                      {errors.name && (
                        <p className="mt-2 text-xs text-red-600 font-bold flex items-center">
                          <AlertCircle
                            className="w-3.5 h-3.5 mr-1.5"
                            strokeWidth={2.5}
                          />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Program Code <span className="text-red-600">*</span>
                      </label>
                      <input
                        {...register("code")}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-900 text-black dark:text-white uppercase font-mono text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.code
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 dark:border-gray-800 focus:border-blue-500"
                          }`}
                        placeholder="e.g. BTECH-CSE"
                      />
                      {errors.code && (
                        <p className="mt-2 text-xs text-red-600 font-bold">
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Degree Type <span className="text-red-600">*</span>
                      </label>
                      <select
                        {...register("degree_type")}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all capitalize"
                      >
                        <option value="">Select Degree Type</option>
                        {degreeTypes.map((type) => (
                          <option
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Department <span className="text-red-600">*</span>
                      </label>
                      <select
                        {...register("department_id")}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.department_id
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 dark:border-gray-800 focus:border-blue-500"
                          }`}
                      >
                        <option value="">Select Department...</option>
                        {departmentList.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                      {errors.department_id && (
                        <p className="mt-2 text-xs text-red-600 font-bold">
                          {errors.department_id.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        {...register("description")}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                        placeholder="Detailed objectives and overview of the program..."
                      />
                    </div>
                  </div>
                </section>

                {/* Section 2: Curriculum Structure */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border-2 border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                      <Calendar
                        className="w-5 h-5 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className="text-lg font-black text-black dark:text-white">
                      Curriculum Structure
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Duration (Years) <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Clock className="h-4 w-4" strokeWidth={2.5} />
                        </div>
                        <input
                          {...register("duration_years")}
                          type="number"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.duration_years
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 dark:border-gray-800 focus:border-blue-500"
                            }`}
                        />
                      </div>
                      {errors.duration_years && (
                        <p className="mt-2 text-xs text-red-600 font-bold">
                          {errors.duration_years.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Total Semesters <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <BarChart className="h-4 w-4" strokeWidth={2.5} />
                        </div>
                        <input
                          {...register("total_semesters")}
                          type="number"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.total_semesters
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 dark:border-gray-800 focus:border-blue-500"
                            }`}
                        />
                      </div>
                      {errors.total_semesters && (
                        <p className="mt-2 text-xs text-red-600 font-bold">
                          {errors.total_semesters.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Admission Criteria
                      </label>
                      <textarea
                        {...register("admission_criteria")}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-black dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                        placeholder="Eligibility requirements, entrance exams, etc..."
                      />
                    </div>
                  </div>
                </section>

                {/* Section 3: Program Outcomes */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border-2 border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                        <Target
                          className="w-5 h-5 text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                      <h3 className="text-lg font-black text-black dark:text-white">
                        Program Outcomes
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={addProgramOutcome}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all text-sm font-bold"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                      <span>Add PO</span>
                    </button>
                  </div>

                  {programOutcomes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <Target
                        className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3"
                        strokeWidth={2}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                        No program outcomes defined yet
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Click "Add PO" to define learning outcomes
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {programOutcomes.map((po, index) => (
                        <div
                          key={index}
                          className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700"
                        >
                          <div className="shrink-0 w-28">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                              PO Code
                            </label>
                            <input
                              type="text"
                              value={po.po_code}
                              onChange={(e) =>
                                updateProgramOutcome(
                                  index,
                                  "po_code",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                              placeholder={`PO${index + 1}`}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Description
                            </label>
                            <textarea
                              value={po.description}
                              onChange={(e) =>
                                updateProgramOutcome(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              rows="2"
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                              placeholder="Describe the program outcome..."
                            />
                          </div>
                          <div className="shrink-0 flex items-end">
                            <button
                              type="button"
                              onClick={() => removeProgramOutcome(index)}
                              className="p-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Status Section */}
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-sm font-black text-black dark:text-white">
                      Active Status
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                      Determine if new students can enroll.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("is_active")}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:ring-4 focus:ring-gray-200/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="program-form"
                  disabled={loading}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <>
                      <Save className="w-5 h-5" strokeWidth={2.5} />
                      <span>{program ? "Save Changes" : "Create Program"}</span>
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
