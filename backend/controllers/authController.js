const bcrypt = require('bcryptjs');
const Owner = require('../models/Owner');
const Client = require('../models/Client');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');
const { sendError } = require('../utils/errorResponse');

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

// Get current user profile
const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = {
  registerOwner, loginOwner, loginClient,
  registerCustomer, loginCustomer,
  registerCustomerForStore, loginCustomerForStore,
  getProfile,
};
