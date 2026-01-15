import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchUsers,
  deleteUser,
  createUser,
  updateUser,
  fetchUserStats,
} from "../../store/slices/userSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchRoles } from "../../store/slices/roleSlice";
import {
  Search,
  Eye,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import UserForm from "../users/UserForm";

const StaffList = () => {
  const dispatch = useDispatch();
  const { users, status, error, userStats } = useSelector(
    (state) => state.users
  );
  const { departments } = useSelector((state) => state.departments);
  const { roles } = useSelector((state) => state.roles);

  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchRoles());
    dispatch(fetchUserStats());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fetch only potential staff roles
      dispatch(
        fetchUsers({
          search: searchTerm,
          department_id: deptFilter,
          role: roleFilter, // API should handle filtering multiple roles if needed, or we filter client side
          // tailored for staff/faculty
        })
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, deptFilter, roleFilter]);

  // Filter out students on client side if API returns mixed
  const staffUsers = users.filter(
    (u) => u.role !== "student" && (!roleFilter || u.role === roleFilter)
  );

  const getProfileImageUrl = (user) => {
    if (user.profile_picture) {
      if (user.profile_picture.startsWith("http")) return user.profile_picture;
      return `${user.profile_picture}`;
    }
    return `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random&size=128`;
  };

  const handleSave = async (formData) => {
    try {
      if (selectedUser) {
        await dispatch(
          updateUser({ id: selectedUser.id, data: formData })
        ).unwrap();
      } else {
        await dispatch(createUser(formData)).unwrap();
      }
      setIsFormOpen(false);
      // Refresh list
      dispatch(fetchUsers({ role: roleFilter }));
    } catch (err) {
      console.error("Failed to save staff:", err);
      // userSlice handles error state, shown in UI if needed
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

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Staff Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage employee records, attendance, and payroll.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={openAddForm}
            className="btn btn-primary flex items-center shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Register Staff
          </button>
          <button className="btn btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-2 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 pl-10 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 hidden md:block" />
        <select
          className="bg-transparent border-none focus:ring-0 text-sm py-2 px-4 dark:text-white"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Units</option>

          <optgroup
            label="Academic Departments"
            className="font-bold text-primary-600"
          >
            {departments
              .filter((d) => d.type === "academic" || !d.type)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </optgroup>

          <optgroup
            label="Administration Teams"
            className="font-bold text-secondary-600"
          >
            {departments
              .filter((d) => d.type === "administrative")
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </optgroup>
        </select>
        <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 hidden md:block" />
        <select
          className="bg-transparent border-none focus:ring-0 text-sm py-2 px-4 dark:text-white"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles
            .filter((r) => r.slug !== "student")
            .map((r) => (
              <option key={r.id} value={r.slug}>
                {r.name}
              </option>
            ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Employee
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Department
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Join Date
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {staffUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={getProfileImageUrl(user)}
                        className="w-10 h-10 rounded-xl object-cover"
                        alt=""
                      />
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {user.employee_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {user.department?.name || "-"}
                    </span>
                    <div className="text-[10px] text-gray-400">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.joining_date || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.is_active
                          ? "text-success-600 bg-success-50 dark:bg-success-900/10"
                          : "text-gray-400 bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/hr/staff/${user.id}`}
                      className="btn btn-sm btn-ghost"
                    >
                      <Eye className="w-4 h-4 text-primary-500" />
                    </Link>
                  </td>
                </tr>
              ))}
              {staffUsers.length === 0 && status !== "loading" && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No staff members found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        departmentList={departments}
        roleList={roles.filter((r) => r.slug !== "student")}
        forcedRole="staff"
      />
    </div>
  );
};

export default StaffList;
