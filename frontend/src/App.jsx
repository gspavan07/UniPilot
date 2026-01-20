import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "./store/slices/authSlice";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import DepartmentList from "./pages/departments/DepartmentList";
import ProgramList from "./pages/programs/ProgramList";
import UserList from "./pages/users/UserList";
import StudentList from "./pages/users/StudentList";
import StudentRegistration from "./pages/users/StudentRegistration";
import CourseList from "./pages/courses/CourseList";
import MyCourses from "./pages/courses/MyCourses";
import RoleManagement from "./pages/settings/RoleManagement";
import ProctorDashboard from "./pages/proctoring/ProctorDashboard";
import AdmissionDashboard from "./pages/dashboards/AdmissionDashboard";
import AdmissionSettings from "./pages/settings/AdmissionSettings";
import PromotionManager from "./pages/promotion/PromotionManager";
import AttendanceTracker from "./pages/attendance/AttendanceTracker";
import LeaveManager from "./pages/attendance/LeaveManager";
import ExamManagement from "./pages/exam/ExamManagement";
import StudentResults from "./pages/exam/StudentResults";
import FeeManagement from "./pages/fee/FeeManagement";
import MyFees from "./pages/fee/MyFees";
import LibraryDashboard from "./pages/library/LibraryDashboard";
import MyLibrary from "./pages/library/MyLibrary";
import TimetableManager from "./pages/timetable/TimetableManager";
import MyTimetable from "./pages/timetable/MyTimetable";
import UserProfile from "./pages/profile/UserProfile";
import StaffList from "./pages/hr/StaffList";
import StaffProfile from "./pages/hr/StaffProfile";
import PayrollDashboard from "./pages/hr/PayrollDashboard";
import GradeManagement from "./pages/hr/GradeManagement";
import LeaveDashboard from "./pages/hr/LeaveDashboard";
import StaffAttendance from "./pages/hr/StaffAttendance";
import EmployeeOnboarding from "./pages/hr/EmployeeOnboarding";
import AcademicCalendar from "./pages/hr/AcademicCalendar";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdmissionAnalytics from "./pages/dashboards/AdmissionAnalytics";
import BlockList from "./pages/infrastructure/BlockList";
import BlockDetails from "./pages/infrastructure/BlockDetails";
import RegulationList from "./pages/academics/RegulationList";
import RegulationViewer from "./pages/academics/RegulationViewer";
import SectionManager from "./pages/academics/SectionManager";

function App() {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (accessToken) {
      dispatch(loadUser());
    }
  }, [dispatch, accessToken]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/departments" element={<DepartmentList />} />
          <Route path="/programs" element={<ProgramList />} />
          <Route path="/regulations" element={<RegulationList />} />
          <Route
            path="/regulations/:id/curriculum"
            element={<RegulationViewer />}
          />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/faculty" element={<UserList role="faculty" />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/student/register" element={<StudentRegistration />} />
          <Route path="/staff" element={<UserList role="staff" />} />
          <Route path="/admins" element={<UserList role="admin" />} />
          <Route path="/admission/dashboard" element={<AdmissionDashboard />} />
          <Route path="/admission/settings" element={<AdmissionSettings />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/timetable/manage" element={<TimetableManager />} />
          <Route path="/timetable/my" element={<MyTimetable />} />
          <Route path="/settings/roles" element={<RoleManagement />} />
          <Route path="/proctoring" element={<ProctorDashboard />} />
          <Route path="/lifecycle" element={<PromotionManager />} />
          <Route path="/attendance" element={<AttendanceTracker />} />
          <Route path="/leave" element={<LeaveManager />} />
          <Route path="/exams" element={<ExamManagement />} />
          <Route path="/results" element={<StudentResults />} />
          <Route path="/fees" element={<FeeManagement />} />
          <Route path="/my-fees" element={<MyFees />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/library" element={<LibraryDashboard />} />
          <Route path="/my-library" element={<MyLibrary />} />
          <Route path="/hr/onboard" element={<EmployeeOnboarding />} />
          <Route path="/employees" element={<StaffList />} />
          <Route path="/employee/:id" element={<StaffProfile />} />
          <Route path="/hr/payroll" element={<PayrollDashboard />} />
          <Route path="/hr/payroll/grades" element={<GradeManagement />} />
          <Route path="/hr/leaves" element={<LeaveDashboard />} />
          <Route path="/hr/attendance" element={<StaffAttendance />} />
          <Route
            path="/hr/calendar"
            element={<AcademicCalendar target="staff" />}
          />
          <Route
            path="/academic/calendar"
            element={<AcademicCalendar target="student" />}
          />
          <Route path="/academic/sections" element={<SectionManager />} />
          <Route path="/infrastructure" element={<BlockList />} />
          <Route path="/infrastructure/blocks/:id" element={<BlockDetails />} />
          <Route path="/hr/my-profile" element={<StaffProfile isSelf />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route
            path="/settings"
            element={<Navigate to="/settings/roles" replace />}
          />
        </Route>

        {/* Root Redirect */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
