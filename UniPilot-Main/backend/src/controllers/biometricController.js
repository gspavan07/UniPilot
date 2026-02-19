import { User, StaffAttendance } from "../models/index.js";
import { Op } from "sequelize";

const isEnabled = process.env.BIOMETRIC_INTEGRATION_ENABLED === "true";

// Helper to determine status based on time
// For simplicity, we just mark PRESENT. Complex logic (late, half-day) can be added here.
const determineStatus = (timestamp) => {
  return "present";
};

export const syncBiometricData = async (req, res) => {
  if (!isEnabled) {
    return res.status(403).json({
      success: false,
      error: "Biometric integration is disabled.",
    });
  }

  const logs = req.body; // Expect array: [{ device_user_id, timestamp, device_ip }]

  if (!Array.isArray(logs) || logs.length === 0) {
    return res.status(400).json({ success: false, error: "Invalid payload" });
  }

  let successCount = 0;
  let skippedCount = 0;

  try {
    // 1. Get all mapped users
    const deviceIds = logs.map((l) => l.device_user_id.toString());
    const mappedUsers = await User.findAll({
      where: {
        biometric_device_id: {
          [Op.in]: deviceIds,
        },
      },
      attributes: ["id", "biometric_device_id"],
    });

    // Create a lookup map
    const userMap = {};
    mappedUsers.forEach((u) => {
      userMap[u.biometric_device_id] = u.id;
    });

    // 2. Process logs
    for (const log of logs) {
      const systemUserId = userMap[log.device_user_id.toString()];

      if (!systemUserId) {
        skippedCount++; // ID not mapped to any user
        continue;
      }

      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      const logTime = new Date(log.timestamp).toLocaleTimeString("en-GB", {
        hour12: false,
      });
      const status = determineStatus(log.timestamp);

      // Check if attendance already exists for today
      const existingRecord = await StaffAttendance.findOne({
        where: {
          user_id: systemUserId,
          date: logDate,
        },
      });

      if (existingRecord) {
        // If it exists, but check_in is empty, treat this as the first scan (In)
        if (!existingRecord.check_in_time) {
          await existingRecord.update({
            check_in_time: logTime,
            status: status, // Ensure status is set to present
            remarks: `Biometric In (Device: ${log.device_ip || "Unknown"})`,
          });
        } else if (!existingRecord.check_out_time) {
          // If check_in exists, but check_out is empty, this is the SECOND scan (Out)
          await existingRecord.update({
            check_out_time: logTime,
            remarks: `Biometric Out (Device: ${log.device_ip || "Unknown"})`,
          });
        }
        // If both are already set, we ignore subsequent scans per user request "simple only 2 for day"
      } else {
        // No record today: Create with Check-In
        await StaffAttendance.create({
          user_id: systemUserId,
          date: logDate,
          status: status,
          check_in_time: logTime,
          remarks: `Biometric Sync (Device: ${log.device_ip || "Unknown"})`,
        });
      }

      successCount++;
    }

    return res.status(200).json({
      success: true,
      message: "Sync complete",
      stats: {
        received: logs.length,
        processed: successCount,
        skipped: skippedCount,
      },
    });
  } catch (error) {
    console.error("Biometric Sync Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const mapUserToDevice = async (req, res) => {
  if (!isEnabled) {
    return res.status(403).json({
      success: false,
      error: "Biometric integration is disabled.",
    });
  }

  const { user_id, biometric_device_id } = req.body;

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.biometric_device_id = biometric_device_id;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User mapped successfully",
      data: user,
    });
  } catch (error) {
    console.error("Mapping Error:", error);
    return res.status(500).json({ success: false, error: "Mapping failed" });
  }
};

export default {
  syncBiometricData,
  mapUserToDevice,
};
