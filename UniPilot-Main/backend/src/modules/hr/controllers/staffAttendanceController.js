import logger from "../../../utils/logger.js";
import { Op } from "sequelize";
import { sequelize } from "../../../config/database.js";
import AcademicService from "../../academics/services/index.js";
import CoreService from "../../core/services/index.js";
import { LeaveBalance, StaffAttendance } from "../models/index.js";
import SettingsService from "../../settings/services/index.js";

// @desc    Mark staff attendance (Admin/Manager)
// @route   POST /api/hr/attendance/mark
// @access  Private/Admin
export const markAttendance = async (req, res) => {
  try {
    const { date, attendance_data } = req.body; // [{ user_id, status, check_in_time, check_out_time, remarks }]

    if (!attendance_data || !Array.isArray(attendance_data)) {
      return res.status(400).json({ error: "Invalid attendance data" });
    }

    const savedRecords = await sequelize.transaction(async (t) => {
      const records = [];
      for (const item of attendance_data) {
        const [record, created] = await StaffAttendance.findOrCreate({
          where: { user_id: item.user_id, date },
          defaults: {
            status: item.status,
            check_in_time: item.check_in_time,
            check_out_time: item.check_out_time,
            remarks: item.remarks,
          },
          transaction: t,
        });

        if (!created) {
          await record.update(
            {
              status: item.status,
              check_in_time: item.check_in_time,
              check_out_time: item.check_out_time,
              remarks: item.remarks,
            },
            { transaction: t }
          );
        }
        records.push(record);
      }
      return records;
    });

    res.status(200).json({
      success: true,
      message: `Marked attendance for ${attendance_data.length} staff members`,
      data: savedRecords,
    });
  } catch (error) {
    logger.error("Error marking staff attendance:", error);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};

// @desc    Get Daily Attendance View (Users + Attendance + Leaves)
// @route   GET /api/hr/attendance/daily-view
// @access  Private/Admin/HOD
export const getDailyAttendanceView = async (req, res) => {
  try {
    const { date, department_id } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // 1. Fetch Users
    const userWhere = {
      role: { [Op.ne]: "student" },
      is_active: true,
    };
    const users = await CoreService.findAll({
      where: userWhere,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "employee_id",
        "role",
        "department_id",
        "biometric_device_id",
      ],
      includeProfiles: "staff",
      order: [["first_name", "ASC"]],
    });

    const filteredUsers =
      department_id && department_id !== "all"
        ? users.filter(
            (user) =>
              (user.staff_profile?.department_id || user.department_id) ===
              department_id,
          )
        : users;

    const departmentIds = [
      ...new Set(
        filteredUsers
          .map((user) => user.staff_profile?.department_id || user.department_id)
          .filter(Boolean),
      ),
    ];
    const departments = await AcademicService.getDepartmentsByIds(
      departmentIds,
      { attributes: ["id", "name"], raw: true },
    );
    const departmentMap = new Map(
      departments.map((department) => [department.id, department]),
    );

    // 2. Fetch Existing Attendance
    const attendance = await StaffAttendance.findAll({
      where: { date },
    });

    // 3. Fetch Approved Leaves covering this date
    const leaves = await AcademicService.listLeaveRequests({
      where: {
        status: "approved",
        start_date: { [Op.lte]: date },
        end_date: { [Op.gte]: date },
      },
    });

    // 4. Fetch Holiday for this date (Staff targeted)
    const holiday = await SettingsService.getHolidayByDate(date, {
      targets: ["staff", "both"],
    });

    // 4.5 Check if Saturday is a working day for staff
    let isSatWorking = false;
    const dayOfWeek = new Date(date).getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek === 6) {
      const satSetting = await SettingsService.getSettingByKey(
        "staff_saturday_working",
      );
      isSatWorking = satSetting?.setting_value === "true";
    }
    const isSunday = dayOfWeek === 0;

    // 5. Merge Data
    const mergedData = filteredUsers.map((user) => {
      // Check existing attendance
      const attCallback = attendance.find((a) => a.user_id === user.id);

      // Check leave
      const leaveCallback = leaves.find((l) => l.student_id === user.id);

      let status = holiday ? "holiday" : "not_marked";
      let remarks = holiday ? `Holiday: ${holiday.name}` : "";

      // If it's Sunday or a non-working Saturday, and not a holiday
      if (!holiday) {
        if (isSunday) {
          status = "holiday";
          remarks = "Weekly Off (Sunday)";
        } else if (dayOfWeek === 6 && !isSatWorking) {
          status = "holiday";
          remarks = "Weekly Off (Saturday)";
        }
      }

      let check_in = "";
      let check_out = "";
      let is_locked =
        !!holiday ||
        (isSunday && !holiday) ||
        (dayOfWeek === 6 && !isSatWorking && !holiday);

      if (attCallback) {
        status = attCallback.status;
        remarks = attCallback.remarks || "";
        check_in = attCallback.check_in_time || "";
        check_out = attCallback.check_out_time || "";
      } else if (leaveCallback) {
        status = leaveCallback.is_half_day ? "half-day" : "leave";
        remarks = `On Leave: ${leaveCallback.leave_type}`;
        is_locked = true;
      }

      const deptId = user.staff_profile?.department_id || user.department_id;

      return {
        user_id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        employee_id: user.staff_profile?.employee_id || user.employee_id,
        role: user.role,
        department: deptId ? departmentMap.get(deptId)?.name || "-" : "-",
        biometric_device_id: user.biometric_device_id,
        status,
        check_in_time: check_in,
        check_out_time: check_out,
        remarks,
        is_leave: !!leaveCallback,
        leave_details: leaveCallback,
      };
    });

    res.status(200).json({ success: true, data: mergedData });
  } catch (error) {
    logger.error("Error fetching daily attendance view:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
};

// @desc    Get Staff Attendance Report
// @route   GET /api/hr/attendance
// @access  Private/Admin/Staff
export const getStats = async (req, res) => {
  try {
    const { start_date, end_date, user_id, department_id } = req.query;

    const where = {};
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }
    if (user_id) where.user_id = user_id;

    if (department_id) {
      const staffInDepartment = await CoreService.findAll({
        where: {},
        includeProfiles: "staff",
      });
      // Filter those whose profile matches the department
      const filteredUsers = staffInDepartment.filter(
        (staff) => (staff.staff_profile?.department_id || staff.department_id) === department_id
      );
      const filteredUserIds = filteredUsers.map((staff) => staff.id);
      
      if (filteredUserIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
      if (user_id) {
        if (!filteredUserIds.includes(user_id)) {
          return res.status(200).json({ success: true, data: [] });
        }
        where.user_id = user_id;
      } else {
        where.user_id = { [Op.in]: filteredUserIds };
      }
    }

    const records = await StaffAttendance.findAll({
      where,
      order: [["date", "DESC"]],
    });

    const staffIds = [...new Set(records.map((record) => record.user_id))];
    const staffUsers = await CoreService.getUsersByIds(staffIds, {
      attributes: ["id", "first_name", "last_name", "employee_id", "department_id"],
      includeProfiles: "staff",
    });
    const staffUserMap = new Map(
      staffUsers.map((user) => [user.id, user.toJSON?.() ?? user]),
    );

    const staffDepartmentIds = [
      ...new Set(staffUsers.map((user) => user.staff_profile?.department_id || user.department_id).filter(Boolean)),
    ];
    const staffDepartments = await AcademicService.getDepartmentsByIds(
      staffDepartmentIds,
      { attributes: ["id", "name"], raw: true },
    );
    const staffDepartmentMap = new Map(
      staffDepartments.map((department) => [department.id, department]),
    );

    const enrichedRecords = records.map((record) => {
      const recordJson = record.toJSON?.() ?? record;
      const staff = staffUserMap.get(record.user_id);
      
      const deptId = staff?.staff_profile?.department_id || staff?.department_id;
      
      if (staff) {
        staff.employee_id = staff.staff_profile?.employee_id || staff.employee_id;
      }
      
      recordJson.staff = staff
        ? {
            ...staff,
            department: deptId
              ? staffDepartmentMap.get(deptId) || null
              : null,
          }
        : null;
      return recordJson;
    });

    res.status(200).json({
      success: true,
      data: enrichedRecords,
    });
  } catch (error) {
    logger.error("Error fetching staff attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

// @desc    Get My Attendance (Staff Perspective)
// @route   GET /api/hr/my-attendance
// @access  Private/Staff
export const getMyAttendance = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { start_date, end_date } = req.query;

    const where = { user_id };
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const records = await StaffAttendance.findAll({
      where,
      order: [["date", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    logger.error("Error fetching my attendance:", error);
    res.status(500).json({ error: "Failed to fetch your attendance" });
  }
};

// @desc    Get My Leave Requests
// @route   GET /api/hr/leave/my-requests
// @access  Private/Staff
export const getMyLeaveRequests = async (req, res) => {
  try {
    const requests = await AcademicService.listLeaveRequests({
      where: { student_id: req.user.userId }, // Reuse student_id as user_id
      order: [["created_at", "DESC"]],
    });
    const approverIds = [
      ...new Set(requests.map((request) => request.approver_id).filter(Boolean)),
    ];
    const approvers = await CoreService.getUsersByIds(approverIds, {
      attributes: ["id", "first_name", "last_name", "role"],
    });
    const approverMap = new Map(
      approvers.map((user) => [user.id, user.toJSON?.() ?? user]),
    );
    const enriched = requests.map((request) => {
      const requestJson = request.toJSON?.() ?? request;
      requestJson.approver = requestJson.approver_id
        ? approverMap.get(requestJson.approver_id) || null
        : null;
      return requestJson;
    });
    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    logger.error("Error fetching my leaves:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
};

// @desc    Get Specific User's Leave Requests (Admin/HR)
// @route   GET /api/hr/leave/requests/:user_id
// @access  Private/Admin/HR
export const getUserLeaveRequests = async (req, res) => {
  try {
    const { user_id } = req.params;

    const requests = await AcademicService.listLeaveRequests({
      where: { student_id: user_id },
      order: [["created_at", "DESC"]],
    });
    const approverIds = [
      ...new Set(requests.map((request) => request.approver_id).filter(Boolean)),
    ];
    const approvers = await CoreService.getUsersByIds(approverIds, {
      attributes: ["id", "first_name", "last_name", "role"],
    });
    const approverMap = new Map(
      approvers.map((user) => [user.id, user.toJSON?.() ?? user]),
    );
    const enriched = requests.map((request) => {
      const requestJson = request.toJSON?.() ?? request;
      requestJson.approver = requestJson.approver_id
        ? approverMap.get(requestJson.approver_id) || null
        : null;
      return requestJson;
    });
    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    logger.error("Error fetching user leaves:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
};

// @desc    Apply for Leave (Staff)
// @route   POST /api/hr/leave/apply
// @access  Private/Staff
export const applyLeave = async (req, res) => {
  try {
    const {
      leave_type,
      start_date,
      end_date,
      reason,
      attachment_url,
      is_half_day,
    } = req.body;
    const user_id = req.user.userId;

    // Fetch User details for hierarchy
    const user = await CoreService.findByPk(user_id, {
      includeProfiles: "staff",
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Determine Approver
    let approverId = null;
    const role = user.role;

    // Hierarchy Logic
    if (role === "hr") {
      const boss = await CoreService.findOne({ where: { role: "hr_admin" } });
      approverId = boss?.id;
    } else if (
      ["faculty", "staff", "lab_assistant", "operator", "student"].includes(
        role
      )
    ) {
      // Find HOD
      const deptId = user.staff_profile?.department_id || user.department_id;
      const hod = await CoreService.findOne({
        includeProfiles: "staff",
      });
      const hods = await CoreService.findAll({
        where: { role: "hod" },
        includeProfiles: "staff",
      });
      const matchedHod = hods.find(h => (h.staff_profile?.department_id || h.department_id) === deptId);
      
      approverId = matchedHod?.id;
    } else if (role === "hod") {
      const admin = await CoreService.findOne({ where: { role: "admin" } });
      approverId = admin?.id;
    }

    // Fallback
    if (!approverId) {
      const fallback = await CoreService.findOne({ where: { role: "admin" } });
      approverId = fallback?.id;
    }

    // Determine duration
    const start = new Date(start_date);
    const end = new Date(end_date);

    if (is_half_day && start.getTime() !== end.getTime()) {
      return res.status(400).json({
        error:
          "Half-day leave must be for a single date (Start Date = End Date).",
      });
    }

    const diffTime = Math.abs(end - start);
    let requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (is_half_day) requestedDays = 0.5;

    // Check Balance logic
    if (leave_type !== "Loss of Pay") {
      const currentYear = new Date().getFullYear();
      const balanceRecord = await LeaveBalance.findOne({
        where: { user_id, leave_type, year: currentYear },
      });

      if (!balanceRecord) {
        return res
          .status(400)
          .json({ error: `No leave balance found for ${leave_type}.` });
      }

      if (balanceRecord.balance < requestedDays) {
        return res.status(400).json({
          error: `Insufficient leave balance. Available: ${balanceRecord.balance}, Requested: ${requestedDays}`,
        });
      }
    }

    const leave = await AcademicService.createLeaveRequest({
      student_id: user_id, // Note: LeaveRequest model uses 'student_id' foreign key for user. We reuse it for staff.
      leave_type,
      start_date,
      end_date,
      reason,
      attachment_url,
      status: "pending",
      approver_id: approverId,
      is_half_day: is_half_day || false,
    });

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  } catch (error) {
    logger.error("Error applying for leave:", error);
    res.status(500).json({ error: "Leave application failed" });
  }
};

// @desc    Admin: Update Leave Status (Approve/Reject)
// @route   PUT /api/hr/leave/:id
// @access  Private/Admin
export const updateLeaveStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // status: 'approved' | 'rejected'

    const leave = await AcademicService.findLeaveRequestByPk(id);
    if (!leave) {
      await t.rollback();
      return res.status(404).json({ error: "Leave request not found" });
    }

    // Verify Authority
    // Allow if: User IS the assigned approver OR User IS Admin
    const isApprover = leave.approver_id === req.user.userId;
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);

    if (!isApprover && !isAdmin) {
      await t.rollback();
      return res
        .status(403)
        .json({ error: "Not authorized to approve this request" });
    }

    if (leave.status === "approved" && status !== "approved") {
      // If reverting approval, should credit back? (Complex logic, skipping for MVP)
    }

    await leave.update(
      {
        status,
        review_remarks: remarks,
        reviewed_by: req.user.userId,
      },
      { transaction: t }
    );

    // logic: If approved, deduct balance
    if (status === "approved") {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const currentYear = start.getFullYear();

      const balanceRecord = await LeaveBalance.findOne({
        where: {
          user_id: leave.student_id,
          leave_type: leave.leave_type,
          year: currentYear,
        },
        transaction: t,
      });

      if (balanceRecord) {
        const newUsed = parseFloat(balanceRecord.used) + diffDays;
        const newBalance = parseFloat(balanceRecord.total_credits) - newUsed;
        await balanceRecord.update(
          {
            used: newUsed,
            balance: newBalance,
          },
          { transaction: t }
        );
      }

      // Also Create Attendance Records as 'leave' ?
      // Implementation Choice: Yes, useful for daily tracking.
      // Loop dates and create StaffAttendance(status='leave')
      // Skipping complex loop for now, but commonly done.
    }

    await t.commit();
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    await t.rollback();
    logger.error("Error updating leave:", error);
    res.status(500).json({ error: "Update failed" });
  }
};

// @descGet Leave Balances
// @route GET /api/hr/leave/balances
export const getLeaveBalances = async (req, res) => {
  try {
    const user_id = req.query.user_id || req.user.userId;
    const year = req.query.year || new Date().getFullYear();

    const balances = await LeaveBalance.findAll({
      where: { user_id, year },
    });
    res.status(200).json({ success: true, data: balances });
  } catch (error) {
    logger.error("Error fetching balances:", error);
    res.status(500).json({ error: "Failed to fetch balances" });
  }
};

// @desc    Get Pending Approvals (For Manager/HOD/Admin)
// @route   GET /api/hr/leave/approvals
export const getPendingApprovals = async (req, res) => {
  try {
    const { role, userId } = req.user;

    // Logic: Admins see ALL pending. Others see only assigned.
    const where = { status: "pending" };

    if (!["admin", "super_admin", "hr_admin"].includes(role)) {
      where.approver_id = userId;
    }

    const approvals = await AcademicService.listLeaveRequests({
      where,
      order: [["created_at", "ASC"]],
    });

    const applicantIds = [
      ...new Set(approvals.map((leave) => leave.student_id).filter(Boolean)),
    ];
    const applicants = await CoreService.getUsersByIds(applicantIds, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "employee_id",
        "department_id",
        "role",
      ],
      includeProfiles: "staff",
    });
    const applicantMap = new Map(
      applicants.map((user) => [user.id, user.toJSON?.() ?? user]),
    );

    const applicantDepartmentIds = [
      ...new Set(
        applicants.map((user) => user.staff_profile?.department_id || user.department_id).filter(Boolean),
      ),
    ];
    const applicantDepartments = await AcademicService.getDepartmentsByIds(
      applicantDepartmentIds,
      { attributes: ["id", "name"], raw: true },
    );
    const applicantDepartmentMap = new Map(
      applicantDepartments.map((department) => [department.id, department]),
    );

    // Remap for frontend consistency if needed
    // Frontend expects `applicant` object.
    const data = approvals.map((a) => {
      const applicant = applicantMap.get(a.student_id);
      
      const deptId = applicant?.staff_profile?.department_id || applicant?.department_id;
      if (applicant) {
        applicant.employee_id = applicant.staff_profile?.employee_id || applicant.employee_id;
      }
      
      return {
        ...a.toJSON(),
        applicant: applicant
          ? {
              ...applicant,
              department: deptId
                ? applicantDepartmentMap.get(deptId) || null
                : null,
            }
          : null,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error("Error fetching approvals:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
};

export default {
  markAttendance,
  getDailyAttendanceView,
  getStats,
  getMyAttendance,
  getMyLeaveRequests,
  getUserLeaveRequests,
  applyLeave,
  updateLeaveStatus,
  getLeaveBalances,
  getPendingApprovals,
};
