import auditLogger from "../../utils/exam/auditLogger.js";

/**
 * Audit Middleware for Exam Routes
 * Automatically logs actions after successful operations
 *
 * Usage:
 *   router.post('/generate', auditMiddleware('GENERATE', 'HALL_TICKET'), controller)
 */
export const auditMiddleware = (action, module) => {
  return async (req, res, next) => {
    // Store original res.json to intercept successful responses
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Only log if response was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Extract entity info from response data or request
        const entityId =
          data?.data?.id || req.params?.id || req.body?.id || null;

        const entityType = module
          ? module.toLowerCase().replace("_", "-")
          : "exam";

        // Build description
        let description = `${action} ${module}`;
        if (req.user) {
          description += ` by ${req.user.email}`;
        }

        // Log asynchronously (don't block response)
        setImmediate(() => {
          auditLogger
            .log({
              user: req.user,
              action,
              module,
              description,
              entityType,
              entityId,
              changes: req.body,
              metadata: {
                query: req.query,
                params: req.params,
                responseData: data?.data,
              },
              request: req,
              status: "success",
            })
            .catch((err) => {
              console.error("Audit logging failed:", err);
            });
        });
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

/**
 * Manual audit log helper
 * Use this in controllers for complex scenarios
 */
export const logAudit = async (
  req,
  {
    action,
    module = "EXAM_MANAGEMENT",
    description,
    entityType = null,
    entityId = null,
    changes = null,
    metadata = null,
    status = "success",
    error = null,
  },
) => {
  await auditLogger.log({
    user: req.user,
    action,
    module,
    description,
    entityType,
    entityId,
    changes,
    metadata,
    request: req,
    status,
    error,
  });
};

export default {
  auditMiddleware,
  logAudit,
};
