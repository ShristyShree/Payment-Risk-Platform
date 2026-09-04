/**
 * Converts engineered behavioral features into human-readable
 * risk factors.
 *
 * This service does NOT decide whether a transaction is allowed,
 * blocked, or requires verification.
 *
 * Its only responsibility is explainability:
 * "Why did this transaction receive this risk assessment?"
 */

function generateRiskFactors(features) {
  const riskFactors = [];

  // --------------------------------------------------
  // Amount deviation
  // --------------------------------------------------

  if (Math.abs(features.amount_deviation) >= 0.5) {
    riskFactors.push({
      factor: 'amount_deviation',
      weight: 20,
      description:
        'Transaction amount is significantly different from the customer\'s typical amount',
    });
  }

  // --------------------------------------------------
  // New payee
  // --------------------------------------------------

  if (features.new_payee) {
    riskFactors.push({
      factor: 'new_payee',
      weight: 20,
      description: 'Transaction is being sent to a new payee',
    });
  }

  // --------------------------------------------------
  // Transaction velocity
  // --------------------------------------------------

  if (features.transaction_velocity >= 3) {
    riskFactors.push({
      factor: 'high_transaction_velocity',
      weight: 15,
      description:
        'High transaction velocity in the previous 5 minutes',
    });
  }

  // --------------------------------------------------
  // Unusual transaction hour
  // --------------------------------------------------

  if (features.unusual_hour) {
    riskFactors.push({
      factor: 'unusual_hour',
      weight: 15,
      description:
        'Transaction occurred at an unusual hour for this customer',
    });
  }

  // --------------------------------------------------
  // Location change
  // --------------------------------------------------

  if (features.location_change) {
    riskFactors.push({
      factor: 'location_change',
      weight: 15,
      description:
        'Transaction was made from a new location',
    });
  }

  // --------------------------------------------------
  // New device
  // --------------------------------------------------

  if (features.new_device) {
    riskFactors.push({
      factor: 'new_device',
      weight: 15,
      description:
        'Transaction was made from a new device',
    });
  }

  return riskFactors;
}

module.exports = {
  generateRiskFactors,
};