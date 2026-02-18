const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const Message = require('../models/Message');
const { calculateProfit } = require('../utils/calculateProfit');
const { deleteFromCloudinary } = require('../utils/imageUpload');
const { sendError } = require('../utils/errorResponse');
const { sendEmail } = require('../utils/emailService');

// GET /api/client/dashboard
const getDashboard = async (req, res) => {
  try {
    const clientId = req.user._id;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const [todayOrders, totalProducts, totalCustomers, pendingOrders, shippedOrders, profitData] = await Promise.all([
      Order.countDocuments({ clientId, createdAt: { $gte: todayStart } }),
      Product.countDocuments({ clientId }),
      Customer.countDocuments({ clientId }),
      Order.countDocuments({ clientId, orderStatus: 'pending' }),
      Order.countDocuments({ clientId, orderStatus: 'shipped' }),
      calculateProfit(clientId),
    ]);

    res.json({
      success: true,
      data: { todayOrders, totalProducts, totalCustomers, pendingOrders, shippedOrders, ...profitData },
    });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/client/products
const getProducts = async (req, res) => {
  try {
    const clientId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = { clientId };

    if (req.query.search) query.$text = { $search: req.query.search };
    if (req.query.category) query.category = req.query.category;
    if (req.query.status) query.status = req.query.status;

    const products = await Product.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Product.countDocuments(query);
    res.json({ success: true, data: products, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, error);
  }
};

// POST /api/client/products
const addProduct = async (req, res) => {
  try {
    const { name, description, price, costPrice, category, stock, sizes, colors, status } = req.body;
    const images = req.files ? req.files.map(f => f.path) : [];

    const product = await Product.create({
      clientId: req.user._id, name, description, price, costPrice, category, stock,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      images, status,
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    sendError(res, error);
  }
};

// PUT /api/client/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updates = { ...req.body };
    if (updates.sizes) updates.sizes = JSON.parse(updates.sizes);
    if (updates.colors) updates.colors = JSON.parse(updates.colors);
    if (req.files && req.files.length > 0) {
      updates.images = [...product.images, ...req.files.map(f => f.path)];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    sendError(res, error);
  }
};

// DELETE /api/client/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    for (const img of product.images) {
      try { await deleteFromCloudinary(img); } catch (e) { /* ignore */ }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/client/orders
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const query = { clientId: req.user._id };
    if (req.query.status) query.orderStatus = req.query.status;

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Order.countDocuments(query);
    res.json({ success: true, data: orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, error);
  }
};

// PUT /api/client/orders/:id
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, clientId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.body.orderStatus) order.orderStatus = req.body.orderStatus;
    if (req.body.trackingId) order.trackingId = req.body.trackingId;
    await order.save();

    const io = req.app.get('io');
    if (io) io.emit('orderStatusUpdate', { orderId: order._id, status: order.orderStatus, customerId: order.customerId });

    // Send shipping/status email to customer (non-blocking)
    if (req.body.orderStatus === 'shipped' || req.body.orderStatus === 'delivered') {
      try {
        const customer = await Customer.findById(order.customerId).select('email name');
        if (customer) {
          const statusLabel = req.body.orderStatus === 'shipped' ? 'Shipped' : 'Delivered';
          const trackingLine = order.trackingId ? `<p>Tracking ID: <strong>${order.trackingId}</strong></p>` : '';
          await sendEmail({
            to: customer.email,
            subject: `Your order has been ${statusLabel}! - #${order._id}`,
            html: `<h2>Order ${statusLabel}!</h2><p>Hi ${customer.name}, your order <strong>#${order._id}</strong> has been ${statusLabel.toLowerCase()}.</p>${trackingLine}<p>Total: ₹${order.totalAmount}</p>`,
          });
        }
      } catch (e) { /* ignore email errors */ }
    }

    res.json({ success: true, data: order });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/client/customers
const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const customers = await Customer.find({ clientId: req.user._id })
      .select('-password -cart')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Customer.countDocuments({ clientId: req.user._id });
    res.json({ success: true, data: customers, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/client/payments
const getPayments = async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.user._id });
    const orderIds = orders.map(o => o._id);
    const payments = await Payment.find({ orderId: { $in: orderIds } })
      .populate('orderId', 'totalAmount orderStatus customerId')
      .sort({ createdAt: -1 });
    const profitData = await calculateProfit(req.user._id);
    res.json({ success: true, data: { payments, ...profitData } });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/client/messages
const getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const query = { clientId: req.user._id };
    if (req.query.platform) query.platform = req.query.platform;

    const messages = await Message.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Message.countDocuments(query);
    res.json({ success: true, data: messages, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, error);
  }
};

// POST /api/client/messages/reply
const replyToMessage = async (req, res) => {
  try {
    const { messageId, reply, platform } = req.body;

    if (messageId) {
      const msg = await Message.findOne({ _id: messageId, clientId: req.user._id });
      if (msg) { msg.reply = reply; await msg.save(); }
    }

    const outgoing = await Message.create({
      clientId: req.user._id,
      customerPhone: req.body.customerPhone,
      customerName: req.body.customerName,
      platform: platform || 'whatsapp',
      direction: 'outgoing',
      content: reply,
      isAutoReply: false,
    });

    res.json({ success: true, data: outgoing });
  } catch (error) {
    sendError(res, error);
  }
};

// PUT /api/client/settings
const updateSettings = async (req, res) => {
  try {
    const allowed = ['whatsappNo', 'whatsappToken', 'whatsappPhoneNumberId', 'instagramId', 'instagramToken', 'facebookPage', 'facebookToken'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const client = await Client.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, data: client });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = { getDashboard, getProducts, addProduct, updateProduct, deleteProduct, getOrders, updateOrder, getCustomers, getPayments, getMessages, replyToMessage, updateSettings };
