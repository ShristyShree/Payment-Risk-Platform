/**
 * Converts the ML risk score into an operational risk tier.
 *
 * Stage 9 responsibility:
 * - interpret the raw ML risk score
 * - assign LOW / MEDIUM / HIGH / CRITICAL
 *
 * This service does NOT:
 * - calculate ML predictions
 * - communicate with Flask
 * - decide whether a transaction is blocked
 *
 * Intervention decisions belong to Stage 10.
 */

/**
 * Classifies a risk score into an operational risk tier.
 *
 * Score ranges:
 * 0-24   -> LOW
 * 25-49  -> MEDIUM
 * 50-74  -> HIGH
 * 75-100 -> CRITICAL
 *
 * @param {number} riskScore
 * @returns {string}
 */
function getRiskTier(riskScore) {
  if (typeof riskScore !== 'number' || Number.isNaN(riskScore)) {
    throw new Error('Risk score must be a valid number');
  }

  if (riskScore < 0 || riskScore > 100) {
    throw new Error('Risk score must be between 0 and 100');
  }

  if (riskScore < 25) {
    return 'LOW';
  }

  if (riskScore < 50) {
    return 'MEDIUM';
  }

  if (riskScore < 75) {
    return 'HIGH';
  }

  return 'CRITICAL';
}

module.exports = {
  getRiskTier,
};