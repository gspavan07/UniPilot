/**
 * Exam Receipt PDF Generator
 *
 * Generates exam payment receipt PDFs for students.
 * Customize layout and branding as needed.
 */

const PDFDocument = require("pdfkit");
const config = require("../config/templateConfig");

/**
 * Generate Exam Payment Receipt PDF
 *
 * @param {Object} registration - Exam registration object with payment details
 * @param {Stream} stream - Writable stream (response object)
 */
async function generateExamReceiptPdf(registration, stream) {
  const doc = new PDFDocument({ margin: 50, size: config.pdf.pageSize });

  doc.pipe(stream);

  // Header
  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(config.pdf.fontSize.title)
    .font(config.pdf.fonts.heading)
    .text(config.university.name.toUpperCase(), { align: "center" });

  doc
    .fontSize(config.pdf.fontSize.body)
    .fillColor(config.pdf.colors.textLight)
    .text(config.university.address, { align: "center" });
  doc.text(`${config.university.phone} | ${config.university.email}`, {
    align: "center",
  });

  doc.moveDown(2);

  // Receipt Title
  doc
    .fillColor(config.pdf.colors.primary)
    .fontSize(config.pdf.fontSize.heading)
    .font(config.pdf.fonts.heading)
    .text(config.exam.receipt.title, { align: "center" });

  doc.moveDown(1);

  // Box for details
  const startY = doc.y;
  doc.rect(50, startY, 500, 260).strokeColor(config.pdf.colors.border).stroke();

  const leftX = 70;
  const valueX = 220;
  let currentY = startY + 20;

  // Helper for rows
  const drawRow = (label, value) => {
    doc
      .fontSize(10)
      .font(config.pdf.fonts.heading)
      .text(label, leftX, currentY);
    doc.font(config.pdf.fonts.body).text(value, valueX, currentY);
    currentY += 25;
  };

  drawRow(
    "Receipt Number:",
    registration.transaction_id ||
      `REC-${registration.id.split("-")[0].toUpperCase()}`,
  );
  drawRow("Date:", new Date(registration.updatedAt).toLocaleDateString());
  drawRow(
    "Student Name:",
    `${registration.student.first_name} ${registration.student.last_name}`,
  );
  drawRow("Student ID:", registration.student.student_id);
  drawRow("Email:", registration.student.email);

  doc
    .moveTo(70, currentY)
    .lineTo(530, currentY)
    .strokeColor(config.pdf.colors.border)
    .stroke();
  currentY += 20;

  doc.fontSize(config.pdf.fontSize.heading).text("Exam Details");
  doc
    .fontSize(config.pdf.fontSize.body)
    .text(`Cycle: ${registration.cycle.name}`);
  doc.text(`Session: ${registration.cycle.month} ${registration.cycle.year}`);
  drawRow("Payment Status:", registration.fee_status.toUpperCase());

  doc
    .moveTo(70, currentY)
    .lineTo(530, currentY)
    .strokeColor(config.pdf.colors.border)
    .stroke();
  currentY += 20;

  doc
    .fontSize(config.pdf.fontSize.subheading)
    .font(config.pdf.fonts.heading)
    .text("Amount Paid:", leftX, currentY);
  doc
    .fontSize(config.pdf.fontSize.subheading)
    .fillColor(config.pdf.colors.accent)
    .text(
      `${config.currency.symbol} ${registration.total_fee}`,
      valueX,
      currentY,
    )
    .fillColor(config.pdf.colors.text);

  // Footer
  doc.moveDown(10);
  doc
    .fontSize(config.pdf.fontSize.body)
    .font("Helvetica-Oblique")
    .text(
      "This is a computer-generated receipt and does not require a physical signature.",
      { align: "center", color: "gray" },
    );
  doc
    .fontSize(config.pdf.fontSize.small)
    .text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });

  doc.end();
}

module.exports = generateExamReceiptPdf;
