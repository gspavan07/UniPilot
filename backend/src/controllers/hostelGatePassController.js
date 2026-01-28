const logger = require("../utils/logger");
const {
  HostelGatePass,
  User,
  HostelAttendance,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

// @desc    Request gate pass (Student)
// @route   POST /api/hostel/gate-passes
// @access  Private/Student
exports.requestGatePass = async (req, res) => {
  try {
    const {
      going_date,
      coming_date,
      purpose,
      destination,
      pass_type,
      expected_out_time,
      expected_in_time,
    } = req.body;
    const student_id = req.user.userId;

    if (!going_date || (pass_type === "long" && !coming_date)) {
      return res.status(400).json({
        error: "Going date and coming date (for long leave) are required",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const gatePass = await HostelGatePass.create({
      student_id,
      going_date,
      coming_date: pass_type === "day" ? going_date : coming_date,
      pass_type: pass_type || "long",
      expected_out_time,
      expected_in_time,
      purpose,
      destination,
      parent_otp: otp,
      status: "pending",
    });

    // SIMULATION: Log OTP for parent consent (would be sent via SMS)
    console.log(`[GATE PASS OTP] For Student ID: ${student_id}, OTP: ${otp}`);
    logger.info(
      `Gate pass requested by student ${student_id}. OTP generated: ${otp}`,
    );

    res.status(201).json({
      success: true,
      message:
        "Gate pass requested successfully. Provide the OTP received by your parent to the Warden.",
      data: gatePass,
    });
  } catch (error) {
    logger.error("Error requesting gate pass:", error);
    res.status(500).json({ error: "Failed to request gate pass" });
  }
};

// @desc    Verify OTP and Approve Gate Pass (Warden)
// @route   PUT /api/hostel/gate-passes/:id/verify
// @access  Private/Hostel:Warden
exports.verifyOtpAndApprove = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const gatePass = await HostelGatePass.findByPk(id, {
      include: [{ model: User, as: "student" }],
    });

    if (!gatePass) {
      await transaction.rollback();
      return res.status(404).json({ error: "Gate pass not found" });
    }

    if (gatePass.status !== "pending") {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: `Gate pass is already ${gatePass.status}` });
    }

    if (gatePass.parent_otp !== otp) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Invalid OTP. Please check again." });
    }

    // Update gate pass
    await gatePass.update(
      {
        status: "approved",
        is_otp_verified: true,
        approved_by: req.user.userId,
      },
      { transaction },
    );

    // SYNC TO HOSTEL ATTENDANCE
    // Mark as 'on_leave' in hostel_attendance table only
    const startDate = new Date(gatePass.going_date);
    const endDate = new Date(gatePass.coming_date);

    const hostelAttendanceRecords = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];

      // Mark for both shifts (Day and Night Roll Call)
      [false, true].forEach((isNight) => {
        hostelAttendanceRecords.push({
          student_id: gatePass.student_id,
          date: dateStr,
          is_present: false,
          night_roll_call: isNight,
          remarks: `On Leave: ${gatePass.pass_type === "day" ? "Day Outing" : "Long Leave"} (${gatePass.purpose || "Gate Pass"})`,
        });
      });
    }

    // Upsert hostel attendance records
    for (const record of hostelAttendanceRecords) {
      const [attRecord, created] = await HostelAttendance.findOrCreate({
        where: {
          student_id: record.student_id,
          date: record.date,
          night_roll_call: record.night_roll_call,
        },
        defaults: record,
        transaction,
      });

      if (!created) {
        await attRecord.update(
          {
            is_present: false,
            remarks: record.remarks,
          },
          { transaction },
        );
      }
    }

    await gatePass.update({ attendance_synced: true }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: "Gate pass approved and attendance synced.",
      data: gatePass,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error("Error approving gate pass:", error);
    res.status(500).json({ error: "Failed to approve gate pass" });
  }
};

// @desc    Get all gate passes with filters
// @route   GET /api/hostel/gate-passes
// @access  Private
exports.getGatePasses = async (req, res) => {
  try {
    const { status, student_id, month, year } = req.query;
    const { role, userId } = req.user;

    const where = {};
    if (status) where.status = status;

    // If student, only show their own
    if (role === "student") {
      where.student_id = userId;
    } else if (student_id) {
      where.student_id = student_id;
    }

    // Month and Year filters (based on going_date)
    if (year) {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;

      if (month) {
        const monthNum = parseInt(month);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0); // Last day of month

        where.going_date = {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        };
      } else {
        where.going_date = {
          [Op.between]: [yearStart, yearEnd],
        };
      }
    }

    const gatePasses = await HostelGatePass.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "student_id",
            "section",
            "batch_year",
          ],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, data: gatePasses });
  } catch (error) {
    logger.error("Error fetching gate passes:", error);
    res.status(500).json({ error: "Failed to fetch gate passes" });
  }
};

// @desc    Reject Gate Pass
// @route   PUT /api/hostel/gate-passes/:id/reject
// @access  Private/Hostel:Warden
exports.rejectGatePass = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const gatePass = await HostelGatePass.findByPk(id);
    if (!gatePass) {
      return res.status(404).json({ error: "Gate pass not found" });
    }

    await gatePass.update({
      status: "rejected",
      approved_by: req.user.userId,
      purpose: gatePass.purpose + (remarks ? ` (Rejection: ${remarks})` : ""),
    });

    res.json({ success: true, message: "Gate pass rejected", data: gatePass });
  } catch (error) {
    logger.error("Error rejecting gate pass:", error);
    res.status(500).json({ error: "Failed to reject gate pass" });
  }
};
