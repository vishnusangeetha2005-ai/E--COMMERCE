const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  storeName: { type: String, required: true },
  storeUrl: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  whatsappNo: { type: String, default: '' },
  whatsappToken: { type: String, default: '' },
  whatsappPhoneNumberId: { type: String, default: '' },
  instagramId: { type: String, default: '' },
  instagramToken: { type: String, default: '' },
  facebookPage: { type: String, default: '' },
  facebookToken: { type: String, default: '' },
  plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
  isActive: { type: Boolean, default: true },
  subscriptionStatus: { type: String, enum: ['inactive', 'active', 'expired'], default: 'inactive' },
  subscriptionPlan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: null },
  subscriptionExpiry: { type: Date, default: null },
  subscriptionId: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  role: { type: String, default: 'client' },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
