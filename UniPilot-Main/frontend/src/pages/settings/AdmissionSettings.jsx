import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  Plus,
  Settings,
  Shield,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Hash,
  Globe,
} from "lucide-react";
import api from "../../utils/api";
import { toast } from "react-hot-toast";
import { ListChecks, Layout, Users2, FileCheck } from "lucide-react";

const AdmissionSettings = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [programs, setPrograms] = useState([]);
  const navigate = useNavigate();

  const fetchConfigs = async () => {
    try {
      const [configRes, programRes] = await Promise.all([
        api.get("/admission/configs"),
        api.get("/programs"),
      ]);
      setConfigs(configRes.data.data);
      setPrograms(programRes.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admission/configs", editingConfig);
      toast.success("Configuration saved successfully");
      setEditingConfig(null);
      fetchConfigs();
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        await api.delete(`/admission/configs/${id}`);
        toast.success("Configuration deleted successfully");
        fetchConfigs();
      } catch (error) {
        toast.error("Failed to delete configuration");
      }
    }
  };

  const createNew = () => {
    setEditingConfig({
      batch_year: new Date().getFullYear(),
      university_code: "B11",
      id_format: "{YY}{UNIV}{BRANCH}{SEQ}",
      temp_id_format: "T{YY}{SEQ}",
      lateral_id_format: "L{YY}{UNIV}{BRANCH}{SEQ}",
      is_active: true,
      required_documents: ["Photo ID", "10th Marksheet", "12th Marksheet"],
      seat_matrix: {},
    });
    setActiveTab("general");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className=" mx-auto px-8 pt-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700">
          {/* Back button and title row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admission")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to Admission Management"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Admission Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 pb-5">
                Configure batch parameters and ID generation rules
              </p>

            </div>
            <button
              onClick={createNew}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold text-sm shadow-lg shadow-primary-200 dark:shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>New Batch Config</span>
            </button>
          </div>

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 mt-5 gap-8">
          {configs.map((config, idx) => (
            <div
              key={config.id}
              className="border max-w-72 border-gray-200 bg-white hover:border-blue-300 transition-all rounded-xl group"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 tracking-wider">BATCH</div>
                      <div className="text-lg font-light text-black">{config.batch_year}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 text-[10px] tracking-widest font-medium ${config.is_active
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                    }`}>
                    {config.is_active ? "ACTIVE" : "INACTIVE"}
                  </div>
                </div>
              </div>

              <div className="px-4 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 tracking-wide">University Code</span>
                  </div>
                  <span className="text-sm font-medium text-black">{config.university_code}</span>
                </div>

                <div className="py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 tracking-wide">ID Format</span>
                  </div>
                  <div className="font-mono text-xs text-black bg-gray-50 px-3 py-2 border border-gray-200">
                    {config.id_format}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => setEditingConfig(config)}
                  className="flex-1 py-2 text-xs font-medium text-black border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-colors"
                >
                  Edit Configuration
                </button>
                <button
                  onClick={(e) => handleDelete(config.id, e)}
                  className="px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="border-b border-gray-200 p-8">
              <h2 className="text-3xl font-light text-black tracking-tight">
                {editingConfig.id ? "Edit Configuration" : "New Batch Configuration"}
              </h2>
            </div>

            <div className="border-b border-gray-200 flex">
              {[
                { id: "general", label: "General", icon: Settings },
                { id: "seats", label: "Seat Matrix", icon: Users2 },
                { id: "docs", label: "Documents", icon: ListChecks },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-xs tracking-widest font-medium transition-colors border-b-2 ${activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-400 hover:text-black"
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="p-8">
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs tracking-wider text-gray-500 mb-2">
                        Batch Year
                      </label>
                      <input
                        type="number"
                        value={editingConfig.batch_year}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            batch_year: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 text-black focus:outline-none focus:border-blue-600 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs tracking-wider text-gray-500 mb-2">
                        University Code
                      </label>
                      <input
                        type="text"
                        value={editingConfig.university_code}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            university_code: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 text-black focus:outline-none focus:border-blue-600 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs tracking-wider text-gray-500 mb-2">
                        ID Generation Format
                      </label>
                      <input
                        type="text"
                        value={editingConfig.id_format}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            id_format: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 font-mono text-sm text-black focus:outline-none focus:border-blue-600 transition-colors"
                        placeholder="{YY}{UNIV}{BRANCH}{SEQ}"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Available placeholders: <span className="text-blue-600 font-mono">{"{YY}"}</span>, <span className="text-blue-600 font-mono">{"{UNIV}"}</span>, <span className="text-blue-600 font-mono">{"{BRANCH}"}</span>, <span className="text-blue-600 font-mono">{"{SEQ}"}</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs tracking-wider text-gray-500 mb-2">
                        Temporary ID Format
                      </label>
                      <input
                        type="text"
                        value={editingConfig.temp_id_format || ""}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            temp_id_format: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 font-mono text-sm text-black focus:outline-none focus:border-blue-600 transition-colors"
                        placeholder="T{YY}{SEQ}"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Used for initial temporary student IDs
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs tracking-wider text-gray-500 mb-2">
                        Lateral Entry ID Format
                      </label>
                      <input
                        type="text"
                        value={editingConfig.lateral_id_format || ""}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            lateral_id_format: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 font-mono text-sm text-black focus:outline-none focus:border-blue-600 transition-colors"
                        placeholder="L{YY}{UNIV}{BRANCH}{SEQ}"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Used for lateral entry students
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <input
                        type="checkbox"
                        checked={editingConfig.is_active}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                      />
                      <span className="text-sm text-black">
                        Set as default for new registrations
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "seats" && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 mb-6">
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Define the maximum intake capacity for each program in this batch year.
                      </p>
                    </div>
                    {programs.map((program) => (
                      <div
                        key={program.id}
                        className="flex items-center justify-between py-4 border-b border-gray-100"
                      >
                        <div>
                          <div className="text-sm font-medium text-black">{program.code}</div>
                          <div className="text-xs text-gray-500 mt-1">{program.name}</div>
                        </div>
                        <input
                          type="number"
                          placeholder="0"
                          value={editingConfig.seat_matrix?.[program.id] || ""}
                          onChange={(e) =>
                            setEditingConfig({
                              ...editingConfig,
                              seat_matrix: {
                                ...editingConfig.seat_matrix,
                                [program.id]: e.target.value,
                              },
                            })
                          }
                          className="w-24 px-3 py-2 border border-gray-200 text-center text-sm text-black focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "docs" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs tracking-wider text-gray-500">
                        Required Documents
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const doc = prompt("Enter document name:");
                          if (doc) {
                            setEditingConfig({
                              ...editingConfig,
                              required_documents: [
                                ...(editingConfig.required_documents || []),
                                doc,
                              ],
                            });
                          }
                        }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Document
                      </button>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 px-3 py-2 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <p className="text-[11px] text-blue-700">
                        Accepted file types: <span className="font-semibold">PDF, JPG, JPEG, PNG</span> only
                      </p>
                    </div>
                    <div className="space-y-2">
                      {(editingConfig.required_documents || []).map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 px-4 border border-gray-200 hover:border-gray-300 group"
                        >
                          <span className="text-sm text-black">{doc}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newDocs = [...editingConfig.required_documents];
                              newDocs.splice(index, 1);
                              setEditingConfig({
                                ...editingConfig,
                                required_documents: newDocs,
                              });
                            }}
                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-6 flex gap-3 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setEditingConfig(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-black text-sm font-medium hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionSettings;
