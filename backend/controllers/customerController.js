const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Client = require('../models/Client');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Owner = require('../models/Owner');
const { sendError } = require('../utils/errorResponse');
const { sendOrderReceiptEmail } = require('../utils/emailService');

// === Public Store Routes ===

// GET /api/store/:storeUrl/products
const getStoreProducts = async (req, res) => {
  try {
    const client = await Client.findOne({ storeUrl: req.params.storeUrl, isActive: true });
    if (!client) return res.status(404).json({ success: false, message: 'Store not found' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const query = { clientId: client._id, status: 'active' };

    if (req.query.search) query.$text = { $search: req.query.search };
    if (req.query.category) query.category = req.query.category;

    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    if (req.query.sort === 'price_desc') sort = { price: -1 };
    if (req.query.sort === 'newest') sort = { createdAt: -1 };

    const products = await Product.find(query).sort(sort).skip((page - 1) * limit).limit(limit);
    const total = await Product.countDocuments(query);
    res.json({ success: true, data: products, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/store/:storeUrl/products/:id
const getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const reviews = await Review.find({ productId: product._id })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { product, reviews } });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/store/:storeUrl/categories
const getCategories = async (req, res) => {
  try {
    const client = await Client.findOne({ storeUrl: req.params.storeUrl, isActive: true });
    if (!client) return res.status(404).json({ success: false, message: 'Store not found' });

    const categories = await Product.distinct('category', { clientId: client._id, status: 'active' });
    res.json({ success: true, data: categories });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/store/:storeUrl/info
const getStoreInfo = async (req, res) => {
  try {
    const client = await Client.findOne({ storeUrl: req.params.storeUrl, isActive: true }).select('storeName storeUrl ownerId');
    if (!client) return res.status(404).json({ success: false, message: 'Store not found' });

    const owner = await Owner.findById(client.ownerId).select('logo brandName');
    res.json({ success: true, data: { clientId: client._id, storeName: client.storeName, storeUrl: client.storeUrl, logo: owner?.logo, brandName: owner?.brandName } });
  } catch (error) {
    sendError(res, error);
  }
};

// === Authenticated Customer Routes ===

// POST /api/customer/cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < (quantity || 1)) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    const customer = await Customer.findById(req.user._id);
    const existing = customer.cart.find(item => item.product.toString() === productId && item.size === (size || '') && item.color === (color || ''));

    if (existing) {
      existing.quantity += quantity || 1;
    } else {
      customer.cart.push({ product: productId, quantity: quantity || 1, size: size || '', color: color || '' });
    }
    await customer.save();

    const populated = await Customer.findById(req.user._id).populate('cart.product', 'name price images stock');
    res.json({ success: true, data: populated.cart });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/customer/cart
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate('cart.product', 'name price images stock');
    res.json({ success: true, data: customer.cart });
  } catch (error) {
    sendError(res, error);
  }
};

// PUT /api/customer/cart/:id
const updateCartItem = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.id(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    item.quantity = req.body.quantity;
    await customer.save();

    const populated = await Customer.findById(req.user._id).populate('cart.product', 'name price images stock');
    res.json({ success: true, data: populated.cart });
  } catch (error) {
    sendError(res, error);
  }
};

// DELETE /api/customer/cart/:id
const removeFromCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    customer.cart = customer.cart.filter(item => item._id.toString() !== req.params.id);
    await customer.save();
    res.json({ success: true, data: customer.cart });
  } catch (error) {
    sendError(res, error);
  }
};

// POST /api/customer/checkout
const checkout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;
    const customer = await Customer.findById(req.user._id).populate('cart.product');

    if (!customer.cart.length) return res.status(400).json({ success: false, message: 'Cart is empty' });

    let totalAmount = 0;
    const products = [];

    for (const item of customer.cart) {
      if (!item.product || item.product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${item.product?.name || 'Product'} is out of stock` });
      }
      const lineTotal = item.product.price * item.quantity;
      totalAmount += lineTotal;
      products.push({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ clientId: customer.clientId, code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate > new Date() && coupon.usedCount < coupon.maxUses && totalAmount >= coupon.minOrderAmount) {
        discount = Math.round(totalAmount * coupon.discountPercent / 100);
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const order = await Order.create({
      clientId: customer.clientId,
      customerId: customer._id,
      products,
      totalAmount: totalAmount - discount,
      discount,
      shippingAddress,
      paymentMethod: paymentMethod || 'razorpay',
      couponCode: couponCode || '',
    });

    // Decrease stock
    for (const item of customer.cart) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    // Clear cart
    customer.cart = [];
    await customer.save();

    // Create payment record for COD orders
    if ((paymentMethod || 'razorpay') === 'cod') {
      await Payment.create({ orderId: order._id, amount: order.totalAmount, method: 'cod', status: 'pending' });
    }

    const io = req.app.get('io');
    if (io) io.emit('newOrder', { orderId: order._id, clientId: order.clientId });

    // Send order confirmation email (non-blocking)
    try { await sendOrderReceiptEmail(customer.email, order); } catch (e) { /* ignore email errors */ }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/customer/orders
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const orders = await Order.find({ customerId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Order.countDocuments({ customerId: req.user._id });
    res.json({ success: true, data: orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/customer/orders/:id
const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    sendError(res, error);
  }
};

// POST /api/customer/reviews
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const exists = await Review.findOne({ productId, customerId: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: 'You already reviewed this product' });

    const review = await Review.create({ productId, customerId: req.user._id, rating, comment });

    // Update product ratings
    const reviews = await Review.find({ productId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { ratings: Math.round(avg * 10) / 10, numReviews: reviews.length });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/customer/wishlist
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate('wishlist', 'name price images ratings');
    res.json({ success: true, data: customer.wishlist });
  } catch (error) {
    sendError(res, error);
  }
};

// POST /api/customer/wishlist
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const customer = await Customer.findById(req.user._id);
    const idx = customer.wishlist.indexOf(productId);

    if (idx > -1) {
      customer.wishlist.splice(idx, 1);
    } else {
      customer.wishlist.push(productId);
    }
    await customer.save();

    const populated = await Customer.findById(req.user._id).populate('wishlist', 'name price images ratings');
    res.json({ success: true, data: populated.wishlist });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  getStoreProducts, getProductDetail, getCategories, getStoreInfo,
  addToCart, getCart, updateCartItem, removeFromCart,
  checkout, getOrders, getOrderDetail,
  addReview, getWishlist, toggleWishlist,
};
