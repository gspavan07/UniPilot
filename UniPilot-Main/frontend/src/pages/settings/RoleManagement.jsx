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
  Lock,
  Layout,
  Eye,
  EyeOff,
  Layers,
  FileText,
  XCircle,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const RoleManagement = () => {
  const dispatch = useDispatch();
  const { roles, permissions, status } = useSelector((state) => state.roles);
  const { user } = useSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canManage =
    user?.role === "super_admin" ||
    user?.permissions?.includes("settings:roles:manage");

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsEditOpen(true);
  };

  if (status === "loading" && roles.length === 0)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium animate-pulse">
            Loading roles...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans text-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  Role Management
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  Configure access levels and form visibility for your team.
                </p>
              </div>
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 group"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              Create New Role
            </button>
          )}
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onClick={() => handleEditRole(role)}
            />
          ))}
          {canManage && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all group min-h-[200px]"
            >
              <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-500 group-hover:text-blue-700">
                Add Custom Role
              </span>
            </button>
          )}
        </div>

        {/* Modals */}
        {isEditOpen && selectedRole && (
          <EditRoleModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            role={selectedRole}
            permissions={permissions}
            canManage={canManage}
            dispatch={dispatch}
          />
        )}

        <CreateRoleModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
};

const RoleCard = ({ role, onClick }) => {
  const permCount = role.permissions?.length || 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]"
    >
      <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-blue-600 transition-all duration-300" />

      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </div>
          {role.is_system ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-100">
              <Shield className="w-3 h-3" />
              System
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-blue-100">
              Custom
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
          {role.name}
        </h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
          {role.description ||
            "Manage permissions and specialized visibility for this role."}
        </p>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">
            {permCount} Permissions
          </span>
        </div>
        <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
          <MoreVertical className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

const EditRoleModal = ({
  isOpen,
  onClose,
  role,
  permissions,
  canManage,
  dispatch,
}) => {
  const [activeTab, setActiveTab] = useState("permissions");
  const [saving, setSaving] = useState(false);
  const [localRole, setLocalRole] = useState({
    ...role,
    permissionIds: role.permissions?.map((p) => p.id) || [],
  });

  const modules = [...new Set(permissions.map((p) => p.module))];

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
        currentIds.includes(id),
      );

      let newIds;
      if (allSelected) {
        newIds = currentIds.filter((id) => !modulePermissionIds.includes(id));
      } else {
        const missing = modulePermissionIds.filter(
          (id) => !currentIds.includes(id),
        );
        newIds = [...currentIds, ...missing];
      }
      return { ...prev, permissionIds: newIds };
    });
  };

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
        }),
      ).unwrap();
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="px-8 pt-8 pb-6 bg-white border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">
                    {localRole.name}
                  </h2>
                  {localRole.is_system && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md border border-indigo-100">
                      System Role
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-1 max-w-md line-clamp-1">
                  {localRole.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setActiveTab("permissions")}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === "permissions" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  PERMISSIONS
                </button>
                <button
                  onClick={() => setActiveTab("forms")}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === "forms" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  FORM RULES
                </button>
              </div>

              <div className="h-8 w-[1px] bg-gray-200 hidden md:block" />

              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
          <div className="max-w-5xl mx-auto">
            {activeTab === "permissions" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => {
                  const modulePerms = permissions.filter(
                    (p) => p.module === module,
                  );
                  const modulePermIds = modulePerms.map((p) => p.id);
                  const selectedCount = modulePerms.filter((p) =>
                    localRole.permissionIds.includes(p.id),
                  ).length;
                  const isAllSelected =
                    selectedCount === modulePerms.length &&
                    modulePerms.length > 0;

                  return (
                    <div
                      key={module}
                      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <div className="px-5 py-4 bg-gray-50/50 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">
                            {module}
                          </h4>
                        </div>
                        {canManage && (
                          <button
                            onClick={() =>
                              handleToggleModule(module, modulePermIds)
                            }
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all ${isAllSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-gray-400 border border-gray-200 hover:bg-gray-50"}`}
                          >
                            {isAllSelected ? "SELECTED" : "SELECT ALL"}
                          </button>
                        )}
                      </div>
                      <div className="p-4 space-y-1">
                        {modulePerms.map((p) => {
                          const isGranted = localRole.permissionIds.includes(
                            p.id,
                          );
                          return (
                            <div
                              key={p.id}
                              onClick={() =>
                                canManage && handleTogglePermission(p.id)
                              }
                              className={`group flex items-center justify-between p-3 rounded-xl transition-all ${canManage ? "cursor-pointer" : "cursor-default"} ${isGranted ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                            >
                              <span
                                className={`text-xs font-bold capitalize transition-colors ${isGranted ? "text-blue-700" : "text-gray-500"}`}
                              >
                                {p.name
                                  .replace(`${module}:`, "")
                                  .replace(/_/g, " ")}
                              </span>
                              <div
                                className={`w-10 h-5 rounded-full p-1 transition-all duration-300 ${isGranted ? "bg-blue-600" : "bg-gray-200"}`}
                              >
                                <div
                                  className={`w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-300 ${isGranted ? "translate-x-5" : "translate-x-0"}`}
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
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-blue-600 rounded-3xl p-8 flex items-center gap-6 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                    <Layout className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Visibility Rules</h4>
                    <p className="text-blue-100 text-sm mt-1 max-w-xl">
                      Configure granular field accessibility for this role.
                      Hidden fields won't appear in intake forms, while
                      mandatory fields enforce data entry.
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
                        className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                      >
                        <div>
                          <p className="font-black text-xs text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">
                            {field.key.replace(/_/g, " ")}
                          </p>
                          <p className="font-bold text-gray-900">
                            {field.label}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              canManage &&
                              handleToggleField(field.key, "visible")
                            }
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black transition-all ${isVisible ? "bg-gray-50 border-gray-100 text-gray-900" : "bg-red-50 border-red-100 text-red-600"}`}
                          >
                            {isVisible ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                            {isVisible ? "ACTIVE" : "HIDDEN"}
                          </button>

                          <button
                            onClick={() =>
                              canManage &&
                              handleToggleField(field.key, "required")
                            }
                            disabled={!isVisible || !canManage}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black transition-all ${isRequired ? "bg-orange-50 border-orange-100 text-orange-600" : "bg-white border-gray-100 text-gray-400"} disabled:opacity-30`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${isRequired ? "bg-orange-600 animate-pulse" : "bg-gray-300"}`}
                            />
                            {isRequired ? "REQUIRED" : "OPTIONAL"}
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

        {/* Modal Footer */}
        <div className="px-8 py-6 bg-white border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs font-medium">
              Changes will take effect immediately for all users in this role.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl text-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            {canManage && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-70 flex items-center group active:scale-95"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                )}
                SAVE CONFIGURATION
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">New Role</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
              TEAM SPECIFICATION
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Role Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Project Manager"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Description
            </label>
            <textarea
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Briefly describe what this role does..."
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none h-32 resize-none"
            />
          </div>
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl text-sm hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl text-sm hover:bg-blue-700 transition-all flex items-center justify-center shadow-xl shadow-blue-200 disabled:opacity-70 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "CREATE ROLE"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleManagement;
