/**
 * A plain Error with an attached statusCode, so controllers can do:
 *   throw new ApiError(401, 'Invalid credentials');
 * and the centralized errorHandler (which reads err.statusCode) picks up
 * the right HTTP status automatically.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;