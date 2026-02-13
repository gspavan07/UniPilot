import React from "react";
import { useSelector } from "react-redux";
import AdminDashboard from "./dashboards/AdminDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";
import FacultyDashboard from "./dashboards/FacultyDashboard";
import HodDashboard from "./dashboards/HodDashboard";
import SuperAdminDashboard from "./dashboards/SuperAdminDashboard";
import HRDashboard from "./hr/HRDashboard";
import AdmissionManagement from "./dashboards/AdmissionManagement";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  // Render dashboard based on role
  switch (user.role) {
    case "student":
      return <StudentDashboard />;
    case "faculty":
      return <FacultyDashboard />;
    case "hod":
      return <HodDashboard />;
    case "admission_admin":
    case "admission_staff":
      return <AdmissionManagement />;
    case "hr":
    case "hr_admin":
      return <HRDashboard />;
    case "super_admin":
      return <SuperAdminDashboard />;
    case "admin":
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;
