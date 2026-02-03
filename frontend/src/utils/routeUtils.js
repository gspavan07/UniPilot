/**
 * Determines the default landing page based on the user's role.
 * This ensures that users land on their most relevant workspace immediately after login.
 *
 * @param {Object} user - The user object from auth state
 * @returns {string} - The path to the landing page
 */
export const getLandingPage = (user) => {
  if (!user) return "/auth/login";

  // Use role_data slug if available, otherwise fallback to basic role string
  const roleSlug = user.role_data?.slug || user.role;

  switch (roleSlug) {
    case "finance_staff":
    case "finance_admin":
      return "/fees";
    case "admission_admin":
    case "admission_staff":
      return "/admission/dashboard";
    case "hr":
    case "hr_admin":
      return "/hr/onboard";
    case "transport_admin":
    case "transport_staff":
      return "/transport";
    case "tpo":
      return "/placement/dashboard";
    case "placement_coordinator":
      return "/placement/department";
    case "student":
      return "/dashboard"; // StudentDashboard is well defined
    case "faculty":
    case "hod":
      return "/dashboard";
    case "admin":
    case "super_admin":
      return "/dashboard";
    default:
      return "/dashboard";
  }
};
