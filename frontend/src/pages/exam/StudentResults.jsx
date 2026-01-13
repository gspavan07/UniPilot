import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trophy,
  BookOpen,
  FileText,
  Award,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  PieChart,
} from "lucide-react";
import { fetchMyResults } from "../../store/slices/examSlice";

const StudentResults = () => {
  const dispatch = useDispatch();
  const { myResults, gpa, status } = useSelector((state) => state.exam);
  const { user } = useSelector((state) => state.auth);
  const [selectedSemester, setSelectedSemester] = React.useState(
    user?.current_semester || 1
  );

  useEffect(() => {
    dispatch(fetchMyResults({ semester: selectedSemester }));
  }, [dispatch, selectedSemester]);

  const calculateGPA = () => {
    // Use GPA from backend if available
    return gpa?.currentSemester || "0.00";
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Academic Performance</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your examination results and grade history
            </p>
          </div>
        </div>

        <button className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <Download className="w-4 h-4 mr-2" /> Download Marksheet (PDF)
        </button>
        {/* Semester Selector */}
        <div className="flex justify-end">
          <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <label className="text-sm font-bold text-gray-500">
              View Semester:
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
              className="px-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
              Current Semester GPA
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {calculateGPA()}
            </p>
          </div>
          <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-50 opacity-10 dark:opacity-5" />
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg border-none relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Overall CGPA
            </h3>
            <p className="text-4xl font-black text-white">
              {gpa?.overall || "0.00"}
            </p>
          </div>
          <Trophy className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            Courses Cleared
          </h3>
          <p className="text-3xl font-bold">
            {myResults.filter((r) => r.grade !== "F").length} /{" "}
            {myResults.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            Passing Status
          </h3>
          <div className="flex items-center mt-1">
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
            <span className="text-xl font-bold text-green-600 uppercase">
              Promoted
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold">Subject-wise Results</h3>
          <div className="flex items-center text-xs text-gray-400 uppercase font-bold tracking-wider">
            <Clock className="w-4 h-4 mr-1.5" /> Published on Oct 12, 2026
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Subject Code</th>
                <th className="px-6 py-4">Subject Name</th>
                <th className="px-6 py-4 text-center">Marks</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {myResults.map((res) => (
                <tr
                  key={res.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                    {res.schedule?.course?.code || "SUB001"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {res.schedule?.course?.name}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold">
                    {res.marks_obtained}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        res.grade === "A+" || res.grade === "A"
                          ? "bg-green-100 text-green-700"
                          : res.grade === "F"
                            ? "bg-red-100 text-red-700"
                            : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {res.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`flex items-center text-sm font-bold ${res.grade === "F" ? "text-red-500" : "text-green-500"}`}
                    >
                      {res.grade === "F" ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-1.5" /> Fail
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Pass
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
              {myResults.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <PieChart className="w-12 h-12 mx-auto mb-3 opacity-10" />
                    <p>No results have been published for this semester yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
