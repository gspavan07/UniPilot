import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  Users,
  XCircle,
} from "lucide-react";

const RoleManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  const modules = [...new Set(permissions.map((p) => p.module))];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans text-gray-900">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Roles & Permissions
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium pl-14">
              Build specialized admin roles and fine-tune form visibility.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Role
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Role List */}
          <div className="lg:col-span-3 space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${selectedRole?.id === role.id
                  ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-100"
                  : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm"
                  }`}
              >
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${selectedRole?.id === role.id ? "bg-blue-600" : "bg-transparent group-hover:bg-gray-200"} transition-colors`}
                />
                <div className="pl-2">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`font-bold text-sm ${selectedRole?.id === role.id ? "text-blue-700" : "text-gray-900"}`}
                    >
                      {role.name}
                    </h3>
                    {role.is_system && (
                      <Shield className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {role.description || "Custom role configuration"}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT COLUMN: Configuration */}
          <div className="lg:col-span-9 flex flex-col">
            {localRole ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                {/* Config Header */}
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                        <Settings className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-gray-900">
                          {localRole.name}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold border ${localRole.is_system ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}
                          >
                            {localRole.is_system
                              ? "System Role"
                              : "Custom"}
                          </span>
                          <span>•</span>
                          <span className="font-medium">
                            {localRole.permissionIds.length} Permissions Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => setActiveTab("permissions")}
                          className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center ${activeTab === "permissions" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          <Lock className="w-3 h-3 mr-2" />
                          Access
                        </button>
                        <button
                          onClick={() => setActiveTab("forms")}
                          className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center ${activeTab === "forms" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          <FileText className="w-3 h-3 mr-2" />
                          Forms
                        </button>
                      </div>

                      {canManage && (
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-70 flex items-center"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save
                        </button>
                      )}
                      {!canManage && (
                        <div className="flex items-center text-xs font-bold text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
                          <Lock className="w-3 h-3 mr-2" />
                          View Only
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 max-h-[calc(100vh-300px)]">
                  {activeTab === "permissions" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gray-400" />
                                <h4 className="font-bold text-sm capitalize text-gray-900">
                                  {module}
                                </h4>
                              </div>
                              {canManage && (
                                <button
                                  onClick={() =>
                                    handleToggleModule(module, modulePermIds)
                                  }
                                  className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${isAllSelected ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                >
                                  {isAllSelected ? "Clear" : "All"}
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
                                    className={`flex items-center justify-between p-2 rounded-md transition-all ${canManage ? "cursor-pointer" : "cursor-default"} ${isGranted ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-600"}`}
                                  >
                                    <span className="text-xs font-medium">
                                      {p.name.replace(`${module}:`, "")}
                                    </span>
                                    <div
                                      className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isGranted ? "bg-blue-600" : "bg-gray-300"}`}
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
                    <div className="max-w-4xl mx-auto space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-blue-900">
                        <Layout className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm">
                            Form Visibility Rules
                          </h4>
                          <p className="text-xs mt-1 text-blue-700">
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
                              className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm"
                            >
                              <div>
                                <p className="font-bold text-sm text-gray-900">
                                  {field.label}
                                </p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                  {field.key}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Visibility Toggle */}
                                <button
                                  onClick={() =>
                                    canManage &&
                                    handleToggleField(field.key, "visible")
                                  }
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-bold transition-all ${isVisible ? "bg-white border-gray-200 text-gray-700" : "bg-gray-50 border-gray-100 text-gray-400 opacity-60"}`}
                                >
                                  {isVisible ? (
                                    <Eye className="w-3 h-3" />
                                  ) : (
                                    <EyeOff className="w-3 h-3" />
                                  )}
                                  <span>
                                    {isVisible ? "Show" : "Hide"}
                                  </span>
                                </button>

                                {/* Required Toggle */}
                                <button
                                  onClick={() =>
                                    canManage &&
                                    handleToggleField(field.key, "required")
                                  }
                                  disabled={!isVisible || !canManage}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-bold transition-all ${isRequired ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-gray-200 text-gray-400"}`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${isRequired ? "bg-red-600" : "bg-gray-300"}`}
                                  />
                                  <span>
                                    {isRequired ? "Req" : "Opt"}
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
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                  <Shield className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900">
                  Select a Role to Configure
                </h3>
                <p className="text-gray-500 max-w-sm mt-2 text-sm">
                  Choose a role from the list on the left to manage its
                  permissions and form field rules.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Create New Role
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
              Custom Specialization
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-gray-50/50">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Library Assistant"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Briefly describe what this role does..."
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24 resize-none"
            />
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Role"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
