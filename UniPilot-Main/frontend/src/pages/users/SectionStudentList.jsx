import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../store/slices/userSlice";
import { fetchAttendanceStats } from "../../store/slices/attendanceSlice";
import {
  Users,
  Search,
  ArrowLeft,
  Loader2,
  SearchX,
  Eye,
  Calendar,
  Layers,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import StudentDetailModal from "./StudentDetailModal";
import api from "../../utils/api";

const SectionStudentList = () => {
  const { programId, batchYear, section } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { users, status } = useSelector((state) => state.users);
  const { stats } = useSelector((state) => state.attendance);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  useEffect(() => {
    // Fetch students for this specific section
    dispatch(
      fetchUsers({
        role: "student",
        program_id: programId,
        batch_year: batchYear,
        section: section,
      }),
    );

    // Fetch attendance stats for the same section
    dispatch(
      fetchAttendanceStats({
        batch_year: batchYear,
        section: section,
      }),
    );
  }, [dispatch, programId, batchYear, section]);

  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.first_name.toLowerCase().includes(searchLower) ||
      u.last_name.toLowerCase().includes(searchLower) ||
      u.student_id?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  });

  const getProfileImageUrl = (user) => {
    if (user.profile_picture) return user.profile_picture;
    return `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random&size=128`;
  };

  const getAttendanceForStudent = (studentId) => {
    const studentStats = stats?.students?.find((s) => s.id === studentId);
    return studentStats ? parseFloat(studentStats.percentage) : 0;
  };

  const getBarColor = (percentage) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 65) return "bg-amber-500";
    return "bg-red-500";
  };

  const getTextColor = (percentage) => {
    if (percentage >= 75) return "text-green-600 dark:text-green-400";
    if (percentage >= 65) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleViewProfile = async (studentSummary) => {
    try {
      setFetchingProfile(true);
      // Fetch the FULL profile to ensure Academic (Program/Regulation) details are present
      const response = await api.get(`/users/${studentSummary.id}`);
      if (response.data.success) {
        setSelectedStudent(response.data.data);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch student profile:", error);
      // Fallback to what we have if API fails
      setSelectedStudent(studentSummary);
      setIsDetailOpen(true);
    } finally {
      setFetchingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Fetching Overlay */}
      {fetchingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-200 dark:border-gray-700">
            <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-sm font-semibold text-black dark:text-white">
              Fetching Profile...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/my-students")}
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
        >
          <ArrowLeft
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            strokeWidth={2.5}
          />
          Back to My Students
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  Section {section} Students
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Batch {batchYear}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {users.length} Students
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {status === "loading" && users.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Loading students...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-24 text-center">
              <SearchX className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-black dark:text-white font-semibold mb-1">
                No matching students
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Try adjusting your search filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Student ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Contact Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Attendance
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredUsers.map((student) => {
                    const attendance = getAttendanceForStudent(student.id);
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getProfileImageUrl(student)}
                              alt={student.first_name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <p className="text-sm font-semibold text-black dark:text-white">
                              {student.first_name} {student.last_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-mono font-semibold">
                            {student.student_id ||
                              student.admission_number ||
                              "PENDING"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {student.email}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getBarColor(attendance)} transition-all duration-500`}
                                style={{ width: `${attendance}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-semibold ${getTextColor(attendance)}`}
                            >
                              {attendance}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewProfile(student)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Integration */}
      {selectedStudent && (
        <StudentDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          student={selectedStudent}
        />
      )}
    </div>
  );
};

export default SectionStudentList;
