import path from "path";
import { fileURLToPath } from 'url';
import { Role, User } from "../models/index.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";
import jwt from "jsonwebtoken";
import logger from "../../../utils/logger.js";

// @desc    Serve Profile Image securely
// @route   GET /uploads/profiles/:filename
// @access  Protected
export const serveProfileImage = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../../../../uploads/profiles", filename);

  // 1. Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // 2. Authentication (Token in Header or Query)
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  // Debugging
  // console.log("Serving file:", filename);
  // console.log("Token received:", token ? "Yes" : "No");

  if (!token) {
    console.log("File Auth Failed: No Token");
    logger.warn(`File Access Denied: No token for ${filename}`);
    return res.status(401).send("Unauthorized: No Token");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id; // Support both just in case

    // Fetch user with role
    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: "role_data" }],
    });

    if (!user) {
      logger.warn(`File Access Denied: User ${userId} not found`);
      return res.status(401).send("User not found");
    }

    const roleSlug = user.role_data?.slug || user.role;
    logger.info(`Serving ${filename} to ${user.email} (${roleSlug})`);

    // 3. Authorization Logic
    // Allow: Admin, Admission Team
    if (
      roleSlug === "super_admin" ||
      roleSlug === "admin" ||
      (roleSlug && roleSlug.includes("admission"))
    ) {
      return res.sendFile(filePath);
    }

    // Allow: Student viewing THEIR OWN photo
    // Check if the requested filename matches the user's profile_picture record
    // The profile_picture field stores relative path like "/uploads/profiles/xyz.jpg"
    if (user.profile_picture && user.profile_picture.includes(filename)) {
      return res.sendFile(filePath);
    }

    // Otherwise Deny
    console.log("File Auth Failed: Forbidden for user", user.email);
    logger.warn(
      `File Access Forbidden: ${user.email} tried to access ${filename}`
    );
    return res.status(403).send("Forbidden");
  } catch (error) {
    console.log("File Auth Error:", error.message);
    logger.error("File Access Error:", error.message);
    return res
      .status(401)
      .send(
        `Invalid Token: ${error.message} (Secret: ${!!process.env.JWT_SECRET})`
      );
  }
};

export default {
  serveProfileImage,
};
