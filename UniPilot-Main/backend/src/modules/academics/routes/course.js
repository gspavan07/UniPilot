import express from "express";
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
} from "../controllers/courseController.js";
import { authenticate, checkPermission } from "../../../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Student routes
router.get("/my-courses", getMyCourses);

router
  .route("/")
  .get(getAllCourses)
  .post(checkPermission("academics:manage"), createCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(checkPermission("academics:manage"), updateCourse)
  .delete(checkPermission("academics:manage"), deleteCourse);

export default router;
