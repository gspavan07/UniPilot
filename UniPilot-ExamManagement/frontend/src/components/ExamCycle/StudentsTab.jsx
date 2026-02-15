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
import "./StudentsTab.css";

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
        student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.first_name} ${student.last_name}`
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

  if (loading) return <div className="loading-state">Loading students...</div>;
  if (error) return <div className="error-state">{error}</div>;

  const totalPaid = data.students.reduce(
    (acc, s) => acc + (parseFloat(s.amount_paid) || 0),
    0,
  );

  return (
    <div className="students-tab-container">
      <div className="students-tab-header">
        <div className="students-tab-title">
          <h2>
            {data.cycle_info?.needs_fee
              ? "Registered Students"
              : "Eligible Students"}
          </h2>
          <p>Total {filteredStudents.length} students showing</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={exportToCSV}>
            <Download size={18} /> Export List
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="icon-box">
            <Users size={24} />
          </div>
          <div className="data">
            <span className="label">Total Students</span>
            <span className="value">{data.students.length}</span>
          </div>
        </div>
        {data.cycle_info?.needs_fee && (
          <div className="stat-card green">
            <div className="icon-box">
              <CreditCard size={24} />
            </div>
            <div className="data">
              <span className="label">Total Amount Collected</span>
              <span className="value">₹{totalPaid.toLocaleString()}</span>
            </div>
          </div>
        )}
        <div className="stat-card purple">
          <div className="icon-box">
            <BookOpen size={24} />
          </div>
          <div className="data">
            <span className="label">Courses Tracked</span>
            <span className="value">{data.timetables.length}</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <label>Search</label>
          <div className="input-container">
            <Search className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Roll No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Program</label>
          <div className="input-container">
            <Layout className="input-icon" size={18} />
            <select
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

        <div className="filter-group">
          <label>Section</label>
          <div className="input-container">
            <Users className="input-icon" size={18} />
            <select
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

        <div className="filter-group">
          <label>Course Filter</label>
          <div className="input-container">
            <Filter className="input-icon" size={18} />
            <select
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
            className="btn-reset"
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

      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Program</th>
              <th>Section</th>
              {data.cycle_info?.needs_fee && <th>Payment Status</th>}
              {data.cycle_info?.publish_eligibility && (
                <th>Eligibility Status</th>
              )}
              {!data.cycle_info?.needs_fee &&
                !data.cycle_info?.publish_eligibility && <th>Base Status</th>}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-identity">
                      <span className="name">
                        {student.first_name} {student.last_name}
                      </span>
                      <span className="roll">{student.roll_no}</span>
                    </div>
                  </td>
                  <td>
                    <span className="program-badge">
                      {student.program_name}
                    </span>
                  </td>
                  <td>
                    <span className="section-badge">
                      {student.section || "-"}
                    </span>
                  </td>

                  {data.cycle_info?.needs_fee && (
                    <td>
                      <div className={`payment-info ${student.payment_status}`}>
                        <span className="amount">
                          {student.payment_status === "paid"
                            ? `Paid: ₹${(student.amount_paid || 0).toLocaleString()}`
                            : "Pending Payment"}
                        </span>
                        {student.payment_date && (
                          <span className="date">
                            {new Date(
                              student.payment_date,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  {data.cycle_info?.publish_eligibility && (
                    <td>
                      <span
                        className={`status-badge ${student.eligibility_status}`}
                      >
                        {student.eligibility_status.replace("_", " ")}
                      </span>
                    </td>
                  )}

                  {!data.cycle_info?.needs_fee &&
                    !data.cycle_info?.publish_eligibility && (
                      <td>
                        <span className="status-badge base">Enrolled</span>
                      </td>
                    )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <Users className="icon" size={48} />
                    <h3>No Students Found</h3>
                    <p>Try adjusting your search or filters</p>
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
