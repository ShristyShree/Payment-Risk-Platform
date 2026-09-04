/**
 * Catches any request that didn't match a route.
 * Must be registered AFTER all real routes and BEFORE the error handler.
 */
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error); // hand off to the centralized error handler below
}

module.exports = notFound;