import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, UserCheck, TrendingUp, ChevronDown } from "lucide-react";
import { fetchMyAttendance } from "../../store/slices/attendanceSlice";

const MyAttendance = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { records, summary, courseWise } = useSelector(
    (state) => state.attendance,
  );
  const [selectedSemester, setSelectedSemester] = useState(
    user?.current_semester || 1,
  );
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    dispatch(fetchMyAttendance({ semester: selectedSemester }));
  }, [dispatch, selectedSemester]);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-12">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
            <div className="space-y-2 relative z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
                Academic Records
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                Attendance <span className="text-blue-600">Analytics.</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Track your presence and maintain academic compliance.
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-300 shadow-sm">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                className="appearance-none bg-transparent font-black text-blue-600 border-none outline-none pr-10 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              label: "Total Sessions",
              value: summary?.total || 0,
              icon: Calendar,
            },
            {
              label: "Total Attended",
              value: summary?.present || 0,
              icon: UserCheck,
            },
            {
              label: "Attendance Rate",
              value: `${summary?.percentage || 0}%`,
              icon: TrendingUp,
              isAlert: (summary?.percentage || 0) < 75,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-8 rounded-[2rem] border border-blue-300 transition-all duration-500 shadow-md shadow-black/[0.02] ${stat.isAlert ? "border-red-200 bg-red-50/30" : "border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1"}`}
            >
              <stat.icon
                className={`w-6 h-6 mb-6 ${stat.isAlert ? "text-red-500" : "text-blue-600"}`}
              />
              <p className="text-4xl font-black text-black mb-1">
                {stat.value}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-100">
          {["overview", "coursewise"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-300 hover:text-gray-500"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Session Date
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Course Module
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records?.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="px-8 py-5 text-sm font-bold text-gray-900">
                      {new Date(record.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-black">
                      {record.course?.name || "Academic Session"}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${record.status === "present" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courseWise?.map((course) => (
              <div
                key={course.course_id}
                className="p-8 rounded-[2.5rem] bg-white border border-gray-300 shadow-md shadow-black/[0.02] hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {course.course_code}
                  </span>
                  <span
                    className={`text-2xl font-black ${parseFloat(course.percentage) < 75 ? "text-red-500" : "text-blue-600"}`}
                  >
                    {course.percentage}%
                  </span>
                </div>
                <h4 className="text-xl font-black text-black mb-8 leading-tight group-hover:text-blue-600 transition-colors">
                  {course.course_name}
                </h4>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden mb-8">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${parseFloat(course.percentage) < 75 ? "bg-red-500" : "bg-blue-600"}`}
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between border-t border-gray-50 pt-6">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-gray-300 uppercase mb-1">
                      Total
                    </p>
                    <p className="font-black text-black">{course.total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black  uppercase mb-1 text-green-600">
                      Present
                    </p>
                    <p className="font-black text-green-600">
                      {course.present}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase mb-1 text-red-500">
                      Absent
                    </p>
                    <p className="font-black text-red-500">{course.absent}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendance;
