import {
  User,
  Department,
  Program,
  Role,
  StudentDocument,
  AdmissionConfig,
  InstitutionSetting,
  sequelize,
} from "../models/index.js";
import { Op } from "sequelize";
import PDFDocument from "pdfkit";
import logger from "../utils/logger.js";

// Template import
import generateAdmissionLetterPdf from "../templates/admission/admissionLetterPdf.js";

/**
 * Admission Controller
 * Handles admission-specific analytics and reporting
 */

// @desc    Get admission statistics (Batch-wise & Department-wise)
// @route   GET /api/admission/stats
// @access  Private (Admission Admin/Staff)
export const getAdmissionStats = async (req, res) => {
  try {
    const { year } = req.query;

    // 1. Group by Batch Year
    const batchStats = await User.findAll({
      attributes: [
        "batch_year",
        [User.sequelize.fn("COUNT", User.sequelize.col("id")), "count"],
      ],
      where: {
        role: "student",
        batch_year: { [Op.ne]: null },
      },
      group: ["batch_year"],
      order: [["batch_year", "ASC"]],
    });

    // 2. Group by Department (for a specific year if provided)
    const deptWhere = { role: "student" };
    if (year) {
      deptWhere.batch_year = year;
    }

    const deptStats = await User.findAll({
      attributes: [
        [User.sequelize.fn("COUNT", User.sequelize.col("User.id")), "count"],
      ],
      where: deptWhere,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["name", "code"],
        },
      ],
      group: ["department.id", "department.name", "department.code"],
    });

    res.status(200).json({
      success: true,
      data: {
        batchWise: batchStats,
        deptWise: deptStats,
      },
    });
  } catch (error) {
    logger.error("Error in getAdmissionStats:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Export admission data
// @route   GET /api/admission/export
// @access  Private (Admission Admin/Staff)
export const exportAdmissionData = async (req, res) => {
  try {
    const { year, department_id } = req.query;
    const where = { role: "student" };

    if (year) where.batch_year = year;
    if (department_id) where.department_id = department_id;

    const students = await User.findAll({
      where,
      include: [
        { model: Department, as: "department", attributes: ["name"] },
        { model: Program, as: "program", attributes: ["name", "code"] },
      ],
      attributes: [
        "student_id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "batch_year",
        "admission_date",
        "admission_number",
        "academic_status",
      ],
      order: [
        ["batch_year", "DESC"],
        ["last_name", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    logger.error("Error in exportAdmissionData:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get Seat Matrix (Intake vs Filled)
// @route   GET /api/admission/seat-matrix
// @access  Private (Admission Admin/Staff)
export const getSeatMatrix = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const programs = await Program.findAll({
      include: [
        { model: Department, as: "department", attributes: ["name", "code"] },
      ],
      where: { is_active: true },
    });

    const admissionConfig = await AdmissionConfig.findOne({
      where: { batch_year: year, is_active: true },
    });

    const seatMatrix = await Promise.all(
      programs.map(async (prog) => {
        const filled = await User.count({
          where: {
            role: "student",
            program_id: prog.id,
            batch_year: year,
          },
        });

        // Use override if available, otherwise fallback to program intake
        const maxIntake =
          admissionConfig?.seat_matrix?.[prog.id] || prog.max_intake || 0;

        return {
          id: prog.id,
          name: prog.name,
          code: prog.code,
          department: prog.department.code,
          max_intake: maxIntake,
          filled_seats: filled,
          available_seats: Math.max(0, maxIntake - filled),
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: seatMatrix,
    });
  } catch (error) {
    logger.error("Error in getSeatMatrix:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get all documents for a student
// @route   GET /api/admission/documents/:userId
// @access  Private (Admission Admin/Staff/Student)
export const getStudentDocuments = async (req, res) => {
  try {
    const documents = await StudentDocument.findAll({
      where: { user_id: req.params.userId },
      include: [
        {
          model: User,
          as: "verifier",
          attributes: ["first_name", "last_name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    logger.error("Error in getStudentDocuments:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update document verification status
// @route   PUT /api/admission/documents/:id/status
// @access  Private (Admission Admin/Staff)
export const updateDocumentStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const document = await StudentDocument.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    await document.update({
      status,
      remarks,
      verified_by: req.user.userId,
      verified_at: new Date(),
    });

    // --- Phase 4: Communication Hub - Notification Toggle ---
    // In a real system, this would trigger an email or SMS service
    logger.info(
      `NOTIF_TRIGGER: Student ${document.user_id} - Document ${document.name} ${status}. Remarks: ${remarks || "None"}`,
    );

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    logger.error("Error in updateDocumentStatus:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
// @desc    Re-upload a rejected document
// @route   POST /api/admission/documents/:documentId/reupload
// @access  Private (Student/Admission Staff)
export const reuploadDocument = async (req, res) => {
  try {
    const document = await StudentDocument.findByPk(req.params.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Update with new file and reset status
    await document.update({
      file_url: `/uploads/student_docs/${req.file.filename}`,
      status: "pending",
      remarks: "Re-uploaded by user",
      verified_at: null,
      verified_by: null,
    });

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    logger.error("Error in reuploadDocument:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Mark a student as verified
// @route   POST /api/admission/verify-student/:userId
// @access  Private (Admission Staff)
export const verifyStudent = async (req, res) => {
  try {
    const student = await User.findByPk(req.params.userId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // Mark as verified and activate academic status
    await student.update({
      is_verified: true,
      academic_status: "active",
    });

    res.status(200).json({
      success: true,
      message: "Student verified successfully",
      data: student,
    });
  } catch (error) {
    logger.error("Error in verifyStudent:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Generate and download admission letter PDF
// @route   GET /api/admission/letter/:userId
// @access  Private (Admission Admin/Staff/Student)
export const generateAdmissionLetter = async (req, res) => {
  try {
    const student = await User.findByPk(req.params.userId, {
      include: [
        { model: Department, as: "department", attributes: ["name"] },
        {
          model: Program,
          as: "program",
          attributes: ["name", "duration_years"],
        },
      ],
    });

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    const filename = `Admission_Letter_${student.student_id}.pdf`;

    // Set headers for download
    res.setHeader(
      "Content-disposition",
      'attachment; filename="' + filename + '"',
    );
    res.setHeader("Content-type", "application/pdf");

    // Use template module to generate PDF
    await generateAdmissionLetterPdf(student, res);
  } catch (error) {
    logger.error("Error in generateAdmissionLetter:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }
};

// @desc    Get Admission Funnel Stats
// @route   GET /api/admission/funnel
// @access  Private (Admission Admin/Staff)
export const getFunnelStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const totalApplied = await User.count({
      where: { role: "student", batch_year: year },
    });

    // Students with at least one document
    const withDocs = await User.count({
      include: [
        {
          model: StudentDocument,
          as: "documents",
          required: true,
        },
      ],
      where: { role: "student", batch_year: year },
    });

    // Students with all documents approved (simplified: at least one approved and none rejected/pending)
    // Actually, let's just count those with at least one approved document for now as a "Verified" stage proxy
    const verified = await User.count({
      include: [
        {
          model: StudentDocument,
          as: "documents",
          required: true,
          where: { status: "approved" },
        },
      ],
      where: { role: "student", batch_year: year },
    });

    const admitted = await User.count({
      where: {
        role: "student",
        batch_year: year,
        admission_number: { [Op.ne]: null },
      },
    });

    res.status(200).json({
      success: true,
      data: [
        { stage: "Applied", count: totalApplied },
        { stage: "Docs Uploaded", count: withDocs },
        { stage: "Verified", count: verified },
        { stage: "Admitted", count: admitted },
      ],
    });
  } catch (error) {
    logger.error("Error in getFunnelStats:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get Geographic Distribution Stats
// @route   GET /api/admission/geo-stats
// @access  Private (Admission Admin/Staff)
export const getGeoStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const stats = await User.findAll({
      attributes: [
        [sequelize.col("state"), "state"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        role: "student",
        batch_year: year,
        state: { [Op.ne]: null },
      },
      group: ["state"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Error in getGeoStats:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
// @desc    Get Gender Distribution Stats
// @route   GET /api/admission/gender-stats
// @access  Private (Admission Admin/Staff)
export const getGenderStats = async (req, res) => {
  try {
    const { year } = req.query;
    const where = { role: "student" };

    if (year) {
      where.batch_year = year;
    }

    const stats = await User.findAll({
      attributes: [
        "gender",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        ...where,
        gender: { [Op.ne]: null },
      },
      group: ["gender"],
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Error in getGenderStats:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
// @desc    Get preview of next Student ID and Admission Number
// @route   GET /api/admission/id-previews
// @access  Private (Admission Admin/Staff)
export const getIdPreviews = async (req, res) => {
  try {
    const { batch_year, program_id, is_temporary } = req.query;

    if (!batch_year || !program_id) {
      return res.status(400).json({
        success: false,
        error: "Batch Year and Program ID are required",
      });
    }



    // 1. Preview Student ID (Temp)
    let tempIdPreview = "N/A";
    const config = await AdmissionConfig.findOne({
      where: { batch_year: batch_year, is_active: true },
    });

    const program = await Program.findByPk(program_id);

    if (config && program) {
      const isTemp = is_temporary === "true" || is_temporary === true;
      const format = isTemp ? config.temp_id_format : config.id_format; // Default to ID format if not temp ?? logic check
      // Actually user asked for Temp ID preview specifically for registration form
      // But let's support both based on flag, defaulting to Temp for registration usage
      const targetFormat =
        is_temporary !== "false" ? config.temp_id_format : config.id_format;

      const yearShort = batch_year.toString().slice(-2);
      const sequence = config.current_sequence.toString().padStart(3, "0");
      const univCode = config.university_code;
      const branchCode = program.code?.split("-")[1] || program.code || "XX";

      tempIdPreview = targetFormat
        .replace("{YY}", yearShort)
        .replace("{UNIV}", univCode)
        .replace("{BRANCH}", branchCode)
        .replace("{SEQ}", sequence);
    }

    // 2. Preview Admission Number (Global)
    let admissionNumberPreview = "N/A";
    const setting = await InstitutionSetting.findOne({
      where: { setting_key: "global_config" }, // Or just grab the first one if key unknown/migrated differently
    });
    // Wait, my service used create if not exists.
    // Ideally userController/service should have created it by now if used.
    // If not, we fall back to defaults: ADM-0001

    // Actually, let's look at how I implemented the service again.
    // I relied on `findOne` first.
    // Here we can do the same but readonly.

    // Better: let's re-use the InstitutionSetting logic cleanly.
    // If row doesn't exist, we assume 1.

    // If setting found:
    let nextSeq = 1;
    let prefix = "ADM";

    // Since I added columns to the TABLE, I don't necessarily need 'setting_key'="global_config".
    // I might have just added columns to the schema.
    // But rows need to exist.
    // My service code: `setting = await InstitutionSetting.create({ setting_key: "global_config", ... })`
    // So yes, I expect a row with `setting_key: "global_config"`.

    let globalSetting = null;
    if (setting) globalSetting = setting;
    else {
      // Find ANY row? Or specifically global_config
      globalSetting = await InstitutionSetting.findOne();
    }

    if (globalSetting) {
      nextSeq = globalSetting.current_admission_sequence || 1;
      prefix = globalSetting.admission_number_prefix || "ADM";
    }

    const paddedSeq = nextSeq.toString().padStart(4, "0");
    admissionNumberPreview = `${prefix}-${paddedSeq}`;

    res.status(200).json({
      success: true,
      data: {
        temp_id: tempIdPreview,
        admission_number: admissionNumberPreview,
      },
    });
  } catch (error) {
    logger.error("Error in getIdPreviews:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export default {
  getAdmissionStats,
  exportAdmissionData,
  getSeatMatrix,
  getStudentDocuments,
  updateDocumentStatus,
  reuploadDocument,
  verifyStudent,
  generateAdmissionLetter,
  getFunnelStats,
  getGeoStats,
  getGenderStats,
  getIdPreviews,
};
