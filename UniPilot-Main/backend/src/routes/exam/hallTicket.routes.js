const express = require("express");
const router = express.Router();
const {
  getAllHallTickets,
  getHallTicketById,
  generateHallTickets,
  updateHallTicket,
  deleteHallTicket,
} = require("../../controllers/exam/hallTicketController");
const { auditMiddleware } = require("../../middleware/exam/auditMiddleware");
const { authenticate } = require("../../middleware/auth");

// Get all hall tickets (with filters)
router.get("/", authenticate, getAllHallTickets);

// Get hall ticket by ID
router.get("/:id", authenticate, getHallTicketById);

// Generate hall tickets for students
router.post(
  "/generate",
  authenticate,
  auditMiddleware("GENERATE", "HALL_TICKET"),
  generateHallTickets,
);

// Update a hall ticket
router.put(
  "/:id",
  authenticate,
  auditMiddleware("UPDATE", "HALL_TICKET"),
  updateHallTicket,
);

// Delete a hall ticket
router.delete(
  "/:id",
  authenticate,
  auditMiddleware("DELETE", "HALL_TICKET"),
  deleteHallTicket,
);

module.exports = router;
