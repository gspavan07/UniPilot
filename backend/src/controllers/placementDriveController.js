const {
  PlacementDrive,
  StudentApplication,
  JobPosting,
  Company,
  DriveEligibility,
  DriveRound,
  User,
  Placement,
  sequelize,
} = require("../models");
const eligibilityService = require("../services/eligibilityService");
const logger = require("../utils/logger");

/**
 * Placement Drive Controller
 * Handles CRUD operations for placement drives
 */

// @desc    Get all placement drives
// @route   GET /api/placement/drives
// @access  Private
exports.getDrives = async (req, res) => {
  try {
    const { status, type, academic_year } = req.query;
    const where = {};

    if (status) where.status = status;
    if (type) where.drive_type = type;

    const drives = await PlacementDrive.findAll({
      where,
      include: [
        {
          model: JobPosting,
          as: "job_posting",
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["id", "name", "logo_url"],
            },
          ],
        },
        {
          model: User,
          as: "coordinator",
          attributes: ["id", "first_name", "last_name"],
        },
        {
          model: DriveEligibility,
          as: "eligibility",
          attributes: ["department_ids"],
        },
      ],
      order: [["drive_date", "DESC"]],
    });

    // Scoping for Placement Coordinator
    const requester = await User.findByPk(req.user.userId);
    let filteredDrives = drives;

    if (requester.is_placement_coordinator && requester.department_id) {
      filteredDrives = drives.filter(
        (drive) =>
          !drive.eligibility?.department_ids || // Empty means open to all
          drive.eligibility.department_ids.length === 0 ||
          drive.eligibility.department_ids.includes(requester.department_id),
      );
    }

    res.status(200).json({
      success: true,
      count: filteredDrives.length,
      data: filteredDrives,
    });
  } catch (error) {
    logger.error("Error in getDrives:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single placement drive
// @route   GET /api/placement/drives/:id
// @access  Private
exports.getDriveById = async (req, res) => {
  try {
    const drive = await PlacementDrive.findByPk(req.params.id, {
      include: [
        {
          model: JobPosting,
          as: "job_posting",
          include: [
            {
              model: Company,
              as: "company",
            },
          ],
        },
        {
          model: DriveEligibility,
          as: "eligibility",
        },
        {
          model: DriveRound,
          as: "rounds",
        },
        {
          model: User,
          as: "coordinator",
          attributes: ["id", "first_name", "last_name", "email", "phone"],
        },
      ],
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: "Placement drive not found",
      });
    }

    // Convert to JSON to add dynamic properties
    let driveData = drive.toJSON();

    // If requester is a student, calculate eligibility and application status
    const student = await User.findByPk(req.user.userId);
    if (student && student.role === "student") {
      const eligibilityRes = await eligibilityService.isStudentEligible(
        req.user.userId,
        drive.id,
      );

      const existingApp = await StudentApplication.findOne({
        where: { drive_id: drive.id, student_id: req.user.userId },
        attributes: ["status"],
      });

      driveData.isEligible = eligibilityRes.eligible;
      driveData.ineligible_reason = eligibilityRes.errors.join(". ");
      driveData.hasApplied = !!existingApp;
      driveData.applicationStatus = existingApp?.status;
    }

    res.status(200).json({
      success: true,
      data: driveData,
    });
  } catch (error) {
    logger.error("Error in getDriveById:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create new placement drive
// @route   POST /api/placement/drives
// @access  Private/TPO
exports.createDrive = async (req, res) => {
  try {
    const { eligibility, rounds, ...driveData } = req.body;

    const drive = await PlacementDrive.create(driveData);

    if (eligibility) {
      await DriveEligibility.create({
        ...eligibility,
        drive_id: drive.id,
        batch_ids: eligibility.batch_ids || [],
      });
    }

    if (rounds && Array.isArray(rounds)) {
      const roundsWithDriveId = rounds.map((round) => {
        // Strip temporary numeric ID from frontend (Date.now())
        const { id, ...roundData } = round;

        // Convert empty strings to null for PostgreSQL
        if (roundData.round_date === "") roundData.round_date = null;
        if (roundData.round_time === "") roundData.round_time = null;

        return {
          ...roundData,
          drive_id: drive.id,
        };
      });
      await DriveRound.bulkCreate(roundsWithDriveId);
    }

    res.status(201).json({
      success: true,
      data: drive,
    });
  } catch (error) {
    logger.error("Error in createDrive:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update placement drive
// @route   PUT /api/placement/drives/:id
// @access  Private/TPO
exports.updateDrive = async (req, res) => {
  try {
    let drive = await PlacementDrive.findByPk(req.params.id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: "Placement drive not found",
      });
    }

    const { eligibility, rounds, ...driveData } = req.body;
    drive = await drive.update(driveData);

    if (eligibility) {
      const eligibilityData = {
        ...eligibility,
        drive_id: drive.id,
        batch_ids: eligibility.batch_ids || [],
      };
      const [elig, created] = await DriveEligibility.findOrCreate({
        where: { drive_id: drive.id },
        defaults: eligibilityData,
      });
      if (!created) await elig.update(eligibilityData);
    }

    if (rounds && Array.isArray(rounds)) {
      // Simple sync: delete rounds not in payload, update existing, create new
      const existingRounds = await DriveRound.findAll({
        where: { drive_id: drive.id },
      });
      const payloadRoundIds = rounds
        .map((r) => r.id)
        .filter((id) => typeof id === "string" && id.length === 36);

      // Delete removed rounds
      for (const exRound of existingRounds) {
        if (!payloadRoundIds.includes(exRound.id)) {
          await exRound.destroy();
        }
      }

      // Update/Create
      for (const roundData of rounds) {
        // Convert empty strings to null for PostgreSQL
        const sanitizedRoundData = { ...roundData };
        if (sanitizedRoundData.round_date === "")
          sanitizedRoundData.round_date = null;
        if (sanitizedRoundData.round_time === "")
          sanitizedRoundData.round_time = null;

        if (
          typeof sanitizedRoundData.id === "string" &&
          sanitizedRoundData.id.length === 36
        ) {
          const round = await DriveRound.findByPk(sanitizedRoundData.id);
          if (round) await round.update(sanitizedRoundData);
        } else {
          // New round from frontend (temporary numeric ID or no ID)
          const { id, ...newRoundData } = sanitizedRoundData;
          await DriveRound.create({ ...newRoundData, drive_id: drive.id });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: drive,
    });
  } catch (error) {
    logger.error("Error in updateDrive:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Manage Drive Eligibility
// @route   PUT /api/placement/drives/:id/eligibility
// @access  Private/TPO
exports.updateDriveEligibility = async (req, res) => {
  try {
    const drive = await PlacementDrive.findByPk(req.params.id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: "Placement drive not found",
      });
    }

    let eligibility = await DriveEligibility.findOne({
      where: { drive_id: req.params.id },
    });

    if (eligibility) {
      eligibility = await eligibility.update(req.body);
    } else {
      eligibility = await DriveEligibility.create({
        ...req.body,
        drive_id: req.params.id,
      });
    }

    res.status(200).json({
      success: true,
      data: eligibility,
    });
  } catch (error) {
    logger.error("Error in updateDriveEligibility:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Add Drive Round
// @route   POST /api/placement/drives/:id/rounds
// @access  Private/TPO
exports.addDriveRound = async (req, res) => {
  try {
    const drive = await PlacementDrive.findByPk(req.params.id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: "Placement drive not found",
      });
    }

    const round = await DriveRound.create({
      ...req.body,
      drive_id: req.params.id,
    });

    res.status(201).json({
      success: true,
      data: round,
    });
  } catch (error) {
    logger.error("Error in addDriveRound:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update Drive Round
// @route   PUT /api/placement/rounds/:id
// @access  Private/TPO
exports.updateDriveRound = async (req, res) => {
  try {
    let round = await DriveRound.findByPk(req.params.id);

    if (!round) {
      return res.status(404).json({
        success: false,
        error: "Drive round not found",
      });
    }

    round = await round.update(req.body);

    res.status(200).json({
      success: true,
      data: round,
    });
  } catch (error) {
    logger.error("Error in updateDriveRound:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Delete Drive Round
// @route   DELETE /api/placement/rounds/:id
// @access  Private/TPO
exports.deleteDriveRound = async (req, res) => {
  try {
    const round = await DriveRound.findByPk(req.params.id);

    if (!round) {
      return res.status(404).json({
        success: false,
        error: "Drive round not found",
      });
    }

    await round.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error("Error in deleteDriveRound:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * Get all applications for a drive (for TPO pipeline)
 */
exports.getDriveApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const applications = await StudentApplication.findAll({
      where: { drive_id: id },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id", "email"],
        },
        {
          model: Placement,
          as: "placement_records",
        },
      ],
      order: [["applied_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    logger.error("Error fetching drive applications:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Update student application status (Shortlist/Reject/Place)
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params; // application id
    const { status, roundId, joining_date, offer_letter_url } = req.body;

    const application = await StudentApplication.findByPk(id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, error: "Application not found" });
    }

    await application.update({
      status,
      current_round_id: roundId || application.current_round_id,
    });

    // If placed, create a global Placement record
    if (status === "placed") {
      const drive = await PlacementDrive.findByPk(application.drive_id, {
        include: [
          {
            model: JobPosting,
            as: "job_posting",
            include: [{ model: Company, as: "company" }],
          },
        ],
      });

      await Placement.create({
        student_id: application.student_id,
        drive_id: application.drive_id,
        job_posting_id: drive.job_posting_id,
        application_id: application.id,
        company_name: drive.job_posting.company.name,
        designation: drive.job_posting.role_title,
        package_lpa: drive.job_posting.ctc_lpa,
        joining_date,
        offer_letter_url,
        status: "offered",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
    });
  } catch (error) {
    logger.error("Error updating application status:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// @desc    Delete placement drive
// @route   DELETE /api/placement/drives/:id
// @access  Private/TPO
exports.deleteDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findByPk(req.params.id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: "Placement drive not found",
      });
    }

    // Optional: Check if drive has active applications or results before deleting
    // For now, we assume simple deletion (database constraints might apply)

    await drive.destroy();

    res.status(200).json({
      success: true,
      data: {},
      message: "Drive deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteDrive:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * Bulk update application status
 */
exports.bulkUpdateApplicationStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { applicationIds, status, roundId, joining_date, offer_letter_url } =
      req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || !status) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
      });
    }

    const updates = { status };
    if (roundId) {
      updates.current_round_id = roundId;
    }

    // If status is 'placed', we might want to update student profile or similar logic
    // For now, just update the application status

    await StudentApplication.update(updates, {
      where: {
        id: applicationIds,
      },
      transaction,
    });

    // If status is 'placed', create Placement records for all affected applications
    if (status === "placed") {
      const applications = await StudentApplication.findAll({
        where: { id: applicationIds },
        include: [
          {
            model: PlacementDrive,
            as: "drive",
            include: [
              {
                model: JobPosting,
                as: "job_posting",
                include: [{ model: Company, as: "company" }],
              },
            ],
          },
        ],
        transaction,
      });

      const placementRecords = applications.map((app) => ({
        student_id: app.student_id,
        drive_id: app.drive_id,
        job_posting_id: app.drive.job_posting_id,
        application_id: app.id,
        company_name: app.drive.job_posting.company.name,
        designation: app.drive.job_posting.role_title,
        package_lpa: app.drive.job_posting.ctc_lpa,
        joining_date,
        offer_letter_url,
        status: "offered",
      }));

      await Placement.bulkCreate(placementRecords, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: `Successfully updated ${applicationIds.length} applications`,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error in bulk update application status:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

/**
 * Get all placement records for a drive
 */
exports.getPlacementRecords = async (req, res) => {
  try {
    const { id } = req.params; // drive id
    const placements = await Placement.findAll({
      where: { drive_id: id },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id", "email"],
        },
      ],
    });

    res.status(200).json({ success: true, data: placements });
  } catch (error) {
    logger.error("Error fetching placement records:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Update an individual placement record (offer letter, joining date)
 */
exports.updatePlacementRecord = async (req, res) => {
  try {
    const { id } = req.params; // placement record id
    const { joining_date, offer_letter_url, package_lpa, status } = req.body;

    const placement = await Placement.findByPk(id);
    if (!placement) {
      return res
        .status(404)
        .json({ success: false, error: "Placement record not found" });
    }

    await placement.update({
      joining_date: joining_date || placement.joining_date,
      offer_letter_url: offer_letter_url || placement.offer_letter_url,
      package_lpa: package_lpa || placement.package_lpa,
      status: status || placement.status,
    });

    res.status(200).json({
      success: true,
      message: "Placement record updated successfully",
      data: placement,
    });
  } catch (error) {
    logger.error("Error updating placement record:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
