const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  // Default error
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  }
  
  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    status = 400;
    message = err.errors.map(e => e.message).join(', ');
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'Resource already exists';
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }
  
  // Send error response
  res.status(status).json({
    error: err.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
