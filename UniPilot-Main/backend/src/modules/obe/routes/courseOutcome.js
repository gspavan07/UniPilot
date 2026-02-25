import express from "express";
const router = express.Router();
import {
    getAllCourseOutcomes,
    getCourseOutcomeById,
    createCourseOutcome,
    bulkCreateCourseOutcomes,
    updateCourseOutcome,
    deleteCourseOutcome,
    deleteCourseOutcomesByCourse,
} from "../controllers/courseOutcomeController.js";
import { authenticate } from "../../../middleware/auth.js";

// Apply authentication to all routes
router.use(authenticate);

// @route   GET/POST /api/course-outcomes
router
    .route("/")
    .get(getAllCourseOutcomes)
    .post(createCourseOutcome);

// @route   POST /api/course-outcomes/bulk
router.post("/bulk", bulkCreateCourseOutcomes);

// @route   DELETE /api/course-outcomes/course/:course_id
router.delete("/course/:course_id", deleteCourseOutcomesByCourse);

// @route   GET/PUT/DELETE /api/course-outcomes/:id
router
    .route("/:id")
    .get(getCourseOutcomeById)
    .put(updateCourseOutcome)
    .delete(deleteCourseOutcome);

export default router;
