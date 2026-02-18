const Razorpay = require('razorpay');
const crypto = require('crypto');
const Client = require('../models/Client');
const Owner = require('../models/Owner');
const { sendError } = require('../utils/errorResponse');

const PLANS = {
  basic: { name: 'Basic', price: 499, duration: 30 },
  pro: { name: 'Pro', price: 999, duration: 30 },
  enterprise: { name: 'Enterprise', price: 1999, duration: 30 },
};

// GET /api/subscription/plans
const getPlans = (req, res) => {
  const plans = Object.entries(PLANS).map(([key, plan]) => ({
    id: key,
    ...plan,
  }));
  res.json({ success: true, data: plans });
};

// POST /api/subscription/create
const createSubscription = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ success: false, message: 'Invalid plan' });

    const client = await Client.findById(req.user._id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const owner = await Owner.findById(client.ownerId);
    if (!owner?.razorpayKeyId || !owner?.razorpayKeySecret) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured by platform owner.' });
    }

    const rz = new Razorpay({ key_id: owner.razorpayKeyId, key_secret: owner.razorpayKeySecret });

    const order = await rz.orders.create({
      amount: plan.price * 100,
      currency: 'INR',
      receipt: `sub_${client._id}_${planId}_${Date.now()}`,
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: owner.razorpayKeyId,
        planId,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
};

// POST /api/subscription/verify
const verifySubscription = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ success: false, message: 'Invalid plan' });

    const client = await Client.findById(req.user._id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const owner = await Owner.findById(client.ownerId);

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', owner.razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Calculate new expiry — extend from current expiry if still active, otherwise from now
    let baseDate = new Date();
    if (client.subscriptionStatus === 'active' && client.subscriptionExpiry > baseDate) {
      baseDate = new Date(client.subscriptionExpiry);
    }
    const expiry = new Date(baseDate);
    expiry.setDate(expiry.getDate() + plan.duration);

    await Client.findByIdAndUpdate(client._id, {
      subscriptionStatus: 'active',
      subscriptionPlan: planId,
      subscriptionExpiry: expiry,
      subscriptionId: razorpay_payment_id,
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: { subscriptionPlan: planId, subscriptionExpiry: expiry },
    });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = { getPlans, createSubscription, verifySubscription, PLANS };
