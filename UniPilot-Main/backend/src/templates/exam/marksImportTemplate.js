/**
 * Marks Import Template Generator
 *
 * Generates Excel template for bulk marks import.
 * Customize columns, sample data, and instructions as needed.
 */

const xlsx = require("xlsx");
const config = require("../config/templateConfig");

/**
 * Generate Marks Import Template Excel
 *
 * @param {Array} schedules - Array of exam schedules with course details
 * @returns {Buffer} Excel file buffer
 */
function generateMarksImportTemplate(schedules) {
  // Create main template sheet with sample data
  const templateData = [
    ["Student ID", "Course Code", "Marks", "Attendance", "Remarks"],
    [
      "STU001",
      schedules[0]?.course.code || "COURSE01",
      "75",
      "present",
      "Good",
    ],
    [
      "STU002",
      schedules[0]?.course.code || "COURSE01",
      "0",
      "absent",
      "Medical leave",
    ],
  ];

  // Add instructions if configured
  if (config.exam.marksTemplate.instructions.length > 0) {
    // Instructions can be added as a separate section if needed
    // For now, we'll skip to keep the template clean
  }

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(templateData);

  // Set column widths
  ws["!cols"] = [
    { wch: 15 }, // Student ID
    { wch: 15 }, // Course Code
    { wch: 10 }, // Marks
    { wch: 15 }, // Attendance
    { wch: 30 }, // Remarks
  ];

  xlsx.utils.book_append_sheet(
    wb,
    ws,
    config.exam.marksTemplate.sheetName || "Marks Import Template",
  );

  // Add reference sheet with course list
  const refData = [["Course Code", "Course Name", "Max Marks"]];
  schedules.forEach((s) => {
    refData.push([s.course.code, s.course.name, s.max_marks || 100]);
  });

  const wsRef = xlsx.utils.aoa_to_sheet(refData);
  wsRef["!cols"] = [{ wch: 15 }, { wch: 40 }, { wch: 12 }];

  xlsx.utils.book_append_sheet(
    wb,
    wsRef,
    config.exam.marksTemplate.referenceSheetName || "Course Reference",
  );

  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

module.exports = generateMarksImportTemplate;
