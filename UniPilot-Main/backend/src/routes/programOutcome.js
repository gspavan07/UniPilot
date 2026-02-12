const express = require("express");
const router = express.Router();
const {
    getAllProgramOutcomes,
    getProgramOutcomeById,
    createProgramOutcome,
    bulkCreateProgramOutcomes,
    updateProgramOutcome,
    deleteProgramOutcome,
    deleteProgramOutcomesByProgram,
} = require("../controllers/programOutcomeController");
const { authenticate } = require("../middleware/auth");

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

module.exports = router;
