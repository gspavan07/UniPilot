import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartments,
  deleteDepartment,
  createDepartment,
  updateDepartment,
} from "../../store/slices/departmentSlice";
import DepartmentForm from "./DepartmentForm";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  BookOpen,
  Loader2,
  MoreVertical,
  Building,
} from "lucide-react";

const DepartmentList = () => {
  const dispatch = useDispatch();
  const { departments, status, error } = useSelector(
    (state) => state.departments,
  );
  const { accessToken } = useSelector((state) => state.auth);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("academic");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this department? This will NOT delete programs or users associated with it.",
      )
    ) {
      await dispatch(deleteDepartment(id));
    }
  };

  const handleSave = async (formData) => {
    if (selectedDept) {
      await dispatch(
        updateDepartment({ id: selectedDept.id, data: formData }),
      ).unwrap();
    } else {
      await dispatch(createDepartment(formData)).unwrap();
    }
  };

  const openAddForm = () => {
    setSelectedDept(null);
    setIsFormOpen(true);
  };

  const openEditForm = (dept) => {
    setSelectedDept(dept);
    setIsFormOpen(true);
  };

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" ||
      dept.type === filterType ||
      (filterType === "academic" && !dept.type); // Default to academic if no type

    return matchesSearch && matchesType;
  });

  const getProfileImageUrl = (user) => {
    if (user.profile_picture) {
      if (user.profile_picture.startsWith("http")) return user.profile_picture;
      return `${user.profile_picture}?token=${accessToken}`;
    }
    return `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=6366f1&color=fff&size=64`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Departments
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage academic departments and their administrative heads.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="btn btn-primary flex items-center shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Department
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search departments by name or code..."
            className="input pl-10 w-full focus:ring-2 focus:ring-primary-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setFilterType("academic")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === "academic" ? "bg-white dark:bg-gray-700 text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
          >
            Academic
          </button>
          <button
            onClick={() => setFilterType("administrative")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === "administrative" ? "bg-white dark:bg-gray-700 text-secondary-600 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
          >
            Administrative
          </button>
        </div>
      </div>

      {/* Table/List */}
      <div className="card overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
        {status === "loading" && departments.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">
              Loading university departments...
            </p>
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-error-600" />
            </div>
            <p className="text-error-500 font-bold mb-2">Error Connection</p>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => dispatch(fetchDepartments())}
              className="btn btn-secondary"
            >
              Try Again
            </button>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-bold mb-1">
              No departments found
            </p>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Get started by adding your first academic department to the
              system.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Department Name & Code
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Administrative Head
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">
                    Action Panel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredDepartments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-900/10 flex items-center justify-center mr-4 shadow-sm group-hover:scale-105 transition-transform">
                          <span className="text-primary-700 dark:text-primary-400 font-black text-xs">
                            {dept.code}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {dept.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">
                            SINCE{" "}
                            {dept.established_date
                              ? new Date(dept.established_date).getFullYear()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {dept.hod ? (
                        <div className="flex items-center">
                          <img
                            src={getProfileImageUrl(dept.hod)}
                            className="w-10 h-10 rounded-xl mr-3 shadow-sm border border-gray-100 dark:border-gray-700"
                            alt="HOD"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {dept.hod.first_name} {dept.hod.last_name}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate w-32">
                              {dept.hod.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg inline-block border border-gray-100 dark:border-gray-700 border-dashed">
                          PENDING ASSIGNMENT
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          dept.is_active
                            ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
                        }`}
                      >
                        {dept.is_active ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditForm(dept)}
                          className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all"
                          title="Edit Settings"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="p-2.5 text-gray-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/30 rounded-xl transition-all"
                          title="Archive Department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal/Slide-over */}
      <DepartmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        department={selectedDept}
        departmentList={departments}
        facultyList={[]} // Will populate from faculty store later
      />
    </div>
  );
};

export default DepartmentList;
