const { User, sequelize } = require("../models");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger");

// @desc    Bulk Upload Student Photos
// @route   POST /api/admission/photos/bulk
// @access  Private (Admissions)
exports.uploadStudentPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No files uploaded" });
    }

    const report = {
      total: req.files.length,
      success: 0,
      failed: 0,
      details: [],
    };

    const updates = [];

    // Process each file
    for (const file of req.files) {
      const filename = file.originalname;
      const ext = path.extname(filename);
      const outputName = filename; // e.g. "2024CSE101.jpg"
      // Assuming ID is the filename WITHOUT extension
      const studentId = path.basename(filename, ext);

      try {
        // Find user by student_id
        const user = await User.findOne({
          where: { student_id: studentId }, // Exact match
          attributes: ["id", "student_id", "first_name", "last_name"],
        });

        if (user) {
          // Construct public URL path
          const publicPath = `/uploads/profiles/${file.filename}`;

          // Update user
          await User.update(
            { profile_picture: publicPath },
            { where: { id: user.id } }
          );

          report.success++;
          updates.push({
            student_id: studentId,
            status: "Matched",
            file: filename,
            user: `${user.first_name} ${user.last_name}`,
          });
        } else {
          // Failure: Student not found
          report.failed++;
          report.details.push({
            file: filename,
            error: `Student ID '${studentId}' not found`,
          });

          // Optional: Delete the orphaned file?
          // Keeping it might be useful for manual check, but cleaning up is cleaner.
          // Let's keep it for now as "uploaded but unlinked".
        }
      } catch (err) {
        report.failed++;
        report.details.push({
          file: filename,
          error: err.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${req.files.length} photos`,
      report: {
        ...report,
        updates: updates, // Optional: simplify if list is huge
      },
    });
  } catch (error) {
    logger.error("Bulk Photo Upload Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
