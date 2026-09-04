const mongoose = require('mongoose');

/**
 * AuditLog
 * - Append-only record of who did what, for accountability/compliance.
 * - Written by a service helper (not directly by controllers) so every
 *   analyst decision and sensitive action is guaranteed to be logged
 *   consistently. See services/auditService.js (Stage 4+).
 */
const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      // e.g. 'INVESTIGATION_DECISION', 'LOGIN', 'TRANSACTION_CREATED'
      type: String,
      required: true,
    },
    entityType: {
      // e.g. 'Transaction', 'Investigation', 'User'
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // we track time explicitly via `timestamp`
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);