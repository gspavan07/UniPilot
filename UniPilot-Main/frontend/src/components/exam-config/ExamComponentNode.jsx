import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  Calculator,
} from "lucide-react";

const ExamComponentNode = ({
  component,
  path,
  onEdit,
  onDelete,
  onAddChild,
  onToggleExam,
  isRoot = false,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = component.components && component.components.length > 0;
  // For root node, don't include its ID in path since we start traversal from it
  const currentPath = isRoot ? path : [...path, component.id];

  const depthColors = [
    "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10",
    "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10",
    "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10",
    "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10",
    "border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/10",
  ];

  const colorClass = depthColors[depth % depthColors.length];

  return (
    <div className={`${depth > 0 ? "ml-6" : ""}`}>
      <div
        className={`border rounded-lg p-4 mb-3 ${colorClass} transition-all hover:shadow-sm`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-0.5 p-1 rounded hover:bg-white/50 dark:hover:bg-black/20 transition-colors shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}

            {/* Component Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-black dark:text-white text-base">
                  {component.name}
                </h4>
                <span className="px-2.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {component.max_marks} marks
                </span>
                {hasChildren && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {component.components.length} sub-component
                    {component.components.length !== 1 ? "s" : ""}
                  </span>
                )}
                {component.isExam && hasChildren && (
                  <span className="px-2.5 py-0.5 bg-blue-600 dark:bg-blue-500 rounded-full text-xs font-semibold text-white">
                    Conducted Exam
                  </span>
                )}
              </div>

              {/* Exam Toggle - Only for parent nodes */}
              {hasChildren && !isRoot && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={component.isExam || false}
                        onChange={(e) =>
                          onToggleExam(currentPath, e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 peer-checked:dark:bg-blue-500 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Mark as Conducted Exam
                    </span>
                  </label>
                </div>
              )}

              {/* Relation Formula */}
              {component.relation && (
                <div className="flex items-start gap-2 mt-2">
                  <Calculator className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Calculation:
                    </p>
                    <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 font-mono text-blue-700 dark:text-blue-300 block">
                      {component.relation}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onAddChild(component, currentPath)}
              className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              title="Add sub-component"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(component, currentPath)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              title="Edit component"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {!isRoot && (
              <button
                onClick={() => onDelete(currentPath)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                title="Delete component"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Child Components */}
      {hasChildren && isExpanded && (
        <div className="border-l-2 border-gray-200 dark:border-gray-700 pl-2">
          {component.components.map((child) => (
            <ExamComponentNode
              key={child.id}
              component={child}
              path={currentPath}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onToggleExam={onToggleExam}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamComponentNode;
