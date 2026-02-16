import { useEffect, useState } from "react";
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
  UserCheck,
  UserX,
  Mail,
  Briefcase,
  Calendar,
  ArrowLeft,
  Users,
  Building2,
  MoreVertical,
} from "lucide-react";
import UserForm from "../users/UserForm";
import EditEmployeeDrawer from "./EditEmployeeDrawer";

const StaffList = () => {
  const dispatch = useDispatch();
  const { users, status, error, userStats } = useSelector(
    (state) => state.users,
  );
  const { departments } = useSelector((state) => state.departments);
  const { roles } = useSelector((state) => state.roles);

  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchRoles());
    dispatch(fetchUserStats());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchUsers({
          search: searchTerm,
          department_id: deptFilter,
          role: roleFilter,
        }),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, deptFilter, roleFilter]);

  const staffUsers = users.filter(
    (u) => u.role !== "student" && (!roleFilter || u.role === roleFilter),
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
          updateUser({ id: selectedUser.id, data: formData }),
        ).unwrap();
      } else {
        await dispatch(createUser(formData)).unwrap();
      }
      setIsFormOpen(false);
      dispatch(fetchUsers({ role: roleFilter }));
    } catch (err) {
      console.error("Failed to save staff:", err);
    }
  };

  const openAddForm = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const openEditForm = (user) => {
    setSelectedUser(user);
    setIsEditDrawerOpen(true);
    setActiveDropdown(null);
  };

  const handleDeleteUser = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this staff member? This action cannot be undone.",
      )
    ) {
      await dispatch(deleteUser(id));
      dispatch(fetchUsers({ role: roleFilter }));
    }
    setActiveDropdown(null);
  };

  const handleStatusChange = async (user) => {
    const newStatus = !user.is_active;
    const action = newStatus ? "activate" : "deactivate";
    if (
      window.confirm(`Are you sure you want to ${action} this staff member?`)
    ) {
      try {
        await dispatch(
          updateUser({ id: user.id, data: { is_active: newStatus } }),
        ).unwrap();
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    }
    setActiveDropdown(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Employee Directory
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {staffUsers.length} staff member{staffUsers.length !== 1 ? 's' : ''} registered
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 flex items-center gap-2 transition-all">
                <Download className="w-4 h-4" />
                Export
              </button>
              <Link
                to="/hr/onboard"
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Staff
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div className="relative min-w-[240px]">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm font-medium text-gray-900 appearance-none bg-white cursor-pointer transition-all"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                <optgroup label="Academic">
                  {departments
                    .filter((d) => d.type === "academic" || !d.type)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Administrative">
                  {departments
                    .filter((d) => d.type === "administrative")
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </optgroup>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Role Filter */}
            <div className="relative min-w-[200px]">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm font-medium text-gray-900 appearance-none bg-white cursor-pointer transition-all"
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
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Grid */}
        {status === "loading" ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-medium text-gray-500">Loading staff members...</p>
            </div>
          </div>
        ) : staffUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="p-4 rounded-full bg-gray-50 mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No staff members found</h3>
            <p className="text-sm text-gray-500 mb-6">Try adjusting your search or filters</p>
            <Link
              to="/hr/onboard"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add First Staff Member
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {staffUsers.map((user) => (
              <div
                key={user.id}
                className="group relative bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 pb-4 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={getProfileImageUrl(user)}
                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-100"
                        alt={`${user.first_name} ${user.last_name}`}
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${user.is_active ? "bg-green-500" : "bg-gray-300"
                          }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
                          {user.role}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${user.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                            }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                          />
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-1">
                            <button
                              onClick={() => openEditForm(user)}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                              Edit Details
                            </button>
                            <button
                              onClick={() => handleStatusChange(user)}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="w-4 h-4 text-orange-600" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 text-green-600" />
                                  Activate
                                </>
                              )}
                            </button>
                            <Link
                              to={`/employee/${user.id}`}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                              View Profile
                            </Link>
                            <div className="h-px bg-gray-100 my-1" />
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 pt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                        Department
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.department?.name || "Not assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                        Employee ID
                      </p>
                      <p className="text-sm font-mono font-semibold text-gray-900">
                        {user.employee_id || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                        Joined
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.joining_date || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6">
                  <Link
                    to={`/employee/${user.id}`}
                    className="block w-full py-2.5 text-center rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-bold text-gray-700 transition-all"
                  >
                    View Full Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        departmentList={departments}
        roleList={roles.filter((r) => r.slug !== "student")}
        forcedRole="staff"
      />
      <EditEmployeeDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
          dispatch(fetchUsers({ role: roleFilter }));
        }}
        user={selectedUser}
        departmentList={departments}
      />
    </div>
  );
};

export default StaffList;
