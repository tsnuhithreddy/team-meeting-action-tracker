/**
 * Global Error Handling Middleware
 * Ensures uniform JSON response structures and hides sensitive stack traces in production.
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle MySQL connection errors gracefully
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    err.statusCode = 503;
    err.message = 'Database connection failed. Please ensure MySQL is running.';
  }

  // Handle JWT invalid signature or expired errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Your session has expired. Please log in again.';
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || undefined,
    ...(isDevelopment && { stack: err.stack })
  });
};
