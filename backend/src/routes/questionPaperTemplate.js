const express = require("express");
const {
    getTemplate,
    saveTemplate,
    deleteTemplate,
} = require("../controllers/questionPaperTemplateController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get(
    "/",
    checkPermission("exams:manage"), // Or stricter if needed
    getTemplate
);

router.post(
    "/",
    checkPermission("exams:manage"),
    saveTemplate
);

router.delete(
    "/:id",
    checkPermission("exams:manage"),
    deleteTemplate
);

module.exports = router;
