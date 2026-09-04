require('dotenv').config();

/**
 * Centralized environment configuration.
 *
 * Why this exists: every other module should read config from here instead
 * of calling `process.env.X` directly. That gives us one place to see what
 * variables the app needs, one place to set defaults, and one place that
 * fails loudly at startup if something required is missing — instead of a
 * confusing crash three files deep into a request.
 */

const required = ['MONGODB_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // Fail fast and clearly at startup rather than letting the app boot into
  // a broken state (e.g. Mongoose trying to connect to `undefined`).
  console.error(
    `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill in real values.'
  );
  process.exit(1);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret: process.env.JWT_SECRET,
  // how long an issued token stays valid, e.g. '1d', '12h'
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};