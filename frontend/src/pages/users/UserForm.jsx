import React from "react";
import StudentForm from "./forms/StudentForm";
import EmployeeForm from "./forms/EmployeeForm";

/**
 * UserForm Manager
 * Dynamically renders the correct form: StudentForm for students, EmployeeForm for everyone else.
 */
const UserForm = ({
  isOpen,
  onClose,
  onSave,
  user = null,
  departmentList = [],
  programList = [],
  roleList = [],
  forcedRole = null,
}) => {
  // Determine which role we are dealing with
  // 1. If editing, use user.role
  // 2. If adding and forcedRole is provided, use forcedRole
  // 3. Fallback to 'student' IF strict logic needed, but here we can check roleId too.
  // Actually, we pass in 'user' which has role_data usually, or just look at forcedRole context.

  const activeRoleSlug = user?.role || forcedRole || "staff";

  // Find the role ID from our roleList for the selected slug
  // For new users, we might default to first available 'staff' role if not student,
  // but usually forcedRole is passed if filtering, or we pick a default for EmployeeForm logic.
  // EmployeeForm handles role selection itself if a specific ID isn't forced.
  const activeRole = roleList.find((r) => r.slug === activeRoleSlug);
  const roleId = activeRole?.id || "";

  if (!isOpen) return null;

  const lowerRole = activeRoleSlug.toLowerCase();

  // 1. Students get their own specialized form
  if (lowerRole === "student") {
    return (
      <StudentForm
        isOpen={isOpen}
        onClose={onClose}
        onSave={onSave}
        user={user}
        departmentList={departmentList}
        programList={programList}
        roleId={roleId}
      />
    );
  }

  // 2. Everyone else (Faculty, Staff, Admins) gets the Unified EmployeeForm
  // We pass roleList so they can change roles if allowed (e.g. creating new user)
  return (
    <EmployeeForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      user={user}
      departmentList={departmentList}
      roleId={roleId} // Pre-selected ID if context exists
      roleList={roleList} // Full list for dropdown selection
    />
  );
};

export default UserForm;
