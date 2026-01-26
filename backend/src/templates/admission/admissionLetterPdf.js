/**
 * Admission Letter PDF Generator
 *
 * Generates admission/offer letter PDFs for students.
 * Customize letterhead, content, and signature as needed.
 */

const PDFDocument = require("pdfkit");
const config = require("../config/templateConfig");

/**
 * Generate Admission Letter PDF
 *
 * @param {Object} student - Student object with program and department details
 * @param {Stream} stream - Writable stream (response object)
 */
async function generateAdmissionLetterPdf(student, stream) {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(stream);

  // --- Header ---
  doc
    .fillColor(config.pdf.colors.text)
    .fontSize(config.pdf.fontSize.title + 6)
    .text(config.university.name, { align: "center" });
  doc
    .fillColor(config.pdf.colors.textLight)
    .fontSize(config.pdf.fontSize.body)
    .text(`${config.university.address}`, { align: "center" });
  doc.text(`${config.university.phone} | ${config.university.email}`, {
    align: "center",
  });
  doc.moveDown(1);
  doc
    .strokeColor(config.pdf.colors.border)
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();
  doc.moveDown(2);

  // --- Date & Reference ---
  const today = new Date().toLocaleDateString(config.currency.locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.fillColor("#000").fontSize(11).text(`Date: ${today}`, { align: "right" });
  doc.text(
    `Ref No: ${config.university.shortName}/ADM/${student.batch_year}/${student.student_id}`,
    { align: "right" },
  );
  doc.moveDown(2);

  // --- Title ---
  doc
    .fontSize(config.pdf.fontSize.heading)
    .font(config.pdf.fonts.heading)
    .text(
      config.admission.letter.title || "ADMISSION PROVISIONAL OFFER LETTER",
    );
  doc.moveDown(1);

  // --- Addressee ---
  doc.font(config.pdf.fonts.body).text("To,");
  doc
    .font(config.pdf.fonts.heading)
    .text(`${student.first_name} ${student.last_name}`);
  doc.font(config.pdf.fonts.body).text(`Student ID: ${student.student_id}`);
  doc.moveDown(1.5);

  // --- Body ---
  doc.text(`Dear ${student.first_name},`);
  doc.moveDown(1);

  if (config.admission.letter.includeWelcomeMessage) {
    doc.text(
      config.admission.letter.welcomeMessage ||
        `Congratulations! We are pleased to inform you that you have been provisionally admitted to the ${student.program?.name} program at ${config.university.name} for the Batch of ${student.batch_year}.`,
      { align: "justify" },
    );
  } else {
    doc.text(
      `You have been provisionally admitted to the ${student.program?.name} program at ${config.university.name} for the Batch of ${student.batch_year}.`,
      { align: "justify" },
    );
  }

  doc.moveDown(1);
  doc.font(config.pdf.fonts.heading).text("Admission Details:");
  doc.moveDown(0.5);

  const details = [
    ["Program:", student.program?.name || "N/A"],
    ["Department:", student.department?.name || "N/A"],
    ["Duration:", `${student.program?.duration_years} Years`],
    ["Batch Year:", student.batch_year],
    ["Admission Date:", new Date(student.admission_date).toDateString()],
  ];

  doc.font(config.pdf.fonts.body);
  details.forEach(([label, value]) => {
    doc.font(config.pdf.fonts.heading).text(label, { continued: true });
    doc.font(config.pdf.fonts.body).text(` ${value}`);
  });

  doc.moveDown(2);

  if (config.admission.letter.includeTermsAndConditions) {
    doc.text(
      "Please note that this offer is provisional and subject to the fulfillment of eligibility criteria and verification of documents. You are required to complete the remaining registration formalities and fee payment as per the university's academic calendar.",
      { align: "justify" },
    );
  }

  doc.moveDown(3);

  // --- Signature ---
  const signatory = config.admission.letter.signatory;
  doc.text("Sincerely,", { align: "left" });
  doc.moveDown(1);
  doc
    .font(config.pdf.fonts.heading)
    .text(signatory.name || "Registrar (Admissions)", { align: "left" });
  doc
    .font(config.pdf.fonts.body)
    .text(
      signatory.designation || `${config.university.name} Admissions Office`,
      { align: "left" },
    );

  // --- Footer ---
  doc
    .fontSize(config.pdf.fontSize.small)
    .fillColor(config.pdf.colors.textLight)
    .text(
      "This is a computer-generated document and does not require a physical signature.",
      50,
      750,
      { align: "center" },
    );

  doc.end();
}

module.exports = generateAdmissionLetterPdf;
