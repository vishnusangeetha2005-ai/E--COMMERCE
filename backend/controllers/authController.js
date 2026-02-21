const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Owner = require('../models/Owner');
const Client = require('../models/Client');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');
const { sendError } = require('../utils/errorResponse');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Owner Register
const registerOwner = async (req, res) => {
  try {
    const { name, email, password, brandName } = req.body;
    const exists = await Owner.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Owner already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const owner = await Owner.create({ name, email, password: hashed, brandName });
    res.status(201).json({
      success: true,
      data: { id: owner._id, name: owner.name, email: owner.email, role: 'owner' },
      token: generateToken(owner._id, 'owner'),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Owner Login
const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      data: { id: owner._id, name: owner.name, email: owner.email, role: 'owner', logo: owner.logo, brandName: owner.brandName },
      token: generateToken(owner._id, 'owner'),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Client Login
const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await Client.findOne({ email });
    if (!client) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!client.isActive) return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      data: { id: client._id, name: client.name, email: client.email, storeName: client.storeName, role: 'client' },
      token: generateToken(client._id, 'client'),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Customer Register
const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, clientId } = req.body;
    const exists = await Customer.findOne({ email, clientId });
    if (exists) return res.status(400).json({ success: false, message: 'Customer already exists for this store' });

    const hashed = await bcrypt.hash(password, 10);
    const customer = await Customer.create({ name, email, password: hashed, phone, clientId });
    res.status(201).json({
      success: true,
      data: { id: customer._id, name: customer.name, email: customer.email, role: 'customer' },
      token: generateToken(customer._id, 'customer'),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Customer Login
const loginCustomer = async (req, res) => {
  try {
    const { email, password, clientId } = req.body;
    const customer = await Customer.findOne({ email, clientId });
    if (!customer) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      data: { id: customer._id, name: customer.name, email: customer.email, role: 'customer' },
      token: generateToken(customer._id, 'customer'),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Customer Register via store URL (no clientId needed from frontend)
const registerCustomerForStore = async (req, res) => {
  try {
    const client = await Client.findOne({ storeUrl: req.params.storeUrl, isActive: true });
    if (!client) return res.status(404).json({ success: false, message: 'Store not found' });

    const { name, email, password, phone } = req.body;
    const clientId = client._id;
    const exists = await Customer.findOne({ email, clientId });
    if (exists) return res.status(400).json({ success: false, message: 'Customer already exists for this store' });

    const hashed = await bcrypt.hash(password, 10);
    const customer = await Customer.create({ name, email, password: hashed, phone, clientId });
    res.status(201).json({
      success: true,
      data: { id: customer._id, name: customer.name, email: customer.email, role: 'customer', clientId: client._id },
      token: generateToken(customer._id, 'customer'),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Customer Login via store URL (no clientId needed from frontend)
const loginCustomerForStore = async (req, res) => {
  try {
    const client = await Client.findOne({ storeUrl: req.params.storeUrl, isActive: true });
    if (!client) return res.status(404).json({ success: false, message: 'Store not found' });

    const { email, password } = req.body;
    const customer = await Customer.findOne({ email, clientId: client._id });
    if (!customer) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      data: { id: customer._id, name: customer.name, email: customer.email, role: 'customer', clientId: client._id },
      token: generateToken(customer._id, 'customer'),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Forgot Password - Owner
const forgotPasswordOwner = async (req, res) => {
  try {
    const { email } = req.body;
    const owner = await Owner.findOne({ email });
    if (owner) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      owner.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      owner.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
      await owner.save();
      const resetUrl = `${process.env.FRONTEND_URL}/owner/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(owner.email, owner.name, resetUrl, 'owner');
    }
    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    sendError(res, error);
  }
};

// Reset Password - Owner
const resetPasswordOwner = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const owner = await Owner.findOne({ resetPasswordToken: hashed, resetPasswordExpiry: { $gt: Date.now() } });
    if (!owner) return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    owner.password = await bcrypt.hash(password, 10);
    owner.resetPasswordToken = null;
    owner.resetPasswordExpiry = null;
    await owner.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    sendError(res, error);
  }
};

// Forgot Password - Client
const forgotPasswordClient = async (req, res) => {
  try {
    const { email } = req.body;
    const client = await Client.findOne({ email });
    if (client) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      client.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      client.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
      await client.save();
      const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(client.email, client.name, resetUrl, 'store admin');
    }
    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    sendError(res, error);
  }
};

// Reset Password - Client
const resetPasswordClient = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const client = await Client.findOne({ resetPasswordToken: hashed, resetPasswordExpiry: { $gt: Date.now() } });
    if (!client) return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    client.password = await bcrypt.hash(password, 10);
    client.resetPasswordToken = null;
    client.resetPasswordExpiry = null;
    await client.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    sendError(res, error);
  }
};

// Forgot Password - Customer (store-scoped)
const forgotPasswordCustomer = async (req, res) => {
  try {
    const { email } = req.body;
    const client = await Client.findOne({ storeUrl: req.params.storeUrl, isActive: true });
    if (client) {
      const customer = await Customer.findOne({ email, clientId: client._id });
      if (customer) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        customer.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        customer.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
        await customer.save();
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&store=${req.params.storeUrl}`;
        await sendPasswordResetEmail(customer.email, customer.name, resetUrl, 'customer');
      }
    }
    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    sendError(res, error);
  }
};

// Reset Password - Customer (store-scoped)
const resetPasswordCustomer = async (req, res) => {
  try {
    const { token, password } = req.body;
    const client = await Client.findOne({ storeUrl: req.params.storeUrl, isActive: true });
    if (!client) return res.status(404).json({ success: false, message: 'Store not found' });
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const customer = await Customer.findOne({ clientId: client._id, resetPasswordToken: hashed, resetPasswordExpiry: { $gt: Date.now() } });
    if (!customer) return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    customer.password = await bcrypt.hash(password, 10);
    customer.resetPasswordToken = null;
    customer.resetPasswordExpiry = null;
    await customer.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    sendError(res, error);
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = {
  registerOwner, loginOwner, loginClient,
  registerCustomer, loginCustomer,
  registerCustomerForStore, loginCustomerForStore,
  forgotPasswordOwner, resetPasswordOwner,
  forgotPasswordClient, resetPasswordClient,
  forgotPasswordCustomer, resetPasswordCustomer,
  getProfile,
};
