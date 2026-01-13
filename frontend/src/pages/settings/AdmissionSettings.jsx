import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Settings,
  Shield,
  Trash2,
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
    e.stopPropagation(); // Prevent opening edit modal
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
      is_active: true,
      required_documents: ["Photo ID", "10th Marksheet", "12th Marksheet"],
      field_config: {
        personal: {
          first_name: { visible: true, required: true },
          last_name: { visible: true, required: true },
          email: { visible: true, required: true },
          phone: { visible: true, required: true },
          date_of_birth: { visible: true, required: true },
          gender: { visible: true, required: true },
          nationality: { visible: true, required: true },
          religion: { visible: true, required: false },
          caste: { visible: true, required: false },
          aadhaar_number: { visible: true, required: false },
          passport_number: { visible: true, required: false },
        },
        academic: {
          department_id: { visible: true, required: true },
          program_id: { visible: true, required: true },
          batch_year: { visible: true, required: true },
          admission_type: { visible: true, required: true },
        },
        family: {
          father_name: { visible: true, required: true },
          mother_name: { visible: true, required: true },
        },
        custom: {},
      },
      seat_matrix: {},
    });
    setActiveTab("general");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
            Admission Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure automatic ID generation and batch settings
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs.map((config) => (
          <div
            key={config.id}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
              <Settings className="w-20 h-20" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <Calendar className="w-6 h-6" />
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  config.is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {config.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Batch Year {config.batch_year}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Globe className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-500">Univ Code:</span>
                <span className="ml-auto font-bold text-gray-900 dark:text-gray-200">
                  {config.university_code}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Hash className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-500">ID Format:</span>
                <span className="ml-auto font-mono text-xs bg-gray-50 dark:bg-gray-900 p-1 px-2 rounded border border-gray-100 dark:border-gray-700">
                  {config.id_format}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700 flex space-x-2">
              <button
                onClick={() => setEditingConfig(config)}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-bold text-xs"
              >
                Edit Config
              </button>
              <button
                onClick={(e) => handleDelete(config.id, e)}
                className="px-3 py-2 bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 rounded-xl hover:bg-error-100 dark:hover:bg-error-900/40 transition-all"
                title="Delete Config"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingConfig && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {editingConfig.id ? "Edit Config" : "New Batch Config"}
            </h2>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 mb-6 -mx-8 px-8 overflow-x-auto no-scrollbar">
              {[
                { id: "general", label: "General", icon: Settings },
                { id: "seats", label: "Seats", icon: Users2 },
                { id: "docs", label: "Documents", icon: ListChecks },
                { id: "fields", label: "Fields", icon: Layout },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-4 border-b-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
            >
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">
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
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">
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
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">
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
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-mono text-sm"
                      placeholder="{YY}{UNIV}{BRANCH}{SEQ}"
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-2 px-1">
                      Placeholders:{" "}
                      <span className="text-primary-500 font-bold">
                        {"{YY}"}
                      </span>
                      ,{" "}
                      <span className="text-primary-500 font-bold">
                        {"{UNIV}"}
                      </span>
                      ,{" "}
                      <span className="text-primary-500 font-bold">
                        {"{BRANCH}"}
                      </span>
                      ,{" "}
                      <span className="text-primary-500 font-bold">
                        {"{SEQ}"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">
                      Temp ID Generation Format
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
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-mono text-sm"
                      placeholder="T{YY}{SEQ}"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 px-1">
                      Same placeholders supported. Used for initial temporary
                      IDs.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 py-2">
                    <input
                      type="checkbox"
                      checked={editingConfig.is_active}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Default for new registrations
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "seats" && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl mb-4">
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-relaxed">
                      Define the maximum intake capacity for each branch/program
                      in this batch.
                    </p>
                  </div>
                  {programs.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {program.code}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {program.name}
                        </p>
                      </div>
                      <input
                        type="number"
                        placeholder="Seats"
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
                        className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "docs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
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
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Doc
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editingConfig.required_documents || []).map(
                      (doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl group"
                        >
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {doc}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newDocs = [
                                ...editingConfig.required_documents,
                              ];
                              newDocs.splice(index, 1);
                              setEditingConfig({
                                ...editingConfig,
                                required_documents: newDocs,
                              });
                            }}
                            className="p-1.5 text-gray-400 hover:text-error-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeTab === "fields" && (
                <div className="space-y-6">
                  {["personal", "academic", "family", "history", "custom"].map(
                    (section) => (
                      <div key={section} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-primary-100 dark:border-primary-900 pb-1">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
                            {section} Fields
                          </h4>
                          {section === "custom" && (
                            <button
                              type="button"
                              onClick={() => {
                                const label = prompt(
                                  "Field Label (e.g. Blood Group):"
                                );
                                if (label) {
                                  const key = label
                                    .toLowerCase()
                                    .replace(/\s+/g, "_");
                                  setEditingConfig({
                                    ...editingConfig,
                                    field_config: {
                                      ...editingConfig.field_config,
                                      custom: {
                                        ...editingConfig.field_config.custom,
                                        [key]: {
                                          label,
                                          visible: true,
                                          required: false,
                                          type: "text",
                                        },
                                      },
                                    },
                                  });
                                }
                              }}
                              className="text-[10px] font-bold text-primary-600 flex items-center"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Custom
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.keys(
                            editingConfig.field_config?.[section] || {}
                          ).map((field) => (
                            <div
                              key={field}
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-xl group"
                            >
                              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 capitalize">
                                {editingConfig.field_config[section][field]
                                  .label || field.replace(/_/g, " ")}
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current =
                                      editingConfig.field_config[section][field]
                                        .visible;
                                    setEditingConfig({
                                      ...editingConfig,
                                      field_config: {
                                        ...editingConfig.field_config,
                                        [section]: {
                                          ...editingConfig.field_config[
                                            section
                                          ],
                                          [field]: {
                                            ...editingConfig.field_config[
                                              section
                                            ][field],
                                            visible: !current,
                                          },
                                        },
                                      },
                                    });
                                  }}
                                  className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                                    editingConfig.field_config[section][field]
                                      .visible
                                      ? "bg-primary-600 text-white"
                                      : "bg-gray-200 text-gray-400"
                                  }`}
                                  title="Toggle Visibility"
                                >
                                  <Layout className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current =
                                      editingConfig.field_config[section][field]
                                        .required;
                                    setEditingConfig({
                                      ...editingConfig,
                                      field_config: {
                                        ...editingConfig.field_config,
                                        [section]: {
                                          ...editingConfig.field_config[
                                            section
                                          ],
                                          [field]: {
                                            ...editingConfig.field_config[
                                              section
                                            ][field],
                                            required: !current,
                                          },
                                        },
                                      },
                                    });
                                  }}
                                  className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                                    editingConfig.field_config[section][field]
                                      .required
                                      ? "bg-amber-500 text-white"
                                      : "bg-gray-200 text-gray-400"
                                  }`}
                                  title="Toggle Required"
                                >
                                  <Shield className="w-3 h-3" />
                                </button>
                                {section === "custom" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newConfig = {
                                        ...editingConfig.field_config.custom,
                                      };
                                      delete newConfig[field];
                                      setEditingConfig({
                                        ...editingConfig,
                                        field_config: {
                                          ...editingConfig.field_config,
                                          custom: newConfig,
                                        },
                                      });
                                    }}
                                    className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-error-50 hover:text-error-500 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="flex space-x-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingConfig(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-bold text-sm shadow-lg shadow-primary-200 dark:shadow-none disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Config"}
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
