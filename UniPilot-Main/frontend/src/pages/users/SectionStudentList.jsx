import { useEffect, useState } from "react";
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
  Calendar,
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
      (u.first_name || "").toLowerCase().includes(searchLower) ||
      (u.last_name || "").toLowerCase().includes(searchLower) ||
      (u.student_id || "").toLowerCase().includes(searchLower) ||
      (u.email || "").toLowerCase().includes(searchLower)
    );
  });

  const getProfileImageUrl = (user) => {
    if (user.profile_picture) return user.profile_picture;
    return `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=eff6ff&color=2563eb&size=128&bold=true`;
  };

  const getAttendanceForStudent = (studentId) => {
    const studentStats = stats?.students?.find((s) => s.id === studentId);
    return studentStats ? parseFloat(studentStats.percentage) : 0;
  };

  const getBarColor = (percentage) => {
    if (percentage >= 75) return "bg-emerald-500";
    if (percentage >= 65) return "bg-amber-500";
    return "bg-red-500";
  };

  const getTextColor = (percentage) => {
    if (percentage >= 75) return "text-emerald-600";
    if (percentage >= 65) return "text-amber-600";
    return "text-red-500";
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
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      {/* Fetching Overlay */}
      {fetchingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
              Accessing Student Profile...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-12">
        {/* Navigation & Header */}
        <header className="mb-12">
          <button
            onClick={() => navigate("/my-students")}
            className="group flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-bold text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sections
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>

            <div className="space-y-4 relative z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
                Student Directory
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                Section <span className="text-blue-600">{section}</span> Class.
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                  <Calendar className="w-4 h-4 text-gray-300" />
                  Batch {batchYear}
                </span>
                <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                  <Users className="w-4 h-4 text-gray-300" />
                  {users.length} Students
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative z-10 w-full lg:w-96">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="SEARCH BY NAME, ID..."
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-wider text-black outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-300 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Student List */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden">
          {status === "loading" && users.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-6" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">
                Loading Class Roster...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-32 text-center bg-gray-50/30 border-2 border-dashed border-gray-100 rounded-[2.5rem] m-4">
              <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <SearchX className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-black mb-2 tracking-tight">
                No students found
              </h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto">
                No matching records for "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Student Profile
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      ID Number
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Attendance
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((student) => {
                    const attendance = getAttendanceForStudent(student.id);
                    return (
                      <tr
                        key={student.id}
                        className="group hover:bg-blue-50/10 transition-all duration-300 cursor-pointer"
                        onClick={() => handleViewProfile(student)}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-500">
                              <img
                                src={getProfileImageUrl(student)}
                                alt={student.first_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-black text-sm group-hover:text-blue-600 transition-colors">
                                {student.first_name} {student.last_name}
                              </h4>
                              <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-tight">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 group-hover:bg-white group-hover:border-blue-100 group-hover:text-blue-600 transition-all">
                            {student.student_id ||
                              student.admission_number ||
                              "PENDING"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span
                              className={`text-sm font-black ${getTextColor(attendance)} transition-colors`}
                            >
                              {attendance}%
                            </span>

                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getBarColor(attendance)} rounded-full transition-all duration-1000`}
                                style={{ width: `${attendance}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group-hover:translate-x-0 translate-x-2"
                            title="View Details"
                          >
                            Profile <ArrowLeft className="w-3 h-3 rotate-180" />
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
