const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Owner = require('../models/Owner');
const { sendError } = require('../utils/errorResponse');

// Get Razorpay keys — from Owner, then .env fallback
const getRazorpayKeys = async (client) => {
  const owner = await Owner.findById(client.ownerId);
  if (owner?.razorpayKeyId && owner?.razorpayKeySecret) {
    return { keyId: owner.razorpayKeyId, keySecret: owner.razorpayKeySecret };
  }
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return { keyId: process.env.RAZORPAY_KEY_ID, keySecret: process.env.RAZORPAY_KEY_SECRET };
  }
  return null;
};

// Get Razorpay instance for a specific client
const getClientRazorpay = async (client) => {
  const keys = await getRazorpayKeys(client);
  if (!keys) return null;
  return { rz: new Razorpay({ key_id: keys.keyId, key_secret: keys.keySecret }), keyId: keys.keyId, keySecret: keys.keySecret };
};

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const client = await Client.findById(order.clientId);
    if (!client) return res.status(404).json({ success: false, message: 'Store not found' });

    const result = await getClientRazorpay(client);
    if (!result) return res.status(503).json({ success: false, message: 'Payment gateway not configured. Add Razorpay keys in Settings.' });

    const razorpayOrder = await result.rz.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: orderId.toString(),
    });

    await Payment.create({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      method: 'razorpay',
      status: 'pending',
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: result.keyId,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Verify Razorpay payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const order = await Order.findById(payment.orderId);
    const client = await Client.findById(order.clientId);
    const keys = await getRazorpayKeys(client);
    const keySecret = keys?.keySecret;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'completed';
    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('paymentReceived', { orderId: order._id, clientId: order.clientId });
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    sendError(res, error);
  }
};

// Process refund
const processRefund = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Payment not eligible for refund' });
    }

    const order = await Order.findById(payment.orderId);
    const client = await Client.findById(order.clientId);
    const result = await getClientRazorpay(client);
    if (!result) return res.status(503).json({ success: false, message: 'Payment gateway not configured' });

    const refund = await result.rz.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round((amount || payment.amount) * 100),
    });

    payment.status = 'refunded';
    payment.refundAmount = amount || payment.amount;
    payment.refundId = refund.id;
    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'refunded', orderStatus: 'cancelled' });

    res.json({ success: true, message: 'Refund processed', data: { refundId: refund.id } });
  } catch (error) {
    sendError(res, error);
  }
};

// Get UPI ID for an order — client first, then owner fallback
const getUpiDetails = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const client = await Client.findById(order.clientId);
    if (!client) return res.status(404).json({ success: false, message: 'Store not found' });

    const owner = await Owner.findById(client.ownerId);
    const upiId = owner?.upiId || '';
    const payeeName = owner?.brandName || client.storeName;

    if (!upiId) return res.status(503).json({ success: false, message: 'UPI not configured. Platform owner needs to add UPI ID in Settings.' });

    await Payment.create({
      orderId: order._id,
      amount: order.totalAmount,
      method: 'upi',
      status: 'pending',
    });

    res.json({
      success: true,
      data: {
        upiId,
        payeeName,
        amount: order.totalAmount,
        orderId: order._id,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Confirm UPI payment (admin marks as paid after verifying)
const confirmUpiPayment = async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;
    const payment = await Payment.findOne({ orderId, method: 'upi', status: 'pending' });
    if (!payment) return res.status(404).json({ success: false, message: 'Pending UPI payment not found' });

    payment.status = 'completed';
    payment.razorpayPaymentId = transactionId || 'UPI-MANUAL';
    await payment.save();

    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', orderStatus: 'confirmed' });

    const io = req.app.get('io');
    if (io) {
      const order = await Order.findById(orderId);
      io.emit('paymentReceived', { orderId, clientId: order.clientId });
    }

    res.json({ success: true, message: 'UPI payment confirmed' });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = { createOrder, verifyPayment, processRefund, getUpiDetails, confirmUpiPayment };
