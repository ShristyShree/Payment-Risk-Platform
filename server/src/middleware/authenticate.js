const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

/**
 * Verifies the Authorization: Bearer <token> header and attaches the
 * decoded payload as req.user = { id, role }.
 *
 * Deliberately does NOT hit the database to re-fetch the user on every
 * request — the token itself carries { id, role }, which is enough for
 * authorization decisions. If a route handler needs fresh user data
 * (e.g. the user's current profile), it can look it up by req.user.id
 * itself. This keeps the middleware fast and stateless.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    // Covers both "invalid signature" and "expired token" — we don't need
    // to distinguish these for the client, just reject either way.
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = authenticate;