import express from "express";
const router = express.Router();
import {
    getAllProgramOutcomes,
    getProgramOutcomeById,
    createProgramOutcome,
    bulkCreateProgramOutcomes,
    updateProgramOutcome,
    deleteProgramOutcome,
    deleteProgramOutcomesByProgram,
} from "../controllers/programOutcomeController.js";
import { authenticate } from "../../../middleware/auth.js";

// Apply authentication to all routes
router.use(authenticate);

// @route   GET/POST /api/program-outcomes
router
    .route("/")
    .get(getAllProgramOutcomes)
    .post(createProgramOutcome);

// @route   POST /api/program-outcomes/bulk
router.post("/bulk", bulkCreateProgramOutcomes);

// @route   DELETE /api/program-outcomes/program/:program_id
router.delete("/program/:program_id", deleteProgramOutcomesByProgram);

// @route   GET/PUT/DELETE /api/program-outcomes/:id
router
    .route("/:id")
    .get(getProgramOutcomeById)
    .put(updateProgramOutcome)
    .delete(deleteProgramOutcome);

export default router;
