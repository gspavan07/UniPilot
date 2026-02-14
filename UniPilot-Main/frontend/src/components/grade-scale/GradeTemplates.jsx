import React from "react";
import { useDispatch } from "react-redux";
import { updateGradeScale } from "../../store/slices/gradeScaleSlice";
import { X, CheckCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const GradeTemplates = ({ regulationId, onClose }) => {
  const dispatch = useDispatch();

  const templates = [
    {
      name: "10-Point Scale",
      description: "Standard 10-point grading scale (O to F)",
      grades: [
        {
          grade: "O",
          description: "Outstanding",
          min: 90,
          max: 100,
          points: 10,
        },
        { grade: "A+", description: "Excellent", min: 80, max: 89, points: 9 },
        { grade: "A", description: "Very Good", min: 70, max: 79, points: 8 },
        { grade: "B+", description: "Good", min: 60, max: 69, points: 7 },
        {
          grade: "B",
          description: "Above Average",
          min: 55,
          max: 59,
          points: 6,
        },
        { grade: "C", description: "Average", min: 50, max: 54, points: 5 },
        { grade: "P", description: "Pass", min: 40, max: 49, points: 4 },
        { grade: "F", description: "Fail", min: 0, max: 39, points: 0 },
      ],
    },
    {
      name: "Letter Grades (A-F)",
      description: "Simple A to F grading system",
      grades: [
        {
          grade: "A",
          description: "Excellent",
          min: 90,
          max: 100,
          points: 4.0,
        },
        { grade: "B", description: "Good", min: 80, max: 89, points: 3.0 },
        { grade: "C", description: "Average", min: 70, max: 79, points: 2.0 },
        {
          grade: "D",
          description: "Below Average",
          min: 60,
          max: 69,
          points: 1.0,
        },
        { grade: "F", description: "Fail", min: 0, max: 59, points: 0.0 },
      ],
    },
    {
      name: "Plus/Minus System",
      description: "Detailed grading with + and - modifiers",
      grades: [
        {
          grade: "A+",
          description: "Excellent",
          min: 95,
          max: 100,
          points: 4.0,
        },
        { grade: "A", description: "Excellent", min: 90, max: 94, points: 3.7 },
        {
          grade: "B+",
          description: "Very Good",
          min: 85,
          max: 89,
          points: 3.3,
        },
        { grade: "B", description: "Good", min: 80, max: 84, points: 3.0 },
        {
          grade: "C+",
          description: "Above Average",
          min: 75,
          max: 79,
          points: 2.7,
        },
        { grade: "C", description: "Average", min: 70, max: 74, points: 2.3 },
        {
          grade: "D",
          description: "Below Average",
          min: 60,
          max: 69,
          points: 1.0,
        },
        { grade: "F", description: "Fail", min: 0, max: 59, points: 0.0 },
      ],
    },
    {
      name: "Pass/Fail",
      description: "Binary grading system",
      grades: [
        { grade: "P", description: "Pass", min: 50, max: 100, points: 1 },
        { grade: "F", description: "Fail", min: 0, max: 49, points: 0 },
      ],
    },
  ];

  const handleSelectTemplate = async (template) => {
    const gradeScale = template.grades.map((g) => ({
      ...g,
      id: uuidv4(),
    }));

    await dispatch(
      updateGradeScale({
        regulationId,
        grade_scale: gradeScale,
      }),
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Grade Scale Templates
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose a pre-defined template to quickly set up your grading scale
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {template.description}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>

              <div className="space-y-1.5">
                {template.grades.map((grade, gradeIndex) => (
                  <div
                    key={gradeIndex}
                    className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded"
                  >
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {grade.grade}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {grade.min}-{grade.max}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {grade.points} pts
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Click to apply this template
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradeTemplates;
