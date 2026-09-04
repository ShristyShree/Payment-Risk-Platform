const ApiError = require('../utils/ApiError');

/**
 * Role-gate factory: authorize('analyst') returns a middleware that only
 * lets requests through if req.user.role matches one of the allowed roles.
 *
 * Must run AFTER `authenticate` (which sets req.user). Kept as a separate
 * middleware — rather than baked into `authenticate` — because not every
 * protected route cares about role (some just need "any logged-in user"),
 * and different routes need different role sets.
 *
 * Usage: router.get('/alerts', authenticate, authorize('analyst'), ...)
 */
function authorize(...allowedRoles) {
  return function roleCheck(req, res, next) {
    if (!req.user) {
      // Defensive: this middleware assumes `authenticate` already ran.
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }

    next();
  };
}

module.exports = authorize;