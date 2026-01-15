import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  DollarSign,
  Briefcase,
  Layers,
  Info,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  fetchSalaryGrades,
  upsertSalaryGrade,
  resetOperationStatus,
} from "../../store/slices/hrSlice";
import toast from "react-hot-toast";

const GradeManagement = () => {
  const dispatch = useDispatch();
  const { salaryGrades, operationStatus, operationError } = useSelector(
    (state) => state.hr
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    basic_salary: 0,
    allowances: [],
    deductions: [],
    leave_policy: [],
    lop_config: { basis: "basic", deduction_factor: 1.0 },
    description: "",
  });

  useEffect(() => {
    dispatch(fetchSalaryGrades());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success(editingGrade ? "Grade updated!" : "New grade created!");
      setIsModalOpen(false);
      setEditingGrade(null);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch, editingGrade]);

  const handleOpenModal = (grade = null) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        ...grade,
        allowances: Object.entries(grade.allowances || {}).map(
          ([name, val]) => {
            if (typeof val === "object")
              return { name, value: val.value, type: val.type };
            return { name, value: val, type: "fixed" };
          }
        ),
        deductions: Object.entries(grade.deductions || {}).map(
          ([name, val]) => {
            if (typeof val === "object")
              return { name, value: val.value, type: val.type };
            return { name, value: val, type: "fixed" };
          }
        ),
        leave_policy: grade.leave_policy || [],
        lop_config: grade.lop_config || {
          basis: "basic",
          deduction_factor: 1.0,
        },
      });
    } else {
      setEditingGrade(null);
      setFormData({
        name: "",
        basic_salary: 0,
        allowances: [
          { name: "HRA", value: 40, type: "percentage" },
          { name: "DA", value: 10, type: "percentage" },
        ],
        deductions: [{ name: "PF", value: 12, type: "percentage" }],
        leave_policy: [
          { name: "Casual Leave", days: 12, carry_forward: false },
          { name: "Sick Leave", days: 10, carry_forward: true },
        ],
        lop_config: { basis: "basic", deduction_factor: 1.0 },
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const allowancesObj = {};
    formData.allowances.forEach((a) => {
      if (a.name)
        allowancesObj[a.name] = { value: Number(a.value), type: a.type };
    });

    const deductionsObj = {};
    formData.deductions.forEach((d) => {
      if (d.name)
        deductionsObj[d.name] = { value: Number(d.value), type: d.type };
    });

    dispatch(
      upsertSalaryGrade({
        ...formData,
        id: editingGrade?.id,
        basic_salary: Number(formData.basic_salary),
        allowances: allowancesObj,
        deductions: deductionsObj,
      })
    );
  };

  const addComponent = (type) => {
    const newItem =
      type === "leave_policy"
        ? { name: "", days: 0, carry_forward: false }
        : { name: "", value: 0, type: "fixed" };

    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], newItem],
    }));
  };

  const removeComponent = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="text-primary-500" />
            Salary Grades (Templates)
          </h1>
          <p className="text-gray-500">
            Define standardized university pay scales.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Grade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salaryGrades.map((grade) => (
          <div
            key={grade.id}
            className="card p-6 bg-white dark:bg-gray-800 border-none shadow-xl hover:ring-2 ring-primary-500/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <Award className="text-primary-600" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(grade)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-primary-500"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {grade.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {grade.description || "No description provided."}
            </p>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Basic Salary</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{Number(grade.basic_salary).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-gray-800 pt-2">
                <span className="text-gray-500">Allowances</span>
                <span className="text-emerald-500 font-medium">
                  {Object.keys(grade.allowances || {}).length} Items
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-gray-800 pt-2">
                <span className="text-gray-500">Deductions</span>
                <span className="text-red-500 font-medium">
                  {Object.keys(grade.deductions || {}).length} Items
                </span>
              </div>
            </div>
          </div>
        ))}

        {salaryGrades.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">
              No Salary Grades defined yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create a grade to standardize salaries across staff roles.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-outline border-gray-300"
            >
              Create First Grade
            </button>
          </div>
        )}
      </div>

      {/* Grade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {editingGrade ? "Edit Salary Grade" : "Create Salary Grade"}
                </h2>
                <p className="text-sm text-gray-500">
                  Standardize settings for this grade level.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">
                    Grade Name
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="e.g. Professor Grade 1"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">
                    Standard Basic Salary
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      className="input input-bordered w-full pl-8"
                      value={formData.basic_salary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          basic_salary: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">
                    Description
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Describe which roles this grade applies to..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Leave Policy Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2">
                    <Clock className="text-blue-500 w-4 h-4" /> Leave
                    Entitlements
                  </h3>
                  <button
                    onClick={() => addComponent("leave_policy")}
                    className="btn btn-xs btn-outline border-gray-200"
                  >
                    Add Leave Type
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.leave_policy.map((comp, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 animate-fade-in items-center"
                    >
                      <input
                        className="input input-sm input-bordered flex-1"
                        placeholder="Type (e.g. Casual)"
                        value={comp.name}
                        onChange={(e) => {
                          const newArr = [...formData.leave_policy];
                          newArr[idx].name = e.target.value;
                          setFormData({ ...formData, leave_policy: newArr });
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="input input-sm input-bordered w-20"
                          placeholder="Days"
                          value={comp.days}
                          onChange={(e) => {
                            const newArr = [...formData.leave_policy];
                            newArr[idx].days = Number(e.target.value);
                            setFormData({ ...formData, leave_policy: newArr });
                          }}
                        />
                        <span className="text-xs font-bold text-gray-400">
                          DAYS/YR
                        </span>
                      </div>
                      <label
                        className="cursor-pointer label p-0 gap-2"
                        title="Carry Forward?"
                      >
                        <span className="label-text text-xs font-bold text-gray-400">
                          CF?
                        </span>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs checkbox-primary"
                          checked={comp.carry_forward || false}
                          onChange={(e) => {
                            const newArr = [...formData.leave_policy];
                            newArr[idx].carry_forward = e.target.checked;
                            setFormData({ ...formData, leave_policy: newArr });
                          }}
                        />
                      </label>
                      <button
                        onClick={() => removeComponent("leave_policy", idx)}
                        className="btn btn-sm btn-ghost text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.leave_policy.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      No leave entitlements defined.
                    </p>
                  )}
                </div>
              </div>

              {/* LOP Settings */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <h3 className="font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-3">
                  <AlertCircle className="w-4 h-4" /> Loss of Pay Rules
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">
                      Deduction Basis
                    </label>
                    <select
                      className="select select-bordered select-sm w-full mt-1"
                      value={formData.lop_config.basis}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lop_config: {
                            ...formData.lop_config,
                            basis: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="basic">Basic Salary</option>
                      <option value="gross">Gross Salary</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">
                      Deduction Factor
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="input input-sm input-bordered w-full mt-1"
                      value={formData.lop_config.deduction_factor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lop_config: {
                            ...formData.lop_config,
                            deduction_factor: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      1.0 = Full Day Pay
                    </p>
                  </div>
                </div>
              </div>

              {/* Components section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Allowances */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                      <Plus className="text-emerald-500 w-4 h-4" /> Allowances
                    </h3>
                    <button
                      onClick={() => addComponent("allowances")}
                      className="btn btn-xs btn-outline border-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.allowances.map((comp, idx) => (
                      <div key={idx} className="flex gap-2 animate-fade-in">
                        <input
                          className="input input-sm input-bordered flex-1"
                          placeholder="Name"
                          value={comp.name}
                          onChange={(e) => {
                            const newArr = [...formData.allowances];
                            newArr[idx].name = e.target.value;
                            setFormData({ ...formData, allowances: newArr });
                          }}
                        />
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                          <button
                            onClick={() => {
                              const newArr = [...formData.allowances];
                              newArr[idx].type = "fixed";
                              setFormData({ ...formData, allowances: newArr });
                            }}
                            className={`p-1 px-2 text-[10px] font-bold rounded-md transition-all ${comp.type === "fixed" ? "bg-white shadow-sm text-primary-600" : "text-gray-400"}`}
                          >
                            ₹
                          </button>
                          <button
                            onClick={() => {
                              const newArr = [...formData.allowances];
                              newArr[idx].type = "percentage";
                              setFormData({ ...formData, allowances: newArr });
                            }}
                            className={`p-1 px-2 text-[10px] font-bold rounded-md transition-all ${comp.type === "percentage" ? "bg-white shadow-sm text-primary-600" : "text-gray-400"}`}
                          >
                            %
                          </button>
                        </div>
                        <input
                          type="number"
                          className="input input-sm input-bordered w-20"
                          value={comp.value}
                          onChange={(e) => {
                            const newArr = [...formData.allowances];
                            newArr[idx].value = e.target.value;
                            setFormData({ ...formData, allowances: newArr });
                          }}
                        />
                        <button
                          onClick={() => removeComponent("allowances", idx)}
                          className="btn btn-sm btn-ghost text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                      <Minus className="text-red-500 w-4 h-4" /> Deductions
                    </h3>
                    <button
                      onClick={() => addComponent("deductions")}
                      className="btn btn-xs btn-outline border-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.deductions.map((comp, idx) => (
                      <div key={idx} className="flex gap-2 animate-fade-in">
                        <input
                          className="input input-sm input-bordered flex-1"
                          placeholder="Name"
                          value={comp.name}
                          onChange={(e) => {
                            const newArr = [...formData.deductions];
                            newArr[idx].name = e.target.value;
                            setFormData({ ...formData, deductions: newArr });
                          }}
                        />
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                          <button
                            onClick={() => {
                              const newArr = [...formData.deductions];
                              newArr[idx].type = "fixed";
                              setFormData({ ...formData, deductions: newArr });
                            }}
                            className={`p-1 px-2 text-[10px] font-bold rounded-md transition-all ${comp.type === "fixed" ? "bg-white shadow-sm text-primary-600" : "text-gray-400"}`}
                          >
                            ₹
                          </button>
                          <button
                            onClick={() => {
                              const newArr = [...formData.deductions];
                              newArr[idx].type = "percentage";
                              setFormData({ ...formData, deductions: newArr });
                            }}
                            className={`p-1 px-2 text-[10px] font-bold rounded-md transition-all ${comp.type === "percentage" ? "bg-white shadow-sm text-primary-600" : "text-gray-400"}`}
                          >
                            %
                          </button>
                        </div>
                        <input
                          type="number"
                          className="input input-sm input-bordered w-20"
                          value={comp.value}
                          onChange={(e) => {
                            const newArr = [...formData.deductions];
                            newArr[idx].value = e.target.value;
                            setFormData({ ...formData, deductions: newArr });
                          }}
                        />
                        <button
                          onClick={() => removeComponent("deductions", idx)}
                          className="btn btn-sm btn-ghost text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-transparent">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-10 shadow-lg shadow-primary-500/30"
                disabled={operationStatus === "loading"}
                onClick={handleSave}
              >
                {operationStatus === "loading"
                  ? "Saving..."
                  : editingGrade
                    ? "Update Grade"
                    : "Create Grade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Minus = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
  </svg>
);

export default GradeManagement;
