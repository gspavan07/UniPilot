import express from "express";
const router = express.Router();
import {
  getAllHallTickets,
  getHallTicketById,
  generateHallTickets,
  updateHallTicket,
  deleteHallTicket,
} from "../../controllers/exam/hallTicketController.js";
import { auditMiddleware } from "../../../../middleware/exam/auditMiddleware.js";
import { authenticate } from "../../../../middleware/auth.js";

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

export default router;
