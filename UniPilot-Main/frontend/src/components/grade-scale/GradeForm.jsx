import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addGrade, updateGrade } from "../../store/slices/gradeScaleSlice";
import { X, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const GradeForm = ({ regulationId, grade, onClose }) => {
  const dispatch = useDispatch();
  const { grades } = useSelector((state) => state.gradeScale);

  const [formData, setFormData] = useState({
    id: grade?.id || uuidv4(),
    grade: grade?.grade || "",
    description: grade?.description || "",
    min: grade?.min ?? "",
    max: grade?.max ?? "",
    points: grade?.points ?? "",
  });

  const [validationError, setValidationError] = useState("");

  const validateRange = () => {
    const min = Number(formData.min);
    const max = Number(formData.max);

    if (min >= max) {
      return "Minimum marks must be less than maximum marks";
    }

    // Check for overlapping ranges (exclude current grade if editing)
    for (const existingGrade of grades) {
      if (grade && existingGrade.id === grade.id) continue;

      if (
        (min <= existingGrade.max && max >= existingGrade.min) ||
        (existingGrade.min <= max && existingGrade.max >= min)
      ) {
        return `Range overlaps with grade "${existingGrade.grade}" (${existingGrade.min}-${existingGrade.max})`;
      }
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    const error = validateRange();
    if (error) {
      setValidationError(error);
      return;
    }

    const gradeData = {
      ...formData,
      min: Number(formData.min),
      max: Number(formData.max),
      points: Number(formData.points),
    };

    if (grade) {
      // Edit existing grade
      await dispatch(
        updateGrade({
          regulationId,
          gradeId: grade.id,
          grade: gradeData,
        }),
      );
    } else {
      // Add new grade
      await dispatch(
        addGrade({
          regulationId,
          grade: gradeData,
        }),
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {grade ? "Edit Grade" : "Add Grade"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-900 dark:text-red-300">
              {validationError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
              Grade *
            </label>
            <input
              required
              type="text"
              placeholder="e.g., A+, A, B+"
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g., Outstanding, Excellent"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min and Max Marks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                Min Marks *
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={formData.min}
                onChange={(e) =>
                  setFormData({ ...formData, min: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                Max Marks *
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="100"
                value={formData.max}
                onChange={(e) =>
                  setFormData({ ...formData, max: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Grade Points */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
              Grade Points *
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="10"
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              {grade ? "Save Changes" : "Add Grade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeForm;
