import React from "react";
import { useSelector } from "react-redux";
import AdminDashboard from "./dashboards/AdminDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";
import FacultyDashboard from "./dashboards/FacultyDashboard";
import AdmissionAnalytics from "./dashboards/AdmissionAnalytics";
import HRDashboard from "./hr/HRDashboard";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  // Render dashboard based on role
  switch (user.role) {
    case "student":
      return <StudentDashboard />;
    case "faculty":
      return <FacultyDashboard />;
    case "admission_admin":
    case "admission_staff":
      return <AdmissionAnalytics />;
    case "hr":
    case "hr_admin":
      return <HRDashboard />;
    case "admin":
    case "super_admin":
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;
