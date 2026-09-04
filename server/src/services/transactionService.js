const mlService = require('./mlService');
const Transaction = require('../models/Transaction');
const CustomerProfile = require('../models/CustomerProfile');
const ApiError = require('../utils/ApiError');
const generateTransactionId = require('../utils/generateId');
const featureService = require('./featureService');
const riskService = require('./riskService');
const riskFactorService = require('./riskFactorService');
const interventionService = require('./interventionService');
/**
 * Loads the customer's behavioral profile, or creates an empty default
 * one if this is their first transaction ever.
 */
async function getOrCreateCustomerProfile(customerId) {
  let profile = await CustomerProfile.findOne({ userId: customerId });

  if (!profile) {
    profile = await CustomerProfile.create({ userId: customerId });
  }

  return profile;
}

/**
 * Validates the payee against the customer's known-payee list.
 *
 * A payee must either:
 * 1. Already exist in knownPayees, OR
 * 2. Be explicitly marked as a new payee.
 */
function assertPayeeIsValid(profile, payeeId, isNewPayee) {
  const isKnown = profile.knownPayees.includes(payeeId);

  if (!isKnown && !isNewPayee) {
    throw new ApiError(
      400,
      `payeeId "${payeeId}" is not in your known payees. If this is a new payee, resend the request with isNewPayee: true.`
    );
  }
}

/**
 * Adds a new payee to the customer's known-payee list.
 */
async function registerPayeeIfNew(profile, payeeId) {
  if (!profile.knownPayees.includes(payeeId)) {
    profile.knownPayees.push(payeeId);
    await profile.save();
  }
}

/**
 * Adds a new device to the customer's known-device list.
 */
async function registerDeviceIfNew(profile, deviceId) {
  if (deviceId && !profile.knownDevices.includes(deviceId)) {
    profile.knownDevices.push(deviceId);
    await profile.save();
  }
}

/**
 * Adds a new location to the customer's typical-location list.
 */
async function registerLocationIfNew(profile, location) {
  if (location && !profile.typicalLocations.includes(location)) {
    profile.typicalLocations.push(location);
    await profile.save();
  }
}

/**
 * Creates a transaction.
 *
 * Stage 8:
 * - Computes behavioral features.
 * - Sends those features to the Python ML service.
 * - Receives the ML prediction.
 * - Stores the returned riskScore.
 *
 * Risk tiers and interventions are intentionally NOT handled here.
 * Those belong to later stages.
 */
async function createTransaction(customerId, input, idempotencyKey) {
  const {
    amount,
    payeeId,
    isNewPayee,
    location,
    deviceId,
  } = input;

  // --------------------------------------------------
  // Idempotency fast path
  // --------------------------------------------------

  if (idempotencyKey) {
    const existing = await Transaction.findOne({
      customerId,
      idempotencyKey,
    });

    if (existing) {
      return {
        transaction: existing,
        idempotent: true,
      };
    }
  }

  // --------------------------------------------------
  // Customer profile
  // --------------------------------------------------

  const profile = await getOrCreateCustomerProfile(customerId);

  assertPayeeIsValid(
    profile,
    payeeId,
    isNewPayee
  );

  // --------------------------------------------------
  // Consistent transaction timestamp
  // --------------------------------------------------

  const now = new Date();

  // --------------------------------------------------
  // Transaction velocity
  // --------------------------------------------------

  const velocityCount = await Transaction.countDocuments({
    customerId,
    timestamp: {
      $gte: new Date(
        now.getTime() - featureService.VELOCITY_WINDOW_MS
      ),
    },
  });

  // --------------------------------------------------
  // Stage 6: Feature engineering
  // --------------------------------------------------

  const features = featureService.computeFeatures({
    profile,
    velocityCount,
    amount,
    payeeId,
    location,
    deviceId,
    timestamp: now,
  });

  // --------------------------------------------------
  // Stage 8: ML prediction
  // --------------------------------------------------

  // IMPORTANT:
  // There is only ONE ML call.
  // mlService.predictRisk() handles communication with Flask.
  const prediction = await mlService.predictRisk(features);
 const riskTier = riskService.getRiskTier(
  prediction.riskScore
);
const riskFactors = riskFactorService.generateRiskFactors(features);
const interventionDecision = interventionService.getIntervention(
  riskTier
);
  // --------------------------------------------------
  // Save transaction
  // --------------------------------------------------

  let transaction;

  try {
    transaction = await Transaction.create({
      transactionId: generateTransactionId(),
      customerId,
      payeeId,
      amount,
      location,
      deviceId,
      timestamp: now,
      idempotencyKey: idempotencyKey || undefined,

      // Store the raw ML risk score.
      riskScore: prediction.riskScore,

      // Risk tier comes in a later stage.
      riskTier,
       riskFactors,
      // Intervention comes in a later stage.
     intervention: interventionDecision.intervention,

status: interventionDecision.status,
    });
  } catch (err) {
    // --------------------------------------------------
    // Idempotency race-condition safety net
    // --------------------------------------------------

    if (err.code === 11000 && idempotencyKey) {
      const existing = await Transaction.findOne({
        customerId,
        idempotencyKey,
      });

      if (existing) {
        return {
          transaction: existing,
          idempotent: true,
        };
      }
    }

    throw err;
  }

  // --------------------------------------------------
  // Update behavioral profile AFTER feature calculation
  // --------------------------------------------------

  await registerPayeeIfNew(profile, payeeId);
  await registerDeviceIfNew(profile, deviceId);
  await registerLocationIfNew(profile, location);

  // --------------------------------------------------
  // Return transaction + features + ML prediction
  // --------------------------------------------------

  return {
  transaction,
  idempotent: false,
  features,
  prediction,
  riskTier,
  riskFactors,
  intervention: interventionDecision.intervention,
  status: interventionDecision.status,
};
}

async function listTransactionsForCustomer(customerId) {
  return Transaction.find({
    customerId,
  }).sort({
    timestamp: -1,
  });
}

async function listAllTransactions() {
  return Transaction.find()
    .sort({
      timestamp: -1,
    })
    .limit(200);
}

async function getTransactionById(id) {
  const transaction = await Transaction.findById(id);

  if (!transaction) {
    throw new ApiError(
      404,
      'Transaction not found'
    );
  }

  return transaction;
}

module.exports = {
  createTransaction,
  listTransactionsForCustomer,
  listAllTransactions,
  getTransactionById,
};