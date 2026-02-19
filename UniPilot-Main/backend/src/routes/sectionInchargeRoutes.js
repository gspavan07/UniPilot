import express from "express";
const router = express.Router();
import sectionInchargeController from "../controllers/sectionInchargeController.js";
import { authenticate, authorize } from "../middleware/auth.js";

router.use(authenticate);

router
  .route("/")
  .post(
    authorize("admin", "super_admin", "hod"),
    sectionInchargeController.assignSectionIncharge,
  )
  .get(sectionInchargeController.getSectionIncharges);

router
  .route("/:id")
  .delete(
    authorize("admin", "super_admin", "hod"),
    sectionInchargeController.removeSectionIncharge,
  );

export default router;
