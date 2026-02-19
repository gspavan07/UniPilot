import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const studentDocsDir = "uploads/student_docs";
const resumesDir = "uploads/student_docs/resumes";

[studentDocsDir, resumesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === "resume" ? resumesDir : studentDocsDir;
    cb(null, dest);
  },
  filename: async (req, file, cb) => {
    if (file.fieldname === "resume" && req.user) {
      try {
        let name = req.user.name;

        // Fallback for existing sessions without the 'name' claim in JWT
        if (!name) {
          const user = await User.findByPk(req.user.userId, {
            attributes: ["first_name", "last_name"],
          });
          if (user) {
            name = `${user.first_name}_${user.last_name || ""}`.replace(
              /\s+/g,
              "_",
            );
          }
        }

        const identifier = name || req.user.userId;
        return cb(
          null,
          `${identifier}_resume${path.extname(file.originalname)}`,
        );
      } catch (error) {
        // Fallback to userId if DB lookup fails
        return cb(
          null,
          `${req.user.userId}_resume${path.extname(file.originalname)}`,
        );
      }
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF and standard image files (jpg, png) are allowed"),
      false,
    );
  }
};

const studentUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
});

export default studentUpload;
