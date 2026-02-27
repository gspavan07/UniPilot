import { sequelize } from "../../../config/database.js";
import { Op } from "sequelize";
import CoreService from "../../core/services/index.js";
import feeLedgerService from "../../fees/services/feeLedgerService.js";
import { HostelAllocation, HostelBuilding, HostelFloor, HostelRoom, HostelRoomBill, HostelRoomBillDistribution } from "../models/index.js";

const hydrateListWithUser = async (list, userIdField, asField, attributes) => {
  const items = Array.isArray(list) ? list.filter(Boolean) : list ? [list] : [];
  if (items.length === 0) return;

  const userIdsRaw = items.map(item => item[userIdField]).filter(Boolean);
  const userIds = [...new Set(userIdsRaw)];
  if (userIds.length === 0) return;

  const userMap = await CoreService.getUserMapByIds(userIds, { attributes });

  items.forEach(item => {
    const user = userMap.get(item[userIdField]) || null;
    if (typeof item?.setDataValue === 'function') {
      item.setDataValue(asField, user);
    } else {
      item[asField] = user;
    }
  });
};

// @desc    Create a room bill
// @route   POST /api/hostel/room-bills
// @access  hostel:manage
export const createRoomBill = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      room_id,
      bill_type,
      total_amount,
      billing_month,
      billing_year,
      due_date,
      description,
    } = req.body;

    // Validate room exists
    const room = await HostelRoom.findByPk(room_id);
    if (!room) {
      await transaction.rollback();
      return res.status(404).json({ error: "Room not found" });
    }

    const bill = await HostelRoomBill.create(
      {
        room_id,
        bill_type,
        total_amount,
        billing_month,
        billing_year,
        issue_date: new Date(),
        due_date: due_date || null,
        description,
        status: "pending",
        created_by: req.user.userId || req.user.id,
      },
      { transaction },
    );

    // Auto-distribute to students
    const distributionResult = await distributeBillToStudents(
      bill,
      transaction,
    );

    await transaction.commit();

    res.status(201).json({
      message: "Room bill created and distributed successfully",
      bill: distributionResult.bill,
      distributions: distributionResult.distributions,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating room bill:", error);
    res.status(500).json({ error: "Failed to create room bill" });
  }
};

// Helper function to distribute bill to students
async function distributeBillToStudents(bill, transaction, req = null) {
  // Convert billing month to range strings (YYYY-MM-DD)
  const year = parseInt(bill.billing_year);
  const month = parseInt(bill.billing_month);

  // Start of month: YYYY-MM-01
  const monthStartStr = `${year}-${String(month).padStart(2, "0")}-01`;
  // End of month: last day of the month
  const monthLastDay = new Date(Date.UTC(year, month, 0));
  const monthEndStr = monthLastDay.toISOString().split("T")[0];

  // Get all allocations for this room that could possibly match
  const allAllocations = await HostelAllocation.findAll({
    where: {
      room_id: bill.room_id,
      status: { [Op.in]: ["active", "checked_out"] },
    },
    include: [
      {
        model: HostelRoom,
        as: "room",
        attributes: ["id", "room_number"],
      },
    ],
  });

  await hydrateListWithUser(allAllocations, "student_id", "student", [
    "id",
    "first_name",
    "last_name",
    "email",
    "batch_year",
    "current_semester",
  ]);

  // Filter allocations that residency overlaps with billing period
  const allocations = allAllocations.filter((allocation) => {
    // Get dates as YYYY-MM-DD strings
    const checkInStr = new Date(allocation.check_in_date)
      .toISOString()
      .split("T")[0];
    const checkOutStr = allocation.check_out_date
      ? new Date(allocation.check_out_date).toISOString().split("T")[0]
      : null;

    // Rule: Student is eligible if they checked in on or before the last day of the month
    // AND they haven't checked out OR they checked out on or after the first day of the month
    const startedBeforeOrDuring = checkInStr <= monthEndStr;
    const stayContinuesIntoMonth = !checkOutStr || checkOutStr >= monthStartStr;

    return startedBeforeOrDuring && stayContinuesIntoMonth;
  });

  if (allocations.length === 0) {
    throw new Error(
      "No eligible occupants found in this room for the billing period.",
    );
  }

  // Calculate share per student
  const shareAmount = (
    parseFloat(bill.total_amount) / allocations.length
  ).toFixed(2);

  // Get or create category for this bill type
  const categoryName = `Hostel ${bill.bill_type.charAt(0).toUpperCase() + bill.bill_type.slice(1)}`;
  const category = await feeLedgerService.getOrCreateCategory(
    {
      name: categoryName,
      defaults: {
        description: `${categoryName} charges for hostel`,
        category_type: "one_time",
        is_active: true,
      },
    },
    { transaction },
  );

  const distributions = [];

  // Create student fee charge and distribution record for each student
  for (const allocation of allocations) {
    const student = allocation.student;
    const semester = student.current_semester || 1;

    // Create Student Fee Charge
    const feeCharge = await feeLedgerService.createStudentCharge(
      {
        student_id: student.id,
        category_id: category.id,
        charge_type: "hostel_bill",
        amount: shareAmount,
        description: `${bill.bill_type.toUpperCase()} - ${getMonthName(bill.billing_month)} ${bill.billing_year} - Room ${allocation.room.room_number}`,
        reference_id: bill.id,
        reference_type: "hostel_room_bill",
        semester: semester,
        academic_year: allocation.academic_year || `${year}-${year + 1}`,
        created_by: req ? req.user.userId || req.user.id : bill.created_by,
      },
      { transaction },
    );

    // Create distribution record
    await HostelRoomBillDistribution.create(
      {
        room_bill_id: bill.id,
        student_id: student.id,
        allocation_id: allocation.id,
        share_amount: shareAmount,
        fee_charge_id: feeCharge.id,
      },
      { transaction },
    );

    distributions.push({
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
      },
      share_amount: shareAmount,
    });
  }

  // Update bill status
  bill.status = "distributed";
  bill.distributed_at = new Date();
  await bill.save({ transaction });

  return { bill, distributions };
}

// @desc    Distribute room bill to occupants
// @route   POST /api/hostel/room-bills/:id/distribute
// @access  hostel:manage
export const distributeRoomBill = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const bill = await HostelRoomBill.findByPk(id);
    if (!bill) {
      await transaction.rollback();
      return res.status(404).json({ error: "Room bill not found" });
    }

    if (bill.status === "distributed") {
      await transaction.rollback();
      return res.status(400).json({ error: "Bill already distributed" });
    }

    const { distributions } = await distributeBillToStudents(
      bill,
      transaction,
      req,
    );

    await transaction.commit();

    res.json({
      message: `Bill distributed successfully to ${distributions.length} student(s)`,
      bill,
      distributions,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error distributing room bill:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to distribute room bill" });
  }
};

// @desc    Get all room bills
// @route   GET /api/hostel/room-bills
// @access  hostel:manage
export const getAllRoomBills = async (req, res) => {
  try {
    const { room_id, status, bill_type, page = 1, limit = 50 } = req.query;

    const where = {};
    if (room_id) where.room_id = room_id;
    if (status) where.status = status;
    if (bill_type) where.bill_type = bill_type;

    const offset = (page - 1) * limit;

    const { rows: bills, count } = await HostelRoomBill.findAndCountAll({
      where,
      include: [
        {
          model: HostelRoom,
          as: "room",
          attributes: ["id", "room_number", "capacity"],
        },
      ],
      order: [
        ["billing_year", "DESC"],
        ["billing_month", "DESC"],
      ],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      bills,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching room bills:", error);
    res.status(500).json({ error: "Failed to fetch room bills" });
  }
};

// @desc    Get room's billing history
// @route   GET /api/hostel/rooms/:roomId/bills
// @access  hostel:manage
export const getRoomBills = async (req, res) => {
  try {
    const { roomId } = req.params;

    const bills = await HostelRoomBill.findAll({
      where: { room_id: roomId },
      include: [
        {
          model: HostelRoomBillDistribution,
          as: "distributions",
        },
      ],
      order: [
        ["billing_year", "DESC"],
        ["billing_month", "DESC"],
      ],
    });

    for (const bill of bills) {
      if (bill.distributions && bill.distributions.length > 0) {
        await hydrateListWithUser(bill.distributions, "student_id", "student", ["id", "first_name", "last_name"]);
      }
    }

    res.json({ bills });
  } catch (error) {
    console.error("Error fetching room bills:", error);
    res.status(500).json({ error: "Failed to fetch room bills" });
  }
};

// @desc    Update room bill
// @route   PUT /api/hostel/room-bills/:id
// @access  hostel:manage
export const updateRoomBill = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      total_amount,
      due_date,
      description,
      status,
      bill_type,
      billing_month,
      billing_year,
    } = req.body;

    const bill = await HostelRoomBill.findByPk(id, {
      include: [
        {
          model: HostelRoomBillDistribution,
          as: "distributions",
        },
      ],
    });
    if (!bill) {
      await transaction.rollback();
      return res.status(404).json({ error: "Room bill not found" });
    }

    const isDistributed = bill.status === "distributed";

    if (isDistributed) {
      // Check if any associated charges are paid
      const chargeIds = bill.distributions
        .map((d) => d.fee_charge_id)
        .filter(Boolean);

      if (chargeIds.length > 0) {
        const paidCharges = await feeLedgerService.countStudentCharges({
          where: {
            id: chargeIds,
            is_paid: true,
          },
        });

        if (paidCharges > 0) {
          await transaction.rollback();
          return res.status(400).json({
            error:
              "Cannot update bill because some students have already paid their share.",
          });
        }
      }

      // If amount changed, re-calculate and update shares/charges
      if (
        total_amount &&
        parseFloat(total_amount) !== parseFloat(bill.total_amount)
      ) {
        const newShare = (
          parseFloat(total_amount) / bill.distributions.length
        ).toFixed(2);

        await HostelRoomBillDistribution.update(
          { share_amount: newShare },
          { where: { room_bill_id: id }, transaction },
        );

        if (chargeIds.length > 0) {
          await feeLedgerService.updateStudentCharges(
            { amount: newShare },
            { where: { id: chargeIds }, transaction },
          );
        }
      }

      // Sync other fields to charges if they changed
      if (chargeIds.length > 0) {
        const updates = {};
        if (description !== undefined) updates.description = description;
        // Optionally update description based on bill_type/month/year if they changed

        if (Object.keys(updates).length > 0) {
          await feeLedgerService.updateStudentCharges(updates, {
            where: { id: chargeIds },
            transaction,
          });
        }
      }
    }

    // Update bill record
    if (total_amount) bill.total_amount = total_amount;
    if (due_date) bill.due_date = due_date;
    if (description !== undefined) bill.description = description;
    if (status) bill.status = status;
    if (bill_type) bill.bill_type = bill_type;
    if (billing_month) bill.billing_month = billing_month;
    if (billing_year) bill.billing_year = billing_year;

    await bill.save({ transaction });
    await transaction.commit();

    res.json({ message: "Room bill updated successfully", bill });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error updating room bill:", error);
    res.status(500).json({ error: "Failed to update room bill" });
  }
};

// @desc    Delete room bill
// @route   DELETE /api/hostel/room-bills/:id
// @access  hostel:manage
export const deleteRoomBill = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const bill = await HostelRoomBill.findByPk(id, {
      include: [
        {
          model: HostelRoomBillDistribution,
          as: "distributions",
        },
      ],
    });
    if (!bill) {
      await transaction.rollback();
      return res.status(404).json({ error: "Room bill not found" });
    }

    if (bill.status === "distributed") {
      // Check if any distribution has a paid fee charge
      const distributionIds = bill.distributions.map((d) => d.id);
      const distributions = await HostelRoomBillDistribution.findAll({
        where: { id: distributionIds },
      });

      const chargeIds = distributions
        .map((d) => d.fee_charge_id)
        .filter(Boolean);

      if (chargeIds.length > 0) {
        const paidCharges = await feeLedgerService.countStudentCharges({
          where: {
            id: chargeIds,
            is_paid: true,
          },
        });

        if (paidCharges > 0) {
          await transaction.rollback();
          return res.status(400).json({
            error:
              "Cannot delete bill because some students have already paid their share.",
          });
        }

        // Delete associated fee charges
        await feeLedgerService.deleteStudentCharges({
          where: { id: chargeIds },
          transaction,
        });
      }

      // Delete distributions
      await HostelRoomBillDistribution.destroy({
        where: { room_bill_id: id },
        transaction,
      });
    }

    await bill.destroy({ transaction });
    await transaction.commit();

    res.json({ message: "Room bill deleted successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error deleting room bill:", error);
    res.status(500).json({ error: "Failed to delete room bill" });
  }
};

// @desc    Get all rooms for billing view
// @route   GET /api/hostel/rooms/billing-view
// @access  hostel:manage
export const getRoomsForBilling = async (req, res) => {
  try {
    const { building_id, floor_id, search } = req.query;

    const where = {};
    if (building_id) where.building_id = building_id;
    if (floor_id) where.floor_id = floor_id;
    if (search)
      where.room_number = { [Op.iLike]: `%${search}%` };

    const rooms = await HostelRoom.findAll({
      where,
      include: [
        {
          model: HostelBuilding,
          as: "building",
          attributes: ["id", "name"],
        },
        {
          model: HostelFloor,
          as: "floor",
          attributes: ["id", "floor_number"],
        },
      ],
      attributes: [
        "id",
        "room_number",
        "capacity",
        "current_occupancy",
        "status",
      ],
      order: [["room_number", "ASC"]],
    });

    // Get last bill date for each room
    const roomsWithBillInfo = await Promise.all(
      rooms.map(async (room) => {
        const lastBill = await HostelRoomBill.findOne({
          where: { room_id: room.id },
          order: [["issue_date", "DESC"]],
          attributes: ["issue_date", "bill_type"],
        });

        return {
          ...room.toJSON(),
          last_bill_date: lastBill?.issue_date || null,
          last_bill_type: lastBill?.bill_type || null,
        };
      }),
    );

    res.json({ rooms: roomsWithBillInfo });
  } catch (error) {
    console.error("Error fetching rooms for billing:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

// @desc    Bulk create room bills from CSV
// @route   POST /api/hostel/room-bills/bulk-create
// @access  hostel:manage
export const bulkCreateBills = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { bills } = req.body; // Array of bill objects

    if (!Array.isArray(bills) || bills.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "No bills provided" });
    }

    const createdBills = [];
    const errors = [];

    for (let i = 0; i < bills.length; i++) {
      const billData = bills[i];

      try {
        // Validate room exists
        const room = await HostelRoom.findByPk(billData.room_id);
        if (!room) {
          errors.push({
            row: i + 1,
            room_id: billData.room_id,
            error: "Room not found",
          });
          continue;
        }

        // Create bill
        const bill = await HostelRoomBill.create(
          {
            room_id: billData.room_id,
            bill_type: billData.bill_type,
            total_amount: billData.total_amount,
            billing_month: billData.billing_month,
            billing_year: billData.billing_year,
            issue_date: new Date(),
            due_date: billData.due_date || null,
            description: billData.description || null,
            status: "pending",
            created_by: req.user.userId || req.user.id,
          },
          { transaction },
        );

        // Auto-distribute to students
        try {
          await distributeBillToStudents(bill, transaction);
          createdBills.push(bill);
        } catch (distError) {
          errors.push({
            row: i + 1,
            room_id: billData.room_id,
            error: `Created but failed to distribute: ${distError.message}`,
          });
        }
      } catch (error) {
        errors.push({
          row: i + 1,
          room_id: billData.room_id,
          error: error.message,
        });
      }
    }

    if (errors.length > 0 && createdBills.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Failed to create any bills",
        errors,
      });
    }

    await transaction.commit();

    res.status(201).json({
      message: `Successfully created ${createdBills.length} bill(s)`,
      created: createdBills.length,
      errors: errors.length > 0 ? errors : undefined,
      bills: createdBills,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error bulk creating bills:", error);
    res.status(500).json({ error: "Failed to create bills" });
  }
};

// @desc    Download billing template CSV
// @route   GET /api/hostel/rooms/billing-template
// @access  hostel:manage
export const downloadBillingTemplate = async (req, res) => {
  try {
    const { building_id, floor_id } = req.query;
    const where = {};
    if (building_id) where.building_id = building_id;
    if (floor_id) where.floor_id = floor_id;

    const rooms = await HostelRoom.findAll({
      where,
      include: [
        {
          model: HostelBuilding,
          as: "building",
          attributes: ["name"],
        },
        {
          model: HostelFloor,
          as: "floor",
          attributes: ["floor_number"],
        },
      ],
      attributes: ["id", "room_number", "capacity", "current_occupancy"],
      order: [["room_number", "ASC"]],
    });

    // Generate CSV
    let csv =
      "room_id,room_number,building,floor,capacity,occupancy,amount,description\n";

    rooms.forEach((room) => {
      csv += `${room.id},${room.room_number},${room.building.name},${room.floor.floor_number},${room.capacity},${room.current_occupancy},,\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=room_billing_template_${new Date().toISOString().split("T")[0]}.csv`,
    );
    res.send(csv);
  } catch (error) {
    console.error("Error generating billing template:", error);
    res.status(500).json({ error: "Failed to generate template" });
  }
};

// Helper to get month name
function getMonthName(monthIndex) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[parseInt(monthIndex) - 1] || "Unknown";
}

export default {
  createRoomBill,
  distributeRoomBill,
  getAllRoomBills,
  getRoomBills,
  updateRoomBill,
  deleteRoomBill,
  getRoomsForBilling,
  bulkCreateBills,
  downloadBillingTemplate,
};
