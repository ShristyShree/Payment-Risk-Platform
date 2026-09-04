/**
 * Converts an operational risk tier into an intervention decision.
 *
 * Stage 10 responsibility:
 * - decide what action should be taken for a transaction
 * - return the intervention and transaction status
 *
 * This service does NOT:
 * - calculate ML predictions
 * - communicate with Flask
 * - calculate risk scores
 * - calculate risk tiers
 * - generate risk factors
 *
 * Those responsibilities belong to the ML, risk, and risk-factor services.
 */

/**
 * Determines the appropriate intervention for a risk tier.
 *
 * Decision policy:
 *
 * LOW      -> no intervention, transaction allowed
 * MEDIUM   -> warning, transaction allowed with warning
 * HIGH     -> manual review
 * CRITICAL -> block transaction
 *
 * @param {string} riskTier
 * @returns {{ intervention: string, status: string }}
 */
function getIntervention(riskTier) {
  switch (riskTier) {
    case 'LOW':
      return {
        intervention: 'NONE',
        status: 'ALLOWED',
      };

    case 'MEDIUM':
      return {
        intervention: 'WARNING',
        status: 'WARNED',
      };

    case 'HIGH':
      return {
        intervention: 'REVIEW',
        status: 'UNDER_REVIEW',
      };

    case 'CRITICAL':
      return {
        intervention: 'BLOCK',
        status: 'BLOCKED',
      };

    default:
      throw new Error(`Invalid risk tier: ${riskTier}`);
  }
}

module.exports = {
  getIntervention,
};