/**
 * Template Configuration
 *
 * Centralized configuration for all document templates (PDF, Excel, CSV).
 * Customize this file for college-specific branding and layouts.
 */

export default {
  // University/College Information
  university: {
    name: process.env.UNIVERSITY_NAME || "UniPilot University",
    shortName: process.env.UNIVERSITY_SHORT_NAME || "UPU",
    address:
      process.env.UNIVERSITY_ADDRESS || "Kakinada, Andhra Pradesh, India",
    phone: process.env.UNIVERSITY_PHONE || "+91-XXXXXXXXXX",
    email: process.env.UNIVERSITY_EMAIL || "info@unipilot.edu.in",
    website: process.env.UNIVERSITY_WEBSITE || "www.unipilot.edu.in",
    logo: process.env.UNIVERSITY_LOGO_PATH || null, // Path to logo file
  },

  // PDF Styling
  pdf: {
    // Color scheme (hex colors)
    colors: {
      primary: "#4f46e5", // Indigo
      secondary: "#64748b", // Slate
      accent: "#10b981", // Green
      text: "#1e293b", // Dark slate
      textLight: "#64748b", // Light slate
      border: "#e2e8f0", // Very light slate
      background: "#f8fafc", // Very light slate background
    },

    // Fonts
    fonts: {
      heading: "Helvetica-Bold",
      body: "Helvetica",
      small: "Helvetica",
    },

    // Font sizes
    fontSize: {
      title: 20,
      heading: 14,
      subheading: 12,
      body: 10,
      small: 8,
    },

    // Margins
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },

    // Page size
    pageSize: "A4",
  },

  // Excel Styling
  excel: {
    // Sheet names
    sheetNames: {
      summary: "Summary",
      data: "Data",
      reference: "Reference",
      instructions: "Instructions",
    },

    // Column widths (default)
    defaultColumnWidth: 15,

    // Headers
    headerStyle: {
      bold: true,
      color: "#4f46e5",
    },
  },

  // CSV Configuration
  csv: {
    delimiter: ",",
    encoding: "utf-8",
    includeHeaders: true,
  },

  // Exam Templates
  exam: {
    hallTicket: {
      title: "EXAMINATION HALL TICKET",
      photoWidth: 120,
      photoHeight: 150,
      includeBarcode: true,
      includePhoto: true,
      instructions: [
        "1. Students must bring this hall ticket to the examination hall.",
        "2. Hall ticket must be preserved till the declaration of results.",
        "3. Students should report 15 minutes before the examination.",
        "4. Mobile phones and electronic devices are strictly prohibited.",
      ],
    },

    receipt: {
      title: "OFFICIAL PAYMENT RECEIPT",
      includeQRCode: false,
      showTransactionDetails: true,
    },

    marksTemplate: {
      sheetName: "Marks Import Template",
      referenceSheetName: "Course Reference",
      instructions: [
        "1. Do not modify the Roll Number column",
        "2. Enter marks as numbers only (0-100)",
        "3. Leave blank for absent students",
        "4. Save the file and upload",
      ],
    },
  },

  // Admission Templates
  admission: {
    letter: {
      title: "ADMISSION LETTER",
      includeWelcomeMessage: true,
      welcomeMessage:
        "Congratulations! We are pleased to inform you that you have been selected for admission.",
      includeTermsAndConditions: true,
      signatory: {
        name: "Registrar",
        designation: "Academic Registrar",
        includeSignature: true,
      },
    },
  },

  // HR Templates
  hr: {
    payslip: {
      title: "SALARY SLIP",
      confidentialityNotice:
        "This is a confidential document. Please do not share with unauthorized persons.",
      includeCompanyLogo: true,
      includeBankDetails: true,
      includeAttendanceSummary: true,
    },

    bankTransfer: {
      format: "standard", // 'standard' or 'custom'
      includeHeaders: true,
      dateFormat: "DD-MM-YYYY",
      columns: [
        "Employee ID",
        "Employee Name",
        "Account Number",
        "IFSC Code",
        "Amount",
        "Narration",
      ],
    },
  },

  // Fee Templates
  fee: {
    defaulters: {
      title: "Fee Defaulters Report",
      includeContactInfo: true,
      includeParentInfo: true,
      sortBy: "outstanding_desc", // 'outstanding_desc', 'outstanding_asc', 'name'
      columns: [
        "Student ID",
        "Name",
        "Program",
        "Semester",
        "Total Fee",
        "Paid",
        "Outstanding",
        "Contact",
      ],
    },
  },

  // Date formats
  dateFormats: {
    display: "DD-MM-YYYY",
    displayWithTime: "DD-MM-YYYY HH:mm",
    filename: "YYYYMMDD",
  },

  // Currency
  currency: {
    symbol: "₹",
    code: "INR",
    locale: "en-IN",
  },
};
