import express from "express";
const router = express.Router();
import {
    getCoPoMappings,
    getCoPoMatrix,
    createOrUpdateMapping,
    bulkUpdateMappings,
    deleteMapping,
    getMappingStats,
} from "../controllers/coPoMapController.js";
import { authenticate } from "../middleware/auth.js";

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

export default router;
