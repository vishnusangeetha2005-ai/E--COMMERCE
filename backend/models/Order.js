const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 },
    size: { type: String, default: '' },
    color: { type: String, default: '' },
  }],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  paymentMethod: { type: String, enum: ['razorpay', 'upi', 'cod'], default: 'razorpay' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  trackingId: { type: String, default: '' },
  couponCode: { type: String, default: '' },
}, { timestamps: true });

orderSchema.index({ clientId: 1, createdAt: -1 });
orderSchema.index({ customerId: 1 });

module.exports = mongoose.model('Order', orderSchema);
