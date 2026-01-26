const logger = require("../utils/logger");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");
const {
  Route,
  TransportStop,
  Vehicle,
  TransportDriver,
  VehicleRouteAssignment,
  StudentRouteAllocation,
  SpecialTrip,
  TripLog,
  User,
  FeeStructure,
  FeeCategory,
  Department,
  Program,
} = require("../models");

/**
 * Transport Management Controller
 * Handles all transport-related operations
 */

// ============================================
// ROUTE MANAGEMENT
// ============================================

// @desc    Get all routes
// @route   GET /api/transport/routes
// @access  transport:read
exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({
      include: [
        {
          model: TransportStop,
          as: "stops",
          where: { is_active: true },
          required: false,
          order: [["stop_sequence", "ASC"]],
        },
      ],
      order: [["route_code", "ASC"]],
    });
    res.json({ success: true, data: routes });
  } catch (error) {
    logger.error("Error fetching routes:", error);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
};

// @desc    Create new route
// @route   POST /api/transport/routes
// @access  transport:write
exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    logger.error("Error creating route:", error);
    res.status(500).json({ error: "Failed to create route" });
  }
};

// @desc    Update route
// @route   PUT /api/transport/routes/:id
// @access  transport:write
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findByPk(id);
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    await route.update(req.body);
    res.json({ success: true, data: route });
  } catch (error) {
    logger.error("Error updating route:", error);
    res.status(500).json({ error: "Failed to update route" });
  }
};

// @desc    Delete route
// @route   DELETE /api/transport/routes/:id
// @access  transport:admin
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findByPk(id);
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    await route.update({ is_active: false });
    res.json({ success: true, message: "Route deactivated" });
  } catch (error) {
    logger.error("Error deleting route:", error);
    res.status(500).json({ error: "Failed to delete route" });
  }
};

// ============================================
// STOP MANAGEMENT
// ============================================

// @desc    Add stop to route
// @route   POST /api/transport/stops
// @access  transport:write
exports.createStop = async (req, res) => {
  try {
    const stop = await TransportStop.create(req.body);
    res.status(201).json({ success: true, data: stop });
  } catch (error) {
    logger.error("Error creating stop:", error);
    res.status(500).json({ error: "Failed to create stop" });
  }
};

// @desc    Update stop
// @route   PUT /api/transport/stops/:id
// @access  transport:write
exports.updateStop = async (req, res) => {
  try {
    const { id } = req.params;
    const stop = await TransportStop.findByPk(id);
    if (!stop) {
      return res.status(404).json({ error: "Stop not found" });
    }
    await stop.update(req.body);
    res.json({ success: true, data: stop });
  } catch (error) {
    logger.error("Error updating stop:", error);
    res.status(500).json({ error: "Failed to update stop" });
  }
};

// @desc    Delete stop
// @route   DELETE /api/transport/stops/:id
// @access  transport:admin
exports.deleteStop = async (req, res) => {
  try {
    const { id } = req.params;
    const stop = await TransportStop.findByPk(id);
    if (!stop) {
      return res.status(404).json({ error: "Stop not found" });
    }
    await stop.destroy();
    res.json({ success: true, message: "Stop deleted" });
  } catch (error) {
    logger.error("Error deleting stop:", error);
    res.status(500).json({ error: "Failed to delete stop" });
  }
};

// ============================================
// VEHICLE MANAGEMENT
// ============================================

// @desc    Get all vehicles
// @route   GET /api/transport/vehicles
// @access  transport:read
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      order: [["registration_number", "ASC"]],
    });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    logger.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
};

// @desc    Create vehicle
// @route   POST /api/transport/vehicles
// @access  transport:write
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    logger.error("Error creating vehicle:", error);
    res.status(500).json({ error: "Failed to create vehicle" });
  }
};

// @desc    Update vehicle
// @route   PUT /api/transport/vehicles/:id
// @access  transport:write
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    await vehicle.update(req.body);
    res.json({ success: true, data: vehicle });
  } catch (error) {
    logger.error("Error updating vehicle:", error);
    res.status(500).json({ error: "Failed to update vehicle" });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/transport/vehicles/:id
// @access  transport:admin
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    await vehicle.update({ is_active: false });
    res.json({ success: true, message: "Vehicle deactivated" });
  } catch (error) {
    logger.error("Error deleting vehicle:", error);
    res.status(500).json({ error: "Failed to delete vehicle" });
  }
};

// @desc    Get vehicles with expiring documents
// @route   GET /api/transport/vehicles/expiring
// @access  transport:read
exports.getExpiringVehicles = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const vehicles = await Vehicle.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          {
            insurance_expiry: {
              [Op.and]: [{ [Op.gte]: today }, { [Op.lte]: thirtyDaysLater }],
            },
          },
          {
            fitness_certificate_expiry: {
              [Op.and]: [{ [Op.gte]: today }, { [Op.lte]: thirtyDaysLater }],
            },
          },
        ],
      },
    });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    logger.error("Error fetching expiring vehicles:", error);
    res.status(500).json({ error: "Failed to fetch expiring vehicles" });
  }
};

// ============================================
// DRIVER MANAGEMENT
// ============================================

// @desc    Get all drivers
// @route   GET /api/transport/drivers
// @access  transport:read
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await TransportDriver.findAll({
      order: [["first_name", "ASC"]],
    });
    res.json({ success: true, data: drivers });
  } catch (error) {
    logger.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
};

// @desc    Create driver
// @route   POST /api/transport/drivers
// @access  transport:write
exports.createDriver = async (req, res) => {
  try {
    const driver = await TransportDriver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    logger.error("Error creating driver:", error);
    res.status(500).json({ error: "Failed to create driver" });
  }
};

// @desc    Update driver
// @route   PUT /api/transport/drivers/:id
// @access  transport:write
exports.updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await TransportDriver.findByPk(id);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    await driver.update(req.body);
    res.json({ success: true, data: driver });
  } catch (error) {
    logger.error("Error updating driver:", error);
    res.status(500).json({ error: "Failed to update driver" });
  }
};

// @desc    Delete driver
// @route   DELETE /api/transport/drivers/:id
// @access  transport:admin
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await TransportDriver.findByPk(id);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    await driver.update({ is_active: false });
    res.json({ success: true, message: "Driver deactivated" });
  } catch (error) {
    logger.error("Error deleting driver:", error);
    res.status(500).json({ error: "Failed to delete driver" });
  }
};

// @desc    Get drivers with expiring licenses
// @route   GET /api/transport/drivers/expiring-license
// @access  transport:read
exports.getExpiringDriverLicenses = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const drivers = await TransportDriver.findAll({
      where: {
        is_active: true,
        license_expiry: {
          [Op.and]: [{ [Op.gte]: today }, { [Op.lte]: thirtyDaysLater }],
        },
      },
    });
    res.json({ success: true, data: drivers });
  } catch (error) {
    logger.error("Error fetching expiring licenses:", error);
    res.status(500).json({ error: "Failed to fetch expiring licenses" });
  }
};

// ============================================
// VEHICLE-ROUTE ASSIGNMENTS
// ============================================

// @desc    Get all assignments
// @route   GET /api/transport/assignments
// @access  transport:read
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await VehicleRouteAssignment.findAll({
      where: { is_active: true },
      include: [
        { model: Vehicle, as: "vehicle" },
        { model: Route, as: "route" },
        { model: TransportDriver, as: "driver" },
        { model: TransportDriver, as: "conductor" },
      ],
    });
    res.json({ success: true, data: assignments });
  } catch (error) {
    logger.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
};

// @desc    Create assignment
// @route   POST /api/transport/assignments
// @access  transport:write
exports.createAssignment = async (req, res) => {
  try {
    const assignment = await VehicleRouteAssignment.create(req.body);
    const fullAssignment = await VehicleRouteAssignment.findByPk(
      assignment.id,
      {
        include: [
          { model: Vehicle, as: "vehicle" },
          { model: Route, as: "route" },
          { model: TransportDriver, as: "driver" },
          { model: TransportDriver, as: "conductor" },
        ],
      },
    );
    res.status(201).json({ success: true, data: fullAssignment });
  } catch (error) {
    logger.error("Error creating assignment:", error);
    res.status(500).json({ error: "Failed to create assignment" });
  }
};

// @desc    Update assignment
// @route   PUT /api/transport/assignments/:id
// @access  transport:write
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await VehicleRouteAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    await assignment.update(req.body);
    const updated = await VehicleRouteAssignment.findByPk(id, {
      include: [
        { model: Vehicle, as: "vehicle" },
        { model: Route, as: "route" },
        { model: TransportDriver, as: "driver" },
        { model: TransportDriver, as: "conductor" },
      ],
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error("Error updating assignment:", error);
    res.status(500).json({ error: "Failed to update assignment" });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/transport/assignments/:id
// @access  transport:admin
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await VehicleRouteAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    await assignment.update({ is_active: false, assigned_to: new Date() });
    res.json({ success: true, message: "Assignment ended" });
  } catch (error) {
    logger.error("Error deleting assignment:", error);
    res.status(500).json({ error: "Failed to delete assignment" });
  }
};

// ============================================
// STUDENT ROUTE ALLOCATIONS
// ============================================

// @desc    Get all allocations
// @route   GET /api/transport/allocations
// @access  transport:read
exports.getAllocations = async (req, res) => {
  try {
    const { route_id, status, academic_year } = req.query;
    const where = {};
    if (route_id) where.route_id = route_id;
    if (status) where.status = status;
    if (academic_year) where.academic_year = academic_year;

    const allocations = await StudentRouteAllocation.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "student_id", "phone"],
          include: [
            { model: Department, as: "department", attributes: ["name"] },
            { model: Program, as: "program", attributes: ["name"] },
          ],
        },
        {
          model: Route,
          as: "route",
          attributes: ["id", "name", "route_code"],
        },
        {
          model: TransportStop,
          as: "stop",
          attributes: ["id", "stop_name", "zone_fee"],
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

// @desc    Create student allocation with automatic fee integration
// @route   POST /api/transport/allocations
// @access  transport:write
exports.createAllocation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { student_id, route_id, stop_id } = req.body;

    // Get stop to retrieve zone fee
    const stop = await TransportStop.findByPk(stop_id);
    if (!stop) {
      await transaction.rollback();
      return res.status(404).json({ error: "Stop not found" });
    }

    // Get student info
    const student = await User.findByPk(student_id);
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ error: "Student not found" });
    }

    // Use student's current semester
    const semester = student.current_semester || 1;

    // Get or create Transport Fee category
    let [transportCategory] = await FeeCategory.findOrCreate({
      where: { name: "Transport Fee" },
      defaults: {
        name: "Transport Fee",
        description: "Transport facility fees",
      },
      transaction,
    });

    // Create fee structure entry for transport
    const feeStructure = await FeeStructure.create(
      {
        category_id: transportCategory.id,
        program_id: student.program_id,
        batch_year: student.batch_year,
        semester: semester,
        amount: stop.zone_fee,
        is_optional: true,
        applies_to: "day_scholars",
        student_id: student_id,
        is_active: true,
      },
      { transaction },
    );

    // Create allocation (no academic_year needed)
    const allocation = await StudentRouteAllocation.create(
      {
        student_id,
        route_id,
        stop_id,
        semester,
        fee_structure_id: feeStructure.id,
        status: "active",
      },
      { transaction },
    );

    // Update student's requires_transport flag
    await student.update({ requires_transport: true }, { transaction });

    await transaction.commit();

    // Fetch full allocation data
    const fullAllocation = await StudentRouteAllocation.findByPk(
      allocation.id,
      {
        include: [
          {
            model: User,
            as: "student",
            attributes: ["id", "first_name", "last_name", "student_id"],
          },
          { model: Route, as: "route" },
          { model: TransportStop, as: "stop" },
        ],
      },
    );

    res.status(201).json({ success: true, data: fullAllocation });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error creating allocation:", error);
    res.status(500).json({ error: "Failed to create allocation" });
  }
};

// @desc    Update allocation
// @route   PUT /api/transport/allocations/:id
// @access  transport:write
exports.updateAllocation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { stop_id } = req.body;

    const allocation = await StudentRouteAllocation.findByPk(id, {
      transaction,
    });
    if (!allocation) {
      await transaction.rollback();
      return res.status(404).json({ error: "Allocation not found" });
    }

    // If stop changed, update fee amount
    if (stop_id && stop_id !== allocation.stop_id) {
      const newStop = await TransportStop.findByPk(stop_id, { transaction });
      if (newStop && allocation.fee_structure_id) {
        await FeeStructure.update(
          { amount: newStop.zone_fee },
          { where: { id: allocation.fee_structure_id }, transaction },
        );
      }
    }

    await allocation.update(req.body, { transaction });
    await transaction.commit();

    const updated = await StudentRouteAllocation.findByPk(id, {
      include: [
        { model: User, as: "student" },
        { model: Route, as: "route" },
        { model: TransportStop, as: "stop" },
      ],
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error updating allocation:", error);
    res.status(500).json({ error: "Failed to update allocation" });
  }
};

// @desc    Cancel/Deactivate allocation
// @route   DELETE /api/transport/allocations/:id
// @access  transport:write
exports.deleteAllocation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { remarks } = req.body || {};

    const allocation = await StudentRouteAllocation.findByPk(id, {
      transaction,
    });
    if (!allocation) {
      await transaction.rollback();
      return res.status(404).json({ error: "Allocation not found" });
    }

    // Inactivate the linked fee structure for the current/future periods
    if (allocation.fee_structure_id) {
      await FeeStructure.update(
        { is_active: false },
        { where: { id: allocation.fee_structure_id }, transaction },
      );
    }

    // Update status to cancelled
    await allocation.update(
      {
        status: "cancelled",
        remarks: remarks || allocation.remarks,
      },
      { transaction },
    );

    // Check if student has other active allocations
    const activeAllocCount = await StudentRouteAllocation.count({
      where: {
        student_id: allocation.student_id,
        status: "active",
      },
      transaction,
    });

    // If no other active allocations, update student's requires_transport flag
    if (activeAllocCount === 0) {
      await User.update(
        { requires_transport: false },
        { where: { id: allocation.student_id }, transaction },
      );
    }

    await transaction.commit();
    res.json({ success: true, message: "Allocation cancelled successfully" });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error cancelling allocation:", error);
    res.status(500).json({ error: "Failed to cancel allocation" });
  }
};

// @desc    Sync fees for all active transport students for a specific semester
// @route   POST /api/transport/sync-fees
// @access  transport:admin
exports.syncSemesterFees = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { batch_year, semester } = req.body;

    if (!batch_year || !semester) {
      return res
        .status(400)
        .json({ error: "Batch year and semester are required" });
    }

    // 1. Get all active allocations for the target batch
    const activeAllocations = await StudentRouteAllocation.findAll({
      where: { status: "active" },
      include: [
        { model: TransportStop, as: "stop" },
        {
          model: User,
          as: "student",
          where: { batch_year }, // Filter by target batch
        },
      ],
      transaction,
    });

    // 2. Get or create Transport Fee category
    let [transportCategory] = await FeeCategory.findOrCreate({
      where: { name: "Transport Fee" },
      defaults: {
        name: "Transport Fee",
        description: "Transport facility fees",
      },
      transaction,
    });

    let createdCount = 0;
    let updatedCount = 0;

    for (const alloc of activeAllocations) {
      // Check if fee structure already exists for this student, category, year, and semester
      const existingFee = await FeeStructure.findOne({
        where: {
          category_id: transportCategory.id,
          student_id: alloc.student_id,
          batch_year: batch_year,
          semester: semester,
        },
        transaction,
      });

      if (existingFee) {
        // Update price to current stop price
        if (
          parseFloat(existingFee.amount) !== parseFloat(alloc.stop.zone_fee)
        ) {
          await existingFee.update(
            {
              amount: alloc.stop.zone_fee,
              is_active: true,
            },
            { transaction },
          );
          updatedCount++;
        }
      } else {
        // Create new fee entry
        const newFee = await FeeStructure.create(
          {
            category_id: transportCategory.id,
            program_id: alloc.student.program_id,
            batch_year: batch_year,
            semester: semester,
            amount: alloc.stop.zone_fee,
            is_optional: true,
            applies_to: "day_scholars",
            student_id: alloc.student_id,
            is_active: true,
          },
          { transaction },
        );

        // Update allocation with the latest fee structure if it matches the target semester
        if (parseInt(alloc.semester) === parseInt(semester)) {
          await alloc.update({ fee_structure_id: newFee.id }, { transaction });
        }
        createdCount++;
      }
    }

    await transaction.commit();
    res.json({
      success: true,
      message: `Sync complete. ${createdCount} fees created, ${updatedCount} updated.`,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error syncing transport fees:", error);
    res.status(500).json({ error: "Sync failed" });
  }
};

// ============================================
// SPECIAL TRIPS
// ============================================

// @desc    Get all special trips
// @route   GET /api/transport/special-trips
// @access  transport:read
exports.getSpecialTrips = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const trips = await SpecialTrip.findAll({
      where,
      include: [
        { model: Vehicle, as: "vehicle" },
        { model: TransportDriver, as: "driver" },
        {
          model: User,
          as: "requester",
          attributes: ["id", "first_name", "last_name"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["trip_date", "DESC"]],
    });
    res.json({ success: true, data: trips });
  } catch (error) {
    logger.error("Error fetching special trips:", error);
    res.status(500).json({ error: "Failed to fetch special trips" });
  }
};

// @desc    Create special trip
// @route   POST /api/transport/special-trips
// @access  transport:write
exports.createSpecialTrip = async (req, res) => {
  try {
    const trip = await SpecialTrip.create(req.body);
    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    logger.error("Error creating special trip:", error);
    res.status(500).json({ error: "Failed to create special trip" });
  }
};

// @desc    Update special trip
// @route   PUT /api/transport/special-trips/:id
// @access  transport:write
exports.updateSpecialTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await SpecialTrip.findByPk(id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    await trip.update(req.body);
    res.json({ success: true, data: trip });
  } catch (error) {
    logger.error("Error updating special trip:", error);
    res.status(500).json({ error: "Failed to update special trip" });
  }
};

// @desc    Approve special trip
// @route   PUT /api/transport/special-trips/:id/approve
// @access  transport:admin
exports.approveSpecialTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const trip = await SpecialTrip.findByPk(id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    await trip.update({
      status: "approved",
      approved_by: userId,
    });

    res.json({ success: true, data: trip });
  } catch (error) {
    logger.error("Error approving special trip:", error);
    res.status(500).json({ error: "Failed to approve special trip" });
  }
};

// @desc    Delete special trip
// @route   DELETE /api/transport/special-trips/:id
// @access  transport:admin
exports.deleteSpecialTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await SpecialTrip.findByPk(id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    await trip.update({ status: "cancelled" });
    res.json({ success: true, message: "Trip cancelled" });
  } catch (error) {
    logger.error("Error deleting special trip:", error);
    res.status(500).json({ error: "Failed to delete special trip" });
  }
};

// ============================================
// TRIP LOGS
// ============================================

// @desc    Get trip logs
// @route   GET /api/transport/trip-logs
// @access  transport:read
exports.getTripLogs = async (req, res) => {
  try {
    const { start_date, end_date, vehicle_id, route_id } = req.query;
    const where = {};

    if (start_date && end_date) {
      where.trip_date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.trip_date = { [Op.gte]: start_date };
    }
    if (vehicle_id) where.vehicle_id = vehicle_id;
    if (route_id) where.route_id = route_id;

    const logs = await TripLog.findAll({
      where,
      include: [
        { model: Vehicle, as: "vehicle" },
        { model: Route, as: "route" },
        { model: TransportDriver, as: "driver" },
      ],
      order: [
        ["trip_date", "DESC"],
        ["start_time", "DESC"],
      ],
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    logger.error("Error fetching trip logs:", error);
    res.status(500).json({ error: "Failed to fetch trip logs" });
  }
};

// @desc    Create trip log
// @route   POST /api/transport/trip-logs
// @access  transport:write
exports.createTripLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logData = { ...req.body, logged_by: userId };

    // Auto-calculate distance if mileage provided
    if (logData.start_mileage && logData.end_mileage) {
      logData.distance_covered = logData.end_mileage - logData.start_mileage;
    }

    const log = await TripLog.create(logData);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    logger.error("Error creating trip log:", error);
    res.status(500).json({ error: "Failed to create trip log" });
  }
};

// @desc    Update trip log
// @route   PUT /api/transport/trip-logs/:id
// @access  transport:write
exports.updateTripLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await TripLog.findByPk(id);
    if (!log) {
      return res.status(404).json({ error: "Trip log not found" });
    }

    const updates = { ...req.body };
    // Auto-calculate distance if mileage updated
    if (updates.start_mileage && updates.end_mileage) {
      updates.distance_covered = updates.end_mileage - updates.start_mileage;
    }

    await log.update(updates);
    res.json({ success: true, data: log });
  } catch (error) {
    logger.error("Error updating trip log:", error);
    res.status(500).json({ error: "Failed to update trip log" });
  }
};

// ============================================
// ANALYTICS & REPORTS
// ============================================

// @desc    Get route utilization analytics
// @route   GET /api/transport/analytics/route-utilization
// @access  transport:read
exports.getRouteUtilization = async (req, res) => {
  try {
    const routes = await Route.findAll({
      attributes: [
        "id",
        "name",
        "route_code",
        [
          sequelize.fn("COUNT", sequelize.col("student_allocations.id")),
          "student_count",
        ],
      ],
      include: [
        {
          model: StudentRouteAllocation,
          as: "student_allocations",
          attributes: [],
          where: { status: "active" },
          required: false,
        },
      ],
      where: { is_active: true },
      group: ["Route.id"],
      raw: true,
    });

    res.json({ success: true, data: routes });
  } catch (error) {
    logger.error("Error fetching route utilization:", error);
    res.status(500).json({ error: "Failed to fetch route utilization" });
  }
};

// @desc   Get zone-wise revenue
// @route   GET /api/transport/analytics/zone-revenue
// @access  transport:read
exports.getZoneRevenue = async (req, res) => {
  try {
    const zoneRevenue = await TransportStop.findAll({
      attributes: [
        "id",
        "stop_name",
        "zone_fee",
        [
          sequelize.fn("COUNT", sequelize.col("allocations.id")),
          "allocation_count",
        ],
        [
          sequelize.literal("zone_fee * COUNT(allocations.id)"),
          "total_revenue",
        ],
      ],
      include: [
        {
          model: StudentRouteAllocation,
          as: "allocations",
          attributes: [],
          where: { status: "active" },
          required: false,
        },
      ],
      where: { is_active: true },
      group: ["TransportStop.id"],
      raw: true,
    });

    res.json({ success: true, data: zoneRevenue });
  } catch (error) {
    logger.error("Error fetching zone revenue:", error);
    res.status(500).json({ error: "Failed to fetch zone revenue" });
  }
};

// @desc    Get trip statistics
// @route   GET /api/transport/analytics/trip-stats
// @access  transport:read
exports.getTripStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};
    if (start_date && end_date) {
      where.trip_date = { [Op.between]: [start_date, end_date] };
    }

    const stats = await TripLog.findAll({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("*")), "total_trips"],
        [
          sequelize.fn("SUM", sequelize.col("distance_covered")),
          "total_distance",
        ],
        [sequelize.fn("SUM", sequelize.col("fuel_consumed")), "total_fuel"],
        [
          sequelize.fn("SUM", sequelize.col("students_transported")),
          "total_students",
        ],
      ],
      where,
      raw: true,
    });

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    logger.error("Error fetching trip stats:", error);
    res.status(500).json({ error: "Failed to fetch trip stats" });
  }
};

// @desc    Get dashboard overview
// @route   GET /api/transport/analytics/dashboard
// @access  transport:read
exports.getDashboardOverview = async (req, res) => {
  try {
    const [
      totalRoutes,
      totalVehicles,
      totalDrivers,
      activeAllocations,
      pendingTrips,
    ] = await Promise.all([
      Route.count({ where: { is_active: true } }),
      Vehicle.count({ where: { is_active: true } }),
      TransportDriver.count({ where: { is_active: true } }),
      StudentRouteAllocation.count({ where: { status: "active" } }),
      SpecialTrip.count({ where: { status: "pending" } }),
    ]);

    res.json({
      success: true,
      data: {
        totalRoutes,
        totalVehicles,
        totalDrivers,
        activeAllocations,
        pendingTrips,
      },
    });
  } catch (error) {
    logger.error("Error fetching dashboard overview:", error);
    res.status(500).json({ error: "Failed to fetch dashboard overview" });
  }
};

module.exports = exports;
