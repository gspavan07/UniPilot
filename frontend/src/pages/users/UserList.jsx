import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  createUser,
  updateUser,
  fetchUserStats,
} from "../../store/slices/userSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchRoles } from "../../store/slices/roleSlice";
import UserForm from "./UserForm";
import BulkImportModal from "./BulkImportModal";
import { Plus, Search, Edit2, Trash2, Loader2, SearchX } from "lucide-react";

const UserList = ({ role: forcedRole }) => {
  const dispatch = useDispatch();
  const {
    users,
    status: userStatus,
    error: userError,
    userStats,
  } = useSelector((state) => state.users);
  const { departments } = useSelector((state) => state.departments);
  const { programs } = useSelector((state) => state.programs);
  const { roles } = useSelector((state) => state.roles);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(forcedRole || "");
  const [deptFilter, setDeptFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
    dispatch(fetchUserStats());
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchUsers({
          search: searchTerm,
          role: forcedRole || roleFilter,
          department_id: deptFilter,
        })
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, roleFilter, deptFilter, forcedRole]);

  // Dynamic Content based on forced role
  const getPageTitle = () => {
    if (forcedRole === "faculty") return "Faculty Directory";
    if (forcedRole === "staff") return "Staff Directory";
    if (forcedRole === "admin") return "Administrator Directory";
    return "User Directory";
  };

  const getPageDesc = () => {
    if (forcedRole === "faculty")
      return "Manage teaching assignments, professional profiles, and staff details.";
    if (forcedRole === "staff")
      return "Manage administrative and operational staff records.";
    if (forcedRole === "admin")
      return "Manage system configurations and administrative access.";
    return "Manage profiles for faculty and administrative staff.";
  };

  const handleDeleteUser = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this user? This action cannot be undone."
      )
    ) {
      await dispatch(deleteUser(id));
    }
  };

  const handleSave = async (formData) => {
    if (selectedUser) {
      await dispatch(
        updateUser({ id: selectedUser.id, data: formData })
      ).unwrap();
    } else {
      await dispatch(createUser(formData)).unwrap();
    }
  };

  const openAddForm = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const openEditForm = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="badge bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400">
            Admin
          </span>
        );
      case "faculty":
        return (
          <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
            Faculty
          </span>
        );
      case "staff":
        return (
          <span className="badge bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400">
            Staff
          </span>
        );
      case "student":
        return (
          <span className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400">
            Student
          </span>
        );
      default:
        return (
          <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            {role}
          </span>
        );
    }
  };

  const { user: currentUser, accessToken } = useSelector((state) => state.auth);

  // Permission Logic
  const canCreate = (() => {
    let roleSlug = currentUser?.role_data?.slug;

    if (!roleSlug && currentUser?.role_id && roles.length > 0) {
      const r = roles.find((role) => role.id === currentUser.role_id);
      if (r) roleSlug = r.slug;
    }

    if (!roleSlug) roleSlug = currentUser?.role || "";

    roleSlug = roleSlug.toLowerCase();

    const isSystemAdmin = roleSlug === "admin" || roleSlug === "super_admin";

    if (isSystemAdmin) return true;
    if (roleSlug.includes("hr")) {
      return true;
    }
    return false;
  })();

  // Check if current user can manage a specific target user
  const canManageUser = (targetUser) => {
    let myRoleSlug = currentUser?.role_data?.slug;
    if (!myRoleSlug && currentUser?.role_id && roles.length > 0) {
      const r = roles.find((role) => role.id === currentUser.role_id);
      if (r) myRoleSlug = r.slug;
    }
    if (!myRoleSlug) myRoleSlug = currentUser?.role || "";
    myRoleSlug = myRoleSlug.toLowerCase();

    const targetRole = (targetUser?.role || "").toLowerCase();
    const isSystemAdmin =
      myRoleSlug === "admin" || myRoleSlug === "super_admin";

    if (isSystemAdmin) return true;

    // HR: Manage Employees only
    if (myRoleSlug.includes("hr")) {
      return targetRole !== "student";
    }

    // HOD: Manage Dept Users (Student, Faculty, Staff)
    if (myRoleSlug === "hod") {
      const allowedTargets = ["faculty", "staff"];
      if (allowedTargets.includes(targetRole)) {
        return currentUser.department_id === targetUser.department_id;
      }
      return false;
    }

    return false;
  };

  const getProfileImageUrl = (user) => {
    if (user.profile_picture) {
      if (user.profile_picture.startsWith("http")) return user.profile_picture;
      return `${user.profile_picture}?token=${accessToken}`;
    }
    return `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random&size=128`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {getPageTitle()}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {getPageDesc()}
          </p>
        </div>
        {(canCreate || currentUser?.role === "super_admin") && (
          <div className="flex gap-3">
            {canCreate && (
              <>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="btn btn-secondary flex items-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Bulk Import
                </button>
                <button
                  onClick={openAddForm}
                  className="btn btn-primary flex items-center shadow-lg shadow-primary-500/20"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {forcedRole
                    ? `Register ${forcedRole.charAt(0).toUpperCase() + forcedRole.slice(1)}`
                    : "Register User"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userStats
          ?.filter((stat) => !forcedRole || stat.role === forcedRole)
          .map((stat) => (
            <div
              key={stat.role}
              className="card p-4 border border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Total {stat.role}s
              </p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.count}
              </h4>
            </div>
          )) || (
          <div className="col-span-4 h-16 bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-2xl" />
        )}
      </div>

      {/* Filters Bar */}
      <div className="card p-2 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 pl-10 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {!forcedRole && (
          <>
            <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 hidden md:block" />
            <select
              className="bg-transparent border-none focus:ring-0 text-sm py-2 px-4 dark:text-white cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles
                .filter((role) => role.slug !== "student")
                .map((role) => (
                  <option key={role.id} value={role.slug}>
                    {role.name}
                  </option>
                ))}
            </select>
          </>
        )}
        <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 hidden md:block" />
        <select
          className="bg-transparent border-none focus:ring-0 text-sm py-2 px-4 dark:text-white cursor-pointer"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.code}
            </option>
          ))}
        </select>
      </div>

      {/* Directory Content */}
      <div className="card overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300">
        {userStatus === "loading" && users.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Syncing directory...</p>
          </div>
        ) : userError ? (
          <div className="py-24 text-center">
            <p className="text-error-500 font-bold mb-2">Connection Blocked</p>
            <p className="text-gray-500 text-sm mb-6">{userError}</p>
            <button
              onClick={() => dispatch(fetchUsers())}
              className="btn btn-secondary"
            >
              Reload Data
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-24 text-center">
            <SearchX className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-900 dark:text-white font-bold mb-1">
              No users found
            </p>
            <p className="text-gray-500 text-sm">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    User Identity
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Classification
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Affiliation
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    System Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="relative">
                          <img
                            src={getProfileImageUrl(user)}
                            className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100 dark:border-gray-700"
                            alt="avatar"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${user.is_active ? "bg-success-500" : "bg-gray-400"}`}
                          />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-400 truncate w-40">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {getRoleBadge(user.role)}
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                          ID: {user.employee_id || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {user.department?.code || "Main Office"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${user.is_active ? "text-success-600 bg-success-50 dark:bg-success-900/10" : "text-gray-400 bg-gray-100 dark:bg-gray-700"}`}
                      >
                        {user.is_active ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 group-hover:opacity-100 transition-all duration-200">
                        {(canManageUser(user) ||
                          currentUser?.role === "super_admin") && (
                          <>
                            <button
                              onClick={() => openEditForm(user)}
                              className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg text-primary-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 hover:bg-error-50 dark:hover:bg-error-900/30 rounded-lg text-error-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        departmentList={departments}
        programList={programs}
        roleList={roles}
        forcedRole={forcedRole || roleFilter}
      />

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        forcedRole={forcedRole || roleFilter}
        roleList={roles}
        departmentList={departments}
      />
    </div>
  );
};

export default UserList;
