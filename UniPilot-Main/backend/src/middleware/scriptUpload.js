const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create script upload middleware for PDFs
const createScriptUploadDir = (examCycleId, studentId) => {
  const uploadPath = path.join(
    __dirname,
    "../../uploads/exam_scripts",
    examCycleId,
    studentId,
  );

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return uploadPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For bulk uploads, we'll handle directory creation per file
    const tempDir = path.join(__dirname, "../../uploads/exam_scripts/temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for answer scripts"), false);
  }
};

const scriptUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

module.exports = { scriptUpload, createScriptUploadDir };
