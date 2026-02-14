import React, { useState, useRef } from "react";
import { X, Plus, Minus, Asterisk, Divide, Calculator } from "lucide-react";

const RelationBuilder = ({
  currentRelation,
  childComponents = [],
  onSave,
  onClose,
}) => {
  const [relationText, setRelationText] = useState(currentRelation || "");
  const textareaRef = useRef(null);

  const operators = [
    { symbol: "+", label: "Add", icon: Plus },
    { symbol: "-", label: "Subtract", icon: Minus },
    { symbol: "*", label: "Multiply", icon: Asterisk },
    { symbol: "/", label: "Divide", icon: Divide },
    { symbol: "(", label: "Open Parenthesis" },
    { symbol: ")", label: "Close Parenthesis" },
  ];

  const functions = [
    {
      name: "Sum",
      description: "Sum of all components",
      example: "Sum(A, B, C)",
    },
    {
      name: "Average",
      description: "Average of components",
      example: "Average(A, B, C)",
    },
    { name: "Best", description: "Maximum value", example: "Best(A, B)" },
    { name: "Min", description: "Minimum value", example: "Min(A, B)" },
    {
      name: "Max",
      description: "Maximum value (alias of Best)",
      example: "Max(A, B)",
    },
  ];

  const templates = [
    {
      name: "Simple Sum",
      formula: "Component1 + Component2",
      description: "Add two components together",
    },
    {
      name: "Weighted Average",
      formula: "0.3 * Component1 + 0.7 * Component2",
      description: "30% of first, 70% of second",
    },
    {
      name: "Best of Two",
      formula: "Best(Component1, Component2)",
      description: "Take the higher score",
    },
    {
      name: "Average of All",
      formula: "Average(Component1, Component2, Component3)",
      description: "Average of multiple components",
    },
    {
      name: "Complex Weighted",
      formula: "0.8 * Best(Mid1, Mid2) + 0.2 * Average(Quiz1, Quiz2)",
      description: "80% best of mids + 20% average of quizzes",
    },
    {
      name: "Sum Multiple",
      formula: "Sum(Assignment, Objective, Descriptive)",
      description: "Sum all sub-components",
    },
  ];

  const insertText = (text, isComponent = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = relationText;

    //Wrap component names in brackets for atomic deletion
    const textToInsert = isComponent ? `[${text}]` : text;

    // Add space before if needed
    const needsSpaceBefore =
      start > 0 &&
      currentText[start - 1] !== " " &&
      currentText[start - 1] !== "(";
    const spaceBefore = needsSpaceBefore ? " " : "";

    // Add space after if needed
    const needsSpaceAfter =
      end < currentText.length &&
      currentText[end] !== " " &&
      currentText[end] !== ")";
    const spaceAfter = needsSpaceAfter ? " " : "";

    const newText =
      currentText.substring(0, start) +
      spaceBefore +
      textToInsert +
      spaceAfter +
      currentText.substring(end);

    setRelationText(newText);

    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPos =
        start + spaceBefore.length + textToInsert.length + spaceAfter.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleSave = () => {
    // Remove brackets before saving
    const cleanedText = relationText.replace(/\[([^\]]+)\]/g, "$1");
    onSave(cleanedText);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      const textarea = textareaRef.current;
      const cursorPos = textarea.selectionStart;
      const text = relationText;

      // Check if cursor is right after a closing bracket ]
      if (cursorPos > 0 && text[cursorPos - 1] === "]") {
        // Find the opening bracket
        let openBracketPos = -1;
        let bracketCount = 0;

        for (let i = cursorPos - 1; i >= 0; i--) {
          if (text[i] === "]") bracketCount++;
          if (text[i] === "[") {
            bracketCount--;
            if (bracketCount === 0) {
              openBracketPos = i;
              break;
            }
          }
        }

        if (openBracketPos !== -1) {
          e.preventDefault();
          // Delete the entire bracketed component
          const newText =
            text.substring(0, openBracketPos) + text.substring(cursorPos);
          setRelationText(newText);

          // Set cursor position
          setTimeout(() => {
            textarea.setSelectionRange(openBracketPos, openBracketPos);
            textarea.focus();
          }, 0);
        }
      }
    }
  };

  // Render formula with styled components for preview
  const renderPreview = () => {
    if (!relationText) return null;

    const parts = [];
    let lastIndex = 0;
    const regex = /\[([^\]]+)\]/g;
    let match;

    while ((match = regex.exec(relationText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: relationText.substring(lastIndex, match.index),
        });
      }

      // Add the component
      parts.push({
        type: "component",
        content: match[1],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < relationText.length) {
      parts.push({
        type: "text",
        content: relationText.substring(lastIndex),
      });
    }

    return (
      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Preview:
        </p>
        <div className="font-mono text-sm flex flex-wrap items-center gap-1">
          {parts.map((part, index) =>
            part.type === "component" ? (
              <span
                key={index}
                className="inline-flex px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700 rounded font-semibold"
              >
                {part.content}
              </span>
            ) : (
              <span key={index} className="text-black dark:text-white">
                {part.content}
              </span>
            ),
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Relation Builder
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Build mathematical relations for component calculation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Current Formula Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            Current Formula
          </label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={relationText}
              onChange={(e) => setRelationText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows="3"
              placeholder="Build your formula using the tools below..."
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
            />
            <Calculator className="absolute right-4 top-3 w-5 h-5 text-gray-400" />
          </div>

          {/* Visual Preview */}
          {renderPreview()}

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setRelationText("")}
              className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
            >
              Clear
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              💡 Tip: Press backspace after a component to delete it entirely
            </p>
          </div>
        </div>

        {/* Child Components Section */}
        {childComponents.length > 0 && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-green-900 dark:text-green-300 mb-3">
              Child Components
            </h3>
            <div className="flex flex-wrap gap-2">
              {childComponents.map((child) => (
                <button
                  key={child.id}
                  onClick={() => insertText(child.name, true)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg text-sm font-medium text-green-900 dark:text-green-300 transition-colors"
                >
                  {child.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-green-700 dark:text-green-400 mt-3">
              Click a component name to insert it into your formula
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operators */}
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white mb-3">
              Operators
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {operators.map((op) => (
                <button
                  key={op.symbol}
                  onClick={() => insertText(op.symbol)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium text-black dark:text-white transition-colors"
                >
                  {op.icon && <op.icon className="w-3.5 h-3.5" />}
                  <span>{op.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Functions */}
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white mb-3">
              Functions
            </h3>
            <div className="space-y-2">
              {functions.map((func) => (
                <button
                  key={func.name}
                  onClick={() => insertText(`${func.name}()`)}
                  className="w-full text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <div className="font-medium text-sm text-black dark:text-white">
                    {func.name}()
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {func.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-black dark:text-white mb-3">
            Common Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => setRelationText(template.formula)}
                className="text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
              >
                <div className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-1">
                  {template.name}
                </div>
                <div className="text-xs font-mono text-blue-700 dark:text-blue-400 mb-1.5 break-all">
                  {template.formula}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">
                  {template.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
            Usage Guidelines
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
            <li>• Use component names exactly as they appear in the tree</li>
            <li>
              • Combine operators (+, -, *, /) with numbers and component names
            </li>
            <li>
              • Functions take comma-separated component names: Best(Mid1, Mid2)
            </li>
            <li>• Use parentheses to control order: (A + B) * 0.5</li>
            <li>• Decimals are supported: 0.8 * Component1</li>
            <li>
              • Component names are case-sensitive and should match exactly
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Apply Relation
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationBuilder;
