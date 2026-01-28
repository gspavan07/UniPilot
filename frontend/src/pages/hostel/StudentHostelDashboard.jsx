import React, { useState } from "react";
import { Shield, Wrench, Home } from "lucide-react";
import GatePassManagement from "./GatePassManagement";
import HostelComplaints from "./HostelComplaints";

const StudentHostelDashboard = () => {
  const [activeTab, setActiveTab] = useState("gate-pass");

  const tabs = [
    {
      id: "gate-pass",
      label: "Gate Pass",
      icon: Shield,
      component: <GatePassManagement />,
    },
    {
      id: "complaints",
      label: "Complaints",
      icon: Wrench,
      component: <HostelComplaints />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl">
            <Home className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
              My Hostel
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Manage your outings and maintenance requests in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white dark:bg-gray-800 rounded-2xl w-fit shadow-sm border border-gray-100 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white dark:bg-gray-700 shadow-md transform scale-105"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 mr-2 ${activeTab === tab.id ? "text-white" : "text-gray-400"}`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {tabs.find((t) => t.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default StudentHostelDashboard;
