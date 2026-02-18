const bcrypt = require('bcryptjs');
const Owner = require('../models/Owner');
const Client = require('../models/Client');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Message = require('../models/Message');
const { sendClientCredentials } = require('../utils/emailService');
const { sendError } = require('../utils/errorResponse');

// GET /api/owner/dashboard
const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const clients = await Client.find({ ownerId });
    const clientIds = clients.map(c => c._id);

    const totalOrders = await Order.countDocuments({ clientId: { $in: clientIds } });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ clientId: { $in: clientIds }, createdAt: { $gte: todayStart } });

    const revenueAgg = await Order.aggregate([
      { $match: { clientId: { $in: clientIds }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalClients: clients.length,
        activeClients: clients.filter(c => c.isActive).length,
        inactiveClients: clients.filter(c => !c.isActive).length,
        totalOrders,
        todayOrders,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/owner/clients
const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const clients = await Client.find({ ownerId: req.user._id })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Client.countDocuments({ ownerId: req.user._id });
    res.json({ success: true, data: clients, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, error);
  }
};

// POST /api/owner/clients
const addClient = async (req, res) => {
  try {
    const { name, email, password, storeName, storeUrl, phone, whatsappNo, instagramId, facebookPage, plan } = req.body;
    const exists = await Client.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Client email already exists' });

    const urlExists = await Client.findOne({ storeUrl: storeUrl.toLowerCase() });
    if (urlExists) return res.status(400).json({ success: false, message: 'Store URL already taken' });

    const hashed = await bcrypt.hash(password, 10);
    const client = await Client.create({
      name, email, password: hashed, storeName, storeUrl: storeUrl.toLowerCase(),
      phone, whatsappNo, instagramId, facebookPage, plan,
      ownerId: req.user._id,
    });

    try { await sendClientCredentials(email, name, password); } catch (e) { /* email optional */ }

    res.status(201).json({ success: true, data: { ...client.toObject(), password: undefined } });
  } catch (error) {
    sendError(res, error);
  }
};

// PUT /api/owner/clients/:id
const updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const updates = { ...req.body };
    delete updates.password;
    delete updates.ownerId;

    const updated = await Client.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json({ success: true, data: updated });
  } catch (error) {
    sendError(res, error);
  }
};

// DELETE /api/owner/clients/:id
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/owner/orders
const getOrders = async (req, res) => {
  try {
    const clients = await Client.find({ ownerId: req.user._id });
    const clientIds = clients.map(c => c._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = { clientId: { $in: clientIds } };
    if (req.query.status) query.orderStatus = req.query.status;

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('clientId', 'storeName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Order.countDocuments(query);

    res.json({ success: true, data: orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/owner/revenue
const getRevenue = async (req, res) => {
  try {
    const clients = await Client.find({ ownerId: req.user._id });
    const clientIds = clients.map(c => c._id);

    const monthly = await Order.aggregate([
      { $match: { clientId: { $in: clientIds }, paymentStatus: 'paid' } },
      { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const perClient = await Order.aggregate([
      { $match: { clientId: { $in: clientIds }, paymentStatus: 'paid' } },
      { $group: { _id: '$clientId', revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    const clientMap = {};
    clients.forEach(c => { clientMap[c._id.toString()] = c.storeName; });
    const perClientData = perClient.map(p => ({ clientId: p._id, storeName: clientMap[p._id.toString()] || '', revenue: p.revenue, orders: p.count }));

    const totalRevenue = monthly.reduce((sum, m) => sum + m.revenue, 0);

    res.json({ success: true, data: { totalRevenue, monthly, perClient: perClientData } });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/owner/messages
const getMessages = async (req, res) => {
  try {
    const clients = await Client.find({ ownerId: req.user._id });
    const clientIds = clients.map(c => c._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = { clientId: { $in: clientIds } };
    if (req.query.platform) query.platform = req.query.platform;

    const messages = await Message.find(query)
      .populate('clientId', 'storeName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Message.countDocuments(query);

    res.json({ success: true, data: messages, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, error);
  }
};

// PUT /api/owner/settings
const updateSettings = async (req, res) => {
  try {
    const updates = {};
    if (req.body.brandName) updates.brandName = req.body.brandName;
    if (req.file) updates.logo = req.file.path;
    if (req.body.razorpayKeyId !== undefined) updates.razorpayKeyId = req.body.razorpayKeyId;
    if (req.body.razorpayKeySecret !== undefined) updates.razorpayKeySecret = req.body.razorpayKeySecret;
    if (req.body.upiId !== undefined) updates.upiId = req.body.upiId;
    const socialFields = ['whatsappNo', 'whatsappToken', 'whatsappPhoneNumberId', 'instagramId', 'instagramToken', 'facebookPage', 'facebookToken'];
    for (const key of socialFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const owner = await Owner.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, data: owner });
  } catch (error) {
    sendError(res, error);
  }
};

// PUT /api/owner/bot-templates
const updateBotTemplates = async (req, res) => {
  try {
    const owner = await Owner.findByIdAndUpdate(
      req.user._id,
      { botTemplates: req.body },
      { new: true }
    ).select('-password');
    res.json({ success: true, data: owner.botTemplates });
  } catch (error) {
    sendError(res, error);
  }
};

// PUT /api/owner/clients/:id/activate-subscription
const activateClientSubscription = async (req, res) => {
  try {
    const { plan, days } = req.body;
    const validPlans = ['basic', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) return res.status(400).json({ success: false, message: 'Invalid plan' });

    const client = await Client.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const duration = parseInt(days) || 30;
    let baseDate = new Date();
    if (client.subscriptionStatus === 'active' && client.subscriptionExpiry > baseDate) {
      baseDate = new Date(client.subscriptionExpiry);
    }
    const expiry = new Date(baseDate);
    expiry.setDate(expiry.getDate() + duration);

    const updated = await Client.findByIdAndUpdate(client._id, {
      subscriptionStatus: 'active',
      subscriptionPlan: plan,
      subscriptionExpiry: expiry,
      subscriptionId: 'MANUAL_' + Date.now(),
    }, { new: true }).select('-password');

    res.json({ success: true, data: updated, message: 'Subscription activated' });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = { getDashboard, getClients, addClient, updateClient, deleteClient, getOrders, getRevenue, getMessages, updateSettings, updateBotTemplates, activateClientSubscription };
