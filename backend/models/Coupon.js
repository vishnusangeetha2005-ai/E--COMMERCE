const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  code: { type: String, required: true, uppercase: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  minOrderAmount: { type: Number, default: 0 },
}, { timestamps: true });

couponSchema.index({ clientId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Coupon', couponSchema);
