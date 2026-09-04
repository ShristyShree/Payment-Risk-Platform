const app = require('./app');
const { port } = require('./config/env');
const { connectDB } = require('./config/db');

/**
 * server.js is the actual entry point (see package.json "main"/scripts).
 * It sequences startup: connect to MongoDB FIRST, then start accepting
 * HTTP requests. That ordering matters — without it, a request could
 * arrive before Mongoose is ready and fail with a confusing error deep
 * inside a query instead of a clear "not connected yet" state.
 */
async function start() {
  try {
    await connectDB();
  } catch (err) {
    // Graceful handling of connection failure: log clearly and exit
    // instead of starting an API that can't actually serve data.
    console.error('[startup] Failed to connect to MongoDB:', err.message);
    console.error(
      '[startup] Check that MONGODB_URI in your .env is correct and that ' +
        'MongoDB is reachable (local mongod running, or Atlas IP allowlist configured).'
    );
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`[startup] Server listening on port ${port}`);
  });

  // Handle errors that happen after the server is already listening
  // (e.g. MongoDB drops mid-run) without crashing the whole process.
  process.on('unhandledRejection', (err) => {
    console.error('[startup] Unhandled promise rejection:', err);
  });

  return server;
}

start();