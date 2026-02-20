import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Award } from "lucide-react";
import ExamConfigurationManager from "./ExamConfigurationManager";
import GradeScaleManager from "./GradeScaleManager";

const RegulationConfigManager = () => {
  const { regulationId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("exam");

  const tabs = [
    {
      id: "exam",
      label: "Exam Configuration",
      icon: Settings,
      description: "Configure exam structure and components",
    },
    {
      id: "grades",
      label: "Grade Scale",
      icon: Award,
      description: "Define grading criteria and points",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/regulations")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Regulations</span>
          </button>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Regulation Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure exam structure and grading scale for this regulation
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 p-2">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all ${activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div
                    className={`text-xs ${activeTab === tab.id
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-500"
                      }`}
                  >
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === "exam" && (
            <div className="animate-fadeIn">
              <ExamConfigurationManager embedded={true} />
            </div>
          )}
          {activeTab === "grades" && (
            <div className="animate-fadeIn">
              <GradeScaleManager embedded={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegulationConfigManager;
