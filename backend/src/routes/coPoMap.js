const express = require("express");
const router = express.Router();
const {
    getCoPoMappings,
    getCoPoMatrix,
    createOrUpdateMapping,
    bulkUpdateMappings,
    deleteMapping,
    getMappingStats,
} = require("../controllers/coPoMapController");
const { authenticate } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/co-po-maps
router.get("/", getCoPoMappings);

// @route   GET /api/co-po-maps/matrix (must be before /:id)
router.get("/matrix", getCoPoMatrix);

// @route   GET /api/co-po-maps/stats
router.get("/stats", getMappingStats);

// @route   POST /api/co-po-maps (create or update single mapping)
router.post("/", createOrUpdateMapping);

// @route   POST /api/co-po-maps/bulk (bulk update entire matrix)
router.post("/bulk", bulkUpdateMappings);

// @route   DELETE /api/co-po-maps/:id
router.delete("/:id", deleteMapping);

module.exports = router;
