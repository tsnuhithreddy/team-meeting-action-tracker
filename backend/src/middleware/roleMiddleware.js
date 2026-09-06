const AppError = require('../utils/appError');

/**
 * Middleware to restrict route access to specific roles.
 * Usage: authorizeRoles('ADMIN', 'MANAGER')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. Role '${req.user ? req.user.role : 'UNKNOWN'}' is not authorized to perform this action.`, 403)
      );
    }
    next();
  };
};

module.exports = {
  authorizeRoles
};