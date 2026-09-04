const mongoose = require('mongoose');

/**
 * Transaction
 * - The central record: a payment plus everything the risk pipeline
 *   attached to it (score, tier, factors, intervention).
 * - riskScore/riskTier/riskFactors/intervention start null and are filled
 *   in synchronously during creation (see transactionService, Stage 5+).
 */
const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      // human-friendly/public ID, separate from Mongo's _id
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payeeId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    location: {
      type: String,
    },
    deviceId: {
      type: String,
    },
    status: {
      // lifecycle state of the payment itself
      type: String,
      enum: ['ALLOWED', 'WARNED', 'FLAGGED', 'BLOCKED', 'UNDER_REVIEW'],
      default: 'ALLOWED',
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    riskTier: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: null,
    },
    riskFactors: {
      // e.g. [{ factor: 'new_payee', weight: 20, description: '...' }]
      type: [
        {
          factor: String,
          weight: Number,
          description: String,
        },
      ],
      default: [],
    },
    intervention: {
      type: String,
    },
    idempotencyKey: {
      // used to guarantee a duplicate submission doesn't create a 2nd doc
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

transactionSchema.index({ customerId: 1, timestamp: -1 });
transactionSchema.index({ riskTier: 1 });
// Idempotency is scoped per-customer: the same key from two different
// customers should not collide.
transactionSchema.index(
  { customerId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: 'string' }
    }
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);