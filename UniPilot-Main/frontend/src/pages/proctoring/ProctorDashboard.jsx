import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LifeBuoy,
  Users,
  Search,
  Filter,
  Plus,
  Calendar,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import {
  fetchMyProctees,
  fetchMyProctor,
} from "../../store/slices/proctorSlice";
import AutoAssignModal from "./AutoAssignModal";

const ProctorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myProctees, myProctor, status } = useSelector(
    (state) => state.proctor
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isAutoAssignOpen, setIsAutoAssignOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (user?.role === "student") {
      dispatch(fetchMyProctor());
    } else if (["faculty", "hod"].includes(user?.role)) {
      dispatch(fetchMyProctees());
    }
  }, [dispatch, user]);

  // --- Student View ---
  const StudentView = () => (
    <div className="space-y-6">
      <header className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          My Mentor
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Academic guidance and counseling
        </p>
      </header>

      {myProctor ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <img
              src={
                myProctor.profile_picture ||
                `https://ui-avatars.com/api/?name=${myProctor.first_name}+${myProctor.last_name}&background=6366f1&color=fff&size=128`
              }
              alt="Proctor"
              className="w-32 h-32 rounded-full ring-4 ring-primary-500/10 mb-4"
            />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {myProctor.first_name} {myProctor.last_name}
            </h2>
            <p className="text-primary-600 font-medium mb-4">Faculty Mentor</p>

            <div className="w-full space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <ExternalLink className="w-4 h-4 mr-2" />
                <span>{myProctor.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Office Hours: Mon, Wed 2-4 PM</span>
              </div>
            </div>

            <button className="mt-6 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-primary-500/20">
              Request Meeting
            </button>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Recent Feedback
              </h3>
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No feedback recorded yet.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <LifeBuoy className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Assigning Proctor...
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            The administration is currently assigning a mentor to your profile.
            Please check back later.
          </p>
        </div>
      )}
    </div>
  );

  // --- Faculty View ---
  const FacultyView = () => (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mentoring Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Managing {myProctees.length} assigned students
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Group Session
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/40 rounded-xl text-primary-600 dark:text-primary-400">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              +2 this week
            </span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Total Proctees
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {myProctees.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning-100 dark:bg-warning-900/40 rounded-xl text-warning-600 dark:text-warning-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            At Risk
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-info-100 dark:bg-info-900/40 rounded-xl text-info-600 dark:text-info-400">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Pending Feedback
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-gray-900 dark:text-white">
            My Proctees
          </h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all w-64"
              />
            </div>
            <button className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl transition-all">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Current Sem</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {myProctees
                .filter(
                  (s) =>
                    `${s.first_name} ${s.last_name}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    s.student_id
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={
                            student.profile_picture ||
                            `https://ui-avatars.com/api/?name=${student.first_name}+${student.last_name}&background=6366f1&color=fff`
                          }
                          alt=""
                          className="w-10 h-10 rounded-full mr-3 border-2 border-primary-500/10"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {student.student_id || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      Semester {student.current_semester || "1"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                        On Track
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              {myProctees.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No students assigned to you yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // --- Admin View ---
  const AdminView = () => (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Proctoring Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Oversee student assignments and departmental load
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-medium text-sm shadow-lg shadow-primary-500/20">
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Auto-Assign Proctors
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm">
            Automatically distribute students to available faculty members in
            their respective departments.
          </p>
          <button
            onClick={() => setIsAutoAssignOpen(true)}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-all font-medium"
          >
            Run Auto-Assignment
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-warning-100 dark:bg-warning-900/40 text-warning-600 dark:text-warning-400 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            View Analytics
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm">
            Detailed reports on mentoring frequency, student risks, and faculty
            load across the institution.
          </p>
          <button className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-all font-medium">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-2">
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl flex items-center text-green-700 dark:text-green-400 animate-fade-in">
          <CheckCircle className="w-5 h-5 mr-3" />
          <p className="font-medium">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {user?.role === "student" && <StudentView />}
      {["faculty", "hod"].includes(user?.role) && <FacultyView />}
      {user?.role === "admin" && <AdminView />}

      <AutoAssignModal
        isOpen={isAutoAssignOpen}
        onClose={() => setIsAutoAssignOpen(false)}
        onComplete={(msg) => setSuccessMessage(msg)}
      />
    </div>
  );
};

export default ProctorDashboard;
