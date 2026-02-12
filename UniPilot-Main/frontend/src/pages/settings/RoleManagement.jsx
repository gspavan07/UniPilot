import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRoles,
  fetchPermissions,
  updateRole,
  createRole,
} from "../../store/slices/roleSlice";
import {
  Shield,
  Settings,
  Plus,
  Save,
  Loader2,
  CheckCircle2,
  Lock,
  Layout,
  Eye,
  EyeOff,
  X,
  ToggleLeft,
  ToggleRight,
  Layers,
  FileText,
} from "lucide-react";

const RoleManagement = () => {
  const dispatch = useDispatch();
  const { roles, permissions, status } = useSelector((state) => state.roles);
  const { user } = useSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localRole, setLocalRole] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("permissions"); // 'permissions' | 'forms'

  const canManage =
    user?.role === "super_admin" ||
    user?.permissions?.includes("settings:roles:manage");

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRole) {
      setLocalRole({
        ...selectedRole,
        permissionIds: selectedRole.permissions?.map((p) => p.id) || [],
      });
    }
  }, [selectedRole]);

  // --- Permission Handlers ---
  const handleTogglePermission = (permissionId) => {
    setLocalRole((prev) => {
      const exists = prev.permissionIds.includes(permissionId);
      const newIds = exists
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId];
      return { ...prev, permissionIds: newIds };
    });
  };

  const handleToggleModule = (moduleName, modulePermissionIds) => {
    setLocalRole((prev) => {
      const currentIds = prev.permissionIds;
      const allSelected = modulePermissionIds.every((id) =>
        currentIds.includes(id)
      );

      let newIds;
      if (allSelected) {
        // Deselect all
        newIds = currentIds.filter((id) => !modulePermissionIds.includes(id));
      } else {
        // Select all (add missing)
        const missing = modulePermissionIds.filter(
          (id) => !currentIds.includes(id)
        );
        newIds = [...currentIds, ...missing];
      }
      return { ...prev, permissionIds: newIds };
    });
  };

  // --- Field Config Handlers ---
  const handleToggleField = (fieldKey, attribute) => {
    setLocalRole((prev) => {
      const currentConfig = prev.field_config || {};
      const fieldConfig = currentConfig[fieldKey] || {
        visible: true,
        required: false,
      };

      return {
        ...prev,
        field_config: {
          ...currentConfig,
          [fieldKey]: {
            ...fieldConfig,
            [attribute]: !fieldConfig[attribute],
          },
        },
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateRole({
          id: localRole.id,
          data: {
            permissions: localRole.permissionIds,
            field_config: localRole.field_config,
          },
        })
      ).unwrap();
      setSelectedRole({
        ...localRole,
        permissions: permissions.filter((p) =>
          localRole.permissionIds.includes(p.id)
        ),
      });
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const commonFields = [
    { key: "student_id", label: "Student ID" },
    { key: "employee_id", label: "Employee ID" },
    { key: "aadhaar_number", label: "Aadhaar Number" },
    { key: "passport_number", label: "Passport Number" },
    { key: "religion", label: "Religion" },
    { key: "caste", label: "Caste/Category" },
    { key: "admission_number", label: "Admission Number" },
    { key: "bank_details", label: "Bank Account Detail" },
    { key: "previous_academics", label: "Academic History" },
  ];

  if (status === "loading" && roles.length === 0)
    return (
      <div className="p-10 text-center animate-pulse flex flex-col items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
        <p className="text-gray-400 font-medium">Loading Rules...</p>
      </div>
    );

  const modules = [...new Set(permissions.map((p) => p.module))];

  return (
    <div className="space-y-6 animate-fade-in pb-20 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Roles & Permissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Build specialized admin roles and fine-tune form visibility.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary shadow-lg shadow-primary-500/20 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Role
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* LEFT COLUMN: Role List */}
        <div className="lg:col-span-3 space-y-3 overflow-y-auto pr-2 no-scrollbar">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                selectedRole?.id === role.id
                  ? "bg-white dark:bg-gray-800 border-primary-500 shadow-lg ring-1 ring-primary-500/20"
                  : "bg-gray-50/50 dark:bg-gray-800/30 border-transparent hover:bg-white dark:hover:bg-gray-800 hover:shadow-md"
              }`}
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full ${selectedRole?.id === role.id ? "bg-primary-500" : "bg-transparent group-hover:bg-gray-200 dark:group-hover:bg-gray-700"} transition-colors`}
              />
              <div className="pl-2">
                <div className="flex justify-between items-start">
                  <h3
                    className={`font-bold ${selectedRole?.id === role.id ? "text-primary-700 dark:text-primary-400" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {role.name}
                  </h3>
                  {role.is_system && (
                    <Shield className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                  {role.description || "Custom role configuration"}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT COLUMN: Configuration */}
        <div className="lg:col-span-9 flex flex-col h-full overflow-hidden">
          {localRole ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full overflow-hidden">
              {/* Config Header */}
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {localRole.name}
                    </h2>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span
                        className={`px-2 py-0.5 rounded-full ${localRole.is_system ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {localRole.is_system
                          ? "System Role"
                          : "Custom Specialization"}
                      </span>
                      <span>•</span>
                      <span>
                        {localRole.permissionIds.length} Permissions Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("permissions")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${activeTab === "permissions" ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Lock className="w-3 h-3 mr-2" />
                    Access Control
                  </button>
                  <button
                    onClick={() => setActiveTab("forms")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${activeTab === "forms" ? "bg-white text-secondary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <FileText className="w-3 h-3 mr-2" />
                    Form Settings
                  </button>
                </div>

                {canManage && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary ml-4"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                )}
                {!canManage && (
                  <div className="flex items-center text-xs font-bold text-gray-400 bg-gray-100 px-3 py-2 rounded-lg ml-4">
                    <Lock className="w-3 h-3 mr-2" />
                    View Only Mode
                  </div>
                )}
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-gray-900/10">
                {activeTab === "permissions" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                    {modules.map((module) => {
                      const modulePerms = permissions.filter(
                        (p) => p.module === module
                      );
                      const modulePermIds = modulePerms.map((p) => p.id);
                      const selectedCount = modulePerms.filter((p) =>
                        localRole.permissionIds.includes(p.id)
                      ).length;
                      const isAllSelected =
                        selectedCount === modulePerms.length &&
                        modulePerms.length > 0;

                      return (
                        <div
                          key={module}
                          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-50 dark:border-gray-700/50">
                            <div className="flex items-center space-x-2">
                              <Layers className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                              <h4 className="font-bold text-sm capitalize text-gray-700 dark:text-gray-200">
                                {module}
                              </h4>
                            </div>
                            {canManage && (
                              <button
                                onClick={() =>
                                  handleToggleModule(module, modulePermIds)
                                }
                                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${isAllSelected ? "bg-primary-50 text-primary-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                              >
                                {isAllSelected ? "Deselect All" : "Select All"}
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {modulePerms.map((p) => {
                              const isGranted =
                                localRole.permissionIds.includes(p.id);
                              return (
                                <div
                                  key={p.id}
                                  onClick={() =>
                                    canManage && handleTogglePermission(p.id)
                                  }
                                  className={`flex items-center justify-between p-2 rounded-lg transition-all ${canManage ? "cursor-pointer" : "cursor-default"} ${isGranted ? "bg-primary-50/50 text-primary-700" : "hover:bg-gray-50 text-gray-500"}`}
                                >
                                  <span className="text-xs">
                                    {p.name.replace(`${module}:`, "")}
                                  </span>
                                  <div
                                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isGranted ? "bg-primary-500" : "bg-gray-300"}`}
                                  >
                                    <div
                                      className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isGranted ? "translate-x-4" : "translate-x-0"}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === "forms" && (
                  <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3 text-yellow-800">
                      <Layout className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">
                          Form Visibility Rules
                        </h4>
                        <p className="text-xs mt-1">
                          Configure which fields are hidden or mandatory for
                          this role. These settings override global defaults in
                          user registration forms.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {commonFields.map((field) => {
                        const config = localRole.field_config?.[field.key] || {
                          visible: true,
                          required: false,
                        };
                        const isVisible = config.visible !== false;
                        const isRequired = config.required === true;

                        return (
                          <div
                            key={field.key}
                            className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm"
                          >
                            <div>
                              <p className="font-bold text-sm text-gray-700 dark:text-gray-200">
                                {field.label}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                {field.key}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              {/* Visibility Toggle */}
                              <button
                                onClick={() =>
                                  canManage &&
                                  handleToggleField(field.key, "visible")
                                }
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${isVisible ? "bg-white border-gray-200 text-gray-600" : "bg-gray-50 border-transparent text-gray-400 opacity-60"}`}
                              >
                                {isVisible ? (
                                  <Eye className="w-3 h-3" />
                                ) : (
                                  <EyeOff className="w-3 h-3" />
                                )}
                                <span className="text-xs font-medium">
                                  {isVisible ? "Visible" : "Hidden"}
                                </span>
                              </button>

                              {/* Required Toggle */}
                              <button
                                onClick={() =>
                                  canManage &&
                                  handleToggleField(field.key, "required")
                                }
                                disabled={!isVisible || !canManage}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${isRequired ? "bg-error-50 border-error-200 text-error-600" : "bg-white border-gray-200 text-gray-400"}`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${isRequired ? "bg-error-500" : "bg-gray-300"}`}
                                />
                                <span className="text-xs font-medium">
                                  {isRequired ? "Required" : "Optional"}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-6">
                <Shield className="w-10 h-10 text-gray-300 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Select a Role to Configure
              </h3>
              <p className="text-gray-500 max-w-sm mt-2">
                Choose a role from the list on the left to manage its
                implementation permissions and form field rules.
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        dispatch={dispatch}
      />
    </div>
  );
};

export default RoleManagement;

const CreateRoleModal = ({ isOpen, onClose, dispatch }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(createRole({ name, description: desc })).unwrap();
      onClose();
      setName("");
      setDesc("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            New Specialization
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Role Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Library Assistant"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Briefly describe what this role does..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 flex justify-center items-center shadow-lg shadow-primary-500/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Create Role"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
