const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { isProduction } = require('./config/env');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

/**
 * app.js describes WHAT the API is (middleware + routes).
 * It does NOT start listening on a port or connect to the database —
 * that's server.js's job. Splitting these means app.js can be imported
 * by tests without ever binding a real port or opening a real DB
 * connection.
 */
const app = express();


// --- Security & parsing middleware -----------------------------------
app.use(helmet()); // sets a set of safe default HTTP headers
app.use(cors()); // permissive for now; will be scoped down when the
// dashboard/client origins are known (Stage 4+)
app.use(express.json()); // parse JSON request bodies

// Request logging: verbose in dev, quieter in production.
app.use(morgan(isProduction ? 'combined' : 'dev'));

// --- Routes -------------------------------------------------------------
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Placeholder root route so hitting `/` isn't a confusing 404.
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Payment Risk & Scam Intelligence API' });
});

// --- 404 + error handling (must be registered LAST, in this order) -----
app.use(notFound);
app.use(errorHandler);

module.exports = app;