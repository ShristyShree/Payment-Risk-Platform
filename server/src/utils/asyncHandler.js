/**
 * Wraps an async route handler so any thrown error (or rejected promise)
 * is automatically forwarded to next(err) — and therefore to the
 * centralized errorHandler middleware — instead of crashing the process
 * or requiring a try/catch in every single controller function.
 *
 * Usage: router.post('/login', asyncHandler(authController.login));
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;