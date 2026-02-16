import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGradeScale,
  deleteGrade,
  clearError,
} from "../../store/slices/gradeScaleSlice";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import GradeForm from "../../components/grade-scale/GradeForm";
import GradeTemplates from "../../components/grade-scale/GradeTemplates";

const GradeScaleManager = ({ embedded = false }) => {
  const { regulationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { grades, status, error } = useSelector((state) => state.gradeScale);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);

  useEffect(() => {
    dispatch(fetchGradeScale(regulationId));
  }, [dispatch, regulationId]);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  const handleDelete = async (gradeId) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      await dispatch(deleteGrade({ regulationId, gradeId }));
    }
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGrade(null);
  };

  // Sort grades by max marks in descending order
  const sortedGrades = [...grades].sort((a, b) => b.max - a.max);

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${embedded ? "" : "p-6"}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header - hidden when embedded */}
        {!embedded && (
          <div className="mb-6">
            <button
              onClick={() => navigate("/academics/regulations")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Regulations</span>
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  Grade Scale Configuration
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Define grading criteria and grade points for this regulation
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsTemplatesOpen(true)}
                  className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors"
                >
                  Use Template
                </button>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Grade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons for embedded mode */}
        {embedded && (
          <div className="mb-6 flex justify-end gap-3">
            <button
              onClick={() => setIsTemplatesOpen(true)}
              className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors"
            >
              Use Template
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Grade
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {status === "loading" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Loading grade scale...
            </p>
          </div>
        )}

        {/* Empty State */}
        {status === "succeeded" && grades.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              No Grades Defined
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding grades or use a template to quickly set up your
              grading scale
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsTemplatesOpen(true)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Use Template
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add First Grade
              </button>
            </div>
          </div>
        )}

        {/* Grade Scale Table */}
        {status === "succeeded" && grades.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Min Marks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Max Marks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Grade Points
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedGrades.map((grade) => (
                    <tr
                      key={grade.grade}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg font-bold text-lg">
                          {grade.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {grade.desc || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">
                        {grade.min_per}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">
                        {grade.max_per}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          {grade.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(grade)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Edit grade"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(grade.id)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                            title="Delete grade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statistics */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Total Grades
                  </p>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {grades.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Range Coverage
                  </p>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {Math.min(...grades.map((g) => g.min_per))} -{" "}
                    {Math.max(...grades.map((g) => g.max_per))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isFormOpen && (
        <GradeForm
          regulationId={regulationId}
          grade={editingGrade}
          onClose={handleCloseForm}
        />
      )}

      {isTemplatesOpen && (
        <GradeTemplates
          regulationId={regulationId}
          onClose={() => setIsTemplatesOpen(false)}
        />
      )}
    </div>
  );
};

export default GradeScaleManager;
