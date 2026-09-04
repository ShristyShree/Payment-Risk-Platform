const mongoose = require('mongoose');

/**
 * User
 * - Base identity + auth record for both customers and analysts.
 * - passwordHash is NEVER returned in API responses (see toJSON below).
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // excluded from queries by default; must opt in with .select('+passwordHash')
    },
    role: {
      type: String,
      enum: ['customer', 'analyst'],
      required: true,
      default: 'customer',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Belt-and-suspenders: even if passwordHash is ever selected, strip it before
// the document is serialized to JSON for an API response.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);