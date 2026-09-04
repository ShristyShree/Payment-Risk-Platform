const express = require('express');
const { getConnectionStatus } = require('../config/db');

const router = express.Router();

/**
 * GET /health
 * Lets you (or a deploy platform) verify the API process is up AND
 * separately check whether it's actually able to talk to MongoDB — the
 * two can fail independently (e.g. server up, DB down), so we report both.
 */
router.get('/', (req, res) => {
  const dbStatus = getConnectionStatus();

  res.status(200).json({
    api: 'running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;