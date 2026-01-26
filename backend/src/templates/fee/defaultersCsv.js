/**
 * Fee Defaulters CSV Generator
 *
 * Generates CSV export of students with outstanding fees.
 * Customize columns and sorting as needed.
 */

const config = require("../config/templateConfig");

/**
 * Generate Fee Defaulters CSV
 *
 * @param {Array} defaulters - Array of student defaulter objects
 * @returns {String} CSV content
 */
function generateDefaultersCsv(defaulters) {
  const columns = config.fee.defaulters.columns;

  // Generate header row
  let csv = columns.join(config.csv.delimiter) + "\n";

  // Generate data rows
  defaulters.forEach((student) => {
    const row = [];

    columns.forEach((column) => {
      switch (column) {
        case "Student ID":
          row.push(`"${student.student_id || ""}"`);
          break;
        case "Name":
          row.push(`"${student.name || ""}"`);
          break;
        case "Program":
          row.push(`"${student.program || ""}"`);
          break;
        case "Semester":
          row.push(`${student.semester || ""}`);
          break;
        case "Total Fee":
          row.push(`${student.totalFee || 0}`);
          break;
        case "Paid":
          row.push(`${student.totalPaid || 0}`);
          break;
        case "Outstanding":
          row.push(`${student.outstanding || 0}`);
          break;
        case "Contact":
          row.push(`"${student.phone || student.email || ""}"`);
          break;
        default:
          row.push('""');
      }
    });

    csv += row.join(config.csv.delimiter) + "\n";
  });

  return csv;
}

module.exports = generateDefaultersCsv;
