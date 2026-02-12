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
import MySections from "./pages/users/MySections";
import SectionStudentList from "./pages/users/SectionStudentList";
import CourseList from "./pages/courses/CourseList";
import MyCourses from "./pages/courses/MyCourses";
import RoleManagement from "./pages/settings/RoleManagement";
import ProctorDashboard from "./pages/proctoring/ProctorDashboard";
import AdmissionDashboard from "./pages/dashboards/AdmissionDashboard";
import AdmissionSettings from "./pages/settings/AdmissionSettings";
import PromotionManager from "./pages/promotion/PromotionManager";
import AttendanceTracker from "./pages/attendance/AttendanceTracker";
import LeaveManager from "./pages/attendance/LeaveManager";
import ExamSchedules from "./pages/exam/ExamSchedules";
import MarksEntry from "./pages/exam/MarksEntry";
import PublishMarks from "./pages/exam/PublishMarks";
import StudentResults from "./pages/exam/StudentResults";
import MyExams from "./pages/student/Exams";
import ExamHallTickets from "./pages/exam/ExamHallTickets";
import MyHallTicket from "./pages/exam/MyHallTicket";
import MarkEntry from "./pages/exam/MarkEntry";
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
import TransportDashboard from "./pages/transport/TransportDashboard";
import RouteManagement from "./pages/transport/RouteManagement";
import StopManagement from "./pages/transport/StopManagement";
import VehicleManagement from "./pages/transport/VehicleManagement";
import DriverManagement from "./pages/transport/DriverManagement";
import StudentAllocation from "./pages/transport/StudentAllocation";
import TripManagement from "./pages/transport/TripManagement";
// Hostel Management
import HostelDashboard from "./pages/hostel/HostelDashboard";
import BuildingManagement from "./pages/hostel/BuildingManagement";
import RoomManagement from "./pages/hostel/RoomManagement";
import StudentHostelDashboard from "./pages/hostel/StudentHostelDashboard";
import HostelStudentAllocation from "./pages/hostel/StudentAllocation";
import HostelFeeManagement from "./pages/hostel/HostelFeeManagement";
import HostelComplaints from "./pages/hostel/HostelComplaints";
import HostelAttendance from "./pages/hostel/HostelAttendance";
import HostelReports from "./pages/hostel/HostelReports";
import GatePassManagement from "./pages/hostel/GatePassManagement";
import HostelFines from "./pages/hostel/HostelFines";
import HostelRoomBills from "./pages/hostel/HostelRoomBills";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdmissionAnalytics from "./pages/dashboards/AdmissionAnalytics";
import BlockList from "./pages/infrastructure/BlockList";
import BlockDetails from "./pages/infrastructure/BlockDetails";
import RegulationList from "./pages/academics/RegulationList";
import RegulationViewer from "./pages/academics/RegulationViewer";
import RegulationManager from "./pages/admin/RegulationManager";
import SectionManager from "./pages/academics/SectionManager";
import AcademicsManagement from "./pages/academics/AcademicsManagement";
import CoPoMapping from "./pages/academics/CoPoMapping";
import HRManagement from "./pages/hr/HRManagement";
import ExamManagement from "./pages/exam/ExamManagement";
import ReverificationManagement from "./pages/exam/ReverificationManagement";
import ScriptManagement from "./pages/exam/ScriptManagement";
import AdmissionManagement from "./pages/dashboards/AdmissionManagement";
import PlacementDashboard from "./pages/placement/PlacementDashboard";
import StudentPlacementDashboard from "./pages/placement/StudentPlacementDashboard";
import MyPlacementProfile from "./pages/placement/MyPlacementProfile";
import SelectionPipeline from "./pages/placement/SelectionPipeline";
import DepartmentPlacementDashboard from "./pages/placement/DepartmentPlacementDashboard";
import ApplyDrive from "./pages/placement/ApplyDrive";
import MyApplications from "./pages/placement/MyApplications";
import MyOffers from "./pages/placement/MyOffers";
import BrowseDrives from "./pages/placement/BrowseDrives";
import CompanyManagement from "./pages/placement/CompanyManagement";
import CompanyForm from "./pages/placement/CompanyForm";
import JobPostings from "./pages/placement/JobPostings";
import JobPostingForm from "./pages/placement/JobPostingForm";
import DriveManagement from "./pages/placement/DriveManagement";
import DriveForm from "./pages/placement/DriveForm";
import DriveDetail from "./pages/placement/DriveDetail";
import CompanyProfile from "./pages/placement/CompanyProfile";
import JobPostingDetail from "./pages/placement/JobPostingDetail";
import CoordinatorManagement from "./pages/placement/CoordinatorManagement";
import { getLandingPage } from "./utils/routeUtils";

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
          <Route path="/academics" element={<AcademicsManagement />} />
          <Route path="/departments" element={<DepartmentList />} />
          <Route path="/programs" element={<ProgramList />} />
          <Route path="/regulations" element={<RegulationList />} />
          <Route
            path="/regulations/:id/curriculum"
            element={<RegulationViewer />}
          />
          <Route
            path="/regulations/:id/exams"
            element={<RegulationManager />}
          />
          <Route
            path="/regulations/:id/co-po-mapping"
            element={<CoPoMapping />}
          />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/faculty" element={<UserList role="faculty" />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/student/register" element={<StudentRegistration />} />
          <Route path="/staff" element={<UserList role="staff" />} />
          <Route path="/admins" element={<UserList role="admin" />} />
          <Route path="/admission/dashboard" element={<AdmissionDashboard />} />
          <Route
            path="/admission-management"
            element={<AdmissionManagement />}
          />
          <Route path="/admission/settings" element={<AdmissionSettings />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/timetable/manage" element={<TimetableManager />} />
          <Route path="/timetable/my" element={<MyTimetable />} />
          <Route path="/settings/roles" element={<RoleManagement />} />
          <Route path="/proctoring" element={<ProctorDashboard />} />
          <Route path="/lifecycle" element={<PromotionManager />} />
          <Route path="/attendance" element={<AttendanceTracker />} />
          <Route path="/leave" element={<LeaveManager />} />
          <Route path="/exams/schedules" element={<ExamSchedules />} />
          <Route path="/exam-management" element={<ExamManagement />} />
          <Route path="/exams/marks-entry" element={<MarksEntry />} />
          <Route path="/exams/publish" element={<PublishMarks />} />
          <Route path="/my-exams" element={<MyExams />} />
          <Route path="/my-exams/hall-ticket" element={<MyHallTicket />} />
          <Route path="/marks-entry/:scheduleId" element={<MarkEntry />} />
          <Route path="/my-students" element={<MySections />} />
          <Route
            path="/my-students/view/:programId/:batchYear/:section"
            element={<SectionStudentList />}
          />
          <Route path="/results" element={<StudentResults />} />

          {/* Reverification and Script Management */}
          <Route
            path="/exams/reverification"
            element={<ReverificationManagement />}
          />
          <Route path="/exams/scripts" element={<ScriptManagement />} />

          <Route path="/fees" element={<FeeManagement />} />
          <Route path="/my-fees" element={<MyFees />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/library" element={<LibraryDashboard />} />
          <Route path="/my-library" element={<MyLibrary />} />
          <Route path="/hr-management" element={<HRManagement />} />
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

          {/* Transport Management */}
          <Route path="/transport" element={<TransportDashboard />} />
          <Route path="/transport/routes" element={<RouteManagement />} />
          <Route
            path="/transport/routes/:routeId/stops"
            element={<StopManagement />}
          />
          <Route path="/transport/vehicles" element={<VehicleManagement />} />
          <Route path="/transport/drivers" element={<DriverManagement />} />
          <Route
            path="/transport/allocations"
            element={<StudentAllocation />}
          />
          <Route path="/transport/trips" element={<TripManagement />} />

          {/* Hostel Management */}
          <Route path="/hostel" element={<HostelDashboard />} />
          <Route path="/hostel/student" element={<StudentHostelDashboard />} />
          <Route path="/hostel/buildings" element={<BuildingManagement />} />
          <Route path="/hostel/rooms" element={<RoomManagement />} />
          <Route
            path="/hostel/allocations"
            element={<HostelStudentAllocation />}
          />
          <Route path="/hostel/fees" element={<HostelFeeManagement />} />
          <Route path="/hostel/complaints" element={<HostelComplaints />} />
          <Route path="/hostel/attendance" element={<HostelAttendance />} />
          <Route path="/hostel/gate-pass" element={<GatePassManagement />} />
          <Route path="/hostel/fines" element={<HostelFines />} />
          <Route path="/hostel/room-bills" element={<HostelRoomBills />} />
          <Route path="/hostel/reports" element={<HostelReports />} />

          {/* Placement Module */}
          <Route path="/placement/dashboard" element={<PlacementDashboard />} />
          <Route
            path="/placement/department"
            element={<DepartmentPlacementDashboard />}
          />
          <Route
            path="/placement/student/dashboard"
            element={<StudentPlacementDashboard />}
          />
          <Route path="/placement/profile" element={<MyPlacementProfile />} />
          <Route path="/placement/eligible" element={<BrowseDrives />} />
          <Route
            path="/placement/drives/:id/pipeline"
            element={<SelectionPipeline />}
          />
          <Route path="/placement/drives/:id/apply" element={<ApplyDrive />} />
          <Route
            path="/placement/my-applications"
            element={<MyApplications />}
          />
          <Route path="/placement/offers" element={<MyOffers />} />
          <Route path="/placement/companies" element={<CompanyManagement />} />
          <Route path="/placement/companies/new" element={<CompanyForm />} />
          <Route
            path="/placement/companies/:id/edit"
            element={<CompanyForm />}
          />
          <Route path="/placement/companies/:id" element={<CompanyProfile />} />
          <Route path="/placement/job-postings" element={<JobPostings />} />
          <Route
            path="/placement/job-postings/new"
            element={<JobPostingForm />}
          />
          <Route
            path="/placement/job-postings/:id/edit"
            element={<JobPostingForm />}
          />
          <Route
            path="/placement/job-postings/:id"
            element={<JobPostingDetail />}
          />
          <Route path="/placement/drives" element={<DriveManagement />} />
          <Route path="/placement/drives/new" element={<DriveForm />} />
          <Route path="/placement/drives/:id/edit" element={<DriveForm />} />
          <Route path="/placement/drives/:id" element={<DriveDetail />} />
          <Route
            path="/placement/coordinators"
            element={<CoordinatorManagement />}
          />

          {/* Add more transport sub-routes here */}

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
              <Navigate to={getLandingPage(user)} replace />
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
