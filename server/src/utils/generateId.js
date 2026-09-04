const crypto = require('crypto');

/**
 * Generates a public-facing transaction ID, separate from MongoDB's
 * internal _id. Why bother with a second ID at all: _id is an
 * implementation detail of the database; a dedicated transactionId means
 * we could migrate databases later, or expose IDs to users, without ever
 * leaking or depending on Mongo's ObjectId format.
 *
 * Format: TXN-<20 hex chars>, e.g. TXN-4f9a1c8e2b7d0a3f5e6c
 */
function generateTransactionId() {
  return `TXN-${crypto.randomBytes(10).toString('hex')}`;
}

module.exports = generateTransactionId;