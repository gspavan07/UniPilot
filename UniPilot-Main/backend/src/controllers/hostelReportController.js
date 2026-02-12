const {
  HostelBuilding,
  HostelRoom,
  HostelAllocation,
  HostelComplaint,
  HostelGatePass,
  HostelAttendance,
  User,
} = require("../models");
const xlsx = require("xlsx");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

/**
 * Generate Excel Buffer from Data
 * @param {Array} data - Array of objects
 * @param {String} sheetName - Name of the sheet
 */
const generateExcelBuffer = (data, sheetName) => {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
};

// @desc    Download Occupancy Report
// @route   GET /api/hostel/reports/download/occupancy
// @access  hostel:read
exports.downloadOccupancyReport = async (req, res) => {
  try {
    const allocations = await HostelAllocation.findAll({
      where: { status: "active" },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["first_name", "last_name", "student_id", "email"],
        },
        {
          model: HostelRoom,
          as: "room",
          include: [
            {
              model: HostelBuilding,
              as: "building",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    const data = allocations.map((a) => ({
      "Student ID": a.student?.student_id,
      "Student Name": `${a.student?.first_name} ${a.student?.last_name}`,
      Building: a.room?.building?.name,
      "Room Number": a.room?.room_number,
      "Bed Number": a.bed_id, // Ideally fetch bed number if included, using raw ID for now or fetch if bed association exists
      "Allocation Date": a.start_date,
      Status: a.status,
    }));

    const buffer = generateExcelBuffer(data, "Occupancy Report");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Occupancy_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    logger.error("Error generating occupancy report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

// @desc    Download Attendance Report
// @route   GET /api/hostel/reports/download/attendance
// @access  hostel:read
exports.downloadAttendanceReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const attendance = await HostelAttendance.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["first_name", "last_name", "student_id"],
        },
      ],
      order: [["date", "DESC"]],
    });

    const data = attendance.map((a) => ({
      Date: a.date,
      "Student ID": a.student?.student_id,
      "Student Name": `${a.student?.first_name} ${a.student?.last_name}`,
      Shift: a.night_roll_call ? "Night" : "Day",
      Status: a.is_present ? "Present" : "Absent",
      Remarks: a.remarks || "",
    }));

    const buffer = generateExcelBuffer(data, "Attendance Report");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Attendance_Report_${month}_${year}.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    logger.error("Error generating attendance report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

// @desc    Download Complaint Report
// @route   GET /api/hostel/reports/download/complaints
// @access  hostel:read
exports.downloadComplaintReport = async (req, res) => {
  try {
    const { status, month, year } = req.query;
    const where = {};

    if (status) where.status = status;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.created_at = { [Op.between]: [startDate, endDate] };
    }

    const complaints = await HostelComplaint.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["first_name", "last_name", "student_id"],
        },
        {
          model: HostelRoom,
          as: "room",
          attributes: ["room_number"],
          include: [
            { model: HostelBuilding, as: "building", attributes: ["name"] },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const data = complaints.map((c) => ({
      "Ticket ID": c.id.split("-")[0],
      Date: c.created_at.toISOString().split("T")[0],
      Type: c.complaint_type,
      Priority: c.priority,
      Status: c.status,
      Building: c.room?.building?.name || "N/A",
      Room: c.room?.room_number || "N/A",
      Student: `${c.student?.first_name} ${c.student?.last_name}`,
      Description: c.description,
      "Resolved At": c.resolved_at
        ? c.resolved_at.toISOString().split("T")[0]
        : "",
    }));

    const buffer = generateExcelBuffer(data, "Complaints Report");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Complaints_Report.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    logger.error("Error generating complaint report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

// @desc    Download Gate Pass Report
// @route   GET /api/hostel/reports/download/gate-passes
// @access  hostel:read
exports.downloadGatePassReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.going_date = { [Op.between]: [startDate, endDate] };
    }

    const passes = await HostelGatePass.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["first_name", "last_name", "student_id"],
        },
      ],
      order: [["going_date", "DESC"]],
    });

    const data = passes.map((p) => ({
      "Pass ID": p.id.split("-")[0],
      Student: `${p.student?.first_name} ${p.student?.last_name}`,
      Type: p.pass_type,
      Purpose: p.purpose,
      Departure: p.going_date,
      "Expected Return": p.coming_date || p.expected_in_time,
      "Actual Return": p.actual_return_time
        ? new Date(p.actual_return_time).toLocaleString()
        : "",
      Status: p.status,
    }));

    const buffer = generateExcelBuffer(data, "Gate Pass Report");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=GatePass_Report.xlsx`,
    );
    res.send(buffer);
  } catch (error) {
    logger.error("Error generating gate pass report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};
