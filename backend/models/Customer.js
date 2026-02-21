const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  addresses: [addressSchema],
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    size: { type: String, default: '' },
    color: { type: String, default: '' },
  }],
  role: { type: String, default: 'customer' },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiry: { type: Date, default: null },
}, { timestamps: true });

customerSchema.index({ email: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
