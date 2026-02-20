import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "uploads/profiles";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename if possible, but safe.
    // Actually, for bulk upload, we want to KEEP the name as it contains the ID.
    // But we should probably sanitize it or just use it directly if safe.
    // Let's use the original name but maybe replace spaces.
    // However, conflicts might occur if multiple uploads happen.
    // Since this is specific for "bulk upload where filename = ID", checking conflicts or overwriting is part of logic.
    // We'll trust Multer to save it. If we want exact ID matching, preserving original name is key.
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed"), false);
  }
};

const profileUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default profileUpload;
