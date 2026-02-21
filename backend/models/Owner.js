const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  logo: { type: String, default: '' },
  brandName: { type: String, required: true },
  razorpayKeyId: { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  upiId: { type: String, default: '' },
  whatsappNo: { type: String, default: '' },
  whatsappToken: { type: String, default: '' },
  whatsappPhoneNumberId: { type: String, default: '' },
  instagramId: { type: String, default: '' },
  instagramToken: { type: String, default: '' },
  facebookPage: { type: String, default: '' },
  facebookToken: { type: String, default: '' },
  role: { type: String, default: 'owner' },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiry: { type: Date, default: null },
  botTemplates: {
    welcome: { type: String, default: 'Welcome! How can we help you today?' },
    orderConfirmation: { type: String, default: 'Your order #{orderId} has been placed successfully!' },
    shippingUpdate: { type: String, default: 'Your order #{orderId} has been shipped! Tracking ID: {trackingId}' },
    deliveryUpdate: { type: String, default: 'Your order #{orderId} has been delivered!' },
    faq: [{ question: String, answer: String }],
  },
}, { timestamps: true });

module.exports = mongoose.model('Owner', ownerSchema);
