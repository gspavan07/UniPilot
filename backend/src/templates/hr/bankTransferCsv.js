/**
 * Bank Transfer CSV Generator
 *
 * Generates CSV file for salary bank transfers.
 * Customize column order and format for your bank's requirements.
 */

const config = require("../config/templateConfig");
const { decrypt } = require("../../utils/encryption");

/**
 * Generate Bank Transfer CSV
 *
 * @param {Array} payslips - Array of payslip objects with staff details
 * @returns {String} CSV content
 */
function generateBankTransferCsv(payslips) {
  const columns = config.hr.bankTransfer.columns;

  // Generate header row
  let csv = columns.join(config.csv.delimiter) + "\n";

  // Generate data rows
  payslips.forEach((p) => {
    const bank = p.staff.bank_details || {};
    const accNum = bank.account_number ? decrypt(bank.account_number) : "";

    const row = [];

    columns.forEach((column) => {
      switch (column) {
        case "Employee ID":
          row.push(`"${p.staff.employee_id || ""}"`);
          break;
        case "Employee Name":
          row.push(`"${p.staff.first_name} ${p.staff.last_name}"`);
          break;
        case "Account Number":
          row.push(`"${accNum}"`);
          break;
        case "IFSC Code":
          row.push(`"${bank.ifsc_code || ""}"`);
          break;
        case "Amount":
          row.push(`${p.net_salary}`);
          break;
        case "Narration":
          const monthName = new Date(0, p.month - 1).toLocaleString("default", {
            month: "short",
          });
          row.push(`"Salary ${monthName} ${p.year}"`);
          break;
        default:
          row.push('""');
      }
    });

    csv += row.join(config.csv.delimiter) + "\n";
  });

  return csv;
}

module.exports = generateBankTransferCsv;
