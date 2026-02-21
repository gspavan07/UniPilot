import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import nullifyEmptyStrings from "./middleware/nullifyEmptyStrings.js";
import logger from "./utils/logger.js";


import path from "path";

const __dirname = import.meta.dirname;

const app = express();

import fileController from "./controllers/fileController.js";

// Serve Profile Images Securely
app.get("/uploads/profiles/:filename", fileController.serveProfileImage);

// Serve other static files (e.g. student_docs) - Temporary/Legacy
// Ideally these should also be protected, but keeping open to prevent breaking existing features for now
app.use(
  "/uploads/student_docs",
  express.static(path.join(__dirname, "../uploads/student_docs")),
);
// app.use("/resumes", express.static(path.join(__dirname, "../uploads/resumes")));
// Make sure other subfolders in uploads are not accidentally exposed unless explicitly added

// Security middleware
app.use(helmet());

// Serve static frontend files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));




// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3001",
  "http://localhost:3001", // Explicitly allow localhost:3001
  "http://localhost:5174", // Exam Management Frontend
  "http://localhost:8086", // Exam Management Docker
  "http://localhost:8085", // Docker Frontend
  "http://localhost:3000", // Backend local
  "http://localhost:3100", // Docker Backend external
  "http://localhost:5173", // Frontend local
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Nullify empty strings middleware
app.use(nullifyEmptyStrings);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max:
    process.env.NODE_ENV === "development"
      ? 10000
      : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use("/api", limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api", routes);

// Custom 404/SPA Handler
app.use((req, res) => {
  // If the request is for an API endpoint, return JSON 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      error: "Not Found",
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  }

  // For all other requests (SPA client-side routing), serve index.html
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global error handler
app.use(errorHandler);

export default app;
