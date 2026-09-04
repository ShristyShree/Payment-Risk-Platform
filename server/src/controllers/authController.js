const bcrypt = require('bcrypt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');
const { validateRegisterInput, validateLoginInput } = require('../utils/validators');

// Cost factor for bcrypt hashing. 10 is a widely-used default that balances
// hashing speed against brute-force resistance; higher = slower to hash
// (and slower to brute-force) but slower for every real login too.
const BCRYPT_SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 *
 * Design decision: role is NOT accepted from the request body. Every
 * self-registration becomes a 'customer' — analyst accounts are created
 * some other way (e.g. directly in the database by whoever administers
 * the system). This avoids the classic vulnerability of a public endpoint
 * that lets a caller grant themselves elevated privileges just by adding
 * `"role": "analyst"` to their JSON body.
 */
async function register(req, res) {
  const { name, email, password } = req.body;

  const errors = validateRegisterInput({ name, email, password });
  if (errors.length > 0) {
    throw new ApiError(400, errors.join('; '));
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    // Deliberately generic-ish but still clear; this is a registration
    // flow (not login), so confirming "this email is taken" isn't the
    // same information leak as it would be on a login endpoint.
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash,
    role: 'customer', // always — see design note above
  });

  const token = signToken({ id: user._id, role: user.role });

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

/**
 * POST /api/auth/login
 *
 * Design decision: on failure we return the SAME error message whether
 * the email doesn't exist or the password is wrong ("Invalid email or
 * password"). This prevents an attacker from using the endpoint to
 * enumerate which emails are registered.
 */
async function login(req, res) {
  const { email, password } = req.body;

  const errors = validateLoginInput({ email, password });
  if (errors.length > 0) {
    throw new ApiError(400, errors.join('; '));
  }

  // passwordHash has `select: false` in the schema, so it must be
  // explicitly requested here.
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ id: user._id, role: user.role });

  res.status(200).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

/**
 * GET /api/auth/me
 * Protected route used to prove the authenticate middleware actually
 * works end-to-end (valid token → req.user populated → real DB lookup).
 */
async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.status(200).json({ user });
}

module.exports = { register, login, me };