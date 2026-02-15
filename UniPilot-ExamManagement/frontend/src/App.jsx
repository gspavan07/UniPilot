import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ExamCycleList from "./pages/ExamCycles/ExamCycleList";
import CreateCycle from "./pages/ExamCycles/CreateCycle";
import ManageCycle from "./pages/ExamCycles/ManageCycle";
import Profile from "./pages/Profile/Profile";
import FacultyDashboard from "./pages/Faculty/FacultyDashboard";
import PaperFormatEditor from "./pages/Faculty/PaperFormatEditor";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Faculty Routes */}
            <Route path="faculty/exams" element={<FacultyDashboard />} />
            <Route
              path="faculty/exam/:timetableId/format"
              element={<PaperFormatEditor />}
            />

            {/* Admin Routes */}
            <Route index element={<Dashboard />} />
            <Route path="exam-cycles" element={<ExamCycleList />} />
            <Route path="exam-cycles/create" element={<CreateCycle />} />
            <Route path="exam-cycles/:id/edit" element={<CreateCycle />} />
            <Route path="exam-cycles/:id/manage" element={<ManageCycle />} />
            <Route path="profile" element={<Profile />} />
            {/* Add more routes here */}
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
