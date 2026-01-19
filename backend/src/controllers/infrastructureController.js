const { Block, Room } = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

// @desc    Get all blocks
// @route   GET /api/infrastructure/blocks
// @access  Private
exports.getAllBlocks = async (req, res) => {
  try {
    const blocks = await Block.findAll({
      include: [
        {
          model: Room,
          as: "rooms",
          attributes: ["id"], // just to count
        },
      ],
      order: [["name", "ASC"]],
    });

    // Transform to add counts
    const data = blocks.map((block) => ({
      ...block.toJSON(),
      room_count: block.rooms.length,
      rooms: undefined, // remove generic list
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Error in getAllBlocks:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create a new block
// @route   POST /api/infrastructure/blocks
// @access  Private/Admin
exports.createBlock = async (req, res) => {
  try {
    const block = await Block.create(req.body);
    res.status(201).json({
      success: true,
      data: block,
    });
  } catch (error) {
    logger.error("Error in createBlock:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Block with this code already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get block details with rooms
// @route   GET /api/infrastructure/blocks/:id
// @access  Private
exports.getBlockDetails = async (req, res) => {
  try {
    const block = await Block.findByPk(req.params.id, {
      include: [
        {
          model: Room,
          as: "rooms",
        },
      ],
      order: [
        [{ model: Room, as: "rooms" }, "floor_number", "ASC"],
        [{ model: Room, as: "rooms" }, "room_number", "ASC"],
      ],
    });

    if (!block) {
      return res.status(404).json({
        success: false,
        error: "Block not found",
      });
    }

    res.status(200).json({
      success: true,
      data: block,
    });
  } catch (error) {
    logger.error("Error in getBlockDetails:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Add a room to a block
// @route   POST /api/infrastructure/blocks/:id/rooms
// @access  Private/Admin
exports.addRoom = async (req, res) => {
  try {
    const block = await Block.findByPk(req.params.id);
    if (!block) {
      return res.status(404).json({
        success: false,
        error: "Block not found",
      });
    }

    const room = await Room.create({
      ...req.body,
      block_id: block.id,
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    logger.error("Error in addRoom:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Room number already exists in this block",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update a block
// @route   PUT /api/infrastructure/blocks/:id
// @access  Private/Admin
exports.updateBlock = async (req, res) => {
  try {
    let block = await Block.findByPk(req.params.id);
    if (!block) {
      return res.status(404).json({ success: false, error: "Block not found" });
    }

    block = await block.update(req.body);
    res.status(200).json({ success: true, data: block });
  } catch (error) {
    logger.error("Error in updateBlock:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Delete a block
// @route   DELETE /api/infrastructure/blocks/:id
// @access  Private/Admin
exports.deleteBlock = async (req, res) => {
  try {
    const block = await Block.findByPk(req.params.id);
    if (!block) {
      return res.status(404).json({ success: false, error: "Block not found" });
    }

    await block.destroy();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error("Error in deleteBlock:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Update a room
// @route   PUT /api/infrastructure/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    room = await room.update(req.body);
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    logger.error("Error in updateRoom:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Delete a room
// @route   DELETE /api/infrastructure/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    await room.destroy();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error("Error in deleteRoom:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Bulk Generate Rooms (Auto-Generate)
// @route   POST /api/infrastructure/blocks/:id/generate
// @access  Private/Admin
exports.generateRooms = async (req, res) => {
  try {
    const {
      floors_start,
      floors_end,
      rooms_per_floor,
      naming_pattern,
      capacity,
    } = req.body;
    // naming_pattern ex: "{BLOCK}-{FLOOR}{NUM}" -> "A-101"

    const block = await Block.findByPk(req.params.id);
    if (!block) return res.status(404).json({ error: "Block not found" });

    const roomsToCreate = [];

    for (let floor = floors_start; floor <= floors_end; floor++) {
      for (let i = 1; i <= rooms_per_floor; i++) {
        // Simple default naming logic if no pattern provided
        // e.g. Floor 1, Room 1 -> "101"
        // Floor 2, Room 12 -> "212"
        const roomNumSuffix = i.toString().padStart(2, "0");
        const roomNumber = `${block.code}-${floor}${roomNumSuffix}`;

        roomsToCreate.push({
          block_id: block.id,
          room_number: roomNumber,
          floor_number: floor,
          name: `Classroom ${roomNumber}`,
          type: "classroom",
          capacity: capacity || 60,
          exam_capacity: Math.floor((capacity || 60) / 2),
          facilities: ["Whiteboard", "Benches"],
        });
      }
    }

    // Bulk create, ignoring duplicates
    await Room.bulkCreate(roomsToCreate, { ignoreDuplicates: true });

    res.status(201).json({
      success: true,
      message: `Generated ${roomsToCreate.length} rooms successfully`,
      count: roomsToCreate.length,
    });
  } catch (error) {
    logger.error("Error in generateRooms:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
