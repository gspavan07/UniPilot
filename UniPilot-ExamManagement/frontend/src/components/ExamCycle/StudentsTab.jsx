import React, { useState, useEffect, useMemo } from "react";
import { getCycleStudents } from "../../services/examCycleService";
import {
  Users,
  Search,
  Download,
  Filter,
  BookOpen,
  Layout,
  CreditCard,
} from "lucide-react";

const StudentsTab = ({ cycleId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    fetchData();
  }, [cycleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getCycleStudents(cycleId);
      setData(response.data.data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!data) return [];

    return data.students.filter((student) => {
      // Search filter
      const matchesSearch =
        (student.roll_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.first_name || ""} ${student.last_name || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Program filter
      const matchesProgram =
        selectedProgram === "all" || student.program_id === selectedProgram;

      // Section filter
      const matchesSection =
        selectedSection === "all" || student.section === selectedSection;

      // Course filter (based on timetable programs)
      let matchesCourse = true;
      if (selectedCourse !== "all") {
        const courseTimetable = data.timetables.find(
          (t) => t.id === selectedCourse,
        );
        if (courseTimetable) {
          // Check if student's program is in the course's program array
          matchesCourse = courseTimetable.program_id.includes(
            student.program_id,
          );
        }
      }

      return matchesSearch && matchesProgram && matchesSection && matchesCourse;
    });
  }, [data, searchTerm, selectedProgram, selectedSection, selectedCourse]);

  const exportToCSV = () => {
    if (!filteredStudents.length) return;

    const headers = [
      "Roll No",
      "Name",
      "Program",
      "Section",
      data?.cycle_info?.needs_fee ? "Amount Paid" : "Status",
    ];
    const rows = filteredStudents.map((s) => [
      s.roll_no,
      `${s.first_name} ${s.last_name}`,
      s.program_name,
      s.section || "N/A",
      data?.cycle_info?.needs_fee ? s.amount_paid : s.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `students_${data?.cycle_info?.cycle_name}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-medium">
        Loading students...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500 font-medium">
        {error}
      </div>
    );

  const totalPaid = data.students.reduce(
    (acc, s) => acc + (parseFloat(s.amount_paid) || 0),
    0,
  );

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div className="students-tab-title">
          <h2 className="text-[1.75rem] font-bold text-slate-800 mb-1">
            {data.cycle_info?.needs_fee
              ? "Registered Students"
              : "Eligible Students"}
          </h2>
          <p className="text-slate-500 text-[0.95rem]">
            Total {filteredStudents.length} students showing
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-[0.6rem] bg-sky-500 text-white px-[1.2rem] py-[0.6rem] rounded-[10px] font-medium border-none cursor-pointer transition-all duration-200 shadow-[0_4px_6px_-1px_rgba(14,165,233,0.2),0_2px_4px_-1px_rgba(14,165,233,0.1)] hover:bg-sky-600 hover:-translate-y-[1px]"
            onClick={exportToCSV}
          >
            <Download size={18} /> Export List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mb-8">
        <div className="bg-white p-6 rounded-[16px] flex items-center gap-[1.25rem] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200/80 transition-transform duration-200 hover:-translate-y-[2px]">
          <div className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-sky-100 text-sky-500">
            <Users size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.875rem] text-slate-500 font-medium">
              Total Students
            </span>
            <span className="text-[1.25rem] font-bold text-slate-800">
              {data.students.length}
            </span>
          </div>
        </div>
        {data.cycle_info?.needs_fee && (
          <div className="bg-white p-6 rounded-[16px] flex items-center gap-[1.25rem] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200/80 transition-transform duration-200 hover:-translate-y-[2px]">
            <div className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-green-100 text-green-500">
              <CreditCard size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[0.875rem] text-slate-500 font-medium">
                Total Amount Collected
              </span>
              <span className="text-[1.25rem] font-bold text-slate-800">
                ₹{totalPaid.toLocaleString()}
              </span>
            </div>
          </div>
        )}
        <div className="bg-white p-6 rounded-[16px] flex items-center gap-[1.25rem] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200/80 transition-transform duration-200 hover:-translate-y-[2px]">
          <div className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-purple-100 text-purple-500">
            <BookOpen size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.875rem] text-slate-500 font-medium">
              Courses Tracked
            </span>
            <span className="text-[1.25rem] font-bold text-slate-800">
              {data.timetables.length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[16px] mb-6 flex flex-wrap gap-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200/80 items-end">
        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-[0.8rem] font-semibold text-slate-500 uppercase tracking-wider">
            Search
          </label>
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-slate-400" size={18} />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-[0.6rem] rounded-[10px] border border-slate-200 text-[0.95rem] text-slate-800 bg-slate-50 transition-all duration-200 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
              placeholder="Roll No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-[0.8rem] font-semibold text-slate-500 uppercase tracking-wider">
            Program
          </label>
          <div className="relative flex items-center">
            <Layout className="absolute left-3 text-slate-400" size={18} />
            <select
              className="w-full pl-10 pr-10 py-[0.6rem] rounded-[10px] border border-slate-200 text-[0.95rem] text-slate-800 bg-slate-50 transition-all duration-200 appearance-none focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 cursor-pointer bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_fill=%22none%22_viewBox=%220_0_24_24%22_stroke=%22%2364748b%22%3E%3Cpath_stroke-linecap=%22round%22_stroke-linejoin=%22round%22_stroke-width=%222%22_d=%22M19_9l-7_7-7-7%22%3E%3C/path%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="all">All Programs</option>
              {data.filters.programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-[0.8rem] font-semibold text-slate-500 uppercase tracking-wider">
            Section
          </label>
          <div className="relative flex items-center">
            <Users className="absolute left-3 text-slate-400" size={18} />
            <select
              className="w-full pl-10 pr-10 py-[0.6rem] rounded-[10px] border border-slate-200 text-[0.95rem] text-slate-800 bg-slate-50 transition-all duration-200 appearance-none focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 cursor-pointer bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_fill=%22none%22_viewBox=%220_0_24_24%22_stroke=%22%2364748b%22%3E%3Cpath_stroke-linecap=%22round%22_stroke-linejoin=%22round%22_stroke-width=%222%22_d=%22M19_9l-7_7-7-7%22%3E%3C/path%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="all">All Sections</option>
              {data.filters.sections.map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-[0.8rem] font-semibold text-slate-500 uppercase tracking-wider">
            Course Filter
          </label>
          <div className="relative flex items-center">
            <Filter className="absolute left-3 text-slate-400" size={18} />
            <select
              className="w-full pl-10 pr-10 py-[0.6rem] rounded-[10px] border border-slate-200 text-[0.95rem] text-slate-800 bg-slate-50 transition-all duration-200 appearance-none focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 cursor-pointer bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_fill=%22none%22_viewBox=%220_0_24_24%22_stroke=%22%2364748b%22%3E%3Cpath_stroke-linecap=%22round%22_stroke-linejoin=%22round%22_stroke-width=%222%22_d=%22M19_9l-7_7-7-7%22%3E%3C/path%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {data.timetables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.course?.course_name} ({t.course?.course_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm ||
          selectedProgram !== "all" ||
          selectedSection !== "all" ||
          selectedCourse !== "all") && (
            <button
              className="bg-slate-100 text-slate-500 border-none px-4 py-[0.6rem] rounded-[10px] font-semibold cursor-pointer transition-all duration-200 h-[38px] hover:bg-slate-200 hover:text-slate-800"
              onClick={() => {
                setSearchTerm("");
                setSelectedProgram("all");
                setSelectedSection("all");
                setSelectedCourse("all");
              }}
            >
              Reset
            </button>
          )}
      </div>

      <div className="bg-white rounded-[16px] overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200/80">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-slate-50 px-6 py-4 text-left text-[0.8rem] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                Student Details
              </th>
              <th className="bg-slate-50 px-6 py-4 text-left text-[0.8rem] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                Program
              </th>
              <th className="bg-slate-50 px-6 py-4 text-left text-[0.8rem] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                Section
              </th>
              {data.cycle_info?.needs_fee && (
                <th className="bg-slate-50 px-6 py-4 text-left text-[0.8rem] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                  Payment Status
                </th>
              )}
              {data.cycle_info?.publish_eligibility && (
                <th className="bg-slate-50 px-6 py-4 text-left text-[0.8rem] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                  Eligibility Status
                </th>
              )}
              {!data.cycle_info?.needs_fee &&
                !data.cycle_info?.publish_eligibility && (
                  <th className="bg-slate-50 px-6 py-4 text-left text-[0.8rem] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                    Base Status
                  </th>
                )}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const isPaid = student.payment_status === "paid";
                const eligibilityStatus = student.eligibility_status || "pending_sync";

                let statusBadgeClasses = "px-3 py-1 rounded-full text-[0.8rem] font-semibold capitalize ";
                if (eligibilityStatus === "eligible") statusBadgeClasses += "bg-green-100 text-green-800";
                else if (eligibilityStatus === "condonation") statusBadgeClasses += "bg-yellow-100 text-yellow-800";
                else if (eligibilityStatus === "detained") statusBadgeClasses += "bg-red-100 text-red-800";
                else if (eligibilityStatus === "bypassed") statusBadgeClasses += "bg-purple-100 text-purple-800";
                else if (eligibilityStatus === "pending_sync")
                  statusBadgeClasses += "bg-slate-100 text-slate-600 border border-dashed border-slate-300";
                else statusBadgeClasses += "bg-slate-100 text-slate-700";

                return (
                  <tr key={student.id} className="last:border-b-0">
                    <td className="px-6 py-5 border-b border-slate-100 align-middle">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-[0.95rem]">
                          {student.first_name} {student.last_name}
                        </span>
                        <span className="text-[0.85rem] text-slate-400 font-mono">
                          {student.roll_no}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 border-b border-slate-100 align-middle">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[0.8rem] font-medium">
                        {student.program_name}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-b border-slate-100 align-middle">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-500 rounded-lg font-bold text-[0.85rem] border border-blue-100">
                        {student.section || "-"}
                      </span>
                    </td>

                    {data.cycle_info?.needs_fee && (
                      <td className="px-6 py-5 border-b border-slate-100 align-middle">
                        <div className="flex flex-col">
                          <span className={`font-medium ${isPaid ? "text-green-500" : "text-amber-500"}`}>
                            {isPaid
                              ? `Paid: ₹${(student.amount_paid || 0).toLocaleString()}`
                              : "Pending Payment"}
                          </span>
                          {student.payment_date && (
                            <span className="text-[0.75rem] text-slate-400">
                              {new Date(student.payment_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {data.cycle_info?.publish_eligibility && (
                      <td className="px-6 py-5 border-b border-slate-100 align-middle">
                        <span className={statusBadgeClasses}>
                          {eligibilityStatus.replace("_", " ")}
                        </span>
                      </td>
                    )}

                    {!data.cycle_info?.needs_fee && !data.cycle_info?.publish_eligibility && (
                      <td className="px-6 py-5 border-b border-slate-100 align-middle">
                        <span className="px-3 py-1 rounded-full text-[0.8rem] font-semibold capitalize bg-blue-50 text-blue-700">
                          Enrolled
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-5 align-middle">
                  <div className="text-center py-16 px-8">
                    <Users className="text-slate-200 mb-4 mx-auto" size={48} />
                    <h3 className="text-slate-600 font-semibold">No Students Found</h3>
                    <p className="text-slate-400">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTab;
