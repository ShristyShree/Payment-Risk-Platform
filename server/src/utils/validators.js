/**
 * Deliberately hand-rolled instead of pulling in a validation library
 * (e.g. express-validator/Joi) — the project spec asks us not to add
 * unnecessary dependencies, and these checks are simple enough that a
 * library would be more machinery than the problem needs.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateRegisterInput({ name, email, password }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('name is required');
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    errors.push('a valid email is required');
  }
  if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  return errors;
}

function validateLoginInput({ email, password }) {
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('email is required');
  }
  if (!password || typeof password !== 'string') {
    errors.push('password is required');
  }

  return errors;
}

function validateTransactionInput({ amount, payeeId, isNewPayee, location, deviceId }) {
  const errors = [];

  if (amount === undefined || amount === null || typeof amount !== 'number' || Number.isNaN(amount)) {
    errors.push('amount is required and must be a number');
  } else if (amount <= 0) {
    errors.push('amount must be greater than 0');
  }

  if (!payeeId || typeof payeeId !== 'string' || payeeId.trim().length === 0) {
    errors.push('payeeId is required');
  }

  if (isNewPayee !== undefined && typeof isNewPayee !== 'boolean') {
    errors.push('isNewPayee must be a boolean if provided');
  }

  if (location !== undefined && typeof location !== 'string') {
    errors.push('location must be a string if provided');
  }

  if (deviceId !== undefined && typeof deviceId !== 'string') {
    errors.push('deviceId must be a string if provided');
  }

  return errors;
}

module.exports = { validateRegisterInput, validateLoginInput, validateTransactionInput };