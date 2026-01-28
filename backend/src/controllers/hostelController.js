const logger = require("../utils/logger");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");
const {
  HostelBuilding,
  HostelFloor,
  HostelRoom,
  HostelBed,
  HostelAllocation,
  HostelFeeStructure,
  HostelComplaint,
  HostelAttendance,
  HostelGatePass,
  HostelVisitor,
  HostelStayLog,
  HostelMessFeeStructure,
  FeeCategory,
  FeeStructure,
  User,
  Department,
  Program,
  StudentFeeCharge,
} = require("../models");

/**
 * Hostel Management Controller
 * Handles all hostel-related operations
 */

// ============================================
// BUILDING MANAGEMENT
// ============================================

// @desc    Get all hostel buildings
// @route   GET /api/hostel/buildings
// @access  hostel:read
exports.getBuildings = async (req, res) => {
  try {
    const buildings = await HostelBuilding.findAll({
      include: [
        {
          model: HostelFloor,
          as: "floors",
        },
      ],
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: buildings });
  } catch (error) {
    logger.error("Error fetching buildings:", error);
    res.status(500).json({ error: "Failed to fetch buildings" });
  }
};

// @desc    Create new building
// @route   POST /api/hostel/buildings
// @access  hostel:write
exports.createBuilding = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { total_floors, ...buildingData } = req.body;
    const building = await HostelBuilding.create(
      { ...buildingData, total_floors },
      { transaction },
    );

    // Create floors automatically
    if (total_floors > 0) {
      const floors = [];
      for (let i = 1; i <= total_floors; i++) {
        floors.push({
          building_id: building.id,
          floor_number: i,
        });
      }
      await HostelFloor.bulkCreate(floors, { transaction });
    }

    await transaction.commit();

    const buildingWithFloors = await HostelBuilding.findByPk(building.id, {
      include: [{ model: HostelFloor, as: "floors" }],
    });

    res.status(201).json({ success: true, data: buildingWithFloors });
  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error("Error creating building:", error);
    res.status(500).json({ error: "Failed to create building" });
  }
};

// @desc    Update building
// @route   PUT /api/hostel/buildings/:id
// @access  hostel:write
exports.updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const building = await HostelBuilding.findByPk(id);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }
    await building.update(req.body);
    res.json({ success: true, data: building });
  } catch (error) {
    logger.error("Error updating building:", error);
    res.status(500).json({ error: "Failed to update building" });
  }
};

// @desc    Delete building
// @route   DELETE /api/hostel/buildings/:id
// @access  hostel:delete
exports.deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const building = await HostelBuilding.findByPk(id);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }
    await building.destroy();
    res.json({ success: true, message: "Building deleted" });
  } catch (error) {
    logger.error("Error deleting building:", error);
    res.status(500).json({ error: "Failed to delete building" });
  }
};

// ============================================
// ROOM MANAGEMENT
// ============================================

// @desc    Get all rooms with filters
// @route   GET /api/hostel/rooms
// @access  hostel:read
exports.getRooms = async (req, res) => {
  try {
    const { building_id, floor_id, status, room_type } = req.query;
    const where = {};

    if (building_id) where.building_id = building_id;
    if (floor_id) where.floor_id = floor_id;
    if (status) where.status = status;
    if (room_type) where.room_type = room_type;

    const rooms = await HostelRoom.findAll({
      where,
      include: [
        {
          model: HostelBuilding,
          as: "building",
        },
        {
          model: HostelFloor,
          as: "floor",
        },
        {
          model: HostelBed,
          as: "beds",
        },
      ],
      order: [["room_number", "ASC"]],
    });
    res.json({ success: true, data: rooms });
  } catch (error) {
    logger.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

// @desc    Get available rooms
// @route   GET /api/hostel/rooms/available
// @access  hostel:read
exports.getAvailableRooms = async (req, res) => {
  try {
    const { building_id, room_type } = req.query;
    const where = {
      status: ["available", "occupied"],
      [Op.or]: [
        { current_occupancy: { [Op.lt]: sequelize.col("capacity") } },
        { status: "available" },
      ],
    };

    if (building_id) where.building_id = building_id;
    if (room_type) where.room_type = room_type;

    const rooms = await HostelRoom.findAll({
      where,
      include: [
        {
          model: HostelBuilding,
          as: "building",
        },
        {
          model: HostelBed,
          as: "beds",
          where: { status: "available" },
          required: false,
        },
      ],
      order: [["room_number", "ASC"]],
    });
    res.json({ success: true, data: rooms });
  } catch (error) {
    logger.error("Error fetching available rooms:", error);
    res.status(500).json({ error: "Failed to fetch available rooms" });
  }
};

// @desc    Create new room
// @route   POST /api/hostel/rooms
// @access  hostel:write
exports.createRoom = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { capacity, ...roomData } = req.body;

    // Create room
    const room = await HostelRoom.create(
      { ...roomData, capacity },
      { transaction },
    );

    // Create beds for the room
    const beds = [];
    for (let i = 1; i <= capacity; i++) {
      beds.push({
        room_id: room.id,
        bed_number: `${room.room_number}-B${i}`,
        status: "available",
      });
    }
    await HostelBed.bulkCreate(beds, { transaction });

    await transaction.commit();

    const roomWithBeds = await HostelRoom.findByPk(room.id, {
      include: [{ model: HostelBed, as: "beds" }],
    });

    res.status(201).json({ success: true, data: roomWithBeds });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
};

// @desc    Update room
// @route   PUT /api/hostel/rooms/:id
// @access  hostel:write
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await HostelRoom.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    await room.update(req.body);
    res.json({ success: true, data: room });
  } catch (error) {
    logger.error("Error updating room:", error);
    res.status(500).json({ error: "Failed to update room" });
  }
};

// @desc    Update room status
// @route   PUT /api/hostel/rooms/:id/status
// @access  hostel:write
exports.updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const room = await HostelRoom.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    await room.update({ status });
    res.json({ success: true, data: room });
  } catch (error) {
    logger.error("Error updating room status:", error);
    res.status(500).json({ error: "Failed to update room status" });
  }
};

// @desc    Delete room
// @route   DELETE /api/hostel/rooms/:id
// @access  hostel:delete
exports.deleteRoom = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const room = await HostelRoom.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if room has active allocations
    const activeAllocations = await HostelAllocation.count({
      where: { room_id: id, status: "active" },
    });

    if (activeAllocations > 0) {
      return res.status(400).json({
        error: "Cannot delete room with active allocations",
      });
    }

    // Delete beds first
    await HostelBed.destroy({ where: { room_id: id }, transaction });
    // Delete room
    await room.destroy({ transaction });

    await transaction.commit();
    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error("Error deleting room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
};

// ============================================
// STUDENT ALLOCATION
// ============================================

// @desc    Get all allocations
// @route   GET /api/hostel/allocations
// @access  hostel:read
exports.getAllocations = async (req, res) => {
  try {
    const { status, building_id } = req.query;
    const where = {};

    if (status) where.status = status;

    const allocations = await HostelAllocation.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id", "email"],
          include: [
            { model: Department, as: "department" },
            { model: Program, as: "program" },
          ],
        },
        {
          model: HostelRoom,
          as: "room",
          include: [
            { model: HostelBuilding, as: "building" },
            { model: HostelFloor, as: "floor" },
          ],
          ...(building_id && { where: { building_id } }),
        },
        {
          model: HostelBed,
          as: "bed",
        },
        {
          model: HostelFeeStructure,
          as: "fee_structure",
        },
        {
          model: HostelMessFeeStructure,
          as: "mess_fee_structure",
        },
        {
          model: FeeStructure,
          as: "rent_fee",
          attributes: ["amount", "is_active"],
        },
        {
          model: FeeStructure,
          as: "mess_fee",
          attributes: ["amount", "is_active"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: allocations });
  } catch (error) {
    logger.error("Error fetching allocations:", error);
    res.status(500).json({ error: "Failed to fetch allocations" });
  }
};

// @desc    Allocate student to room
// @route   POST /api/hostel/allocations
// @access  hostel:write
exports.allocateStudent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      student_id,
      room_id,
      bed_id,
      mess_fee_structure_id,
      fee_structure_id,
    } = req.body;
    let { semester, academic_year, apply_to_future } = req.body;

    // Check for existing allocation for this student (Unified record policy)
    let allocation = await HostelAllocation.findOne({
      where: { student_id },
    });

    if (allocation && allocation.status === "active") {
      return res
        .status(400)
        .json({ error: "Student already has an active allocation" });
    }

    // Check room availability
    const room = await HostelRoom.findByPk(room_id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.current_occupancy >= room.capacity) {
      return res.status(400).json({ error: "Room is full" });
    }

    // Get student details for main fee creation
    const student = await User.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Auto-derive semester and academic year
    if (!semester) {
      semester = student.current_semester || 1;
    }

    if (!academic_year) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-indexed
      // Academic year typically starts in June/July. If month >= 6, it's currentYear-currentYear+1
      if (currentMonth >= 6) {
        academic_year = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
      } else {
        academic_year = `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
      }
    }

    // Get Plan Amounts
    const rentPlan = await HostelFeeStructure.findByPk(fee_structure_id);
    const messPlan = await HostelMessFeeStructure.findByPk(
      mess_fee_structure_id,
    );

    if (!rentPlan || !messPlan) {
      return res.status(400).json({ error: "Invalid rent or mess plan" });
    }

    // Create Main Fee Entries (Integration)
    const [rentCategory] = await FeeCategory.findOrCreate({
      where: { name: "Hostel Rent" },
      defaults: {
        name: "Hostel Rent",
        description: "Hostel accommodation charges",
      },
      transaction,
    });

    const [messCategory] = await FeeCategory.findOrCreate({
      where: { name: "Hostel Mess" },
      defaults: {
        name: "Hostel Mess",
        description: "Hostel mess and food charges",
      },
      transaction,
    });

    const startSem = parseInt(semester) || student.current_semester || 1;
    const endSem = apply_to_future ? 8 : startSem;
    let firstRentFeeId = null;
    let firstMessFeeId = null;

    for (let sem = startSem; sem <= endSem; sem++) {
      // Create individual fee charges for Rent
      const rentCharge = await StudentFeeCharge.create(
        {
          student_id: student_id,
          category_id: rentCategory.id,
          charge_type: "hostel_bill",
          amount: rentPlan.base_amount,
          description: `Hostel Rent: Semester ${sem} (${academic_year})`,
          reference_id: null, // Will update after allocation
          reference_type: "hostel_allocation",
          semester: sem,
          is_paid: false,
          created_by: req.user.userId || req.user.id,
        },
        { transaction },
      );

      // Create individual fee charges for Mess
      const messCharge = await StudentFeeCharge.create(
        {
          student_id: student_id,
          category_id: messCategory.id,
          charge_type: "hostel_bill",
          amount: messPlan.amount,
          description: `Hostel Mess: Semester ${sem} (${academic_year})`,
          reference_id: null, // Will update after allocation
          reference_type: "hostel_allocation",
          semester: sem,
          is_paid: false,
          created_by: req.user.userId || req.user.id,
        },
        { transaction },
      );

      if (sem === startSem) {
        firstRentFeeId = rentCharge.id;
        firstMessFeeId = messCharge.id;
      }
    }

    // Unified Allocation Update or Create
    if (allocation) {
      await allocation.update(
        {
          room_id,
          bed_id,
          fee_structure_id,
          mess_fee_structure_id,
          rent_fee_charge_id: firstRentFeeId,
          mess_fee_charge_id: firstMessFeeId,
          semester: startSem,
          academic_year: academic_year || "2024-25",
          check_in_date: new Date(),
          status: "active",
        },
        { transaction },
      );
    } else {
      allocation = await HostelAllocation.create(
        {
          student_id,
          room_id,
          bed_id,
          fee_structure_id,
          mess_fee_structure_id,
          rent_fee_charge_id: firstRentFeeId,
          mess_fee_charge_id: firstMessFeeId,
          semester: startSem,
          academic_year: academic_year || "2024-25",
          check_in_date: new Date(),
          status: "active",
        },
        { transaction },
      );
    }

    // Update fee charges with reference_id (the allocation id)
    await StudentFeeCharge.update(
      { reference_id: allocation.id },
      {
        where: { id: [firstRentFeeId, firstMessFeeId] },
        transaction,
      },
    );

    // Always create a new Stay Log entry for historical record
    await HostelStayLog.create(
      {
        allocation_id: allocation.id,
        student_id,
        room_id,
        bed_id,
        check_in_date: new Date(),
        semester: semester || student.current_semester || 1,
        academic_year: academic_year || "2024-25",
      },
      { transaction },
    );

    // Update room occupancy
    await room.update(
      {
        current_occupancy: room.current_occupancy + 1,
        status:
          room.current_occupancy + 1 >= room.capacity ? "full" : "occupied",
      },
      { transaction },
    );

    // Sync is_hosteller flag on student
    await student.update({ is_hosteller: true }, { transaction });

    const allocationWithDetails = await HostelAllocation.findByPk(
      allocation.id,
      {
        include: [
          { model: User, as: "student" },
          { model: HostelRoom, as: "room" },
          { model: HostelBed, as: "bed" },
          { model: HostelFeeStructure, as: "fee_structure" },
        ],
      },
      { transaction },
    );

    await transaction.commit();
    res.status(201).json({ success: true, data: allocationWithDetails });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    logger.error("Error allocating student:", error);
    res.status(500).json({ error: "Failed to allocate student" });
  }
};

// @desc    Check out student
// @route   POST /api/hostel/allocations/:id/checkout
// @access  hostel:write
exports.checkoutStudent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { checkout_type } = req.body; // "current" (immediate) or "next" (scheduled)

    const allocation = await HostelAllocation.findByPk(id, {
      include: [
        { model: HostelRoom, as: "room" },
        { model: HostelBed, as: "bed" },
      ],
    });

    if (!allocation) {
      return res.status(404).json({ error: "Allocation not found" });
    }

    if (allocation.status !== "active") {
      return res.status(400).json({ error: "Allocation is not active" });
    }

    const student = await User.findByPk(allocation.student_id);
    const currentSemester =
      student?.current_semester || allocation.semester || 1;

    // 1. Handle Fee Deactivation Logic
    const hostelCategories = await FeeCategory.findAll({
      where: { name: ["Hostel Rent", "Hostel Mess"] },
      attributes: ["id"],
    });
    const categoryIds = hostelCategories.map((c) => c.id);

    if (checkout_type === "next") {
      // Deactivate fees for NEXT semester onwards
      await FeeStructure.update(
        { is_active: false },
        {
          where: {
            student_id: allocation.student_id,
            category_id: categoryIds,
            semester: { [Op.gt]: currentSemester },
          },
          transaction,
        },
      );

      // Mark allocation with scheduled checkout
      await allocation.update(
        { scheduled_checkout_semester: currentSemester + 1 },
        { transaction },
      );

      await transaction.commit();

      const updatedAllocation = await HostelAllocation.findByPk(allocation.id, {
        include: [
          { model: User, as: "student" },
          { model: HostelRoom, as: "room" },
          { model: HostelBed, as: "bed" },
          { model: HostelFeeStructure, as: "fee_structure" },
          { model: HostelMessFeeStructure, as: "mess_fee_structure" },
        ],
      });

      return res.json({
        success: true,
        data: updatedAllocation,
        message:
          "Targeted checkout for next semester. Future hostel fees have been deactivated.",
      });
    }

    // 2. Default: Immediate "current" checkout
    // Update allocation
    await allocation.update(
      {
        check_out_date: new Date(),
        status: "checked_out",
      },
      { transaction },
    );

    // Sync is_hosteller flag on student
    await User.update(
      { is_hosteller: false },
      { where: { id: allocation.student_id }, transaction },
    );

    // Update historical stay log
    const latestLog = await HostelStayLog.findOne({
      where: {
        allocation_id: id,
        check_out_date: null,
      },
      order: [["created_at", "DESC"]],
    });

    if (latestLog) {
      await latestLog.update({ check_out_date: new Date() }, { transaction });
    }

    // Deactivate ALL future and current optional hostel fees for this student
    await FeeStructure.update(
      { is_active: false },
      {
        where: {
          student_id: allocation.student_id,
          category_id: categoryIds,
          semester: { [Op.gte]: currentSemester },
        },
        transaction,
      },
    );

    // Update room occupancy
    if (allocation.room) {
      await allocation.room.update(
        {
          current_occupancy: Math.max(0, allocation.room.current_occupancy - 1),
          status: "occupied",
        },
        { transaction },
      );
    }

    await transaction.commit();
    res.json({ success: true, message: "Checked out successfully" });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    logger.error("Error checking out student:", error);
    res.status(500).json({ error: "Failed to check out student" });
  }
};

// @desc    Get student stay history
// @route   GET /api/hostel/allocations/:id/history
// @access  hostel:read
exports.getStayHistory = async (req, res) => {
  try {
    const { id } = req.params; // allocation_id
    const history = await HostelStayLog.findAll({
      where: { allocation_id: id },
      include: [
        { model: HostelRoom, as: "room" },
        { model: HostelBed, as: "bed" },
      ],
      order: [["check_in_date", "DESC"]],
    });
    res.json({ success: true, data: history });
  } catch (error) {
    logger.error("Error fetching stay history:", error);
    res.status(500).json({ error: "Failed to fetch stay history" });
  }
};

// @desc    Update student allocation
// @route   PUT /api/hostel/allocations/:id
// @access  hostel:write
exports.updateAllocation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { room_id, bed_id, fee_structure_id, mess_fee_structure_id } =
      req.body;

    const allocation = await HostelAllocation.findByPk(id, {
      include: [{ model: HostelRoom, as: "room" }],
    });

    if (!allocation) {
      return res.status(404).json({ error: "Allocation not found" });
    }

    // 1. Handle Room Transfer
    if (room_id && room_id !== allocation.room_id) {
      const newRoom = await HostelRoom.findByPk(room_id);
      if (!newRoom)
        return res.status(404).json({ error: "New room not found" });
      if (newRoom.current_occupancy >= newRoom.capacity) {
        return res.status(400).json({ error: "New room is full" });
      }

      // Decrement old room
      if (allocation.room) {
        await allocation.room.update(
          {
            current_occupancy: Math.max(
              0,
              allocation.room.current_occupancy - 1,
            ),
            status: "occupied",
          },
          { transaction },
        );
      }

      // Increment new room
      await newRoom.update(
        {
          current_occupancy: newRoom.current_occupancy + 1,
          status:
            newRoom.current_occupancy + 1 >= newRoom.capacity
              ? "full"
              : "occupied",
        },
        { transaction },
      );

      allocation.room_id = room_id;
    }

    // 2. Handle Plan Changes
    if (fee_structure_id && fee_structure_id !== allocation.fee_structure_id) {
      const newRentPlan = await HostelFeeStructure.findByPk(fee_structure_id);
      if (newRentPlan && allocation.rent_fee_id) {
        await FeeStructure.update(
          {
            amount: newRentPlan.base_amount,
            is_optional: false,
            applies_to: "all",
          },
          { where: { id: allocation.rent_fee_id }, transaction },
        );
      }
      allocation.fee_structure_id = fee_structure_id;
    }

    if (
      mess_fee_structure_id &&
      mess_fee_structure_id !== allocation.mess_fee_structure_id
    ) {
      const newMessPlan = await HostelMessFeeStructure.findByPk(
        mess_fee_structure_id,
      );
      if (newMessPlan && allocation.mess_fee_id) {
        await FeeStructure.update(
          {
            amount: newMessPlan.amount,
            is_optional: false,
            applies_to: "all",
          },
          { where: { id: allocation.mess_fee_id }, transaction },
        );
      }
      allocation.mess_fee_structure_id = mess_fee_structure_id;
    }

    allocation.bed_id = bed_id || allocation.bed_id;
    await allocation.save({ transaction });

    await transaction.commit();

    const updated = await HostelAllocation.findByPk(id, {
      include: [
        { model: User, as: "student" },
        { model: HostelRoom, as: "room" },
        { model: HostelBed, as: "bed" },
        { model: HostelFeeStructure, as: "fee_structure" },
        { model: HostelMessFeeStructure, as: "mess_fee_structure" },
      ],
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    logger.error("Error updating allocation:", error);
    res.status(500).json({ error: "Failed to update allocation" });
  }
};

// @desc    Delete student allocation
// @route   DELETE /api/hostel/allocations/:id
// @access  hostel:delete
exports.deleteAllocation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const allocation = await HostelAllocation.findByPk(id, {
      include: [{ model: HostelRoom, as: "room" }],
    });

    if (!allocation) {
      return res.status(404).json({ error: "Allocation not found" });
    }

    // 1. Restore Room Occupancy
    if (allocation.room && allocation.status === "active") {
      await allocation.room.update(
        {
          current_occupancy: Math.max(0, allocation.room.current_occupancy - 1),
          status: "occupied",
        },
        { transaction },
      );
    }

    // 2. Handle Linked Fees
    if (allocation.rent_fee_id) {
      await FeeStructure.update(
        { is_active: false },
        { where: { id: allocation.rent_fee_id }, transaction },
      );
    }
    if (allocation.mess_fee_id) {
      await FeeStructure.update(
        { is_active: false },
        { where: { id: allocation.mess_fee_id }, transaction },
      );
    }

    // 3. Sync is_hosteller flag on student
    if (allocation.status === "active") {
      await User.update(
        { is_hosteller: false },
        { where: { id: allocation.student_id }, transaction },
      );
    }

    await allocation.destroy({ transaction });

    await transaction.commit();
    res.json({ success: true, message: "Allocation deleted successfully" });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    logger.error("Error deleting allocation:", error);
    res.status(500).json({ error: "Failed to delete allocation" });
  }
};

// ============================================
// FEE MANAGEMENT
// ============================================

// @desc    Get fee structures
// @route   GET /api/hostel/fee-structures
// @access  hostel:read
exports.getFeeStructures = async (req, res) => {
  try {
    const { is_active } = req.query;
    const where = {};

    if (is_active !== undefined) where.is_active = is_active === "true";

    const feeStructures = await HostelFeeStructure.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: feeStructures });
  } catch (error) {
    logger.error("Error fetching fee structures:", error);
    res.status(500).json({ error: "Failed to fetch fee structures" });
  }
};

// @desc    Create fee structure
// @route   POST /api/hostel/fee-structures
// @access  hostel:write
exports.createFeeStructure = async (req, res) => {
  try {
    const feeStructure = await HostelFeeStructure.create(req.body);
    res.status(201).json({ success: true, data: feeStructure });
  } catch (error) {
    logger.error("Error creating fee structure:", error);
    res.status(500).json({ error: "Failed to create fee structure" });
  }
};

// @desc    Update fee structure
// @route   PUT /api/hostel/fee-structures/:id
// @access  hostel:write
exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const feeStructure = await HostelFeeStructure.findByPk(id);
    if (!feeStructure) {
      return res.status(404).json({ error: "Rent plan not found" });
    }
    await feeStructure.update(req.body);
    res.json({ success: true, data: feeStructure });
  } catch (error) {
    logger.error("Error updating fee structure:", error);
    res.status(500).json({ error: "Failed to update rent plan" });
  }
};

// @desc    Delete fee structure
// @route   DELETE /api/hostel/fee-structures/:id
// @access  hostel:write
exports.deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const feeStructure = await HostelFeeStructure.findByPk(id);
    if (!feeStructure) {
      return res.status(404).json({ error: "Rent plan not found" });
    }
    // Check if in use
    const inUse = await HostelAllocation.findOne({
      where: { fee_structure_id: id, status: "active" },
    });
    if (inUse) {
      return res.status(400).json({
        error:
          "Cannot delete plan: It is currently assigned to active students",
      });
    }
    await feeStructure.destroy();
    res.json({ success: true, message: "Rent plan deleted successfully" });
  } catch (error) {
    logger.error("Error deleting fee structure:", error);
    res.status(500).json({ error: "Failed to delete rent plan" });
  }
};

// @desc    Get mess fee structures
// @route   GET /api/hostel/mess-fee-structures
// @access  hostel:read
exports.getMessFeeStructures = async (req, res) => {
  try {
    const { is_active } = req.query;
    const where = {};

    if (is_active !== undefined) where.is_active = is_active === "true";

    const messFeeStructures = await HostelMessFeeStructure.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: messFeeStructures });
  } catch (error) {
    logger.error("Error fetching mess fee structures:", error);
    res.status(500).json({ error: "Failed to fetch mess fee structures" });
  }
};

// @desc    Create mess fee structure
// @route   POST /api/hostel/mess-fee-structures
// @access  hostel:write
exports.createMessFeeStructure = async (req, res) => {
  try {
    const messFeeStructure = await HostelMessFeeStructure.create(req.body);
    res.status(201).json({ success: true, data: messFeeStructure });
  } catch (error) {
    logger.error("Error creating mess fee structure:", error);
    res.status(500).json({ error: "Failed to create mess fee structure" });
  }
};

// @desc    Update mess fee structure
// @route   PUT /api/hostel/mess-fee-structures/:id
// @access  hostel:write
exports.updateMessFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const messFeeStructure = await HostelMessFeeStructure.findByPk(id);
    if (!messFeeStructure) {
      return res.status(404).json({ error: "Mess plan not found" });
    }
    await messFeeStructure.update(req.body);
    res.json({ success: true, data: messFeeStructure });
  } catch (error) {
    logger.error("Error updating mess fee structure:", error);
    res.status(500).json({ error: "Failed to update mess plan" });
  }
};

// @desc    Delete mess fee structure
// @route   DELETE /api/hostel/mess-fee-structures/:id
// @access  hostel:write
exports.deleteMessFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const messFeeStructure = await HostelMessFeeStructure.findByPk(id);
    if (!messFeeStructure) {
      return res.status(404).json({ error: "Mess plan not found" });
    }
    // Check if in use
    const inUse = await HostelAllocation.findOne({
      where: { mess_fee_structure_id: id, status: "active" },
    });
    if (inUse) {
      return res.status(400).json({
        error:
          "Cannot delete plan: It is currently assigned to active students",
      });
    }
    await messFeeStructure.destroy();
    res.json({ success: true, message: "Mess plan deleted successfully" });
  } catch (error) {
    logger.error("Error deleting mess fee structure:", error);
    res.status(500).json({ error: "Failed to delete mess plan" });
  }
};

// ============================================
// COMPLAINTS
// ============================================

// @desc    Get complaints
// @route   GET /api/hostel/complaints
// @access  hostel:read
exports.getComplaints = async (req, res) => {
  try {
    const { status, priority, month, year } = req.query;
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Date Filtering
    if (year) {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;

      if (month) {
        const monthNum = parseInt(month);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0); // Last day of month

        where.created_at = {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        };
      } else {
        where.created_at = {
          [Op.between]: [yearStart, yearEnd],
        };
      }
    }

    const complaints = await HostelComplaint.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id"],
        },
        {
          model: HostelRoom,
          as: "room",
        },
        {
          model: User,
          as: "assignedTo",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [
        ["priority", "DESC"],
        ["created_at", "DESC"],
      ],
    });
    res.json({ success: true, data: complaints });
  } catch (error) {
    logger.error("Error fetching complaints:", error);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
};

// @desc    Create complaint
// @route   POST /api/hostel/complaints
// @access  hostel:write
exports.createComplaint = async (req, res) => {
  try {
    // 1. Get student ID from authenticated user
    const student_id = req.user.userId;

    // 2. Find student's current room allocation
    const allocation = await HostelAllocation.findOne({
      where: {
        student_id,
        status: "active",
      },
    });

    const complaintData = {
      ...req.body,
      student_id,
      room_id: allocation ? allocation.room_id : null, // Optional: Link to room if allocated
    };

    const complaint = await HostelComplaint.create(complaintData);
    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    logger.error("Error creating complaint:", error);
    res.status(500).json({ error: "Failed to create complaint" });
  }
};

// @desc    Update complaint
// @route   PUT /api/hostel/complaints/:id
// @access  hostel:write
exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await HostelComplaint.findByPk(id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // If status is being changed to resolved, set resolved_at
    if (req.body.status === "resolved" && complaint.status !== "resolved") {
      req.body.resolved_at = new Date();
    }

    await complaint.update(req.body);
    res.json({ success: true, data: complaint });
  } catch (error) {
    logger.error("Error updating complaint:", error);
    res.status(500).json({ error: "Failed to update complaint" });
  }
};

// ============================================
// ATTENDANCE
// ============================================

// @desc    Get attendance
// @route   GET /api/hostel/attendance
// @access  hostel:read
exports.getAttendance = async (req, res) => {
  try {
    const { date, student_id } = req.query;
    const where = {};

    if (date) where.date = date;
    if (student_id) where.student_id = student_id;

    const attendance = await HostelAttendance.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id"],
        },
      ],
      order: [["date", "DESC"]],
    });
    res.json({ success: true, data: attendance });
  } catch (error) {
    logger.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

// @desc    Mark attendance
// @route   POST /api/hostel/attendance
// @access  hostel:write
exports.markAttendance = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { attendance_records } = req.body;

    if (!attendance_records || !Array.isArray(attendance_records)) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid attendance data format" });
    }

    if (attendance_records.length === 0) {
      await t.commit();
      return res.json({ success: true, message: "No records to save" });
    }

    // Prepare data for bulk create
    const recordsToCreate = attendance_records.map((record) => ({
      student_id: record.student_id,
      date: record.date,
      night_roll_call: record.is_night_roll_call,
      is_present: record.status === "present",
      remarks:
        record.status === "leave"
          ? "On Leave"
          : record.status === "absent"
            ? "Absent"
            : null,
    }));

    // Scope for cleanup: All students in this batch, on this date, for this shift
    const studentIds = recordsToCreate.map((r) => r.student_id);
    const date = recordsToCreate[0].date;
    const night_roll_call = recordsToCreate[0].night_roll_call;

    // Delete existing records to allow "overwrite" behavior
    await HostelAttendance.destroy({
      where: {
        student_id: studentIds,
        date: date,
        night_roll_call: night_roll_call,
      },
      transaction: t,
    });

    // Create new records
    const createdRecords = await HostelAttendance.bulkCreate(recordsToCreate, {
      transaction: t,
    });

    await t.commit();
    res.status(201).json({ success: true, data: createdRecords });
  } catch (error) {
    await t.rollback();
    logger.error("Error marking attendance:", error);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};

// ============================================
// GATE PASS
// ============================================

// @desc    Get gate passes
// @route   GET /api/hostel/gate-passes
// @access  hostel:read
exports.getGatePasses = async (req, res) => {
  try {
    const { status, student_id } = req.query;
    const where = {};

    if (status) where.status = status;
    if (student_id) where.student_id = student_id;

    const gatePasses = await HostelGatePass.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id"],
        },
      ],
      order: [["out_time", "DESC"]],
    });
    res.json({ success: true, data: gatePasses });
  } catch (error) {
    logger.error("Error fetching gate passes:", error);
    res.status(500).json({ error: "Failed to fetch gate passes" });
  }
};

// @desc    Create gate pass
// @route   POST /api/hostel/gate-passes
// @access  hostel:write
exports.createGatePass = async (req, res) => {
  try {
    const gatePass = await HostelGatePass.create(req.body);
    res.status(201).json({ success: true, data: gatePass });
  } catch (error) {
    logger.error("Error creating gate pass:", error);
    res.status(500).json({ error: "Failed to create gate pass" });
  }
};

// @desc    Mark gate pass return
// @route   PUT /api/hostel/gate-passes/:id/return
// @access  hostel:write
exports.markGatePassReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const gatePass = await HostelGatePass.findByPk(id);

    if (!gatePass) {
      return res.status(404).json({ error: "Gate pass not found" });
    }

    const returnTime = new Date();
    const isLate =
      gatePass.expected_return_time &&
      returnTime > new Date(gatePass.expected_return_time);

    await gatePass.update({
      actual_return_time: returnTime,
      status: isLate ? "late" : "returned",
    });

    res.json({ success: true, data: gatePass });
  } catch (error) {
    logger.error("Error marking gate pass return:", error);
    res.status(500).json({ error: "Failed to mark return" });
  }
};

// ============================================
// REPORTS
// ============================================

// @desc    Get occupancy report
// @route   GET /api/hostel/reports/occupancy
// @access  hostel:read
exports.getOccupancyReport = async (req, res) => {
  try {
    const buildings = await HostelBuilding.findAll({
      include: [
        {
          model: HostelRoom,
          as: "rooms",
        },
      ],
    });

    const report = buildings.map((building) => {
      const totalRooms = building.rooms.length;
      const occupiedRooms = building.rooms.filter(
        (r) => r.status === "occupied" || r.status === "full",
      ).length;
      const totalCapacity = building.rooms.reduce(
        (sum, r) => sum + r.capacity,
        0,
      );
      const currentOccupancy = building.rooms.reduce(
        (sum, r) => sum + r.current_occupancy,
        0,
      );

      return {
        building_id: building.id,
        building_name: building.name,
        building_type: building.type,
        total_rooms: totalRooms,
        occupied_rooms: occupiedRooms,
        available_rooms: totalRooms - occupiedRooms,
        total_capacity: totalCapacity,
        current_occupancy: currentOccupancy,
        vacancy: totalCapacity - currentOccupancy,
        occupancy_percentage:
          totalCapacity > 0
            ? ((currentOccupancy / totalCapacity) * 100).toFixed(2)
            : 0,
      };
    });

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error("Error generating occupancy report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/hostel/dashboard/stats
// @access  hostel:read
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalBuildings,
      totalRooms,
      totalCapacity,
      activeAllocations,
      pendingComplaints,
      todayAttendance,
    ] = await Promise.all([
      HostelBuilding.count({ where: { status: "active" } }),
      HostelRoom.count(),
      HostelRoom.sum("capacity"),
      HostelAllocation.count({ where: { status: "active" } }),
      HostelComplaint.count({ where: { status: ["pending", "in_progress"] } }),
      HostelAttendance.count({
        where: { date: new Date().toISOString().split("T")[0] },
      }),
    ]);

    const stats = {
      total_buildings: totalBuildings,
      total_rooms: totalRooms,
      total_capacity: totalCapacity || 0,
      current_occupancy: activeAllocations,
      vacancy: (totalCapacity || 0) - activeAllocations,
      occupancy_percentage:
        totalCapacity > 0
          ? ((activeAllocations / totalCapacity) * 100).toFixed(2)
          : 0,
      pending_complaints: pendingComplaints,
      today_attendance: todayAttendance,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

module.exports = exports;
