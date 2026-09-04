const { isProduction } = require('../config/env');

/**
 * Centralized error handler.
 *
 * Why: without this, every controller needs its own try/catch that builds
 * a JSON error response, decides a status code, etc. That's repetitive and
 * easy to get inconsistent. Instead, controllers just `next(error)` (or
 * throw, if wrapped in asyncHandler later) and this single place decides
 * the response shape.
 *
 * Must be registered LAST, after all routes and after notFound.
 * Express recognizes it as an error handler because it takes 4 arguments.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  const body = {
    error: {
      message: err.message || 'Internal server error',
      status: statusCode,
    },
  };

  // Only include stack traces / internal detail outside production, so we
  // never leak implementation details (file paths, query fragments, etc.)
  // to a real client.
  if (!isProduction) {
    body.error.stack = err.stack;
  }

  if (statusCode >= 500) {
    // Server-side errors are worth a loud log; 4xx (bad requests, 404s)
    // are normal traffic and shouldn't spam the console.
    console.error('[error]', err);
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;