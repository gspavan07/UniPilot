/**
 * Middleware to convert empty strings in req.body to null.
 * This prevents PostgreSQL UUID type errors when optional foreign keys
 * are sent as empty strings from the frontend.
 */
const nullifyEmptyStrings = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === "") {
        req.body[key] = null;
      }
    });
  }
  next();
};

export default nullifyEmptyStrings;
