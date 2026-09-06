const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

/**
 * Middleware to verify JWT token in Authorization header
 */
module.exports = (req, res, next) => {
  let token;

  // 1. Check if Authorization header exists and starts with "Bearer "
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2. Verify token signature
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    
    // Attach decoded user payload to the request object
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }
};