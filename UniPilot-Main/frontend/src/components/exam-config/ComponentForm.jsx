import React, { useState, useEffect } from "react";
import { X, HelpCircle } from "lucide-react";
import RelationBuilder from "./RelationBuilder";
import { v4 as uuidv4 } from "uuid";

const ComponentForm = ({ component, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: component?.id || uuidv4(),
    name: component?.name || "",
    max_marks: component?.max_marks || 0,
    relation: component?.relation || "",
    components: component?.components || [],
  });

  const [isRelationBuilderOpen, setIsRelationBuilderOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleRelationSave = (relation) => {
    setFormData({ ...formData, relation });
    setIsRelationBuilderOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              {component ? "Edit Component" : "Add Component"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Component Name */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                Component Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g., Internal, Mid 1, Assignment"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Marks */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                Maximum Marks *
              </label>
              <input
                required
                type="number"
                min="0"
                placeholder="100"
                value={formData.max_marks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_marks: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Relation Formula */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Calculation Relation
                </label>
                <button
                  type="button"
                  onClick={() => setIsRelationBuilderOpen(true)}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Use Relation Builder
                </button>
              </div>
              <textarea
                rows="3"
                placeholder="e.g., 0.8 * Best(Mid 1, Mid 2) + 0.2 * Other&#10;or: Sum(Assignment, Objective, Descriptive)&#10;or: Average(Component1, Component2)"
                value={formData.relation}
                onChange={(e) =>
                  setFormData({ ...formData, relation: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Define how sub-components are combined. Leave empty if this is
                  a leaf component. Use component names, math operators (+, -,
                  *, /), and functions (Sum, Average, Best, Min, Max).
                </span>
              </p>
            </div>

            {/* Example Relations */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide mb-2">
                Example Relations
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="text-blue-700 dark:text-blue-300">
                  <span className="opacity-60">• Simple sum:</span> Internal +
                  External
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  <span className="opacity-60">• Weighted average:</span> 0.3 *
                  Internal + 0.7 * External
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  <span className="opacity-60">• Best of two:</span> Best(Mid 1,
                  Mid 2)
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  <span className="opacity-60">• Complex:</span> 0.8 * Best(Mid
                  1, Mid 2) + 0.2 * Average(Quiz 1, Quiz 2)
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  <span className="opacity-60">• Sum function:</span>{" "}
                  Sum(Assignment, Objective, Descriptive)
                </div>
              </div>
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
                {component ? "Save Changes" : "Add Component"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Relation Builder Modal */}
      {isRelationBuilderOpen && (
        <RelationBuilder
          currentRelation={formData.relation}
          childComponents={formData.components || []}
          onSave={handleRelationSave}
          onClose={() => setIsRelationBuilderOpen(false)}
        />
      )}
    </>
  );
};

export default ComponentForm;
