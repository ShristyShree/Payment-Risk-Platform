/**
 * Feature engineering layer.
 *
 * Design decision: computeFeatures() is a PURE function — no database
 * calls, no side effects. It takes plain data in and returns plain data
 * out. Why this matters: it means we can unit-test every feature
 * calculation with a handful of plain JS objects, with no MongoDB, no
 * mocking, no async — the same reason a pricing calculator or a tax
 * formula should be a pure function. All the DB work (loading the
 * profile, counting recent transactions) happens in transactionService,
 * which then hands this function everything it needs.
 *
 * NOTE ON SCOPE: this computes the 6 behavioral features below.
 * `balance_ratio` (percentage of available balance transferred) is
 * intentionally NOT implemented — there's no balance simulation in this
 * project (a deliberate scope decision, not an oversight).
 *
 * NOTE ON THE ORIGINAL SPEC'S FEATURE LIST: the spec lists both
 * "transaction velocity" and "number of transactions in the previous 5
 * minutes" as separate signals, but its own ML feature list only has one
 * field for this (`transaction_velocity`). We treat these as the same
 * feature — velocity, measured as a 5-minute transaction count — rather
 * than inventing two overlapping numbers for the same underlying signal.
 */

const VELOCITY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * @param {Object} profile - the customer's CustomerProfile document
 * @param {number} velocityCount - number of this customer's transactions
 *   in the preceding 5-minute window (computed by transactionService via
 *   a DB query, BEFORE this transaction is saved)
 * @param {number} amount
 * @param {string} payeeId
 * @param {string} [location]
 * @param {string} [deviceId]
 * @param {Date} timestamp - the moment this transaction is being created
 */
function computeFeatures({ profile, velocityCount, amount, payeeId, location, deviceId, timestamp }) {
  // --- amount_deviation -------------------------------------------------
  // Cold-start handling: a brand-new customer has typicalTransactionAmount
  // = 0 (schema default). There's no baseline yet to deviate from, so we
  // treat that case as "neutral" (0) rather than a false extreme deviation
  // (amount / 0 would be Infinity). This is the same cold-start reasoning
  // from Stage 5's CustomerProfile lazy-creation.
  const hasAmountBaseline = profile.typicalTransactionAmount > 0;
  const amount_deviation = hasAmountBaseline
    ? (amount - profile.typicalTransactionAmount) / profile.typicalTransactionAmount
    : 0;

  // --- new_payee ----------------------------------------------------------
  // By the time this runs, Stage 5's assertPayeeIsValid has already
  // guaranteed that an unrecognized payeeId only got this far because the
  // caller explicitly set isNewPayee: true. So "not in knownPayees" here
  // is unambiguous — it genuinely is new.
  const new_payee = !profile.knownPayees.includes(payeeId);

  // --- unusual_hour ---------------------------------------------------
  // Uses the server's local hour. Simplification worth flagging: a real
  // system would use the CUSTOMER's local timezone, not the server's.
  const hour = timestamp.getHours();
  const unusual_hour =
    profile.typicalTransactionHours.length > 0
      ? !profile.typicalTransactionHours.includes(hour)
      : false; // no baseline yet -> don't flag

  // --- location_change --------------------------------------------------
  // No location provided at all -> we simply don't have a signal, so we
  // don't flag it (missing data isn't treated as automatically risky).
  const location_change = location
    ? profile.typicalLocations.length > 0 && !profile.typicalLocations.includes(location)
    : false;

  // --- new_device ---------------------------------------------------------
  const new_device = deviceId ? !profile.knownDevices.includes(deviceId) : false;

  return {
    amount,
    amount_deviation,
    new_payee,
    transaction_velocity: velocityCount,
    unusual_hour,
    location_change,
    new_device,
  };
}

module.exports = { computeFeatures, VELOCITY_WINDOW_MS };