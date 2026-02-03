const {
  PlacementDrive,
  JobPosting,
  Company,
  DriveEligibility,
  DriveRound,
  User,
} = require("../models");
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
      ],
      order: [["drive_date", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: drives.length,
      data: drives,
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

    res.status(200).json({
      success: true,
      data: drive,
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
      const [elig, created] = await DriveEligibility.findOrCreate({
        where: { drive_id: drive.id },
        defaults: { ...eligibility, drive_id: drive.id },
      });
      if (!created) await elig.update(eligibility);
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
          attributes: ["id", "first_name", "last_name", "id_number", "email"],
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
    const { status, roundId } = req.body;

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
      const drive = await PlacementDrive.findByPk(application.drive_id);
      await Placement.create({
        student_id: application.student_id,
        drive_id: application.drive_id,
        job_posting_id: drive.job_posting_id,
        application_id: application.id,
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
