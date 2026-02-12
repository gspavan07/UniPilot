/**
 * Course Results Excel Generator
 *
 * Generates Excel export of exam results for a specific course.
 * Customize columns, formatting, and summary calculations.
 */

const xlsx = require("xlsx");
const config = require("../config/templateConfig");

/**
 * Generate Course Results Excel
 *
 * @param {Object} course - Course object
 * @param {Object} cycle - Exam cycle object
 * @param {Array} results - Array of student results
 * @param {Object} summary - Summary statistics
 * @returns {Buffer} Excel file buffer
 */
function generateCourseResultsExcel(course, cycle, results, summary) {
  const workbook = xlsx.utils.book_new();

  // Summary Sheet
  const summaryData = [
    { Metric: "Course Code", Value: course.code },
    { Metric: "Course Name", Value: course.name },
    { Metric: "Exam Cycle", Value: cycle.name },
    {
      Metric: "Total Students",
      Value: summary.totalStudents || results.length,
    },
    { Metric: "Passed", Value: summary.passedStudents || 0 },
    { Metric: "Failed", Value: summary.failedStudents || 0 },
    { Metric: "Pass %", Value: summary.passPercentage || "0.00" },
    { Metric: "Average Marks", Value: summary.averageMarks || "0.00" },
  ];

  const summarySheet = xlsx.utils.json_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 20 }, { wch: 20 }];
  xlsx.utils.book_append_sheet(
    workbook,
    summarySheet,
    config.excel.sheetNames.summary,
  );

  // Results Sheet
  const excelData = results.map((student) => ({
    "Roll No": student.student_id,
    Name: student.name,
    Section: student.section,
    Batch: student.batch_year,
    ...Object.keys(student.marks || {}).reduce((acc, examType) => {
      acc[examType] = student.marks[examType];
      return acc;
    }, {}),
    Total: student.total,
    Percentage: student.percentage,
    Grade: student.grade,
    Result: student.result,
  }));

  const resultsSheet = xlsx.utils.json_to_sheet(excelData);

  // Set column widths
  resultsSheet["!cols"] = [
    { wch: 12 }, // Roll No
    { wch: 25 }, // Name
    { wch: 10 }, // Section
    { wch: 10 }, // Batch
    { wch: 12 }, // Marks columns (dynamic)
    { wch: 10 }, // Total
    { wch: 12 }, // Percentage
    { wch: 8 }, // Grade
    { wch: 10 }, // Result
  ];

  xlsx.utils.book_append_sheet(
    workbook,
    resultsSheet,
    config.excel.sheetNames.data,
  );

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

module.exports = generateCourseResultsExcel;
