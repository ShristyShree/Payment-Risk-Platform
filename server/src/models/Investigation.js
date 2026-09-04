const mongoose = require('mongoose');

/**
 * Investigation
 * - Created when an analyst opens/works a flagged transaction.
 * - A transaction can have multiple Investigation entries over time
 *   (e.g. reopened later), so this is its own collection rather than
 *   embedded fields on Transaction.
 */
const investigationSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    analystId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
    },
    notes: {
      type: [String],
      default: [],
    },
    decision: {
      type: String,
      enum: ['LEGITIMATE', 'ESCALATED', 'REJECTED', null],
      default: null,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

investigationSchema.index({ transactionId: 1 });
investigationSchema.index({ analystId: 1 });
investigationSchema.index({ status: 1 });

module.exports = mongoose.model('Investigation', investigationSchema);