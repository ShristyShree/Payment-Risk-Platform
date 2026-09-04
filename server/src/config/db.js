const mongoose = require('mongoose');
const { mongodbUri } = require('./env');

/**
 * Dedicated DB connection module.
 *
 * Why separate from app.js: app.js's job is to describe the HTTP surface
 * (middleware, routes). Connecting to the database is a different concern
 * with its own lifecycle (connect once at boot, react to disconnects,
 * etc.) — keeping it here means app.js stays readable and this file can be
 * unit-tested / reasoned about on its own.
 */

let isConnected = false;

async function connectDB() {
  // Fail loudly instead of silently retrying forever — for a student
  // project it's more useful to see the real error immediately.
  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('[db] MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    // Never log the URI itself — it can contain credentials.
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[db] MongoDB disconnected');
  });

  await mongoose.connect(mongodbUri, {
    serverSelectionTimeoutMS: 5000, // fail fast if MongoDB is unreachable
  });
}

function getConnectionStatus() {
  // mongoose.connection.readyState: 0 = disconnected, 1 = connected,
  // 2 = connecting, 3 = disconnecting
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDB, getConnectionStatus, isConnected: () => isConnected };