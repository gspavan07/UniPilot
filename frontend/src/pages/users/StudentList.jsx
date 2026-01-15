import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  createUser,
  updateUser,
  fetchUserStats,
  fetchStudentSections,
} from "../../store/slices/userSlice";
import { fetchRoles } from "../../store/slices/roleSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import api from "../../utils/api";
import UserForm from "./UserForm";
import StudentDetailModal from "./StudentDetailModal";
import BulkImportModal from "./BulkImportModal";
import DocumentVerificationModal from "../../components/admission/DocumentVerificationModal";
import BulkCommunicationModal from "../../components/admission/BulkCommunicationModal";
import GenerateIdModal from "../../components/admission/GenerateIdModal";
import BulkPhotoUploadModal from "../../components/admission/BulkPhotoUploadModal";
import {
  Plus,
  Wand2,
  Search,
  Filter,
  Edit2,
  Trash2,
  Loader2,
  SearchX,
  Download,
  Upload,
  FileText,
  FileDown,
  Mail,
  Eye,
} from "lucide-react";

const StudentList = () => {
  const dispatch = useDispatch();
  const {
    users,
    sections,
    status: userStatus,
    error: userError,
    userStats,
  } = useSelector((state) => state.users);
  const { departments } = useSelector((state) => state.departments);
  const { programs } = useSelector((state) => state.programs);
  const { roles } = useSelector((state) => state.roles);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBulkNotifOpen, setIsBulkNotifOpen] = useState(false);
  const [docModal, setDocModal] = useState({
    isOpen: false,
    studentId: null,
    studentName: "",
  });
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    student: null,
  });
  const [isGenerateIdOpen, setIsGenerateIdOpen] = useState(false);
  const [isBulkPhotoOpen, setIsBulkPhotoOpen] = useState(false);

  const handleDownloadLetter = async (studentId) => {
    try {
      const response = await api.get(`/admission/letter/${studentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `admission_letter_${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download admission letter");
    }
  };

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
    dispatch(fetchRoles());
    dispatch(fetchUserStats());
    // Initial fetch of sections (optional, or wait for filters)
    dispatch(fetchStudentSections({}));
  }, [dispatch]);

  // Fetch sections when filters change
  useEffect(() => {
    dispatch(
      fetchStudentSections({
        department_id: deptFilter,
        batch_year: batchFilter,
      })
    );
  }, [dispatch, deptFilter, batchFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchUsers({
          search: searchTerm,
          role: "student",
          department_id: deptFilter,
          batch_year: batchFilter,
          section: sectionFilter,
        })
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, deptFilter, batchFilter, sectionFilter]);

  const handleDeleteUser = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this student? This action cannot be undone."
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

  // Handle Data Export for Admissions
  const handleExport = async () => {
    try {
      const response = await api.get("/admission/export", {
        params: {
          year: deptFilter, // example usage
          department_id: deptFilter,
        },
      });

      const data = response.data.data;
      if (data.length === 0) {
        alert("No records found to export.");
        return;
      }

      const headers = Object.keys(data[0]).join(",");
      const csv = [
        headers,
        ...data.map((row) =>
          Object.values(row)
            .map((v) => `"${v}"`)
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute(
        "download",
        `admissions_export_${new Date().toLocaleDateString("en-CA")}.csv`
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const { user: currentUser, accessToken } = useSelector((state) => state.auth);

  // ... (Permission Logic)

  const getProfileImageUrl = (user) => {
    if (user.profile_picture) {
      if (user.profile_picture.startsWith("http")) return user.profile_picture;
      // Append token for secure access
      return `${user.profile_picture}?token=${accessToken}`;
    }
    return `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random&size=128`;
  };

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
    if (roleSlug === "admission_admin" || roleSlug === "admission_staff") {
      return true;
    }
    // HOD/Faculty/Staff usually cannot create students directly in this context unless specified
    return false;
  })();

  const canManageUser = (targetUser) => {
    let myRoleSlug = currentUser?.role_data?.slug;
    if (!myRoleSlug && currentUser?.role_id && roles.length > 0) {
      const r = roles.find((role) => role.id === currentUser.role_id);
      if (r) myRoleSlug = r.slug;
    }
    if (!myRoleSlug) myRoleSlug = currentUser?.role || "";
    myRoleSlug = myRoleSlug.toLowerCase();

    const isSystemAdmin =
      myRoleSlug === "admin" || myRoleSlug === "super_admin";
    if (isSystemAdmin) return true;

    if (myRoleSlug === "admission_admin" || myRoleSlug === "admission_staff") {
      return true;
    }

    if (myRoleSlug === "hod") {
      return currentUser.department_id === targetUser.department_id;
    }

    if (myRoleSlug.includes("_staff") || myRoleSlug.includes("_admin")) {
      return currentUser.department_id === targetUser.department_id;
    }

    return false;
  };

  const hasPermission = (permSlug) => {
    if (currentUser?.role === "super_admin") return true;
    // Check if permission exists in user's permission list (if loaded)
    // Or check if role matches known defaults (fallback)

    // Ideally use permissions from auth state
    if (currentUser?.permissions?.includes(permSlug)) return true;

    // Fallback for Admission Admin until re-login/refresh
    const roleSlug = currentUser?.role_data?.slug || currentUser?.role || "";
    if (
      roleSlug === "admission_admin" &&
      permSlug === "admissions:generate_ids"
    )
      return true;

    return false;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Student Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage enrollment details, academic status, and records for
            students.
          </p>
        </div>
        {(canCreate ||
          (currentUser?.role_data?.slug || "").includes("admission") ||
          currentUser?.role === "super_admin") && (
          <div className="flex gap-3">
            {((currentUser?.role_data?.slug || "").includes("admission") ||
              currentUser?.role === "super_admin") && (
              <button
                onClick={handleExport}
                className="btn btn-secondary flex items-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:shadow-md"
              >
                <Download className="w-4 h-4 mr-2 text-primary-500" />
                Export Admissions
              </button>
            )}
            {((currentUser?.role_data?.slug || "").includes("admission") ||
              currentUser?.role === "super_admin") && (
              <button
                onClick={() => setIsBulkNotifOpen(true)}
                className="btn btn-secondary flex items-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:shadow-md"
              >
                <Mail className="w-4 h-4 mr-2 text-primary-500" />
                Bulk Message
              </button>
            )}

            {hasPermission("admissions:manage") && (
              <button
                onClick={() => setIsBulkPhotoOpen(true)}
                className="btn btn-secondary flex items-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:shadow-md"
              >
                <Upload className="w-4 h-4 mr-2 text-primary-500" />
                Bulk Photos
              </button>
            )}
            {hasPermission("admissions:generate_ids") && (
              <button
                onClick={() => setIsGenerateIdOpen(true)}
                className="btn btn-secondary flex items-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:shadow-md"
              >
                <Wand2 className="w-4 h-4 mr-2 text-primary-500" />
                Generate IDs
              </button>
            )}
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
                  Register Student
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userStats
          ?.filter((stat) => stat.role === "student")
          .map((stat) => (
            <div
              key={stat.role}
              className="card p-4 border border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Total Students
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
        <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 hidden md:block" />
        <select
          className="bg-transparent border-none focus:ring-0 text-sm py-2 px-4 dark:text-white cursor-pointer"
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
        >
          <option value="">All Batches</option>
          {[...Array(5)].map((_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
        <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 hidden md:block" />
        <select
          className="bg-transparent border-none focus:ring-0 text-sm py-2 px-4 dark:text-white cursor-pointer"
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
        >
          <option value="">All Sections</option>
          {sections &&
            sections.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
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
              No students found
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
                    Student Identity
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Role
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Affiliation
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
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
                        <span className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400">
                          Student
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                          ID: {user.student_id || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {user.department?.code || "Main Office"}
                        </span>
                        {user.program && (
                          <span className="text-[10px] text-gray-400 truncate w-32">
                            {user.program.name}
                          </span>
                        )}
                        <div className="flex gap-1 mt-1">
                          {user.batch_year && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                              '{user.batch_year.toString().slice(-2)}
                            </span>
                          )}
                          {user.section && (
                            <span className="text-[10px] bg-purple-50 text-purple-600 px-1 rounded border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
                              Sec {user.section}
                            </span>
                          )}
                        </div>
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
                            {((currentUser?.role_data?.slug || "").includes(
                              "admission"
                            ) ||
                              currentUser?.role === "super_admin") && (
                              <>
                                <button
                                  onClick={() =>
                                    setDetailModal({
                                      isOpen: true,
                                      student: user,
                                    })
                                  }
                                  className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg text-primary-600 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDocModal({
                                      isOpen: true,
                                      studentId: user.id,
                                      studentName: `${user.first_name} ${user.last_name}`,
                                    })
                                  }
                                  className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg text-primary-600 transition-colors"
                                  title="Verify Documents"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDownloadLetter(user.id)}
                                  className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg text-primary-600 transition-colors"
                                  title="Download Admission Letter"
                                >
                                  <FileDown className="w-4 h-4" />
                                </button>
                              </>
                            )}
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
        forcedRole="student"
      />

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        forcedRole="student"
        roleList={roles}
        departmentList={departments}
      />
      {/* Document Verification Modal */}
      <DocumentVerificationModal
        isOpen={docModal.isOpen}
        onClose={() => setDocModal({ ...docModal, isOpen: false })}
        studentId={docModal.studentId}
        studentName={docModal.studentName}
      />

      <StudentDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, student: null })}
        student={detailModal.student}
      />

      {/* Bulk Communication Modal */}
      <BulkCommunicationModal
        isOpen={isBulkNotifOpen}
        onClose={() => setIsBulkNotifOpen(false)}
        userCount={users.length}
        filters={{ role: "student", department: deptFilter }}
      />

      {/* Generate ID Modal */}
      <GenerateIdModal
        isOpen={isGenerateIdOpen}
        onClose={() => setIsGenerateIdOpen(false)}
        onSuccess={() =>
          dispatch(fetchUsers({ role: "student", department_id: deptFilter }))
        }
        departmentList={departments}
        programList={programs}
      />

      <BulkPhotoUploadModal
        isOpen={isBulkPhotoOpen}
        onClose={() => setIsBulkPhotoOpen(false)}
      />
    </div>
  );
};

export default StudentList;
