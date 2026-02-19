import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  createUser,
  updateUser,
  fetchUserStats,
  fetchStudentSections,
  fetchBatchYears,
} from "../../store/slices/userSlice";
import { fetchRoles } from "../../store/slices/roleSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import api from "../../utils/api";
import UserForm from "./UserForm";
import StudentDetailModal from "./StudentDetailModal";
import EditStudentDrawer from "./EditStudentDrawer";
import BulkImportModal from "./BulkImportModal";
import DocumentVerificationModal from "../../components/admission/DocumentVerificationModal";
import BulkCommunicationModal from "../../components/admission/BulkCommunicationModal";
import GenerateIdModal from "../../components/admission/GenerateIdModal";
import BulkPhotoUploadModal from "../../components/admission/BulkPhotoUploadModal";
import {
  Plus,
  Wand2,
  Search,
  Edit2,
  Trash2,
  Loader2,
  SearchX,
  Download,
  Upload,
  FileText,
  Mail,
  Eye,
} from "lucide-react";

const StudentList = () => {
  const dispatch = useDispatch();
  const {
    users,
    sections,
    batchYears,
    status: userStatus,
    error: userError,
    userStats,
  } = useSelector((state) => state.users);
  const { departments } = useSelector((state) => state.departments);
  const navigate = useNavigate();
  const { programs } = useSelector((state) => state.programs);
  const { roles } = useSelector((state) => state.roles);

  // UI State
  const { user: currentUser, accessToken } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState(
    currentUser?.role === "hod" ? currentUser?.department_id : "",
  );
  const [batchFilter, setBatchFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
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
  }, [dispatch]);

  // Fetch sections and batch years when filters change
  useEffect(() => {
    dispatch(fetchBatchYears({ department_id: deptFilter }));
  }, [dispatch, deptFilter]);

  useEffect(() => {
    dispatch(
      fetchStudentSections({
        department_id: deptFilter,
        batch_year: batchFilter,
      }),
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
        }),
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, deptFilter, batchFilter, sectionFilter]);

  const handleDeleteUser = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this student? This action cannot be undone.",
      )
    ) {
      await dispatch(deleteUser(id));
    }
  };

  const handleSave = async (formData) => {
    if (selectedUser) {
      await dispatch(
        updateUser({ id: selectedUser.id, data: formData }),
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
    setIsEditDrawerOpen(true);
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
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute(
        "download",
        `admissions_export_${new Date().toLocaleDateString("en-CA")}.csv`,
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Skip duplicate declaration
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
    // Check specific permission
    if (currentUser?.permissions?.includes("students:manage")) {
      return true;
    }
    if (
      currentUser?.role_data?.permissions?.some(
        (p) => p.slug === "students:manage",
      )
    ) {
      return true;
    }

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

    // Check specific permission
    if (currentUser?.permissions?.includes("students:manage")) {
      return true;
    }
    // Also check nested permissions if structure is different (safe fallback)
    if (
      currentUser?.role_data?.permissions?.some(
        (p) => p.slug === "students:manage",
      )
    ) {
      return true;
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
    <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-10">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-8 border-b border-gray-100 pb-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-6 bg-blue-600"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
                Academic Registry
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2">
              Student Directory
            </h1>
            <p className="text-base text-gray-500 font-light leading-relaxed">
              Comprehensive academic records, enrollment status, and student
              profiles.
            </p>
          </div>

          <div className="flex flex-col items-start xl:items-end gap-4">
            {/* Stats Strip */}
            <div className="flex items-center gap-6 md:gap-8 pb-2">
              {userStats
                ?.filter((stat) => stat.role === "student")
                .map((stat) => (
                  <div key={stat.role} className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Total Enrolled
                    </p>
                    <p className="text-3xl font-light text-black tabular-nums">
                      {stat.count}
                    </p>
                  </div>
                )) || (
                  <div className="h-10 w-24 bg-gray-50 animate-pulse rounded" />
                )}
            </div>

            {/* Action Toolbar */}
            {(canCreate ||
              (currentUser?.role_data?.slug || "").includes("admission") ||
              currentUser?.role === "super_admin" ||
              hasPermission("students:manage")) && (
                <div className="flex flex-wrap justify-end gap-2">
                  {((currentUser?.role_data?.slug || "").includes("admission") ||
                    currentUser?.role === "super_admin") && (
                      <button
                        onClick={handleExport}
                        className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all"
                      >
                        <Download className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-600" />
                        Export
                      </button>
                    )}
                  {((currentUser?.role_data?.slug || "").includes("admission") ||
                    currentUser?.role === "super_admin") && (
                      <button
                        onClick={() => setIsBulkNotifOpen(true)}
                        className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all"
                      >
                        <Mail className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-600" />
                        Message
                      </button>
                    )}

                  {hasPermission("admissions:manage") && (
                    <button
                      onClick={() => setIsBulkPhotoOpen(true)}
                      className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all"
                    >
                      <Upload className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-600" />
                      Photos
                    </button>
                  )}

                  {canCreate && (
                    <>
                      <button
                        onClick={() => setIsImportOpen(true)}
                        className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all"
                      >
                        <Plus className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-600" />
                        Import
                      </button>
                      <button
                        onClick={() => navigate("/student/register")}
                        className="flex items-center px-5 py-2 text-sm font-bold text-white bg-black border border-black rounded-full hover:bg-blue-700 hover:border-blue-700 transition-all shadow-xl shadow-blue-900/10"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Student
                      </button>
                    </>
                  )}
                  {hasPermission("admissions:generate_ids") && (
                    <button
                      onClick={() => setIsGenerateIdOpen(true)}
                      className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-blue-600 hover:text-blue-600 transition-all"
                    >
                      <Wand2 className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-600" />
                      IDs
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Filters & Control Bar */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-2 mb-8 flex flex-col md:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search directory..."
              className="w-full bg-white border-0 rounded-xl py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex w-full md:w-auto gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <select
              className={`bg-white border-0 rounded-xl py-2.5 px-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 shadow-sm min-w-[160px] cursor-pointer ${currentUser?.role === "hod" ? "opacity-50 cursor-not-allowed" : ""}`}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              disabled={currentUser?.role === "hod"}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.code}
                </option>
              ))}
            </select>
            <select
              className="bg-white border-0 rounded-xl py-2.5 px-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 shadow-sm min-w-[140px] cursor-pointer"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
            >
              <option value="">All Batches</option>
              {batchYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="bg-white border-0 rounded-xl py-2.5 px-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 shadow-sm min-w-[140px] cursor-pointer"
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
        </div>

        {/* Directory Content */}
        <div className="bg-white rounded-none">
          {userStatus === "loading" && users.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/30">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-900 font-medium tracking-tight">
                Syncing directory...
              </p>
            </div>
          ) : userError ? (
            <div className="py-32 text-center border border-dashed border-red-100 rounded-3xl bg-red-50/10">
              <p className="text-black font-bold mb-2">Connection Blocked</p>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                {userError}
              </p>
              <button
                onClick={() => dispatch(fetchUsers())}
                className="px-6 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all"
              >
                Retry Connection
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="py-32 text-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/30">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-black font-bold text-lg mb-2">
                No students found
              </p>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                We couldn't find any records matching your current filters. Try
                stripping back the search terms.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black">
                    <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-black/60 w-[35%]">
                      Identity
                    </th>
                    <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-black/60">
                      ID & Details
                    </th>
                    <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-black/60">
                      Academic
                    </th>
                    <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-black/60">
                      Status
                    </th>
                    <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-black/60 text-right">
                      Manage
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() =>
                        setDetailModal({
                          isOpen: true,
                          student: user,
                        })
                      }
                      className="group border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="relative">
                            <img
                              src={getProfileImageUrl(user)}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100 ring-1 ring-gray-100 group-hover:ring-blue-200 transition-all"
                              alt="avatar"
                            />
                            {user.is_active && (
                              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="ml-5">
                            <p className="text-[15px] font-bold text-black group-hover:text-blue-700 transition-colors">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-xs font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {user.student_id ? user.student_id : "NO ID"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-semibold text-gray-900">
                            {user.department?.code || "Main Office"}
                          </span>
                          <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                            {user.batch_year && (
                              <span>
                                Batch{" "}
                                <span className="text-black font-medium">
                                  {user.batch_year}
                                </span>
                              </span>
                            )}
                            {user.section && (
                              <span className="before:content-['•'] before:mr-2 before:text-gray-300">
                                Sec{" "}
                                <span className="text-black font-medium">
                                  {user.section}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {user.is_active ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-700">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Active
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Inactive
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div
                          className="flex items-center justify-end gap-1 opacity-100 transition-all duration-200 translate-x-0 md:translate-x-2 md:group-hover:translate-x-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(canManageUser(user) ||
                            currentUser?.role === "super_admin") && (
                              <>
                                {((currentUser?.role_data?.slug || "").includes(
                                  "admission",
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
                                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200"
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
                                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                        title="Verify Documents"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                <button
                                  onClick={() => openEditForm(user)}
                                  className="p-2 hover:bg-gray-100 text-gray-400 hover:text-black rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
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

        {/* Form Components kept exactly as is */}
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

        <EditStudentDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => {
            setIsEditDrawerOpen(false);
            dispatch(
              fetchUsers({ role: "student", department_id: deptFilter }),
            );
          }}
          user={selectedUser}
          departmentList={departments}
          programList={programs}
        />

        <BulkImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          forcedRole="student"
          roleList={roles}
          departmentList={departments}
        />

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

        <BulkCommunicationModal
          isOpen={isBulkNotifOpen}
          onClose={() => setIsBulkNotifOpen(false)}
          userCount={users.length}
          filters={{ role: "student", department: deptFilter }}
        />

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
    </div>
  );
};

export default StudentList;
