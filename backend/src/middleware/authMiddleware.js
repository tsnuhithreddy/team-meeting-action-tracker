const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const UserModel = require('../models/userModel');

/**
 * Middleware to verify JWT token in Authorization header
 */
module.exports = async (req, res, next) => {
  let token;

  // 1. Check if Authorization header exists and starts with "Bearer "
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2. Verify token signature
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // 3. Re-verify the user still exists and is active. A valid signature alone
  // isn't enough — without this, a deactivated user's existing token would
  // keep working for up to 7 days after an admin deactivates them.
  try {
    const user = await UserModel.findById(decoded.id);
    if (!user || !user.is_active) {
      return next(new AppError('Your account has been deactivated.', 403));
    }
  } catch (err) {
    return next(err);
  }

  // Attach decoded user payload to the request object
  req.user = decoded;
  next();
};