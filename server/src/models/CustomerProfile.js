const mongoose = require('mongoose');

/**
 * CustomerProfile
 * - The "baseline" of normal behavior we compare each new transaction
 *   against. This is what the feature-engineering layer reads from.
 * - In a real system this would be continuously recalculated from history;
 *   here we keep it as a maintained snapshot to keep the project explainable.
 */
const customerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    typicalTransactionAmount: {
      // average amount for this customer's normal transactions
      type: Number,
      required: true,
      default: 0,
    },
    typicalTransactionFrequency: {
      // average number of transactions per day
      type: Number,
      required: true,
      default: 0,
    },
    knownPayees: {
      // payee IDs this customer has paid before — used for "new payee" checks
      type: [String],
      default: [],
    },
    typicalTransactionHours: {
      // hours of day (0-23) this customer normally transacts in
      type: [Number],
      default: [],
    },
    typicalLocations: {
      type: [String],
      default: [],
    },
    knownDevices: {
      // device IDs this customer has transacted from before — used for
      // "new device" checks. Added in Stage 6: the original schema had no
      // field for this, but "is the device new" is one of the required
      // risk features, so this mirrors the existing knownPayees pattern.
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CustomerProfile', customerProfileSchema);