/**
 * Payslip PDF Generator
 *
 * Generates detailed salary slip PDFs for staff members.
 * Customize layout, company branding, and salary breakdown display.
 */

import PDFDocument from "pdfkit";
import config from "../config/templateConfig.js";
import { decrypt } from "../../utils/encryption.js";

/**
 * Generate Payslip PDF
 *
 * @param {Object} payslip - Payslip object with breakdown details
 * @param {Object} staff - Staff user object with department and bank details
 * @param {Stream} stream - Writable stream (response object)
 */
async function generatePayslipPdf(payslip, staff, stream) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(stream);

  // Metrics for layout
  const width = 595.28; // A4 Width
  const margin = 50;
  const contentWidth = width - margin * 2;

  // 1. Header
  doc
    .fontSize(config.pdf.fontSize.title + 4)
    .fillColor(config.pdf.colors.text)
    .font(config.pdf.fonts.heading)
    .text(config.university.name, { align: "center" });

  doc.moveDown(0.2);

  doc
    .fontSize(config.pdf.fontSize.body)
    .fillColor(config.pdf.colors.textLight)
    .font(config.pdf.fonts.body)
    .text(config.university.address, { align: "center" });

  doc.moveDown(1.5);

  // Separator
  doc
    .moveTo(margin, doc.y)
    .lineTo(width - margin, doc.y)
    .strokeColor(config.pdf.colors.border)
    .stroke();

  doc.moveDown(1.5);

  // 2. Title Section
  const monthName = new Date(0, payslip.month - 1).toLocaleString("default", {
    month: "long",
  });

  doc
    .fontSize(config.pdf.fontSize.heading + 2)
    .fillColor(config.pdf.colors.text)
    .font(config.pdf.fonts.heading)
    .text(`${config.hr.payslip.title} for ${monthName}, ${payslip.year}`, {
      align: "center",
    });

  doc.moveDown(1.5);

  // 3. Employee Details Box
  const startY = doc.y;
  doc.rect(margin, startY, contentWidth, 85).fillColor("#f7fafc").fill();

  doc
    .fillColor(config.pdf.colors.text)
    .font(config.pdf.fonts.heading)
    .fontSize(10);

  const leftX = margin + 20;
  const rightX = margin + contentWidth / 2 + 20;
  const rowHeight = 20;
  let currentY = startY + 15;

  doc.text("Employee Name:", leftX, currentY);
  doc
    .font(config.pdf.fonts.body)
    .text(`${staff.first_name} ${staff.last_name}`, leftX + 100, currentY);

  doc.font(config.pdf.fonts.heading).text("Employee ID:", rightX, currentY);
  doc
    .font(config.pdf.fonts.body)
    .text(staff.employee_id || "N/A", rightX + 80, currentY);

  currentY += rowHeight;

  doc.font(config.pdf.fonts.heading).text("Department:", leftX, currentY);
  doc
    .font(config.pdf.fonts.body)
    .text(staff.department?.name || "N/A", leftX + 100, currentY);

  doc.font(config.pdf.fonts.heading).text("Designation:", rightX, currentY);
  doc
    .font(config.pdf.fonts.body)
    .text(
      staff.role
        ? staff.role.charAt(0).toUpperCase() + staff.role.slice(1)
        : "Staff",
      rightX + 80,
      currentY,
    );

  currentY += rowHeight;

  if (config.hr.payslip.includeBankDetails) {
    doc.font(config.pdf.fonts.heading).text("Bank:", leftX, currentY);
    doc
      .font(config.pdf.fonts.body)
      .text(staff.bank_details?.bank_name || "-", leftX + 100, currentY);

    doc.font(config.pdf.fonts.heading).text("Account No:", rightX, currentY);
    doc
      .font(config.pdf.fonts.body)
      .text(
        staff.bank_details?.account_number
          ? `****${String(decrypt(staff.bank_details.account_number)).slice(-4)}`
          : "-",
        rightX + 80,
        currentY,
      );
  }

  doc.moveDown(4);

  // 4. Tables (Earnings & Deductions)
  const tableTop = doc.y;
  const colWidth = contentWidth / 2 - 10;

  // -- Earnings Table --
  doc
    .fillColor(config.pdf.colors.primary)
    .font(config.pdf.fonts.heading)
    .fontSize(config.pdf.fontSize.subheading)
    .text("Earnings", margin, tableTop);

  doc
    .moveTo(margin, tableTop + 20)
    .lineTo(margin + colWidth, tableTop + 20)
    .strokeColor(config.pdf.colors.primary)
    .lineWidth(2)
    .stroke();

  let earnY = tableTop + 30;

  // Basic Salary
  doc
    .fillColor(config.pdf.colors.textLight)
    .font(config.pdf.fonts.body)
    .fontSize(config.pdf.fontSize.body)
    .text("Basic Salary", margin, earnY);
  doc
    .font(config.pdf.fonts.heading)
    .text(
      `${config.currency.symbol} ${Number(payslip.breakdown?.basic || 0).toLocaleString(config.currency.locale)}`,
      margin + colWidth - 80,
      earnY,
      { align: "right", width: 80 },
    );
  earnY += 20;

  // Allowances
  doc.font(config.pdf.fonts.body).text("Total Allowances", margin, earnY);
  doc
    .font(config.pdf.fonts.heading)
    .text(
      `${config.currency.symbol} ${(Number(payslip.total_earnings) - Number(payslip.breakdown?.basic || 0)).toLocaleString(config.currency.locale)}`,
      margin + colWidth - 80,
      earnY,
      { align: "right", width: 80 },
    );
  earnY += 20;

  doc
    .moveTo(margin, earnY + 5)
    .lineTo(margin + colWidth, earnY + 5)
    .lineWidth(1)
    .strokeColor(config.pdf.colors.border)
    .stroke();
  earnY += 15;

  doc
    .fillColor(config.pdf.colors.text)
    .font(config.pdf.fonts.heading)
    .text("Total Earnings", margin, earnY);
  doc.text(
    `${config.currency.symbol} ${Number(payslip.total_earnings).toLocaleString(config.currency.locale)}`,
    margin + colWidth - 80,
    earnY,
    { align: "right", width: 80 },
  );

  // -- Deductions Table --
  doc
    .fillColor(config.pdf.colors.primary)
    .font(config.pdf.fonts.heading)
    .fontSize(config.pdf.fontSize.subheading)
    .text("Deductions", margin + colWidth + 20, tableTop);
  doc
    .moveTo(margin + colWidth + 20, tableTop + 20)
    .lineTo(margin + colWidth + 20 + colWidth, tableTop + 20)
    .strokeColor(config.pdf.colors.primary)
    .lineWidth(2)
    .stroke();

  let dedY = tableTop + 30;

  doc
    .fillColor(config.pdf.colors.textLight)
    .font(config.pdf.fonts.body)
    .fontSize(config.pdf.fontSize.body)
    .text("Total Deductions", margin + colWidth + 20, dedY);
  doc
    .font(config.pdf.fonts.heading)
    .text(
      `${config.currency.symbol} ${Number(payslip.total_deductions).toLocaleString(config.currency.locale)}`,
      margin + colWidth + 20 + colWidth - 80,
      dedY,
      { align: "right", width: 80 },
    );
  dedY += 20;

  doc
    .moveTo(margin + colWidth + 20, dedY + 25)
    .lineTo(margin + colWidth + 20 + colWidth, dedY + 25)
    .lineWidth(1)
    .strokeColor(config.pdf.colors.border)
    .stroke();
  dedY += 35;

  doc
    .fillColor(config.pdf.colors.text)
    .font(config.pdf.fonts.heading)
    .text("Total Deductions", margin + colWidth + 20, dedY);
  doc.text(
    `${config.currency.symbol} ${Number(payslip.total_deductions).toLocaleString(config.currency.locale)}`,
    margin + colWidth + 20 + colWidth - 80,
    dedY,
    { align: "right", width: 80 },
  );

  // 5. Net Pay (Highlighted)
  const maxY = Math.max(earnY, dedY) + 50;

  doc.rect(margin, maxY, contentWidth, 40).fillColor("#edf2f7").fill();
  doc
    .moveTo(margin, maxY)
    .lineTo(margin + contentWidth, maxY)
    .strokeColor(config.pdf.colors.primary)
    .lineWidth(2)
    .stroke();

  doc
    .fillColor(config.pdf.colors.primary)
    .fontSize(config.pdf.fontSize.heading)
    .font(config.pdf.fonts.heading)
    .text("NET SALARY PAYABLE", margin + 20, maxY + 13);

  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(config.pdf.fontSize.heading + 2)
    .font(config.pdf.fonts.heading)
    .text(
      `${config.currency.symbol} ${Number(payslip.net_salary).toLocaleString(config.currency.locale)}`,
      width - margin - 150,
      maxY + 12,
      { align: "right", width: 130 },
    );

  // 6. Footer
  const footerY = maxY + 100;

  if (config.hr.payslip.confidentialityNotice) {
    doc
      .fontSize(config.pdf.fontSize.body)
      .fillColor(config.pdf.colors.textLight)
      .font("Helvetica-Oblique")
      .text(config.hr.payslip.confidentialityNotice, margin, footerY, {
        align: "center",
      });
  }

  doc
    .fontSize(config.pdf.fontSize.small)
    .text(
      `Generated on: ${new Date().toLocaleDateString(config.currency.locale)}`,
      margin,
      footerY + 15,
      {
        align: "center",
      },
    );

  doc.end();
}

export default generatePayslipPdf;
