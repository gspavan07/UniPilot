/**
 * Hall Ticket PDF Generator
 *
 * Generates examination hall tickets for students.
 * Customize layout, styling, and content as needed for your college.
 */

const PDFDocument = require("pdfkit");
const config = require("../config/templateConfig");

/**
 * Generate Hall Ticket PDF
 *
 * @param {Object} registration - Exam registration object with student and cycle details
 * @param {Array} schedules - Array of exam schedules
 * @param {Stream} stream - Writable stream (response object)
 */
async function generateHallTicketPdf(registration, schedules, stream) {
  const doc = new PDFDocument({
    margin: config.pdf.margins.top,
    size: config.pdf.pageSize,
  });

  doc.pipe(stream);

  // -- Header Design --
  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(config.pdf.fontSize.title)
    .font(config.pdf.fonts.heading)
    .text(config.university.name.toUpperCase(), { align: "center" });

  doc
    .fontSize(config.pdf.fontSize.body)
    .fillColor(config.pdf.colors.primary)
    .text(config.exam.hallTicket.title, {
      align: "center",
      characterSpacing: 2,
    });

  doc.moveDown(1);
  doc
    .strokeColor(config.pdf.colors.border)
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(1.5);

  // -- Student Info --
  const startY = doc.y;
  doc
    .fillColor(config.pdf.colors.textLight)
    .fontSize(9)
    .font(config.pdf.fonts.heading)
    .text("STUDENT NAME", 50, startY);
  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(11)
    .text(
      `${registration.student.first_name} ${registration.student.last_name}`.toUpperCase(),
      50,
      startY + 14,
    );

  doc
    .fillColor(config.pdf.colors.textLight)
    .fontSize(9)
    .text("ROLL NUMBER", 350, startY);
  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(11)
    .text(
      (registration.student.student_id || "").toUpperCase(),
      350,
      startY + 14,
    );

  doc.moveDown(2.5);

  const nextY = doc.y;
  doc
    .fillColor(config.pdf.colors.textLight)
    .fontSize(9)
    .text("PROGRAM & SECTION", 50, nextY);
  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(11)
    .text(`B.TECH - ${registration.student.section}`, 50, nextY + 14);

  doc
    .fillColor(config.pdf.colors.textLight)
    .fontSize(9)
    .text("EXAM CYCLE", 350, nextY);
  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(11)
    .text(registration.cycle.name, 350, nextY + 14);

  doc.moveDown(3);

  // -- Schedule Table --
  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(config.pdf.fontSize.heading)
    .font(config.pdf.fonts.heading)
    .text("EXAMINATION SCHEDULE", 50, doc.y);
  doc.moveDown(1);

  const tableTop = doc.y;
  const col1 = 50,
    col2 = 120,
    col3 = 300,
    col4 = 400,
    col5 = 480;

  // Table Header
  doc
    .fillColor(config.pdf.colors.background)
    .rect(50, tableTop, 495, 25)
    .fill();
  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(9)
    .font(config.pdf.fonts.heading);
  doc.text("CODE", col1 + 5, tableTop + 8);
  doc.text("SUBJECT NAME", col2 + 5, tableTop + 8);
  doc.text("DATE", col3 + 5, tableTop + 8);
  doc.text("TIME", col4 + 5, tableTop + 8);
  doc.text("VENUE", col5 + 5, tableTop + 8);

  let rowY = tableTop + 25;
  doc.font(config.pdf.fonts.body);

  schedules.forEach((s, idx) => {
    // Background for alternating rows
    if (idx % 2 === 1) {
      doc.fillColor("#f1f5f9").rect(50, rowY, 495, 35).fill();
    }

    doc.fillColor(config.pdf.colors.text).fontSize(8);
    doc.text(s.course.code, col1 + 5, rowY + 10);
    doc.text(s.course.name, col2 + 5, rowY + 10, { width: 170 });
    doc.text(new Date(s.exam_date).toLocaleDateString(), col3 + 5, rowY + 10);
    doc.text(
      `${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)}`,
      col4 + 5,
      rowY + 10,
    );
    doc.text(s.venue || "Exam Hall", col5 + 5, rowY + 10);

    rowY += 35;
  });

  // -- Instructions Section --
  if (config.exam.hallTicket.instructions.length > 0) {
    doc.moveDown(3);
    doc
      .fillColor(config.pdf.colors.text)
      .fontSize(config.pdf.fontSize.subheading)
      .font(config.pdf.fonts.heading)
      .text("IMPORTANT INSTRUCTIONS", 50, doc.y);
    doc.moveDown(0.5);

    doc.fontSize(config.pdf.fontSize.small).font(config.pdf.fonts.body);
    config.exam.hallTicket.instructions.forEach((instruction) => {
      doc.fillColor(config.pdf.colors.textLight).text(instruction, 50);
    });
  }

  // -- Footer --
  doc.moveDown(4);
  const footerY = doc.page.height - 100;
  doc
    .strokeColor(config.pdf.colors.border)
    .lineWidth(1)
    .moveTo(50, footerY)
    .lineTo(545, footerY)
    .stroke();

  doc
    .fontSize(config.pdf.fontSize.small)
    .fillColor(config.pdf.colors.textLight)
    .text(`Generated on: ${new Date().toLocaleString()}`, 50, footerY + 10);

  doc
    .fontSize(9)
    .fillColor(config.pdf.colors.accent)
    .font(config.pdf.fonts.heading)
    .text("DIGITALLY VERIFIED BY EXAMINATION CELL", 350, footerY + 10);

  doc.end();
}

module.exports = generateHallTicketPdf;
