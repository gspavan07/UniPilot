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
    if (percentage >= 75) return "bg-emerald-500";
    if (percentage >= 65) return "bg-amber-500";
    return "bg-rose-500";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      {/* Fetching Overlay */}
      {fetchingProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl flex items-center gap-4">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Fetching Profile...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/my-students")}
            className="p-3 hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              Section {section} Students
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Layers className="w-4 h-4" /> Batch {batchYear}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{users.length} Enrolled Students</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-white py-3 pl-12 pr-4 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Table Content */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
        {status === "loading" && users.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium font-display">
              Syncing with directory...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-24 text-center">
            <SearchX className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-900 dark:text-white font-bold mb-1">
              No matching students
            </p>
            <p className="text-gray-500 text-sm">
              Try adjusting your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    Student Identity
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    Contact Email
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    Attendance
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">
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
                      className="hover:bg-gray-50/40 dark:hover:bg-gray-900/40 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={getProfileImageUrl(student)}
                            alt={student.first_name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-primary-500/20 transition-all shadow-sm"
                          />
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {student.first_name} {student.last_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-lg">
                          {student.student_id ||
                            student.admission_number ||
                            "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-48">
                          {student.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getBarColor(attendance)} transition-all duration-1000`}
                              style={{ width: `${attendance}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${attendance < 65 ? "text-rose-500" : "text-gray-400"}`}
                          >
                            {attendance}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewProfile(student)}
                          className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all transform group-hover:scale-110"
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

      {/* Strategic Scalability Tag */}
      <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
        <GraduationCap className="w-4 h-4 opacity-50" />
        <p className="text-[10px] font-black uppercase tracking-widest italic opacity-50">
          Optimized for large scale university management | Kakinada, AP
        </p>
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
