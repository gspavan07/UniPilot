/**
 * Department Results Excel Generator
 *
 * Generates Excel export of exam results for an entire department.
 * Customize for department-specific reporting needs.
 */

const xlsx = require("xlsx");
const config = require("../config/templateConfig");

/**
 * Generate Department Results Excel
 *
 * @param {String} departmentName - Name of the department
 * @param {Object} cycle - Exam cycle object
 * @param {Array} studentResults - Array of student results with course details
 * @param {Object} summary - Summary statistics
 * @returns {Buffer} Excel file buffer
 */
function generateDepartmentResultsExcel(
  departmentName,
  cycle,
  studentResults,
  summary,
) {
  const workbook = xlsx.utils.book_new();

  // Summary Sheet
  const summaryData = [
    { Metric: "Department", Value: departmentName },
    { Metric: "Exam Cycle", Value: cycle.name },
    {
      Metric: "Total Students",
      Value: summary.totalStudents || studentResults.length,
    },
    { Metric: "Courses Evaluated", Value: summary.totalCourses || 0 },
    {
      Metric: "Overall Pass %",
      Value: summary.overallPassPercentage || "0.00",
    },
  ];

  const summarySheet = xlsx.utils.json_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
  xlsx.utils.book_append_sheet(
    workbook,
    summarySheet,
    config.excel.sheetNames.summary,
  );

  // Student Results Sheet
  const excelData = studentResults.map((student) => ({
    "Roll No": student.student_id,
    Name: student.name,
    Section: student.section,
    Batch: student.batch,
    Semester: student.semester,
    ...Object.keys(student.courses || {}).reduce((acc, courseCode) => {
      const courseData = student.courses[courseCode];
      acc[`${courseCode} Total`] = courseData.total;
      acc[`${courseCode} Grade`] = courseData.grade || "";
      return acc;
    }, {}),
    "Overall SGPA": student.sgpa || "",
    Status: student.status || "",
  }));

  const resultsSheet = xlsx.utils.json_to_sheet(excelData);

  // Set column widths (basic)
  resultsSheet["!cols"] = Array(20).fill({ wch: 12 });

  xlsx.utils.book_append_sheet(workbook, resultsSheet, "Student Results");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

module.exports = generateDepartmentResultsExcel;
