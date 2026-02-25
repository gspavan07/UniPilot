import express from "express";
import {
  getAllPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";
import { authenticate, checkPermission } from "../../../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router
  .route("/")
  .get(getAllPrograms)
  .post(checkPermission("academics:manage"), createProgram);

router
  .route("/:id")
  .get(getProgram)
  .put(checkPermission("academics:manage"), updateProgram)
  .delete(checkPermission("academics:manage"), deleteProgram);

export default router;
