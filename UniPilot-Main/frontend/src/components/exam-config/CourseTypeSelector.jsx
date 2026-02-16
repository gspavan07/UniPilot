import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  addCourseType,
  deleteCourseType,
} from "../../store/slices/examConfigSlice";
import { Plus, Trash2, GraduationCap, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const CourseTypeSelector = ({
  regulationId,
  courseTypes,
  selectedCourseType,
  onSelectCourseType,
}) => {
  const dispatch = useDispatch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeMaxMarks, setNewTypeMaxMarks] = useState(100);

  const defaultCourseTypes = [
    { name: "Theory", maxMarks: 100 },
    { name: "Lab", maxMarks: 100 },
    { name: "Integrated (Theory + Lab)", maxMarks: 100 },
    { name: "Project", maxMarks: 100 },
    { name: "Internship", maxMarks: 100 },
  ];

  const handleAddCourseType = (typeName, maxMarks) => {
    const newCourseType = {
      id: uuidv4(),
      name: typeName,
      structure: {
        id: uuidv4(),
        name: typeName,
        max_marks: maxMarks,
        relation: "",
        components: [],
      },
    };

    dispatch(addCourseType({ regulationId, courseType: newCourseType }));
    onSelectCourseType(newCourseType);
    setIsAddModalOpen(false);
    setNewTypeName("");
    setNewTypeMaxMarks(100);
  };

  const handleDeleteCourseType = (courseTypeId) => {
    if (window.confirm("Are you sure you want to delete this course type?")) {
      dispatch(deleteCourseType({ regulationId, courseTypeId }));
      if (selectedCourseType?.id === courseTypeId) {
        onSelectCourseType(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
            Course Types
          </h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {courseTypes.map((type) => (
            <div
              key={type.id}
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${selectedCourseType?.id === type.id
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              onClick={() => onSelectCourseType(type)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-sm font-medium text-black dark:text-white truncate">
                  {type.name}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourseType(type.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {courseTypes.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">
              No course types yet. Click + to add one.
            </p>
          )}
        </div>
      </div>

      {/* Quick Add Default Types */}
      {courseTypes.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide mb-3">
            Quick Add
          </h4>
          <div className="space-y-2">
            {defaultCourseTypes.map((type, idx) => (
              <button
                key={idx}
                onClick={() => handleAddCourseType(type.name, type.maxMarks)}
                className="w-full text-left px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
              >
                + {type.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Type Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black dark:text-white">
                Add Course Type
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                  Type Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Theory, Lab, Project"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                  Max Marks *
                </label>
                <input
                  type="number"
                  placeholder="100"
                  value={newTypeMaxMarks}
                  onChange={(e) => setNewTypeMaxMarks(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleAddCourseType(newTypeName, newTypeMaxMarks)
                  }
                  disabled={!newTypeName.trim()}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Type
                </button>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                Or quick add:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {defaultCourseTypes.map((type, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleAddCourseType(type.name, type.maxMarks)
                    }
                    className="px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseTypeSelector;
