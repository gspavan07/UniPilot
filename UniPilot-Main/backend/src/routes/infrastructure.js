const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getAllBlocks,
  createBlock,
  getBlockDetails,
  addRoom,
  generateRooms,
  updateBlock,
  deleteBlock,
  updateRoom,
  deleteRoom,
  getAllRooms,
} = require("../controllers/infrastructureController");

// Base path: /api/infrastructure

router.get("/blocks", authenticate, getAllBlocks);
router.post("/blocks", authenticate, createBlock); // Add permission check middleware here later
router.get("/blocks/:id", authenticate, getBlockDetails);
router.post("/blocks/:id/rooms", authenticate, addRoom);
router.post("/blocks/:id/generate", authenticate, generateRooms);
router.put("/blocks/:id", authenticate, updateBlock);
router.delete("/blocks/:id", authenticate, deleteBlock);

// Room routes
router.get("/rooms", authenticate, getAllRooms);
router.put("/rooms/:id", authenticate, updateRoom);
router.delete("/rooms/:id", authenticate, deleteRoom);

module.exports = router;
